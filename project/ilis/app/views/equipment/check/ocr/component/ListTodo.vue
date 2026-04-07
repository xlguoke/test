<template>
  <BaseSpinWrapper class="relative">
    <a-flex justify="space-between">
      <a-form
        ref="formRef"
        :model="formState"
        layout="inline"
        @submit="handleSearch()"
      >
        <a-form-item name="quickQry">
          <a-input
            v-model:value="formState.quickQry"
            style="width: 330px;"
            placeholder="请输入文件名/设备编号/设备名称/检校确认人"
            allow-clear
          />
        </a-form-item>
        <a-form-item name="timeRange">
          <a-range-picker v-model:value="formState.timeRange" value-format="YYYY-MM-DD" />
        </a-form-item>
        <a-form-item name="certEqMatchStatus">
          <a-select
            v-model:value="formState.certEqMatchStatus"
            style="width: 200px;"
            placeholder="请选择匹配状态"
            allow-clear
          >
            <a-select-option v-for="(item) in MatchStatusDict.exclude([MatchStatus.Confirmed])" :key="item.key" :value="item.key">
              {{ item.label }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" html-type="submit">
              查询
            </a-button>
            <a-button @click="handleReset()">
              重置
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>

      <!-- 已解析成功份数统计 -->
      <a-button type="link" @click="showAnalysisCountDetail">
        <span class="text-lg">{{ analysisCount.used }} <span class="text-gray-700"> / {{ analysisCount.quota }}</span></span>
      </a-button>
    </a-flex>
    <a-space>
      <HtUploadFile
        v-permission="'certOcrUpload'"
        :business-type="BUSINES_TYPE.GENERAL"
        hide-file-list
        force-init
        :accept="['pdf']"
      >
        <template #footer="{ handleCancel, fileDatas }">
          <a-space>
            <a-button
              @click="handleCancel"
            >
              取消
            </a-button>
            <a-button
              :loading="addOcrLoading"
              type="primary"
              @click="handleAddOcr({ closeFn: handleCancel, fileDatas })"
            >
              确定
            </a-button>
          </a-space>
        </template>
      </HtUploadFile>
      <a-button
        v-permission="'certOcrConfirm'"
        :loading="analyticValidationLoading"
        @click="handleAnalyticValidation"
      >
        解析确认
      </a-button>
      <a-button
        v-permission="'certOcrPerson'"
        @click="handleSelectPeople(selectedRows)"
      >
        选择检校确认人
      </a-button>
      <a-button
        v-permission="'certOcrDelete'"
        danger
        @click="handleDelete(selectedRows)"
      >
        删除
      </a-button>
    </a-space>
    <a-table
      row-key="id"
      :data-source="dataSource"
      :columns="columns"
      :loading="loading"
      :pagination="getPagination()"
      :row-selection="getRowSelection()"
      :scroll="{
        x: '1400px',
      }"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'attachmentName'">
          <a-tooltip @click="handleOpenFile(record as OcrRecordEntity)">
            <template #title>
              {{ record.attachmentName }}
            </template>
            <span style="color: #0866e2;">
              {{ record.attachmentName }}
            </span>
          </a-tooltip>
        </template>
        <template v-if="column.dataIndex === 'operation'">
          <a-space size="small">
            <a-button
              v-if="record.ocrStatus === ANALYSIS_STATUS.SUCCESS"
              type="link"
              size="small"
              @click="handleSelectDevice(record as OcrRecordEntity)"
            >
              选择设备
            </a-button>
            <a-button
              v-if="record.ocrStatus === ANALYSIS_STATUS.SUCCESS"
              v-permission="'certOcrPerson'"
              type="link"
              size="small"
              @click="handleSelectPeople([record] as OcrRecordEntity[])"
            >
              检校确认人
            </a-button>
            <a-button
              v-if="record.ocrStatus === ANALYSIS_STATUS.SUCCESS && !record.equipmentId"
              type="link"
              size="small"
              @click="handleCheckAnalysis(record as OcrRecordEntity)"
            >
              查看解析
            </a-button>
            <a-button
              v-if="record.ocrStatus === ANALYSIS_STATUS.SUCCESS && record.equipmentId"
              type="link"
              size="small"
              @click="handleCheckAnalysis(record as OcrRecordEntity).then(() => handleReloadTable())"
            >
              解析确认
            </a-button>
            <a-button
              v-if="record.ocrStatus === ANALYSIS_STATUS.FAIL"
              type="link"
              size="small"
              @click="handleRedo(record as OcrRecordEntity)"
            >
              重新解析
            </a-button>
            <a-button
              v-permission="'certOcrDelete'"
              type="link"
              size="small"
              danger
              @click="handleDelete([record] as OcrRecordEntity[])"
            >
              删除
            </a-button>
          </a-space>
        </template>
      </template>
    </a-table>
    <DeviceSelector v-model:show="showDeviceSelector" @confirm="handleBindDevice($event)">
      <template #beforeConfirm="{ selectedRows: selectedDevices, handleCancel, reset }">
        <a-button
          type="primary"
          :loading="handleNextLoading"
          @click="handleNext({ selectedDevices, handleCancel, reset })"
        >
          确定并设置下一个
        </a-button>
      </template>
    </DeviceSelector>
    <PersonSelector v-model:show="showPersonSelector" @confirm="handleBindPerson($event)" />
    <CheckOcrResultModal v-model:show="showCheckOcrResultModal" :ocr="ocrQuery" />
  </BaseSpinWrapper>
