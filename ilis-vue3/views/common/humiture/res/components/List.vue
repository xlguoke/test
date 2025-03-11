<template>
  <div class="flex flex-col" style="height: calc(100% + 16px)">
    <a-space>
      <a-input v-model:value.trim="queryForm.createName" placeholder="请输入预约人员" />
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
      <a-checkbox v-model:checked="queryForm.notBackIssue" class="ml-4" @change="handleSearch()">
        不看已过期的预约
      </a-checkbox>
      <a-checkbox v-model:checked="queryForm.status" class="ml-4" @change="handleSearch()">
        不看已取消的预约
      </a-checkbox>
      <a-checkbox v-model:checked="queryForm.onlyOne" class="ml-4" @change="handleSearch()">
        仅显示我的预约
      </a-checkbox>
    </a-space>

    <!-- 高级查询 -->
    <AdvancedQuery :entity="ilisAdvancedQuery" />

    <a-space v-permission="'humiture_res_add'" class="mt-4">
      <a-button @click="onAdd">
        预约温湿度
      </a-button>
    </a-space>

    <div ref="tableBoxRef" class="flex-1 overflow-auto mt-4">
      <a-table
        row-key="id"
        :columns="columns"
        :data-source="dataSource"
        :pagination="getPagination()"
        :loading="loading"
        :scroll="{ y: tableHeight }"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.dataIndex === 'index'">
            {{ index + 1 }}
          </template>
          <template v-if="column.dataIndex === 'laboratoryName'">
            {{ record.laboratoryName }}
            <template v-if="record.laboratoryIotEqType === 'BOX' && record.boxName">
              ({{ record.boxName }})
            </template>
          </template>
          <template v-if="column.dataIndex === 'startDate'">
            {{ record.startDate ? dayjs(record.startDate).format("YYYY-MM-DD HH:mm:ss") : "" }}
          </template>
          <template v-if="column.dataIndex === 'endDate'">
            {{ record.endDate ? dayjs(record.endDate).format("YYYY-MM-DD HH:mm:ss") : "" }}
          </template>
          <template v-if="column.dataIndex === 'tem'">
            <template v-if="record.laboratoryIotEqType === 'BOX'">
              -
            </template>
            <template v-else>
              {{ record.tem }} ~ {{ record.maxTem }}
            </template>
          </template>
          <template v-if="column.dataIndex === 'hum'">
            <template v-if="record.laboratoryIotEqType === 'BOX'">
              -
            </template>
            <template v-else>
              {{ record.hum }} ~ {{ record.maxHum }}
            </template>
          </template>
          <template v-if="column.dataIndex === 'paramList'">
            {{ (record.paramList || []).map(i => i.testParamDisplayName).join(",") }}
          </template>
          <template v-if="column.dataIndex === 'status'">
            <span v-if="record.status === ResStatus.已预约">已预约</span>
            <span v-if="record.status === ResStatus.已取消">已取消</span>
          </template>
          <template v-else-if="column.dataIndex === 'action'">
            <a-button type="link" size="small" @click="onCheckDetail(record)">
              详情
            </a-button>
            <a-button
              v-if="record.status !== ResStatus.已取消 && localUserInfo.userId === record.resUserId"
              v-permission="'humiture_res_edit'"
              type="link"
              size="small"
              @click="onEdit(record)"
            >
              修改
            </a-button>
            <a-button
              v-if="record.status !== ResStatus.已取消 && localUserInfo.userId === record.resUserId"
              v-permission="'humiture_res_cancel'"
              type="link"
              size="small"
              @click="onCancel(record)"
            >
              取消
            </a-button>
            <a-button
              v-if="record.status !== ResStatus.已取消 && localUserInfo.userId === record.resUserId"
              v-permission="'humiture_res_delete'"
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
    <CreateForm v-model:open="addUpdateVisible" :data-source="eidtDataSource" @on-save="handleSearch()" />
  </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import type { ColumnType } from 'ant-design-vue/es/table'
