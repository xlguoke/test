<template>
  <ht-modal
    v-model:open="internalOpen"
    width="800px"
    title="选择人员"
    @cancel="handleCancel"
  >
    <a-form
      ref="formRef"
      :model="formState"
      layout="inline"
      class="my-4"
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
      :scroll="{ y: 450 }"
      :custom-row="getCustomRow"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'personStatus'">
          <span v-if="record.personStatus === '0'">在职</span>
          <span v-if="record.personStatus === '1'">离职</span>
        </template>
      </template>
    </a-table>
    <template #footer>
      <a-button @click="handleCancel()">
        取消
      </a-button>
      <a-button type="primary" @click="handleConfirm()">
        确定
      </a-button>
    </template>
  </ht-modal>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue'
import type { FormExpose } from 'ant-design-vue/es/form/Form'
import type { ColumnType } from 'ant-design-vue/es/table'
import { useTableHooks } from '~/hooks/useTableHooks'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import type { PersonDataEntity, QueryParams } from '~/api/person.ts'
import { getPerson } from '~/api/person.ts'
import type { IResponseOldRowsEntity } from '~/interface/IResponseEntity.ts'

const props = defineProps<IDialogPropsParam<null, { multiple: boolean, onConfirm: (rows: PersonDataEntity[]) => void }>>()

const multiple = computed(() => props.param.multiple)

const equipmentId = computed(() => props.param.equipmentId)

const internalOpen = ref(false)

onMounted(() => {
  internalOpen.value = true
})

const columns: ColumnType[] = [
  {
    title: '姓名',
    dataIndex: 'personName',
  },
  {
    title: '身份证号',
    dataIndex: 'identityNumber',
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
  responseDataTransform: (res: IResponseOldRowsEntity<PersonDataEntity>) => {
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

  props.param.onConfirm(selectedRows.value)
  handleCancel()
}

/**
 * # 取消
 */
function handleCancel() {
  internalOpen.value = false
}
</script>
