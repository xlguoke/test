<template>
  <ht-modal
    v-model:open="internalOpen"
    :title="title"
    width="600px"
    @ok="handleConfirm"
    @cancel="handleCancel"
  >
    <div class="min-h-[50vh]">
      <a-space direction="vertical" style="width: 100%;">
        <a-form
          ref="formRef"
          :model="formState"
          layout="inline"
          @submit="handleSearch"
        >
          <a-form-item name="quickQry">
            <a-input
              v-model:value.trim="formState.quickQry"
              placeholder="请输入用户/部门名称"
              allow-clear
            />
          </a-form-item>
        </a-form>
        <a-table
          :key="formState.quickQry"
          v-model:expanded-row-keys="expandedKeys"
          bordered
          row-key="id"
          :loading="loading"
          :columns="columns"
          :pagination="false"
          :data-source="filterData"
          :custom-row="customRow"
          :row-selection="
            getRowSelection({
              type: multiple ? 'checkbox' : 'radio',
              getCheckboxProps: (record: IUserSelectVoEntity) => ({
                disabled: record.disabled, // Column configuration not to be checked
              }),
            })"
          :scroll="{ y: '60vh' }"
        />
      </a-space>
    </div>
  </ht-modal>
</template>

<script lang="ts" setup>
import { message } from 'ant-design-vue'
import type { FormExpose } from 'ant-design-vue/es/form/Form'
import { getPersonsForChoose } from '~/api/common'
import { useTableHooks } from '~/hooks/useTableHooks'
import { type IUserSelectVoEntity, UserSelectVoType } from '~/interface/IUserSelectVoEntity'

const props = defineProps({
  /**
   * # 是否展示弹窗
   */
  show: {
    type: Boolean,
    default: false,
  },
  /**
   * 是否可以多选
   */
  multiple: {
    type: Boolean,
    default: false,
  },
  /**
   * 已选中的ID列表
   */
  checkedIds: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
  /**
   * 标题
   */
  title: {
    type: String,
    default: '请选择人员',
  },
})

const emits = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'confirm', value: IUserSelectVoEntity[]): void
  (e: 'cancel'): void
}>()

const expandedKeys = ref<string[]>([])
const {
  loading,
  dataSource,
  selectedRows,
  selectedRowKeys,
  getList,
  getRowSelection,
  handleSearch,
} = useTableHooks<IUserSelectVoEntity>({
  api: getPersonsForChoose,
  immediate: false,
  rowsKey: 'obj',
  responseDataTransform: (res) => {
    (function _each(datas) {
      if (datas && datas.length) {
        for (let i = 0; i < datas.length; i++) {
          const item = datas[i]
          item.disabled = item.type === UserSelectVoType.DEPART
          _each(item.children)
        }
      }
    })(res.obj)
    return res
  },
})

const formRef = ref<FormExpose>()

const formState = ref({
  quickQry: '',
})

const internalOpen = ref(props.show)

watch(() => props.show, (val) => {
  internalOpen.value = val
  if (val) {
    init()
  }
})

watch(internalOpen, (val) => {
  emits('update:show', val)
})

const columns = [
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '账号',
    dataIndex: 'account',
    key: 'account',
    width: '40%',
  },
]

function customRow(record: IUserSelectVoEntity) {
  return {
    onClick: () => {
      if (record.children && record.children.length > 0) {
        const ind = expandedKeys.value.findIndex(d => d === record.id)
        if (ind === -1) {
          expandedKeys.value.push(record.id)
        }
        else {
          expandedKeys.value.splice(ind, 1)
        }
      }
      if (record.disabled)
        return
      if (props.multiple) {
        const ind = selectedRowKeys.value.findIndex(d => d === record.id)
        if (ind === -1) {
          selectedRowKeys.value.push(record.id)
          selectedRows.value.push(record)
        }
        else {
          selectedRowKeys.value.splice(ind, 1)
          selectedRows.value.splice(ind, 1)
        }
      }
      else {
        selectedRowKeys.value = [record.id]
        selectedRows.value = [record]
      }
    },
  }
}

const filterData = computed(() => {
  let filterData: IUserSelectVoEntity[] = []
  if (!formState.value.quickQry) {
    filterData = dataSource.value
  }
  else {
    const searchItem = (item: IUserSelectVoEntity) => {
      // 上级（部门）包含查询字段时，返回整个上级；叶子节点（人员）包含查询字段时，返回该节点
      if (item.name.includes(formState.value.quickQry)) {
        filterData.push(item)
        return
      }
      if (item.children && item.children.length > 0) {
        item.children.forEach(child => searchItem(child))
      }
    }

    dataSource.value.forEach(item => searchItem(item))
  }
  return filterData
})

/**
 * # 确认
 */
function handleConfirm() {
  if (!selectedRows.value?.length) {
    return message.warning('请选择人员')
  }
  emits('confirm', selectedRows.value)
  reset()
}

/**
 * # 取消
 */
function handleCancel() {
  emits('cancel')
  reset()
}

/**
 * # 重置
 */
function reset() {
  formRef.value?.resetFields()
  selectedRows.value = []
  selectedRowKeys.value = []
}

async function init() {
  await getList()
  if (props.checkedIds?.length) {
    selectedRowKeys.value = props.checkedIds
    initExpandedKeys()
  }
}

function initExpandedKeys() {
  const keys = []
  function _each(datas: IUserSelectVoEntity[]) {
    if (!datas || datas.length === 0)
      return ''
    for (let i = 0; i < datas.length; i++) {
      const item = datas[i]
      if (props.checkedIds.includes(item.id)) {
        return item.id
      }
      else {
        const cId = _each(item.children)
        if (cId) {
          keys.unshift(cId)
          return item.id
        }
      }
    }
    return ''
  }
  const id = _each(dataSource.value)
  if (id)
    keys.unshift(id)

  expandedKeys.value = keys
}
</script>

<style lang="less" scoped>
</style>