import { Modal, message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { AdvancedQueryConfigs } from '../index.ts'
import CreateForm from './CreateForm.vue'
import { useTableHooks } from '~/hooks/useTableHooks'
import { useTableHeight } from '~/hooks/useTableHeight'
import type { HumitureResDataItem } from '~/views/common/humiture/res/api/getHumitureResList.ts'
import { HumitureResListParams, getHumitureResList } from '~/views/common/humiture/res/api/getHumitureResList.ts'
import { delHumitureRes } from '~/views/common/humiture/res/api/delHumitureRes.ts'
import { useLaboratoryOptionsHook } from '~/hooks/options/useLaboratoryOptionsHook.ts'
import { cancelHumitureRes } from '~/views/common/humiture/res/api/cancelHumitureRes.ts'
import { ResStatus } from '~/views/common/humiture/res'
import AdvancedQuery from '~/components/IlisAdvancedQuery/AdvancedQuery.vue'
import { IlisAdvancedQuery } from '~/components/IlisAdvancedQuery'

const columns: ColumnType[] = [
  { title: '序号', dataIndex: 'index', width: 80, align: 'center' },
  { title: '试验任务', dataIndex: 'testTaskCode', width: 220, ellipsis: true },
  { title: '试验参数', dataIndex: 'paramList', width: 180, ellipsis: true },
  { title: '功能室', dataIndex: 'laboratoryName', width: 160 },
  { title: '开始时间', dataIndex: 'startDate', width: 160 },
  { title: '结束时间', dataIndex: 'endDate', width: 160 },
  { title: '预约人员', dataIndex: 'resUserName', width: 120 },
  { title: '目标温度（℃）', dataIndex: 'tem', width: 120 },
  { title: '目标湿度（%RH）', dataIndex: 'hum', width: 120 },
  { title: '预约状态', dataIndex: 'status', width: 120 },
  { title: '操作', dataIndex: 'action', width: 180, fixed: 'right' },
]

const { tableHeight, tableBoxRef } = useTableHeight()

const { laboratoryOptions } = useLaboratoryOptionsHook({ isIotLab: 1 })

const localUserInfo = getLocalUserInfo()

const addUpdateVisible = ref(false)

const eidtDataSource = ref()

const queryForm = ref(new HumitureResListParams())

const {
  loading,
  dataSource,
  getPagination,
  handleSearch,
} = useTableHooks<HumitureResDataItem>({
  api: getHumitureResList,
  query: queryForm,
})

const ilisAdvancedQuery = reactive(new IlisAdvancedQuery<HumitureResListParams>({
  configs: AdvancedQueryConfigs,
  queryParams: queryForm.value,
  onQuery: () => {
    handleSearch()
  },
})) as IlisAdvancedQuery<HumitureResListParams>

function onCheckDetail(record: HumitureResDataItem) {
  eidtDataSource.value = { ...record }
  eidtDataSource.value.id = null
  addUpdateVisible.value = true
}

function onReset() {
  queryForm.value = new HumitureResListParams()
  ilisAdvancedQuery.queryParams = queryForm.value
  ilisAdvancedQuery.updateQueryTags()
  handleSearch()
}

function onAdd() {
  eidtDataSource.value = null
  addUpdateVisible.value = true
}

function onEdit(record: HumitureResDataItem) {
  eidtDataSource.value = { ...record }
  addUpdateVisible.value = true
}

function onDel(record) {
  Modal.confirm({
    title: '提示',
    content: '确定删除吗？',
    onOk: async () => {
      await delHumitureRes(record.id)

      message.success('操作成功！')
      handleSearch()
    },
  })
}

function onCancel(record) {
  Modal.confirm({
    title: '提示',
    content: '确定取消预约吗？',
    onOk: async () => {
      await cancelHumitureRes({
        id: record.id,
        status: ResStatus.已取消,
      })

      message.success('操作成功！')
      handleSearch()
    },
  })
}
</script>
