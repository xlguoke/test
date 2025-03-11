<template>
  <HtModal
    v-model:open="visible"
    title="选择计划"
    width="80%"
    :after-close="onClosed"
  >
    <div class="mt-4">
      <a-table
        row-key="id"
        :columns="columns"
        :data-source="dataSource"
        :pagination="getPagination()"
        :loading="loading"
        :scroll="{ y: 420 }"
        bordered
        :row-selection="getRowSelection()"
        :custom-row="customRow"
      />
    </div>
    <template #footer>
      <a-button @click="cancel">
        取消
      </a-button>
      <a-button type="primary" :loading="submitLoading" @click="handleOk">
        确定
      </a-button>
    </template>
  </HtModal>
</template>

<script lang="ts" setup>
import { message } from 'ant-design-vue'
import type { ColumnType } from 'ant-design-vue/es/table'
import PlanEqSelector from './PlanEqSelector.vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import type {
  AddCheckEntity,
  PlanAvailableItem,
} from '~/views/equipment/funcationalInspect/record/api.ts'
import {
  addCheck,
  getPlanAvailable,
} from '~/views/equipment/funcationalInspect/record/api.ts'
import { useTableHooks } from '~/hooks/useTableHooks.ts'
import { EDateFormatType } from '~/utils/EDateFormatType.ts'

const props = defineProps<IDialogPropsParam<null, any>>()

const submitLoading = ref(false)

const visible = ref(true)

const selectedRowKeys = ref([])

const selectedRows = ref([])

const columns: ColumnType[] = [
  {
    title: '计划编号',
    dataIndex: 'code',
    width: 150,
  },
  {
    title: '计划名称',
    dataIndex: 'name',
    width: 150,
  },
  {
    title: '计划进度',
    dataIndex: 'progress',
    width: 120,
    customRender: ({ record }: any) => {
      return `${record.progress}/${record.amount}`
    },
  },
  {
    title: '计划日期',
    dataIndex: 'planDate',
    width: 150,
  },
  {
    title: '计划说明',
    dataIndex: 'description',
    width: 150,
  },
  {
    title: '制定人',
    dataIndex: 'createName',
    width: 120,
  },
  {
    title: '制定日期',
    dataIndex: 'createDate',
    width: 120,
    customRender: ({ text }: any) => {
      return AnyDateTimeHelper.format(text, EDateFormatType.YYYY_MM_DD)
    },
  },
]

const {
  loading,
  dataSource,
  getPagination,
} = useTableHooks<PlanAvailableItem>({
  api: getPlanAvailable,
  responseDataTransform: (res) => {
    return {
      rows: res.rows,
      total: res.count,
    }
  },
})

function customRow(record: PlanAvailableItem) {
  return {
    onClick: () => {
      selectedRowKeys.value = [record.id]
      selectedRows.value = [record]
    },
  }
}

function getRowSelection() {
  return {
    type: 'radio',
    fixed: true,
    selectedRowKeys: selectedRowKeys.value,
    onChange: (keys: string[], rows) => {
      selectedRowKeys.value = keys
      selectedRows.value = rows
    },
  }
}

async function handleOk() {
  if (!selectedRows.value.length) {
    message.warn('请选择计划！')
    return
  }

  const planRow = selectedRows.value[0]

  const data = await AnyDialogHelper.showModel(PlanEqSelector, unref(planRow))
  data.forEach((item) => {
    const dates = planRow.planDate.split(' ~ ')
    item.checkStartDate = dates[0]
    item.checkEndDate = dates[1]
  })

  submitLoading.value = true
  await addCheck({
    checks: data as AddCheckEntity[],
  }).finally(() => {
    submitLoading.value = false
  })
  message.success('操作成功！')
  props.onConfirm(null)
  cancel()
}

function cancel() {
  visible.value = false
}
</script>