</template>

<script setup lang='ts'>
import type { Key } from 'ant-design-vue/es/_util/type'
import type { OcrRecordEntity } from '../index'
import type { IOcrQueryParams } from '~/components/commonOcr/ocrResultMockData'
import type { IUserSelectVoEntity } from '~/interface/IUserSelectVoEntity'
import type { DeviceEntity } from '~/views/equipment/DeviceEntity'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import { createVNode } from 'vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { OcrBusinessType } from '~/components/commonOcr/ocrResultMockData'
import DeviceSelector from '~/components/DeviceSelector.vue'
import { BUSINES_TYPE, HtUploadFile } from '~/components/htUploadFile'
import PersonSelector from '~/components/PersonSelector.vue'
import { useTableHooks } from '~/hooks/useTableHooks'
import CheckOcrResultModal from '../../../../../components/commonOcr/CheckOcrResultModal.vue'
import { addOcr, bindOcrDevice, bindOcrPerson, confirmOcr, deleteOcr, getOcrPage, ocrAiBillUsedQuota, redoAnalysis } from '../api'
import { ANALYSIS_STATUS, ANALYSIS_STATUS_DICT, columnsListTodo as columns, handleCheckAnalysis, MatchStatus, MatchStatusDict, OcrQueryType, OrderType } from '../index'
import AnalysisRecord from './AnalysisRecord.vue'

const formRef = ref()

const formState = ref({
  quickQry: '',
  certEqMatchStatus: undefined,
  timeRange: undefined,
  order: OrderType.ASC,
  orderBy: 'createDate',
})

const {
  loading,
  dataSource,
  selectedRows,
  selectedRowKeys,
  getList,
  getNextPage,
  getPagination,
  getRowSelection,
  handleSearch,
  handleReset,
  handleReloadTable,
} = useTableHooks<OcrRecordEntity>({
  api: getOcrPage,
  formRef,
  query: formState,
  payload: { queryType: OcrQueryType.WAIT_CONFIRM },
  totalKey: 'count',
  responseDataTransform(res) {
    getAnalysisCount()
    return res
  },
})

const addOcrLoading = ref(false)

const showDeviceSelector = ref(false)

const showPersonSelector = ref(false)

const showCheckOcrResultModal = ref(false)

const handleNextLoading = ref(false)

const analysisCount = ref({
  quota: 2000,
  used: 0,
})

const ocrQuery = computed(() => {
  return {
    businessId: selectedRows.value?.[0]?.id,
    businessType: OcrBusinessType.EQUIPMENT_CERT,
  } as IOcrQueryParams
})

/** 获取解析成功的数量 */
async function getAnalysisCount() {
  const { data } = await ocrAiBillUsedQuota()
  analysisCount.value = data
}

/** 显示历史解析成功的记录 */
function showAnalysisCountDetail() {
  AnyDialogHelper.showModel(AnalysisRecord)
}

async function handleAddOcr({ closeFn, fileDatas }: { closeFn: () => void, fileDatas: any[] }) {
  if (!fileDatas.length) {
    return message.warning('请选择要解析的文件')
  }
  addOcrLoading.value = true
  const query = fileDatas.map(item => ({
    id: item.attachmentId,
    attachmenttitle: item.name,
  }))
  await addOcr(query, addOcrLoading)
  addOcrLoading.value = false
  message.success('操作成功')
  closeFn()
  getList()
}

async function handleRedo(row: OcrRecordEntity) {
  loading.value = true
  await redoAnalysis(row.id).finally(() => {
    loading.value = false
  })
  getList()
  message.success('操作成功')
}

/**
 * # 选择设备
 */
function handleSelectDevice(_q: OcrRecordEntity) {
  selectedRows.value = [_q]
  selectedRowKeys.value = [_q.id]
  showDeviceSelector.value = true
  if (_q.attachmentUrl) {
    window.open(_q.attachmentUrl)
  }
}

/**
 * # ocr绑定设备
 */
async function handleBindDevice(_q: DeviceEntity[]) {
  await bindOcrDevice({ ocr: selectedRows.value[0], device: _q[0] })
  message.success('操作成功')
  showDeviceSelector.value = false
  getList()
}

