<!-- 选择委托单位、工程项目、委托人 -->
<template>
  <ht-modal
    v-model:open="internalOpen"
    width="800px"
    title="编号掩码变更"
    hide-confirm
    cancel-text="确定"
    :after-close="onClosed"
    @cancel="onConfirm"
  >
    <h4>【检测到编号掩码变更，已自动更新编号】变更明细如下：</h4>
    <a-table
      :data-source="param.datas"
      :columns="columns"
      :pagination="false"
    >
      <template #bodyCell="{ record, column }">
        <template v-if="column.dataIndex === 'snType'">
          {{ codeTypes[record.snType] }}
        </template>
      </template>
    </a-table>
  </ht-modal>
</template>

<script setup lang="ts">
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { useIndustryStore } from '~/store/industryStore'

interface PropType {
  datas: {
    snType: string
    preSn: string
    postSn: string
  }[]
}

defineProps<IDialogPropsParam<any, PropType>>()

const { term } = useIndustryStore()

const internalOpen = ref(true)
const codeTypes: any = {
  task: '任务编号',
  report: '报告编号',
  tempReport: '临时报告编号',
  record: '记录编号',
  consign: '委托编号',
  sample: term('样品编号'),
  provideToCustomerSample: term('来样编号'),
}

const columns = [
  { title: '编号类型', dataIndex: 'snType', width: '20%' },
  { title: '变更前', dataIndex: 'preSn', width: '40%' },
  { title: '变更后', dataIndex: 'postSn', width: '40%' },
]
</script>
