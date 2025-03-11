<template>
  <HtModal
    v-model:open="visible"
    title="选择设备"
    width="80%"
    :confirm-loading="submitLoading"
    :after-close="onClosed"
    @ok="handleOk"
  >
    <a-space class="mt-4">
      <a-tree-select
        v-model:value="queryForm.departmentId"
        class="w-[220px]"
        :tree-data="treeData"
        :field-names="{
          label: 'text',
          value: 'id',
        }"
        allow-clear
        placeholder="请选择所属部门"
        tree-node-filter-prop="text"
      />
      <a-input v-model:value.trim="queryForm.q" class="w-[220px]" placeholder="请输入设备名称或设备编号后查询" />
      <a-button type="primary" @click="handleSearch()">
        查询
      </a-button>
      <a-button @click="onReset">
        重置
      </a-button>
    </a-space>

    <div class="mt-4">
      <a-table
        row-key="equipmentId"
        :columns="columns"
        :data-source="dataSource"
        :pagination="getPagination()"
        :loading="loading"
        :scroll="{ y: 350 }"
        bordered
        :row-selection="getRowSelection()"
        :custom-row="customRow"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'lastCheckDate'">
            <span v-if="record.lastCheckStartDate && record.lastCheckEndDate">
              {{ record.lastCheckStartDate }} ~ {{ record.lastCheckEndDate }}
            </span>
          </template>
        </template>
      </a-table>
    </div>
  </HtModal>
</template>

<script lang="ts" setup>
import { message } from 'ant-design-vue'
import type { ColumnType } from 'ant-design-vue/es/table'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import type { IDepartmentEntity } from '~/interface/IDepartmentEntity.ts'
import { getOrgComboTree } from '~/api/common.ts'
import { useTableHooks } from '~/hooks/useTableHooks.ts'
import type { AddCheckEntity, GetSelectEqParams, SelectEqItem } from '~/views/equipment/funcationalInspect/record/api.ts'
import {
  addCheck,
  getSelectEq,
} from '~/views/equipment/funcationalInspect/record/api.ts'

const props = defineProps<IDialogPropsParam<null, any>>()

const visible = ref(true)

const submitLoading = ref(false)

const selectedRowKeys = ref([])

const selectedRows = ref([])

const treeData = ref<IDepartmentEntity[]>([])

const queryForm = ref<GetSelectEqParams>({})

const isSelect = ref(props.param.isSelect)

const columns: ColumnType[] = [
  {
    title: '设备名称',
    dataIndex: 'equipmentName',
    width: 150,
  },
  {
    title: '设备编号',
    dataIndex: 'equipmentCode',
    width: 150,
  },
  {
    title: '规格型号',
    dataIndex: 'standard',
    width: 150,
  },
  {
    title: '购置日期',
    dataIndex: 'buyDate',
    width: 150,
  },
  {
    title: '上次核查日期',
    dataIndex: 'lastCheckDate',
    width: 150,
  },
  {
    title: '所属部门',
    dataIndex: 'department',
    width: 150,
  },
]

const {
  loading,
  dataSource,
  handleSearch,
  getPagination,
} = useTableHooks<SelectEqItem>({
  query: queryForm,
  api: getSelectEq,
  responseDataTransform: (res) => {
    selectedRows.value = []
    selectedRowKeys.value = []

    return {
      rows: res.rows,
      total: res.count,
    }
  },
})

getTreeData()

async function getTreeData() {
  const { data } = await getOrgComboTree()
  treeData.value = data
}

function onReset() {
  queryForm.value.departmentId = undefined
  queryForm.value.q = ''
  handleSearch()
}

function customRow(record: SelectEqItem) {
  return {
    onClick: () => {
      if (selectedRowKeys.value.includes(record.equipmentId)) {
        selectedRowKeys.value = selectedRowKeys.value.filter(i => i !== record.equipmentId)
        selectedRows.value = selectedRows.value.filter(i => i.equipmentId !== record.equipmentId)
      }
      else {
        selectedRowKeys.value.push(record.equipmentId)
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
    message.warn('请选择设备！')
    return
  }

  if (isSelect.value) {
    props.onConfirm(unref(selectedRows.value))
    visible.value = false
    return
  }

  submitLoading.value = true
  await addCheck({
    checks: selectedRows.value as AddCheckEntity[],
  }).finally(() => {
    submitLoading.value = false
  })
  message.success('操作成功！')
  props.onConfirm(null)
  visible.value = false
}
</script>