/**
 * # 选择检校确认人
 */
function handleSelectPeople(_q: OcrRecordEntity[]) {
  if (_q.length === 0) {
    return message.warning('请选择要操作的数据')
  }
  if (_q.some(item => item.ocrStatus !== ANALYSIS_STATUS.SUCCESS)) {
    return message.warning(`仅
    ${ANALYSIS_STATUS_DICT.getLabelByKey(ANALYSIS_STATUS.SUCCESS)}
    状态的数据可以选择检校确认人
    `)
  }
  selectedRows.value = _q
  selectedRowKeys.value = _q.map(item => item.id)
  showPersonSelector.value = true
}

/**
 * # ocr绑定检校确认人
 */
async function handleBindPerson(_q: IUserSelectVoEntity[]) {
  await bindOcrPerson({ ocrs: selectedRows.value, person: _q[0] })
  message.success('操作成功')
  showPersonSelector.value = false
  getList()
}

const analyticValidationLoading = ref(false)
/**
 * # 批量确认解析结果
 */
async function handleAnalyticValidation() {
  if (!selectedRows.value.length) {
    return message.warning('请选择要操作的数据')
  }
  if (selectedRows.value.some(item => item.ocrStatus !== ANALYSIS_STATUS.SUCCESS)) {
    return message.warning(`仅
    ${ANALYSIS_STATUS_DICT.getLabelByKey(ANALYSIS_STATUS.SUCCESS)}
    状态的数据可以进行解析确认
    `)
  }
  Modal.confirm({
    title: '解析确认',
    content: '确定要解析确认选中的数据吗？',
    centered: true,
    onOk: async () => {
      analyticValidationLoading.value = true
      await confirmOcr(selectedRows.value).finally(() => {
        analyticValidationLoading.value = false
      })
      selectedRows.value = []
      selectedRowKeys.value = []
      message.success('操作成功')
      getList()
    },
  })
}

/**
 * # 保存并设置下一个
 */
async function handleNext({ selectedDevices, handleCancel, reset }: { selectedDevices: DeviceEntity[], handleCancel: () => void, reset: () => void }) {
  handleNextLoading.value = true
  // 有选中设备则保存，否则查找下一条，如果没下一条了就关闭弹窗
  if (selectedDevices.length > 0) {
    await bindOcrDevice({ ocr: selectedRows.value[0], device: selectedDevices[0], loading: handleNextLoading })
    message.success('保存成功')
    await getList()
    reset()
  }
  const nextItme = await getNextItme()
  if (!nextItme) {
    handleCancel()
  }
  else {
    const { attachmentUrl } = nextItme
    window.open(attachmentUrl)
  }
  handleNextLoading.value = false
}

/**
 * # 跨页查找下一条满足条件的数据
 */
async function getNextItme() {
  const itemList = dataSource.value.filter(item => item.certEqMatchStatus === MatchStatus.Fail || selectedRowKeys.value.includes(item.id))
  const currentIndex = itemList.findIndex(item => item.id === selectedRowKeys.value[0])
  if (currentIndex + 1 < itemList.length) {
    const nextItem = itemList[currentIndex + 1]
    selectedRows.value = [nextItem]
    selectedRowKeys.value = [nextItem.id]
    return nextItem
  }
  const { noMore } = await getNextPage()
  if (noMore) {
    message.warning('已经是最后一个')
  }
  else {
    return await getNextItme()
  }
}

/**
 * 删除
 */
function handleDelete(rows: OcrRecordEntity[]) {
  if (rows.length === 0) {
    return message.warning('请选择要操作的数据')
  }
  Modal.confirm({
    title: '确认要删除数据吗?',
    icon: createVNode(ExclamationCircleOutlined),
    content: () => h('div', {}, [
      '当前文件已解析成功，删除后若再次上传将重新解析，',
      h('span', { style: { color: 'red' } }, '重新解析时将消耗免费额度'),
      '，您确认要删除吗？',
    ]),
    okText: '确认',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      await deleteOcr(rows)
      // 从选中的数据中删除
      const deleteIds = rows.map(item => item.id) as Key[]
      selectedRows.value = selectedRows.value.filter(item => !deleteIds.includes(item.id))
      selectedRowKeys.value = selectedRowKeys.value.filter(item => !deleteIds.includes(item))
      message.success('删除成功')
      getList()
    },
  })
}

/**
 * # 后端排序
 */
function handleTableChange(_pagination: any, _filters: any, sorter: any) {
  const { order } = sorter
  if (order === 'descend') {
    formState.value.order = OrderType.DESC
  }
  else {
    formState.value.order = OrderType.ASC
  }
  getList()
}

function handleOpenFile(row: OcrRecordEntity) {
  window.open(row.attachmentUrl)
}
defineExpose({
  getList,
})
</script>

<style>

</style>
