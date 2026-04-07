<script setup lang="ts">
import { provide, ref, toRefs } from 'vue'
import { normalizeHitekCenterUrl, task } from 'custodian'
import { z } from 'zod'
import TestTaskSelector from '../../components/TestTaskSelector.vue'
import DataItem from './components/DataItem.vue'
import type { TaskPackageDTO } from './interface'
import { udrCore } from '@/views/udr/provider/UdrCore'
import { request } from '@/axios'
import { useUdrStore } from '@/views/udr/provider/useUdrStore'
import { useTouchSwipe } from '@/hooks/useTouchSwipe'
import { useDeviceInfo } from '@/composables/useDeviceInfo'

provide('offlineMarker', {})
provide('isOnlineList', '1')

const udrStore = useUdrStore()

const { getTestTaskId } = udrStore

const { currentTestTask, panelManager, udrStartParams } = toRefs(udrStore)

const { handleTouchStart, handleTouchEnd } = useTouchSwipe({
  handleLeftSwipe: () => {
    onCollapsePanel()
  },
})

const { deviceId } = toRefs(useDeviceInfo())

const keyword = ref('')

const enableDelete = ref(false)

const activeId = ref(getTestTaskId())

const width = ref(48)

let cacheTestTaskTreeData: TaskPackageDTO[] = []

const testTaskTreeData = ref<TaskPackageDTO[]>([])

cacheTestTaskTreeData = JSON.parse(JSON.stringify(testTaskTreeData.value))

const testTaskSelectorShow = ref(false)

// 展开面板
function onExpandPanel() {
  getTestTaskList()
  panelManager.value.testPackageOpen = true
  width.value = 320
}

// 收起面板
function onCollapsePanel() {
  enableDelete.value = false
  keyword.value = ''
  onFilter()
  panelManager.value.testPackageOpen = false
  width.value = 48
}

// 搜索
function onFilter() {
  const allData = JSON.parse(JSON.stringify(cacheTestTaskTreeData))
  testTaskTreeData.value = allData.filter((i: TaskPackageDTO) => {
    i.expand = true

    if (i.sampleName.includes(keyword.value))
      return true

    if (i.children) {
      i.children = i.children.filter((j: TaskPackageDTO) => j.sampleName.includes(keyword.value))
      return !!i.children.length
    }

    return false
  })
}

function showDelete(item: TaskPackageDTO) {
  if (enableDelete.value) {
    if (item.taskId === activeId.value)
      return false

    if (item.children && item.children.some((i: TaskPackageDTO) => i.taskId === activeId.value))
      return false

    return true
  }

  return false
}

// 获取打包任务
async function getTestTaskList() {
  udrCore.$this.setUdrVisibility(false)

  showLoadingToast({ duration: 0, forbidClick: true })
  const res: any = await request(`/ilis2/rest/handbook/task-package/list/${deviceId.value}`, {
    params: {
      v: new Date().getTime(),
    },
  }).finally(() => {
    closeToast()
  }).catch((err) => {
    showDialog({
      title: '提示',
      message: err.message,
    })
  })

  const taskId = getTestTaskId()
  // 每次打开udr时，判断试验打包中是否存在当前打开的试验，若不存在则将其保存进试验打包中，以实现产品想要在试验打包列表中看到当前打开试验并选中的效果
  if (!res.some((i: any) => i.taskId === taskId)) {
    getTestTaskSelected([taskId])
    return
  }

  cacheTestTaskTreeData = JSON.parse(JSON.stringify(res))
  testTaskTreeData.value = res
}

const hitekServer = ref('')

/**
 * 获取 hitekServer
 */
async function getHitekServer() {
  try {
    const res = await request({
      url: '/ilis2/rest/hitek/server',
      method: 'get',
      schema: z.object({
        hitekApiServer: z.string(),
        hitekUdrServer: z.string(),
      }),
    })
    return res
  }
  catch (err) {
    return {
      hitekApiServer: '',
      hitekUdrServer: '',
    }
  }
}

async function fetchTask(testTaskId: string, dataNames: string[]) {
  if (!hitekServer.value)
    hitekServer.value = (await getHitekServer()).hitekUdrServer

  udrCore.$this.setUdrVisibility(false)
  showLoadingToast({ duration: 0, forbidClick: true })
  const taskRes = await request({
    url: `/ilis2/rest/task/data`,
    method: 'get',
    params: {
      testTaskId,
      dataNames: dataNames.join(','),
    },
    schema: task.Validator.taskDetail,
  }).finally(() => {
    closeToast()
  })

  const taskData = taskRes.taskData || {}
  return {
    ...taskData,
    ...taskRes,
    hitekServer: hitekServer.value,
  }
}

