<template>
  <div class="flex flex-col" style="height: calc(100% + 16px)">
    <a-space>
      <a-select
        v-model:value="queryForm['laboratory.id']"
        allow-clear
        style="width: 240px;"
        placeholder="请选择功能室"
        :options="laboratoryOptions"
      />
      <a-button type="primary" @click="handleSearch()">
        查询
      </a-button>
      <a-button @click="onReset">
        重置
      </a-button>
      <a-button @click="ilisAdvancedQuery.open()">
        高级查询
      </a-button>
      <a-checkbox v-model:checked="queryForm.status" class="ml-4" @change="handleSearch()">
        只看已启用的
      </a-checkbox>
    </a-space>

    <!-- 高级查询 -->
    <AdvancedQuery :entity="ilisAdvancedQuery" />

    <a-space v-permission="'humiture_timer_add'" class="mt-4">
      <a-button @click="onAdd">
        新增定时设置
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
          <template v-if="column.dataIndex === 'startDate'">
            {{ record.startDate ? dayjs(record.startDate).format("YYYY-MM-DD HH:mm:ss") : "" }}
          </template>
          <template v-if="column.dataIndex === 'restType'">
            {{ RestTypeDict.getLabelByKey(record.restType) }}
          </template>
          <template v-if="column.dataIndex === 'customType'">
            {{ CustomTypeDict.getLabelByKey(record.customType) }}
          </template>
          <template v-if="column.dataIndex === 'status'">
            {{ record.status === StatusType.开启 ? "开启" : "关闭" }}
          </template>
          <template v-if="column.dataIndex === 'tem'">
            <span v-if="record.customType === CustomType.设置温湿度">
              {{ record.tem }} ~ {{ record.maxTem }}
            </span>
            <span v-else-if="record.customType === CustomType.开启">
              {{ record.tem }}
            </span>
            <span v-else>-</span>
          </template>
          <template v-if="column.dataIndex === 'hum'">
            <span v-if="record.customType === CustomType.设置温湿度">
              {{ record.hum }} ~ {{ record.maxHum }}
            </span>
            <span v-else>-</span>
          </template>
          <template v-else-if="column.dataIndex === 'action'">
            <a-button type="link" size="small" @click="onCheckDetail(record)">
              详情
            </a-button>
            <a-button
              v-if="record.resUserId === localUserInfo.userId"
              v-permission="'humiture_timer_edit'"
              type="link"
              size="small"
              @click="onEdit(record)"
            >
              修改
            </a-button>
            <a-button
              v-if="record.resUserId === localUserInfo.userId"
              v-permission="'humiture_timer_delete'"
              type="link"
              size="small"
              @click="onDel(record)"
            >
              删除
            </a-button>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 新增/编辑 -->
    <CreateForm v-model:open="addUpdateVisible" :data-source="editDataSource" @on-save="handleSearch" />
  </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import type { ColumnType } from 'ant-design-vue/es/table'
import { Modal, message } from 'ant-design-vue'
import dayjs from 'dayjs'
import type {
  HumitureTimerDataItem,
  HumitureTimerListAdvancedParams,
} from '../api/getHumitureTimerList.ts'
import {
  HumitureTimerListParams,
  getHumitureTimerList,
} from '../api/getHumitureTimerList.ts'

import { AdvancedQueryConfigs, CustomType, CustomTypeDict, RestTypeDict, StatusType } from '../index.ts'
import CreateForm from './CreateForm.vue'
import { useTableHooks } from '~/hooks/useTableHooks'
import { useTableHeight } from '~/hooks/useTableHeight'
import { useLaboratoryOptionsHook } from '~/hooks/options/useLaboratoryOptionsHook.ts'
import { delHumitureTimer } from '~/views/common/humiture/timer/api/delHumitureTimer.ts'
import { IlisAdvancedQuery } from '~/components/IlisAdvancedQuery/index.ts'
import AdvancedQuery from '~/components/IlisAdvancedQuery/AdvancedQuery.vue'
import { getLocalUserInfo } from '~/utils/getLocalUserInfo.ts'

const columns: ColumnType[] = [
  { title: '序号', dataIndex: 'index', width: 85, align: 'center' },
  { title: '功能室', dataIndex: 'laboratoryName', width: '12%' },
  { title: '重复类型', dataIndex: 'restType', width: '12%' },
  { title: '时间', dataIndex: 'startDate', width: '12%' },
  { title: '设置人员', dataIndex: 'createName', width: '10%' },
  { title: '控制类型', dataIndex: 'customType', width: '10%' },
  { title: '目标温度（℃）', dataIndex: 'tem', width: '12%' },
  { title: '目标湿度（%RH）', dataIndex: 'hum', width: '12%' },
  { title: '状态', dataIndex: 'status', width: '10%' },
  { title: '操作', dataIndex: 'action', width: 200 },
]

const { tableHeight, tableBoxRef } = useTableHeight()

const { laboratoryOptions } = useLaboratoryOptionsHook({ isIotLab: 1 })

const addUpdateVisible = ref(false)

const localUserInfo = getLocalUserInfo()

const editDataSource = ref()

const queryForm = ref(new HumitureTimerListParams())

const {
  loading,
  dataSource,
  getRowSelection,
  getPagination,
  handleSearch,
} = useTableHooks<HumitureTimerDataItem>({
  api: getHumitureTimerList,
  query: queryForm,
})

const ilisAdvancedQuery = reactive(new IlisAdvancedQuery<HumitureTimerListAdvancedParams>({
  configs: AdvancedQueryConfigs,
  queryParams: queryForm.value,
  onQuery: () => {
    handleSearch()
  },
}))

function onReset() {
  queryForm.value = new HumitureTimerListParams()
  ilisAdvancedQuery.queryParams = queryForm.value
  ilisAdvancedQuery.updateQueryTags()
  handleSearch()
}

function onCheckDetail(record: HumitureTimerDataItem) {
  editDataSource.value = { ...record }
  editDataSource.value.id = null
  addUpdateVisible.value = true
}

function onAdd() {
  editDataSource.value = null
  addUpdateVisible.value = true
}

function onEdit(record: HumitureTimerDataItem) {
  editDataSource.value = { ...record }
  addUpdateVisible.value = true
}

function onDel(record: HumitureTimerDataItem) {
  Modal.confirm({
    title: '提示',
    content: '确定删除吗？',
    onOk: async () => {
      await delHumitureTimer(record.id)

      message.success('操作成功！')
      handleSearch()
    },
  })
}
</script>
