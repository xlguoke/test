<template>
  <div class="flex flex-col" style="height: calc(100% + 16px)">
    <a-space>
      <a-select
        v-model:value="queryForm.laboratoryId"
        allow-clear
        style="width: 240px;"
        placeholder="功能室"
        :options="laboratoryOptions"
      />
      <a-range-picker v-model:value="recordDate" class="w-full" value-format="YYYY-MM-DD" />
      <a-button type="primary" @click="onSearch">
        查询
      </a-button>
      <a-button @click="onReset">
        重置
      </a-button>
      <!--      <a-button @click="ilisAdvancedQuery.open()">高级查询</a-button> -->
      <a-checkbox v-model:checked="queryForm.abnormal" class="ml-4" @change="handleSearch()">
        只看超标的
      </a-checkbox>
    </a-space>

    <!-- 高级查询 -->
    <AdvancedQuery :entity="ilisAdvancedQuery" />

    <a-space class="mt-4">
      <a-button v-permission="'humiture_record_add'" @click="setAddInspectionVisible(true)">
        手工巡查
      </a-button>
      <a-button v-if="HUMITURE_MANAGE_DEL" v-permission="'humiture_record_delete'" @click="onBatchDel">
        删除
      </a-button>
      <a-button v-permission="'humiture_record_createLedger'" @click="setCreateLedgerVisible(true)">
        创建台账
      </a-button>
      <a-button v-permission="'humiture_record_editLog'" @click="setEditRecordVisible(true)">
        修改记录
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
        :scroll="{ y: tableHeight }"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.dataIndex === 'index'">
            {{ index + 1 }}
          </template>
          <template v-if="column.dataIndex === 'recordDate'">
            {{ record.recordDate ? dayjs(record.recordDate).format("YYYY-MM-DD HH:mm:ss") : "" }}
          </template>
          <template v-if="column.dataIndex === 'temStatus'">
            <span
              :class="{
                'text-red-500': record.temStatus !== MStatus.正常,
              }"
            >
              {{ MStatusDict.getLabelByKey(record.temStatus) }}
            </span>
          </template>
          <template v-if="column.dataIndex === 'humStatus'">
            <span
              :class="{
                'text-red-500': record.humStatus !== MStatus.正常,
              }"
            >
              {{ MStatusDict.getLabelByKey(record.humStatus) }}
            </span>
          </template>
          <template v-if="column.dataIndex === 'type'">
            {{ TypeDict.getLabelByKey(record.type) }}
          </template>
          <template v-else-if="column.dataIndex === 'action'">
            <a-button
              v-if="HUMITURE_MANAGE_UPDATE"
              v-permission="'humiture_record_edit'"
              type="link"
              size="small"
              @click="onEdit(record)"
            >
              修改
            </a-button>
            <a-button
              v-if="HUMITURE_MANAGE_DEL"
              v-permission="'humiture_record_delete'"
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

    <!-- 手工巡查 -->
    <AddInspection v-model:open="addInspectionVisible" @on-save="handleSearch()" />

    <!-- 修改巡查 -->
    <EditInspection v-model:open="editInspectionVisible" :data-source="eidtDataSource" @on-save="handleSearch()" />

    <!-- 创建台账 -->
    <CreateLedger v-model:open="createLedgerVisible" />

    <!-- 修改记录 -->
    <EditRecord v-model:open="editRecordVisible" />
  </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import type { ColumnType } from 'ant-design-vue/es/table'
