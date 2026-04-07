<template>
  <IlisContainer
    app-id="report_compiled"
    :tab-list="tabList"
    :active-tab-key="key"
    @tab-change="key = ($event as EReportCompiledStatus)"
  >
    <template v-for="tab in tabList" :key="tab.key">
      <List v-show="key === tab.key" :ref="`listRef_${tab.key}`" :report-status="tab.key" :current-key="key" />
    </template>
  </IlisContainer>
</template>

<script setup lang='ts'>
import List from './component/List.vue'
import { EReportCompiledStatus } from './ReportCompiledEntity'

const key = ref(EReportCompiledStatus.COMPILE)

const tabList = [
  { tab: '报告编制中', key: EReportCompiledStatus.COMPILE },
  { tab: '报告审批中', key: EReportCompiledStatus.AUDIT },
  { tab: '报告已批准', key: EReportCompiledStatus.APPROVED },
  { tab: '报告已作废', key: EReportCompiledStatus.INVALID },
]
</script>
