<template>
  <div class="flex flex-col" style="height: calc(100% + 16px)">
    <a-space>
      <a-select v-model:value="queryForm.systemId" style="width: 240px;" placeholder="请选择系统">
        <a-select-option value="1">
          系统1
        </a-select-option>
        <a-select-option value="2">
          系统2
        </a-select-option>
      </a-select>
      <a-input
        v-model:value="queryForm.quickQryParam"
        style="width: 240px"
        allow-clear
        placeholder="请输入消息"
      />
      <a-button type="primary" html-type="submit" @search="handleSearch">
        查询
      </a-button>
      <a-button @reset="reset">
        重置
      </a-button>
    </a-space>

    <div ref="tableBoxRef" class="flex-1 overflow-auto mt-4">
      <a-table
        row-key="id"
        :columns="columns"
        :data-source="dataSource"
        :row-selection="getRowSelection()"
        :pagination="getPagination()"
        :loading="loading"
        :scroll="{ x: 1200, y: tableHeight }"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.dataIndex === 'index'">
            {{ index + 1 }}
          </template>
          <template v-else-if="column.dataIndex === 'enableStatus'">
            <a-switch v-model:checked="record.enableStatus" checked-children="开" un-checked-children="关" />
          </template>
          <template v-else-if="column.dataIndex === 'action'">
            <a-button type="link" size="small" @click="onEdit(record)">
              编辑
            </a-button>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 编辑消息 -->
    <EditMessage v-model:open="editVisible" :data-source="editDataSource" @on-save="getList" />
  </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import type { ColumnType } from 'ant-design-vue/es/table'
import { pageListApi } from '../api'
import type { DataSource } from '../api'
import EditMessage from './EditMessage.vue'
import { useTableHooks } from '~/hooks/useTableHooks'
import { useTableHeight } from '~/hooks/useTableHeight'

const columns: ColumnType[] = [
  { title: '序号', dataIndex: 'index', width: '10%' },
  { title: '系统分类', dataIndex: 'standardName', width: '18%' },
  { title: '消息', dataIndex: 'publishCode' },
  { title: '消息模板', dataIndex: 'type' },
  { title: '启用状态', dataIndex: 'enableStatus' },
  { title: '操作', dataIndex: 'action', width: 80 },
]

const { tableHeight, tableBoxRef } = useTableHeight()

const editVisible = ref(false)

const editDataSource = ref({})

const queryForm = ref({
  quickQryParam: undefined,
  systemId: undefined,
})

const {
  loading,
  dataSource,
  getList,
  getRowSelection,
  getPagination,
  handleSearch,
  handleReset,
} = useTableHooks<DataSource>({
  api: pageListApi,
  query: queryForm,
})

function reset() {
  queryForm.value = {
    quickQryParam: undefined,
    systemId: undefined,
  }
  handleReset()
}

function onEdit(record) {
  editDataSource.value = { ...record }
  editVisible.value = true
}
</script>
