<template>
  <div class="h-full flex flex-col gap-3">
    <a-space>
      <a-button type="primary" @click="handleAdd">
        新增
      </a-button>
    </a-space>
    <div ref="tableBoxRef" class="flex-1 mt-2 h-0">
      <IlisTable
        row-key="id"
        :entity="TraceabilityEntity"
        :loading="loading"
        :data-source="dataSource"
        :table-height="tableHeight"
        :show-index="true"
        bordered
      >
        <template #bodyCell="{ column, record, text }">
          <template v-if="column.dataIndex === 'operation'">
            <span v-if="editableData[record.id]">
              <a-button type="link" @click="handleSave(record.id as string)">保存</a-button>
            </span>
            <span v-else>
              <a-button type="link" primary @click="handleEdit(record.id as string)">修改</a-button>
            </span>
            <span>
              <a-button type="link" danger @click="handleDelete(record.id as string)">删除</a-button>
            </span>
          </template>
          <template v-if="['traceabilityOrgName', 'certificateSn'].includes(column.dataIndex as string)">
            <div>
              <a-input
                v-if="editableData[record.id]"
                v-model:value="editableData[record.id][column.dataIndex as string]"
                style="width: 100%"
                placeholder="请输入"
              />
              <template v-else>
                {{ text }}
              </template>
            </div>
          </template>
          <template v-if="['validityDate'].includes(column.dataIndex as string)">
            <div>
              <a-date-picker
                v-if="editableData[record.id]"
                v-model:value="editableData[record.id][column.dataIndex as string]"
                value-format="YYYY-MM-DD"
                style="width: 100%"
                placeholder="请选择"
              />
              <template v-else>
                {{ dayjs(text).format('YYYY-MM-DD') }}
              </template>
            </div>
          </template>
        </template>
      </IlisTable>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { cloneDeep } from '@unovis/ts'
import { message, Modal } from 'ant-design-vue'
import dayjs from 'dayjs'
import { useTableHooks } from '~/hooks/useTableHooks'
import { addTraceabilityApi, deleteTraceabilityApi, getListApi, updateTraceabilityApi } from '../api'
import { TraceabilityEntity } from '../TraceabilityEntity'

const editableData = ref<Record<string, TraceabilityEntity>>({})
const parentUrl = window.parent.location.href
const equipmentId = getEquipmentIdFromUrl(parentUrl)
const query = ref({
  equipmentId,
})

const {
  loading,
  dataSource,
  tableBoxRef,
  tableHeight,
  getList,
} = useTableHooks<TraceabilityEntity>({
  api: getListApi,
  query,
  defaultPageSize: 9999,
  responseDataTransform: (res) => {
    return {
      rows: res?.rows?.reverse() ?? [],
      total: res?.count ?? 0,
    }
  },
})

function getEquipmentIdFromUrl(url: string) {
  const params = new URLSearchParams(url.split('?')[1])
  return params.get('editId')
}
function handleAdd() {
  if (Object.keys(editableData.value).length) {
    message.warning('请先保存当前行数据')
    return
  }
  const tempId = `new_${Date.now()}`
  const newData = { id: tempId, equipmentId } as TraceabilityEntity
  dataSource.value.push(newData)
  // 将新增的行设置为可编辑状态
  editableData.value[tempId] = cloneDeep(newData)
}
function handleEdit(id: string) {
  editableData.value[id] = cloneDeep(dataSource.value.filter(item => id === item.id)[0])
  if (editableData.value[id].validityDate) {
    editableData.value[id].validityDate = dayjs(editableData.value[id].validityDate)
  }
}
async function handleSave(id: string) {
  loading.value = true
  if (editableData.value[id].validityDate) {
    editableData.value[id].validityDate = dayjs(editableData.value[id].validityDate).format('YYYY-MM-DD')
  }
  else {
    editableData.value[id].validityDate = dayjs().format('YYYY-MM-DD')
  }
  if (id.startsWith('new_')) {
    await addTraceabilityApi(editableData.value[id]).finally(() => {
      loading.value = false
    })
  }
  else {
    await updateTraceabilityApi(editableData.value[id]).finally(() => {
      loading.value = false
    })
  }
  // 解除行的可编辑状态
  delete editableData.value[id]
  message.success('操作成功')
  getList()
}
async function handleDelete(id: string) {
  Modal.confirm({
    title: '确认要删除数据吗?',
    content: '删除后数据无法恢复',
    onOk: async () => {
      loading.value = true
      await deleteTraceabilityApi(id).finally(() => {
        loading.value = false
      })
      // 删除正在编辑的行，重置editableData
      if (editableData.value[id]) {
        delete editableData.value[id]
      }
      message.success('操作成功')
      getList()
    },
  })
}
</script>

<style>

</style>
