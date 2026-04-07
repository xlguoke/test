<template>
  <a-space v-if="marks.length" wrap>
    <a-tooltip v-for="(mark, i) in marks" :key="i" placement="top">
      <template #title>
        <span>{{ mark.description }}</span>
      </template>
      <span :style="`color:${mark.color}`">
        {{ mark.label }}
      </span>
    </a-tooltip>
  </a-space>
</template>

<script setup lang='ts'>
import type { ReportData, TabType } from '../listEntity'

const props = defineProps({
  rowData: {
    type: Object as PropType<ReportData>,
    default: () => ({}),
  },
  tabType: {
    type: String as PropType<TabType>,
    default: '0',
  },
})

/** 标记 */
const reportMark = [
  { key: 'temporary', label: '临', color: 'red', description: '临时报告' },
  { key: 'formal', label: '正', color: 'green', description: '正式报告' },
  // { key: 'sign', label: '签', color: 'red', description: '已签名未发放' },
  { key: 'synthesis', label: '综', color: '#f75d00', description: '综合报告' },
  { key: 'kpiDisqualification', label: '指标不合格', color: '#f1891a', description: '有指标不合格' },
  { key: 'disqualification', label: '不合格', color: 'red', description: '不合格' },
]
const marks = ref<any>([])

initMark(props.rowData)

function initMark(row: ReportData) {
  if (row.reportType === 'temporary' || row.reportType === 'synthesis') {
    marks.value.push(reportMark.find(item => item.key === row.reportType))
  }
  if (row.receiverSignature && props.tabType === '0') {
    marks.value.push(reportMark.find(item => item.key === 'sign'))
  }
  // if ((row.autoIsQualified === 0 && row.isQualified && row.isQualified === '1') || row.autoIsQualified === 3) {
  //   marks.value.push(reportMark.find(item => item.key === 'kpiDisqualification'))
  // }
  // if (row.autoIsQualified === 0) {
  //   marks.value.push(reportMark.find(item => item.key === 'disqualification'))
  // }
}
</script>

<style>

</style>
