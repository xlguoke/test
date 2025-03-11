<template>
  <ht-modal
    v-model:open="internalOpen"
    width="600px"
    :title="title || '选择人员'"
    :after-close="onClosed"
    @ok="handleConfirm"
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
import type { IDialogPropsSelector } from '~/anyThing/interface/IDialogProps'
import { getPersonsForChoose } from '~/api/common'
import { useTableHooks } from '~/hooks/useTableHooks'
import { type IUserSelectVoEntity, UserSelectVoType } from '~/interface/IUserSelectVoEntity'

const props = defineProps<IDialogPropsSelector<IUserSelectVoEntity>>()

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

const internalOpen = ref(true)

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
  props.onConfirm(selectedRows.value)
  internalOpen.value = false
}

function init() {
  getList()
  if (props.checkedRows?.length) {
    selectedRows.value = props.checkedRows
    selectedRowKeys.value = props.checkedRows.map(d => d.id)
  }
}
init()
</script>

<style lang="less" scoped>
</style>
