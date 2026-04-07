<template>
  <IlisContainer app-id="inspectionCapacityManage">
    <div class="h-full flex flex-col gap-3">
      <IlisFormSearch
        :init-data="initQuery"
        :entity="CapacityEntity"
        @reset="handleReset"
        @search="handleSearch"
      >
      </IlisFormSearch>
      <div class="flex justify-between">
        <a-space>
          <a-button :icon="h(PoweroffOutlined)" @click="handleCloseWarning()">
            关闭预警
          </a-button>
          <IlisCustomColumns
            type="TEST_CAPACITY_WARNING"
            @confirm="handleReloadTable()"
          ></IlisCustomColumns>
          <a-button :icon="h(ExportOutlined)" @click="handleExport('/capacity-warning/export', { showAll: queryParams.showAll })">
            导出
          </a-button>
        </a-space>
        <div>
          <a-checkbox v-if="showCheckbox" v-model:checked="queryParams.showAll" @change="handleSearch({ showAll: queryParams.showAll })">
            显示全部数据
          </a-checkbox>
        </div>
      </div>
      <div ref="tableBoxRef" class="flex-1 h-0">
        <IlisTable
          row-key="id"
          :loading="loading"
          :data-source="dataSource"
          :entity="CapacityEntity"
          :table-height="tableHeight"
          :custom-columns="customColumns"
          :custom-row="getCustomRow()"
          :pagination="getPagination()"
          :row-selection="getRowSelection()"
          resizable
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'warningType'">
              {{ WARNING_TYPE_MAP[record.warningType as warningType] }}
            </template>
            <template v-if="column.dataIndex === 'status'">
              <a-tooltip placement="right">
                <template #title>
                  <span>{{ handleTooltip(record) }}</span>
                </template>
                <a-tag :color="STATUS_CONFIG_MAP[record.status as STATUS].color">
                  {{ STATUS_CONFIG_MAP[record.status as STATUS].label }}
                </a-tag>
              </a-tooltip>
            </template>
            <template v-if="column.dataIndex === 'objectName'">
              <span v-if="record.objectName && record.objectRemark">{{ `${record.objectName}（${record.objectRemark}）` }}</span>
              <span v-else>{{ record.objectName || record.objectRemark || '' }}</span>
            </template>
            <template v-if="column.dataIndex === 'creatDate'">
              {{ dayjs(record.creatDate).format('YYYY-MM-DD') }}
            </template>
            <template v-if="column.dataIndex === 'capacityLimit'">
              <span>{{ record.capacityLimit }}份/天</span>
            </template>
            <template v-if="column.dataIndex === 'operation'">
              <a-button v-if="[STATUS.CREATED, STATUS.AUDIT_REFUSED].includes(record.status)" type="link" @click.stop="goDispose(record)">
                处理
              </a-button>
              <a-button type="link" @click.stop="goDetail(record)">
                详情
              </a-button>
              <a-button type="link" @click.stop="goLogs(record)">
                日志
              </a-button>
            </template>
          </template>
        </ilistable>
      </div>

      <HtModal
        :open="closeWarningVisible"
        title="关闭预警"
        :loading="closeWarningLoading"
        width="370px"
        height="220px"
        @ok="closeWaringConfirm()"
        @cancel="closeWarningVisible = false"
      >
        <a-textarea
          v-model:value="closeReason"
          placeholder="请输入关闭理由（必填）"
          size="large"
          style="height: 150px;"
          :maxlength="500"
        />
      </HtModal>
    </div>
  </IlisContainer>
</template>

<script lang="ts" setup>
import { ExportOutlined, PoweroffOutlined } from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import dayjs from 'dayjs'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper.ts'
import LogModalByApi from '~/components/commonSystemLog/LogModalByApi.vue'
import { useTableHooks } from '~/hooks/useTableHooks'
import { usePermissionStore } from '~/store/permissionStore'
import { closeWarning, getWarningList } from './api.ts'
import { CapacityEntity, STATUS, STATUS_CONFIG_MAP, WARNING_TYPE_MAP, warningType } from './CapacityEntity'
import Detail from './component/Detail.vue'
import WarningDispose from './component/WarningDispose.vue'

