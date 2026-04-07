<template>
  <ht-modal
    v-model:open="internalOpen"
    width="800px"
    title="选择人员"
    :after-close="onClosed"
    @cancel="handleCancel"
    @ok="handleConfirm"
  >
    <a-form
      ref="formRef"
      :model="formState"
      layout="inline"
      class="mb-2"
    >
      <a-form-item name="department">
        <a-input
          v-model:value="formState.department"
          placeholder="请输入任职部门查询"
          allow-clear
          class="w-[220px]"
          @press-enter="handleSearch()"
        />
      </a-form-item>
      <a-form-item name="quickQryParam">
        <a-input
          v-model:value="formState.queryParam"
          placeholder="请输入姓名查询"
          allow-clear
          class="w-[220px]"
          @press-enter="handleSearch()"
        />
      </a-form-item>
      <a-form-item>
        <a-space>
          <a-button type="primary" @click="handleSearch(formState)">
            查询
          </a-button>
          <a-button @click="onReset">
            重置
          </a-button>
        </a-space>
      </a-form-item>
    </a-form>
    <a-table
      row-key="id"
      bordered
      :loading="loading"
      :columns="columns"
      :data-source="dataSource"
      :pagination="getPagination()"
      :row-selection="getRowSelection({
        type: multiple ? 'checkbox' : 'radio',
      })"
      :scroll="{ y: '50vh' }"
      :custom-row="getCustomRow()"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'personStatus'">
          <span v-if="record.personStatus === '0'">在职</span>
          <span v-if="record.personStatus === '1'">离职</span>
        </template>
      </template>
    </a-table>
  </ht-modal>
</template>

<script setup lang="ts">
import type { FormExpose } from 'ant-design-vue/es/form/Form'
import type { ColumnType } from 'ant-design-vue/es/table'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import type { PersonDataEntity, QueryParams } from '~/api/person.ts'
import { message } from 'ant-design-vue'
import { getPerson } from '~/api/person.ts'
import { useTableHooks } from '~/hooks/useTableHooks'

interface PropParam {
  multiple: boolean
  equipmentId: string
  onConfirm: (rows: PersonDataEntity[]) => void
}

const props = defineProps<IDialogPropsParam<PersonDataEntity[], PropParam>>()

const multiple = computed(() => props.param.multiple)

const equipmentId = computed(() => props.param.equipmentId)

const internalOpen = ref(true)

const columns: ColumnType[] = [
  {
    title: '姓名',
    dataIndex: 'personName',
  },
  {
    title: '任职部门',
    dataIndex: 'department',
  },
  {
    title: '人员状态',
    dataIndex: 'personStatus',
  },
]

const formRef = ref<FormExpose>()

const formState = ref<QueryParams>({
  equipmentId: equipmentId.value,
  department: '',
  queryParam: '',
})

const {
  loading,
  dataSource,
  selectedRows,
  getPagination,
  getRowSelection,
  getCustomRow,
  handleSearch,
} = useTableHooks<PersonDataEntity>({
  api: getPerson,
  formRef,
  query: formState,
  responseDataTransform: (res) => {
    return {
      rows: res.obj.rows,
      total: res.obj.count,
    }
  },
})

function onReset() {
  formState.value = {
    equipmentId: equipmentId.value,
    department: '',
    queryParam: '',
  }
  handleSearch(formState.value)
}

/**
 * # 确认
 */
function handleConfirm() {
  if (!selectedRows.value?.length) {
    return message.warning('请选择人员')
  }

  if (props.param.onConfirm)
    props.param.onConfirm(selectedRows.value)
  else
    props.onConfirm(selectedRows.value)

  handleCancel()
}

/**
 * # 取消
 */
function handleCancel() {
  internalOpen.value = false
}
</script>
