<template>
  <HtModal
    v-model:open="visible"
    title="选择设备"
    width="70%"
    :confirm-loading="loading"
    :after-close="onClosed"
    @ok="handleOk"
  >
    <TitleBar class="mt-2">
      {{ planRow.name }}（{{ planRow.code }}）
    </TitleBar>

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
          <template v-if="column.dataIndex === 'status'">
            <a-tag v-if="record.status === StatusType.填写中" color="#555555">
              进行中
            </a-tag>
            <a-tag v-if="record.status === StatusType.待提交" color="#0066ec">
              待提交
            </a-tag>
            <a-tag v-if="record.status === StatusType.审核中" color="#f59a23">
              审核中
            </a-tag>
            <a-tag v-if="record.status === StatusType.未通过" color="#d9001b">
              未通过
            </a-tag>
            <a-tag v-if="record.status === StatusType.已完成" color="#70b603">
              已通过
            </a-tag>
            <a-tag v-if="!record.status" color="#00bfbf">
              无记录
            </a-tag>
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
import TitleBar from '~/components/TitleBar.vue'
import type {
  GetSelectEqEntity,
  GetSelectEqParams,
  PlanAvailableItem,
  SelectEqItem,
} from '~/views/equipment/funcationalInspect/record/api.ts'
import {
  getSelectEq,
} from '~/views/equipment/funcationalInspect/record/api.ts'
import { useTableHooks } from '~/hooks/useTableHooks.ts'
import { StatusType } from '~/views/equipment/funcationalInspect/plan/api.ts'

const props = defineProps<IDialogPropsParam<null, PlanAvailableItem>>()

const planRow = computed(() => props.param)

const visible = ref(true)

const selectedRowKeys = ref([])

const selectedRows = ref([])

const treeData = ref<IDepartmentEntity[]>([])

const queryForm = ref<GetSelectEqParams>({
  planId: planRow.value.id,
})

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
    width: 100,
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
  {
    title: '核查进度',
    dataIndex: 'status',
    width: 100,
  },
]

const {
  loading,
  dataSource,
  handleSearch,
  getPagination,
} = useTableHooks<GetSelectEqEntity>({
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

function onReset() {
  queryForm.value.departmentId = undefined
  queryForm.value.q = ''
  handleSearch()
}

async function getTreeData() {
  const { data } = await getOrgComboTree()
  treeData.value = data
}

function getRowSelection() {
  return {
    fixed: true,
    selectedRowKeys: selectedRowKeys.value,
    getCheckboxProps: record => ({
      disabled: !!record.checkId,
    }),
    onChange: (keys: string[], rows) => {
      selectedRowKeys.value = keys
      selectedRows.value = rows
    },
  }
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

async function handleOk() {
  if (!selectedRows.value.length) {
    message.warn('请选择设备！')
    return
  }

  props.onConfirm(unref(selectedRows.value))
  visible.value = false
}
</script>