// 查看试验
async function openTask(item: TaskPackageDTO) {
  if (enableDelete.value)
    return

  udrCore.$this.setUdrVisibility(false)

  // 某些情况下，这个是undefined，这里做个兼容吧
  if (!udrCore.$this) {
    showDialog({
      title: '提示',
      message: '请稍后再试！',
    }).then(() => {
      udrCore.$this.setUdrVisibility(true)
    })
    return
  }

  const task = await fetchTask(item.taskId, ['taskInfo', 'taskTemplate'])
  const inputTemplate = task.taskAppTemplates
    ? task.taskAppTemplates.find(it => it.templateType === '1')
    : undefined

  if (!inputTemplate) {
    showDialog({ title: '提示', message: '当前任务未配置录入模板' })
    return
  }

  const template = inputTemplate.appTemplates.find(it => it.type === '2')
  if (!template) {
    showDialog({ title: '提示', message: '当前任务未配置正确的试验模板' })
    return
  }

  const main = template.appTemplateFiles.find(it => it.fileName === 'main.json')
  if (!main) {
    showDialog({ title: '提示', message: '当前试验模板未配置主文件' })
    return
  }

  // udrCore.$global.closeUdr("udrTarget");

  udrStartParams.value.taskName = item.sampleName
  udrStartParams.value.taskId = item.taskId
  udrStartParams.value.testItemId = inputTemplate.testItemId
  udrStartParams.value.readOnlyMode = item.status !== '10'
  udrStartParams.value.title = item.status === '10' ? '试验录入' : '试验记录'
  udrStartParams.value.url = new URL(main.filePath, normalizeHitekCenterUrl(task.hitekServer)).href
  udrStartParams.value.testObjectId = task.testObjectId

  udrCore.$global.openUdr('udrTarget', JSON.stringify(udrStartParams.value))

  activeId.value = item.taskId

  currentTestTask.value.testTaskName = item.sampleName
  currentTestTask.value.testTaskId = item.taskId

  // 重点：隐藏udr后，一般来说不用控制显示，但这里打开了试验，会导致表格区域变为灰色，只有主动控制显示udr
  // 加个setTimeout是防止udr打开过快，loading层又被udr给盖住了
  setTimeout(() => {
    udrCore.$this.setUdrVisibility(true)
  }, 100)

  // 触发任务切换事件
  ;(window as any).OnTestTaskChanged()
}

async function onDelTask(item: TaskPackageDTO) {
  udrCore.$this.setUdrVisibility(false)

  showConfirmDialog({
    title: '提示',
    message: `确认删除${item.sampleName}吗？`,
  }).then(async () => {
    showLoadingToast({ duration: 0, forbidClick: true, message: '删除中...' })
    await request(`/ilis2/rest/handbook/task-package/delete/${deviceId.value}`, {
      method: 'DELETE',
      data: [item.taskId],
    }).finally(() => {
      closeToast()
    }).catch((err) => {
      showDialog({
        title: '提示',
        message: err.message,
      })
    })

    getTestTaskList()
  })
}

async function getTestTaskSelected(taskIds: string[]) {
  if (taskIds) {
    showLoadingToast({ duration: 0, forbidClick: true })
    await request(`/ilis2/rest/handbook/task-package/save/${deviceId.value}`, {
      method: 'POST',
      data: taskIds,
    }).finally(() => {
      closeToast()
    }).catch((err) => {
      showDialog({
        title: '提示',
        message: err.message,
      })
    })

    getTestTaskList()
  }
}
</script>

<template>
  <div
    class="testtask-package"
    :style="{ width: `${width}px` }"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
  >
    <template v-if="!panelManager.testPackageOpen">
      <img class="testtask-package-menu" src="@/assets/images/udr/left-expand.svg" @click="onExpandPanel">
    </template>
    <template v-else>
      <div class="testtask-package-search">
        <van-search v-model.trim="keyword" placeholder="请输入任务名称" @search="onFilter" />
        <img class="testtask-package-menu" src="@/assets/images/udr/left-expand.svg" @click="onCollapsePanel">
      </div>

      <div class="testtask-package-body">
        <div v-for="(item, index) in testTaskTreeData" :key="index" class="testtask-package-li">
          <van-icon v-if="showDelete(item)" class="testtask-package-del" name="clear" @click="onDelTask(item)" />
          <DataItem :data="item" :active-id="activeId" @on-check="openTask" />
        </div>

        <van-empty v-if="!testTaskTreeData.length" description="暂无数据" style="margin-top: 48px;" />
      </div>

      <div class="testtask-package-action">
        <van-button style="background: #0066EC;" type="primary" icon="plus" @click="testTaskSelectorShow = true">
          添加任务
        </van-button>
        <van-button style="background: #FF6666;" type="danger" @click="enableDelete = !enableDelete">
          {{ enableDelete ? "取消" : "移除" }}
        </van-button>
      </div>
    </template>
  </div>

  <TestTaskSelector v-model:show="testTaskSelectorShow" @select="getTestTaskSelected" />
</template>

<style lang="less" scoped>
.testtask-package {
  padding: 12px;
  box-sizing: border-box;
  overflow: hidden;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  font-size: 16px;
  border-right: solid 1px #E5E6EB;

  :deep(.van-search) {
    padding: 0;
    border: solid 1px #e2e2e2;
    border-radius: 4px;

    .van-search__content {
      background: #fff;
    }
  }

  .testtask-package-search {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;

    .van-search {
      flex: 1;
    }

    .testtask-package-menu {
      transform: rotate(180deg);
    }
  }

  .testtask-package-menu {
    max-width: 24px;
  }

  .testtask-package-body {
    flex: 1;
    height: 0;
    overflow-y: auto;
    padding-top: 16px;
  }

  .testtask-package-li {
    display: flex;
    gap: 8px;
  }

  .testtask-package-del {
    font-size: 18px;
    color: #FF6666;
    cursor: pointer;
    margin-top: 20px;
  }

  .testtask-package-action {
    display: flex;
    align-items: center;
    gap: 12px;

    .van-button:first-child {
      flex: 1;
    }

    .van-button:last-child {
      width: 80px;
    }
  }
}
</style>
