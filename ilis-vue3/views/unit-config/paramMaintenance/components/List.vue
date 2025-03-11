<template>
  <div class="h-full flex flex-col">
    <a-space>
      <a-input
        v-model:value="queryForm.displayName"
        class="w-[320px]"
        allow-clear
        placeholder="请输入参数名称后回车检索"
      />
      <a-button type="primary" html-type="submit" @click="handleSearch()">
        查询
      </a-button>
      <a-button @click="reset">
        重置
      </a-button>
    </a-space>

    <div>
      <a-button class="mt-4" @click="onBatchSetting">
        设置养护/试验温湿度要求
      </a-button>
    </div>

    <div ref="tableBoxRef" class="flex-1 overflow-auto mt-4">
      <a-table
        row-key="id"
        :columns="columns"
        :data-source="dataSource"
        :row-selection="getRowSelection()"
        :pagination="getPagination()"
        :loading="loading"
        :scroll="{ y: tableHeight }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'box'">
            {{ record.box ? "是" : "否" }}
          </template>
          <template v-if="column.dataIndex === 'house'">
            {{ record.house ? "是" : "否" }}
          </template>
          <template v-if="column.dataIndex === 'boxTemMin'">
            <span>{{ record.boxTemMin }} ~ {{ record.boxTemMax }}</span>
          </template>
          <template v-if="column.dataIndex === 'boxHumMin'">
            <span>{{ record.boxHumMin }} ~ {{ record.boxHumMax }}</span>
          </template>
          <template v-if="column.dataIndex === 'houseTemMin'">
            <span>{{ record.houseTemMin }} ~ {{ record.houseTemMax }}</span>
          </template>
          <template v-if="column.dataIndex === 'houseHumMin'">
            <span>{{ record.houseHumMin }} ~ {{ record.houseHumMax }}</span>
          </template>
          <template v-else-if="column.dataIndex === 'enableStatus'">
            <a-switch v-model:checked="record.enableStatus" checked-children="开" un-checked-children="关" />
          </template>
          <template v-else-if="column.dataIndex === 'action'">
            <a-button type="link" size="small" @click="onSetting(record)">
              设置
            </a-button>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 设置 -->
    <EditSetting v-model:open="settingVisible" :data-source="editDataSource" @on-save="getList()" />
  </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import type { ColumnType } from 'ant-design-vue/es/table'
import { message } from 'ant-design-vue'
import type { ParamHumitureDataItem } from '../api/getParamHumitureList.ts'
import { GetParamHumitureListParams, getParamHumitureList } from '../api/getParamHumitureList.ts'
import EditSetting from './EditSetting.vue'
import { useTableHooks } from '~/hooks/useTableHooks'
import { useTableHeight } from '~/hooks/useTableHeight'
import { SaveParamHumitureEntity } from '~/views/unit-config/paramMaintenance/api/saveParamHumiture.ts'

const props = defineProps({
  bigCategoryId: {
    type: String,
    default: null,
  },
})

const columns: ColumnType[] = [
  { title: '试验系统参数名称', dataIndex: 'testItemName', width: 220 },
  { title: '试验参数显示名称', dataIndex: 'displayName', width: 220 },
  { title: '参数备注', dataIndex: 'remark', width: 180 },
  { title: '是否需要养护', dataIndex: 'box', width: 180 },
  { title: '养护温度范围(℃)', dataIndex: 'boxTemMin', width: 180 },
  { title: '养护湿度范围(%RH)', dataIndex: 'boxHumMin', width: 180 },
  { title: '试验对温湿度是否有要求', dataIndex: 'house', width: 220 },
  { title: '试验温度范围(℃)', dataIndex: 'houseTemMin', width: 180 },
  { title: '试验湿度范围(%RH)', dataIndex: 'houseHumMin', width: 180 },
  { title: '操作', dataIndex: 'action', width: 120, fixed: 'right', align: 'center' },
]

const { tableHeight, tableBoxRef } = useTableHeight()

const settingVisible = ref(false)

const editDataSource = ref({})

const queryForm = ref(new GetParamHumitureListParams())

const bigCategoryId = computed(() => props.bigCategoryId)

const {
  loading,
  dataSource,
  getRowSelection,
  getPagination,
  selectedRows,
  selectedRowKeys,
  handleSearch,
  handleReset,
  getList,
} = useTableHooks<ParamHumitureDataItem>({
  api: getParamHumitureList,
  immediate: false,
  query: queryForm,
})

watch(() => bigCategoryId.value, (val: string) => {
  queryForm.value.bigCategoryId = val
  selectedRows.value = []
  selectedRowKeys.value = []

  if (bigCategoryId.value) {
    handleSearch()
  }
  else {
    dataSource.value = []
  }
})

function reset() {
  queryForm.value.displayName = ''
  handleReset()
}

function onSetting(record) {
  const data = new SaveParamHumitureEntity()
  for (const key in data) {
    data[key] = record[key]
  }
  data.ids = record.id
  editDataSource.value = data
  settingVisible.value = true
}

function onBatchSetting() {
  if (selectedRowKeys.value.length === 0) {
    message.warn('请勾选要操作的数据！')
    return
  }

  const data = new SaveParamHumitureEntity()
  data.ids = selectedRowKeys.value.join(',')
  editDataSource.value = data
  settingVisible.value = true
}
</script>