import { Modal, message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { AdvancedQueryConfigs, MStatus, MStatusDict, TypeDict } from '../index.ts'
import AddInspection from './AddInspection.vue'
import EditInspection from './EditInspection.vue'
import CreateLedger from './CreateLedger.vue'
import EditRecord from './EditRecord.vue'
import { useTableHeight } from '~/hooks/useTableHeight'
import { useTableHooks } from '~/hooks/useTableHooks'
import { useStateHooks } from '~/hooks/useStateHooks.ts'
import type {
  HumitureRecordDataItem,
  HumitureRecordListParams,
} from '~/views/common/humiture/record/api/getHumitureRecordList.ts'
import {
  getHumitureRecordList,
} from '~/views/common/humiture/record/api/getHumitureRecordList.ts'
import { useLaboratoryOptionsHook } from '~/hooks/options/useLaboratoryOptionsHook.ts'
import { deleteHumitureRecord } from '~/views/common/humiture/record/api/deleteHumitureRecord.ts'
import { getBusinessParam } from '~/utils/getBusinessParam.ts'
import AdvancedQuery from '~/components/IlisAdvancedQuery/AdvancedQuery.vue'
import { IlisAdvancedQuery } from '~/components/IlisAdvancedQuery'

const columns: ColumnType[] = [
  { title: '序号', dataIndex: 'index', width: 85, align: 'center' },
  { title: '巡查时间', dataIndex: 'recordDate', width: 160 },
  { title: '功能室', dataIndex: 'laboratoryName', width: 180 },
  { title: '巡查模式', dataIndex: 'type', width: 120 },
  { title: '标准温度（℃）', dataIndex: 'standardTem', width: 140 },
  { title: '巡查温度（℃）', dataIndex: 'tem', width: 140 },
  { title: '温度状态', dataIndex: 'temStatus', width: 140 },
  { title: '标准湿度（%RH）', dataIndex: 'standardHum', width: 140 },
  { title: '巡查湿度（%RH）', dataIndex: 'hum', width: 140 },
  { title: '湿度状态', dataIndex: 'humStatus', width: 120 },
  { title: '操作', dataIndex: 'action', width: 140, fixed: 'right' },
]

const { tableHeight, tableBoxRef } = useTableHeight()

const [addInspectionVisible, setAddInspectionVisible] = useStateHooks(false)

const [editInspectionVisible, setEditInspectionVisible] = useStateHooks(false)

const [createLedgerVisible, setCreateLedgerVisible] = useStateHooks(false)

const [editRecordVisible, setEditRecordVisible] = useStateHooks(false)

const eidtDataSource = ref()

const recordDate = ref([])

const queryForm = ref<HumitureRecordListParams>({})

const { laboratoryOptions } = useLaboratoryOptionsHook()

const HUMITURE_MANAGE_DEL = ref(false)

const HUMITURE_MANAGE_UPDATE = ref(false)

const {
  loading,
  dataSource,
  getRowSelection,
  getPagination,
  handleSearch,
  selectedRows,
  selectedRowKeys,
} = useTableHooks<HumitureRecordDataItem>({
  api: getHumitureRecordList,
  query: queryForm,
})

const ilisAdvancedQuery = reactive(new IlisAdvancedQuery<HumitureRecordListParams>({
  configs: AdvancedQueryConfigs,
  queryParams: queryForm.value,
  onQuery: () => {
    handleSearch()
  },
})) as IlisAdvancedQuery<HumitureRecordListParams>

init()

async function init() {
  HUMITURE_MANAGE_DEL.value = await getBusinessParam('HUMITURE_MANAGE_DEL')
  HUMITURE_MANAGE_UPDATE.value = await getBusinessParam('HUMITURE_MANAGE_UPDATE')
}

function onSearch() {
  queryForm.value.recordStartDate = recordDate.value ? recordDate.value[0] : undefined
  queryForm.value.recordEndDate = recordDate.value ? recordDate.value[1] : undefined

  handleSearch()
}

function onReset() {
  queryForm.value = {}
  recordDate.value = []
  ilisAdvancedQuery.queryParams = {}
  ilisAdvancedQuery.updateQueryTags()
  handleSearch()
}

function onEdit(record: HumitureRecordDataItem) {
  eidtDataSource.value = { ...record }
  setEditInspectionVisible(true)
}

function onDel(record: HumitureRecordDataItem) {
  Modal.confirm({
    title: '提示',
    content: '确定删除吗？',
    onOk: async () => {
      await deleteHumitureRecord(record.id)
      message.success('操作成功！')

      selectedRows.value = selectedRows.value.filter(i => i.id !== record.id)
      selectedRowKeys.value = selectedRows.value.map(i => i.id)
      handleSearch()
    },
  })
}

function onBatchDel() {
  if (!selectedRowKeys.value.length) {
    message.warn('请勾选要删除的数据！')
    return
  }

  Modal.confirm({
    title: '提示',
    content: '确认删除吗？',
    onOk: async () => {
      for (let i = 0; i < selectedRowKeys.value.length; i++) {
        const id = selectedRowKeys.value[i] as string
        await deleteHumitureRecord(id)
      }
      message.success('操作成功！')
      selectedRows.value = []
      selectedRowKeys.value = []
      handleSearch()
    },
  })
}
</script>
