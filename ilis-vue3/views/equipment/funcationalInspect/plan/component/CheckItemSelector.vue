<template>
  <HtModal
    v-model:open="visible"
    title="核查项目"
    width="640px"
    :confirm-loading="loading"
    :after-close="onClosed"
    @ok="handleOk"
  >
    <div class="mt-4">
      <a-table
        row-key="id"
        :columns="columns"
        :data-source="list"
        :pagination="false"
        :loading="loading"
        :scroll="{ y: 400 }"
        bordered
        :row-selection="getRowSelection()"
        :custom-row="customRow"
      />
    </div>
  </HtModal>
</template>

<script lang="ts" setup>
import { message } from 'ant-design-vue'
import type { ColumnType } from 'ant-design-vue/es/table'
import type { EquipmentFunCheckPlanEntity } from '../EquipmentFunCheckPlanEntity.ts'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { getListByGroupId } from '~/api/common.ts'
import type { ScreenTypeEntity } from '~/views/admin/screen/configuration'

const props = defineProps<IDialogPropsParam<null, EquipmentFunCheckPlanEntity>>()

const visible = ref(true)

const loading = ref(false)

const list = ref<ScreenTypeEntity[]>([])

const selectedRowKeys = ref([])

const selectedRows = ref([])

const columns: ColumnType[] = [
  {
    title: '核查项目',
    dataIndex: 'typename',
  },
]

getList()

function getList() {
  getListByGroupId('6237f908815e4283bf66165ba1c2a16b').then((res) => {
    list.value = res.data.obj
  })
}

function customRow(record: ScreenTypeEntity) {
  return {
    onClick: () => {
      if (selectedRowKeys.value.includes(record.id)) {
        selectedRowKeys.value = selectedRowKeys.value.filter(i => i !== record.id)
        selectedRows.value = selectedRows.value.filter(i => i.id !== record.id)
      }
      else {
        selectedRowKeys.value.push(record.id)
        selectedRows.value.push(record)
      }
    },
  }
}

function getRowSelection() {
  return {
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
    message.warn('请选择数据！')
    return
  }

  props.onConfirm(unref(selectedRows.value))
  visible.value = false
}
</script>
