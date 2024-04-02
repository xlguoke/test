<script lang="ts" setup>
import { TabPane, Tabs } from 'ant-design-vue'
import type { TabsProps } from 'ant-design-vue'
import { UploadOutlined } from '@ant-design/icons-vue'
import { computed, provide, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { OfflineTask, OnlineTask } from './components'
import type { TaskListQuery } from '@/type/testTask'
import uploadManageStore from '@/stores/uploadManage'

const router = useRouter()
const route = useRoute()

const offlineMarker = reactive<{ [k: string]: boolean }>({})
const uploadLength = computed(() => uploadManageStore().uploadDatas.length)
const activeKey = ref<string | number>('1')
const isOnlineList = computed(() => activeKey.value === '1')
const changeActiveKey: TabsProps['onChange'] = (key) => {
  if (!key)
    return
  activeKey.value = key
}

provide('offlineMarker', offlineMarker)
provide('isOnlineList', isOnlineList)
provide('changeActiveKey', changeActiveKey)

// 查询
const onlineTask = ref()
const offlineTask = ref()
function search(val: TaskListQuery) {
  setTimeout(() => {
    if (isOnlineList.value)
      onlineTask.value.defaultSearch(val)
    else offlineTask.value.defaultSearch(val, true)
  }, 0)
}

function goUploadList() {
  router.push({ name: 'UploadManage' })
}

// 更新离线任务列表
function loadOfflineList() {
  offlineTask.value.refreshList()
}
provide('loadOfflineList', loadOfflineList)

// 页面跳转查询
watch(
  () => route.name,
  (to, from) => {
    if (
      to === 'TestTask'
      && (!from || ['Home', 'Project'].includes(from as string))
    ) {
      const q: any = { ...route.query }
      if (!q.tabKey)
        return
      changeActiveKey(q.tabKey as string)
      if (q.status)
        q.status = (q.status as string).split(',')
      delete q.tabKey
      search(q)
    }
  },
  {
    immediate: true,
  },
)
</script>

<template>
  <div class="show-title-bar test-task-wrap">
    <TitleBar hide-left>
      <template #right>
        <div v-show="!isOnlineList" class="upload-count">
          <UploadOutlined style="font-size: 22px" @click="goUploadList" />
          <span v-show="uploadLength > 0" class="count">
            {{ uploadLength }}
          </span>
        </div>
      </template>
    </TitleBar>

    <div class="test-task-content">
      <div class="test-task-tabs">
        <Tabs v-model:activeKey="activeKey" @change="changeActiveKey">
          <TabPane key="1" tab="在线列表" />
          <TabPane key="2" tab="离线列表" />
        </Tabs>
      </div>

      <!-- 在线任务 -->
      <OnlineTask v-show="isOnlineList" ref="onlineTask" tab-key="online" />

      <!-- 离线任务 -->
      <OfflineTask v-show="!isOnlineList" ref="offlineTask" tab-key="offline" />
    </div>
  </div>
</template>

<style lang="less">
.test-task-wrap {
  .upload-count {
    position: relative;
    .count {
      position: absolute;
      top: 6px;
      left: 16px;
      padding: 0 3px;
      min-width: 16px;
      height: 16px;
      line-height: 16px;
      border-radius: 14px;
      background-color: var(--error-color);
      text-align: center;
      font-size: 12px;
      box-sizing: border-box;
    }
  }

  .test-task-content {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  .test-task-tabs {
    background-color: #fff;
    .ant-tabs-nav-list {
      width: 100%;
      .ant-tabs-tab {
        flex: 1;
      }
    }
  }

  .batch-handle {
    padding: 0 2.5rem 1.2rem;
    display: flex;
    justify-content: space-between;
    background-color: #fff;
    .handles .ant-btn {
      margin-left: 1.5rem;
    }
  }

  .test-task-datas {
    padding-top: 1rem;
    padding-bottom: 1rem;
    flex: 1;
    height: 0;
    .task-checkbox-box {
      display: flex;
      align-items: center;
    }
    .task-name {
      margin-bottom: 5px;
      font-size: 14px;
      line-height: 18px;
      white-space: pre-wrap;
    }
    .ant-col {
      display: flex;
      white-space: pre-wrap;
      .label{
        white-space: nowrap;
      }
      .value{
        flex: 1;
        width: 0;
        max-height: 42px;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
    }
  }
  .task-data-list {
    flex: 1;
    height: 0;
    display: flex;
    flex-direction: column;
  }
}
</style>