const queryParams = ref({
  showAll: false,
})

const {
  loading,
  dataSource,
  tableBoxRef,
  customColumns,
  tableHeight,
  selectedRows,
  getPagination,
  getRowSelection,
  getCustomRow,
  handleSearch,
  handleReset,
  handleExport,
  handleReloadTable,
} = useTableHooks<CapacityEntity>({
  customType: 'TEST_CAPACITY_WARNING',
  api: getWarningList,
})
const closeWarningVisible = ref(false)
const closeReason = ref('')
const closeWarningLoading = ref(false)

// const tableFieldList = [
//   'reportSn',
//   'taskSn',
//   'warningType',
//   'objectName',
//   'capacityLimit',
//   'warningDate',
//   'creatDate',
//   'status',
// ]
const initQuery = ref(new CapacityEntity())
function handleJumpFormHome() {
  const urlObj = new URL(window.location.href || '')
  const searchParams = urlObj.searchParams
  const initSearchType = searchParams.get('initSearchType') || ''

  if (initSearchType) {
    initQuery.value.warningType = initSearchType === '1' ? warningType.TEST_PERSON : warningType.EQUIPMENT
  }
  handleSearch(initQuery.value)
}
handleJumpFormHome()
const permissionStore = usePermissionStore()

const showCheckbox = computed(() => {
  return permissionStore.hasPermission('superUserAuthority')
    || permissionStore.hasPermission('departManager')
})
function goLogs(row: any) {
  AnyDialogHelper.showModel(LogModalByApi, {
    id: row.id,
    logType: '370',
  })
}
function goDetail(row: any) {
  AnyDialogHelper.showModel(Detail, {
    ...row,
  })
}
function goDispose(row: any) {
  AnyDialogHelper.showModel(WarningDispose, {
    ...row,
  }).then(() => {
    handleReloadTable()
  })
}
// 关闭预警-确认
async function closeWaringConfirm() {
  const ids = selectedRows.value?.map((item: any) => item.id) || []
  if (!closeReason.value)
    return message.error('请填写关闭理由！')
  closeWarningLoading.value = true
  const data = {
    ids,
    reason: closeReason.value,
  }
  try {
    await closeWarning(data).finally(() => {
      closeWarningLoading.value = false
    })
    message.success('操作成功！')
    closeWarningVisible.value = false
    handleSearch()
  }
  catch (error) {
    console.error(error)
  }
}
// 关闭预警
function handleCloseWarning() {
  if (selectedRows.value.length === 0) {
    return message.error('请选择要关闭的预警！')
  }
  const allStatus = [...new Set(selectedRows.value.map((item: any) => item.status))]
  if (!allStatus.every((item: any) => [STATUS.CREATED, STATUS.AUDIT_REFUSED].includes(item))) {
    return Modal.error({
      title: '关闭失败！',
      content: '仅支持“待处理”和“未通过”状态的预警信息！',
      centered: true,
      okText: '确定',
    })
  }
  closeWarningVisible.value = true
}
// 处理状态tooltip
function handleTooltip(row: any) {
  const unpassPerson = '张三'
  const unpassReason = '不完整'
  const toolTipConfig = {
    [STATUS.AUDITING]: '审核中',
    [STATUS.CLOSED]: '已关闭',
    [STATUS.PROCESSED]: '已处理',
    [STATUS.AUDIT_REFUSED]: `${unpassPerson}审核不通过，原因：${unpassReason}`,
    [STATUS.CREATED]: '待处理',
  }
  return toolTipConfig[row.status as STATUS]
}
</script>

<style lang="less" scoped>
  .demo-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

h2 {
  color: #2c3e50;
  margin-bottom: 20px;
}
</style>
