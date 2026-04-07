<script setup lang="ts">
import { provide, ref } from 'vue'
import { useRoute } from 'vue-router'
import TestTaskInfoView from './TestTask/TestTaskInfoView.vue'
import { useTestTaskInfo } from './useTestTaskInfo'

const route = useRoute()

// 是否为离线数据
const isOfflineData = ref(route.query.isOffline === '1')

const testTaskId = route.query.id as string

const {
  detailData,
  taskParams,
  testTaskData,
} = useTestTaskInfo(isOfflineData.value, testTaskId)

provide('isConfirmEdit', true)
provide('formData', detailData)
provide('taskParams', taskParams)
</script>

<template>
  <div class="show-title-bar test-task-detail">
    <TitleBar />
    <TestTaskInfoView
      :is-offline-data="isOfflineData"
      :detail-data="detailData"
      :test-task-data="testTaskData"
      :task-params="taskParams"
    />
  </div>
</template>
