<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import SubmitReport from './SubmitReport.vue'
import SubmitPdfReport from './SubmitPdfReport.vue'

const route = useRoute()

const testTaskId = computed(() => route.query.testTaskId as string)

const reportId = computed(() => route.query.reportId as string)

const pdfRoundMode = computed(() => route.query.pdfRoundMode as string)

const needMeSubmit = computed(() => route.query.needMeSubmit as string)
</script>

<template>
  <div style="height: 100%;">
    <!-- PDF模式报告确认 -->
    <SubmitPdfReport
      v-if="reportId && pdfRoundMode === '1'"
      :test-task-id="testTaskId"
      :report-id="reportId"
      :need-me-submit="needMeSubmit"
    />

    <!-- 新报告提交 / 非PDF模式报告确认 -->
    <SubmitReport
      v-else
      :test-task-id="testTaskId"
      :report-id="reportId"
    />
  </div>
</template>
