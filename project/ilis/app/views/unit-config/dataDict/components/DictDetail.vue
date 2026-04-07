<template>
  <BaseSpinWrapper>
    <p>字典分类：{{ dict.typegroupname }}</p>
    <BaseTitle size="small" class="mb-0">
      类型列表
    </BaseTitle>
    <div>
      <a-button type="link" @click="handleEdit(false)">
        <PlusCircleOutlined />类型录入
      </a-button>
      <a-button type="link" @click="handleEdit(true)">
        <EditOutlined />类型编辑
      </a-button>
    </div>
    <div ref="tableBoxRef" class="flex-1 h-0">
      <IlisTable
        row-key="id"
        :entity="DictDetailEntity"
        :data-source="dataSource"
        :table-height="tableHeight"
        :pagination="getPagination()"
        :row-selection="getRowSelection({
          type: 'radio',
        })"
        :custom-row="getCustomRow()"
        show-index
      >
        <template #bodyCell="{ record, column }">
          <template v-if="column.dataIndex === 'action'">
            <a-button
              type="link"
              size="small"
              danger
              @click.stop="handleDelete([record as DictDetailEntity], {
                title: '删除确认',
                content: '确定删除该记录吗 ?',
              })"
            >
              删除
            </a-button>
          </template>
        </template>
      </IlisTable>
    </div>
  </BaseSpinWrapper>
</template>

<script setup lang='ts'>
import type { DictListEntity } from '../DataDictEntity.ts'
import { EditOutlined, PlusCircleOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { useTableHooks } from '~/hooks/useTableHooks'
import { deleteDictDataApi, dictDataListApi } from '../api'
import { DictDetailEntity } from '../DataDictEntity.ts'
import AddEdit from './AddEdit.vue'

const props = defineProps<{
  dict: DictListEntity
}>()

const query = ref({
  typegroupid: props.dict.id,
})

const {
  dataSource,
  selectedRows,
  tableBoxRef,
  tableHeight,
  handleDelete,
  getPagination,
  getRowSelection,
  getCustomRow,
  getList,
} = useTableHooks({
  delApi: deleteDictDataApi,
  api: dictDataListApi,
  sizeKey: 'rows',
  query,
})

watch(() => props.dict.id, (id) => {
  query.value.typegroupid = id
  getList()
})

async function handleEdit(edit: boolean) {
  const row = selectedRows.value[0]
  if (edit && !row) {
    return message.error('请选择需要编辑的类型！')
  }
  await AnyDialogHelper.showModel(AddEdit, {
    dict: props.dict,
    record: edit ? row : undefined,
  })
  getList()
}
</script>

<style>

</style>
