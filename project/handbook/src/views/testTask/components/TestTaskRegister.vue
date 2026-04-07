<script setup lang="ts">
import { onActivated, onMounted, provide, ref } from 'vue'
import { onBeforeRouteLeave, useRoute } from 'vue-router'
import type { TaskParam, TaskTemplate, Template } from 'custodian'
import {
  findTaskParams,
  findTaskTemplates,
  getTask,
  saveOnsiteTask,
} from 'custodian'
import { BaseInfo, TestInfo } from './index'
import keepAliveStore from '@/stores/keepAliveView'
import type { TaskBaseInfoDTO } from '@/type/testTask'
import router from '@/router'
import { useUserStore } from '@/stores/users'
import { debounce } from '@/utils'
import { translateError } from '@/utils/translateError'
import CustomSpin from '@/components/CustomSpin.vue'

const route = useRoute()

onMounted(() => {
  getDetailData()
})

const formData = ref<TaskBaseInfoDTO>({
  template: '',
  templateId: '',
  sampleId: '',
  sampleName: '',
  projectId: '',
  projectName: '',
  unitProjectId: '',
  unitProjectName: '',
  testItemId: '',
})
const templateInfo = ref<Template>()
// 参数
const taskParams = ref<TaskParam[]>([])
const isConfirmEdit = ref(false)

provide('isConfirmEdit', isConfirmEdit)
provide('formData', formData)
provide('templateInfo', templateInfo)
provide('taskParams', taskParams)

const spinning = ref(false)
async function getDetailData() {
  const id = route.query.id as string
  if (!id)
    return
  spinning.value = true
  const task = await getTask(route.query.id as string)
  const params = await findTaskParams(task.id)
  const templates = await findTaskTemplates(task.id)
  const template: TaskTemplate = templates[0]

  formData.value = {
    id: task.id,
    sampleId: task.sampleId || '',
    sampleName: task.sampleName || '',
    projectId: task.projectId || '',
    projectName: task.projectName || '',
    unitProjectId: task.unitProjectId || '',
    unitProjectName: task.unitProjectName || '',
    status: task.status,
    testItemId: template.testItemId,
    template: template.name,
    templateId: template.templateId || '',
  }
  taskParams.value = params
  templateInfo.value = {
    ...template,
    id: template.templateId || '',
  }
  spinning.value = false
}

// 保存
const baseInfoRef = ref()
const testInfoRef = ref()
const loading = ref(false)
let addTaskId = ''
async function saveData() {
  const valid = await baseInfoRef.value.validBaseInfoForm()
  if (valid === false)
    return
  const taskParams: TaskParam[] = testInfoRef.value.getTaskParams()
  if (taskParams.length === 0)
    return showToast({ type: 'fail', message: '请添加检测参数' })

  loading.value = true

  debounce(async () => {
    try {
      const userStore = useUserStore()
      const params = {
        ...formData.value,
        username: userStore.username,
        taskParams,
        template: templateInfo.value as Template,
      }

      addTaskId = await saveOnsiteTask(params)
      showToast({ type: 'success', message: '保存成功' })
      router.back()
    }
    catch (err) {
      const e = translateError(err)
      showToast({ type: 'fail', message: e.message })
      loading.value = false
    }
  }, 300)
}

const testTaskContent = ref()
const scrollTop = ref(0)
function cacheScrollTop() {
  scrollTop.value = testTaskContent.value.scrollTop
}

onActivated(() => {
  testTaskContent.value.scrollTop = scrollTop.value
})

onBeforeRouteLeave((to, from) => {
  if (to.name === 'TestTask') {
    keepAliveStore().removeCachedView(from as any)
    to.meta.refresh = addTaskId
  }
  else {
    cacheScrollTop()
  }
})
</script>

<template>
  <div class="show-title-bar test-task-detail">
    <TitleBar />
    <div ref="testTaskContent" class="test-task-content pd-lr">
      <CustomSpin v-model="spinning">
        <div class="content-item task-baseinfo">
          <h4 class="page-title-min">
            基本信息
          </h4>
          <BaseInfo ref="baseInfoRef" />
        </div>
        <div class="content-item task-testinfo">
          <h4 class="page-title-min">
            试验内容
          </h4>
          <TestInfo ref="testInfoRef" :params="taskParams" is-edit />
        </div>
        <div class="handles">
          <van-button type="primary" block :loading="loading" @click="saveData">
            保存
          </van-button>
        </div>
      </CustomSpin>
    </div>
  </div>
</template>

<style lang="less" scoped>
.page-title-min {
  margin-bottom: 2rem;
  font-size: 16px;
  font-weight: 600;
  line-height: 19px;
  &::before {
    content: '';
    float: left;
    margin-top: 2px;
    margin-right: 10px;
    width: 4px;
    height: 14px;
    vertical-align: middle;
    background-color: #0284fe;
    border-radius: 0 3px 3px 0;
  }
}
.test-task-content {
  height: 100%;
  overflow: auto;
  font-size: 14px;
  .content-item {
    padding: 1.5rem 2rem;
    margin-top: 1.5rem;
    background-color: #fff;
  }
}

.handles {
  margin: 8% 10%;
}
</style>
