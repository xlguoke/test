<template>
  <a-table
    row-key="id"
    :data-source="dataSource"
    :columns="columns"
    :loading="loading"
    :pagination="false"
    bordered
    size="middle"
  >
    <template #bodyCell="{ column, record }">
      <template v-if="['displayName', 'description'].includes(column.dataIndex)">
        <div>
          <a-input
            v-if="editRecordData?.id === record.id"
            v-model:value="editRecordData[column.dataIndex]"
          />
          <template v-else>
            {{ record[column.dataIndex] }}
          </template>
        </div>
      </template>
      <template v-if="column.dataIndex === 'enabled'">
        <a-space size="small">
          <a-switch :checked="record.enabled" @click="switchEnabled(record)" />
        </a-space>
      </template>
      <template v-if="column.dataIndex === 'Action'">
        <template v-if="editRecordData?.id === record.id">
          <a-button
            type="link"
            size="small"
            @click="saveEdit()"
          >
            保存
          </a-button>
          <a-button
            type="link"
            size="small"
            @click="cancelEdit()"
          >
            取消
          </a-button>
        </template>
        <template v-else>
          <a-button
            type="link"
            size="small"
            @click="handleEdit(record)"
          >
            编辑
          </a-button>
        </template>
      </template>
    </template>
  </a-table>
</template>

<script setup lang='ts'>
import { message } from 'ant-design-vue'
import { getLevelPage, updateEnabled, updateLevel } from '../api'
import { RecordEntity, columns } from '../index'

const loading = ref(false)

const dataSource = ref<RecordEntity[]>([])

const editRecordData = ref(new RecordEntity())

async function getList() {
  const res = await getLevelPage()
  dataSource.value = res.data as RecordEntity[]
}

/**
 * 编辑
 */
function handleEdit(row: RecordEntity) {
  if (editRecordData.value?.id) {
    message.warn('当前存在正在编辑列！')
    return
  }

  editRecordData.value = { ...row }
}

/**
 * 取消编辑
 */
function cancelEdit() {
  editRecordData.value = new RecordEntity()
}

/**
 * 保存编辑
 */
async function saveEdit() {
  if (editRecordData.value) {
    const closeLoading = message.loading('数据处理中...', 0)
    await updateLevel(editRecordData.value).finally(() => {
      closeLoading()
    })
    await getList()
    cancelEdit()
    message.success('保存成功！')
  }
}

/**
 * 切换启用/禁用
 */
async function switchEnabled(row) {
  const closeLoading = message.loading('数据处理中...', 0)
  await updateEnabled({
    id: row.id,
    enabled: !row.enabled,
  }).finally(() => { closeLoading() })
  await getList()
  message.success('操作成功！')
}

getList()
</script>
