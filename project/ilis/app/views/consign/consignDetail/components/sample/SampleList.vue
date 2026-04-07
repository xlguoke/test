<template>
  <div>
    <a-space wrap class="!mb-1">
      <a-button v-if="!disabled && !isNoticeModify && !isObjectRollback" @click="handleAdd()">
        <PlusCircleOutlined />
        {{ term('添加样品') }}
      </a-button>
      <a-button v-if="!disabled && !isNoticeModify && !isObjectRollback" @click="handleCopy">
        <CopyOutlined />
        {{ term('复制样品') }}
      </a-button>
      <a-button
        v-if="showIndustryModule('addChildSample') && !disabled && !isNoticeModify && !isObjectRollback"

        @click="handleAdd(undefined, undefined, true)"
      >
        <PlusCircleOutlined />
        {{ term('添加子样品') }}
      </a-button>
      <a-button
        v-if="showIndustryModule('addExternalSample') && (!disabled && !isNoticeModify || isObjectRollback)"

        @click="handleAddExternalObject()"
      >
        <PlusCircleOutlined />
        {{ term('录入外来样品') }}
      </a-button>
      <a-button
        v-if="showIndustryModule('useExternalSample') && (!disabled && !isNoticeModify || isObjectRollback)"

        @click="handleUseExternalObject()"
      >
        <LinkOutlined />
        {{ term('引用外来样品') }}
      </a-button>
      <a-button
        v-if="showIndustryModule('useConsignedSample') && (!disabled && !isNoticeModify || isObjectRollback)"

        @click="handleAddConsignedSample()"
      >
        <LinkOutlined />
        {{ term('引用已委托原材料') }}
      </a-button>
      <a-button v-if="showPresetNumber" @click="handlePresetNumber">
        <SettingOutlined />
        预设编号
      </a-button>
      <a-button
        v-if="SYSTEM_PARAM.SAMPLE_BINDING_RFID && consignProcessor.data.status === CONSIGN_STATUS.FINISH"
        @click="handleBindRFID"
      >
        绑定电子标签
      </a-button>
      <a-button
        v-if="showIndustryModule('sampleMark') && !disabled && !isObjectRollback"
        v-permission="'taskStatusMarker'"
        @click="handleSampleMark(true)"
      >
        <StarFilled />
        {{ term('标记') }}
      </a-button>
      <a-button
        v-if="showIndustryModule('sampleMark') && !disabled && !isObjectRollback"
        v-permission="'taskStatusMarker'"
        @click="handleSampleMark(false)"
      >
        <StarOutlined />
        取消{{ term('标记') }}
      </a-button>
    </a-space>

    <IlisTable
      v-model:expanded-row-keys="consignSampleProcessor.expandedRowKeys"
      row-key="id"
      :entity="SampleInfoEntity"
      :data-source="renderSampleDatas"
      :pagination="false"
      :custom-row="customRow"
      :field-list="tableFieldList()"
    >
      <!-- @vue-expect-error -->
      <template #expandIcon="{ expanded, onExpand, record }">
        <button
          v-if="record.children !== undefined"
          :class="`ant-table-row-expand-icon ${expanded ? 'ant-table-row-expand-icon-expanded' : 'ant-table-row-expand-icon-collapsed'}`"
          @click.stop="(e) => onExpand(record, e)"
        ></button>
        <span v-else></span>
      </template>

      <!-- 自定义列 -->
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'selected'">
          <a-checkbox
            v-if="!record.parentMark" v-model:checked="consignSampleProcessor.selectedSample[record.id]"
            :disabled="record.disabled"
          ></a-checkbox>
          <div v-if="pageStateService.readonly && pageStateService.sampleId === record.originId" class="text-red-500 whitespace-nowrap">
            ({{ term('当前样品') }})
          </div>
        </template>
        <template v-else-if="column.dataIndex === 'mark'">
          <IlisMarks :marks="sampleMarks(record as any)" />
          <div class="pl-7 text-left">
            <IlisCustomMark
              v-for="(mark, i) in sampleCustomMark(record as any)" :key="mark.id"
              :data="mark"
              :class="`${i > 0 ? 'mt-[2px]' : ''}`"
            />
          </div>
        </template>
        <template v-else-if="column.dataIndex === 'testObjectCode'">
          {{ pageStateService.cloneReport ? '未生成编号' : record.testObjectCode }}
        </template>
        <template v-else-if="column.dataIndex === 'testParams'">
          {{ renderTestParams(record.testParams) }}
        </template>
        <template v-else-if="column.dataIndex === 'qualifications'">
          <a-button
            v-if="isEditQualification(record as any)"
            type="link" size="small"
            @click.stop="openQualificationSelector(record as any)"
          >
            {{ renderQualifications(record.qualifications) || '添加' }}
          </a-button>
          <span v-else>
            {{ renderQualifications(record.qualifications) }}
          </span>
        </template>
        <template v-else-if="column.dataIndex === 'testObjectPrice'">
          <a-button
            v-if="!consignFeeProcessor.whetherFeeHide && record.priceDetailList && record.priceDetailList.length && (!record.type || record.parentSampleId)"
            type="link"
            @click.stop="openPriceDetailList(record.priceDetailList)"
          >
            {{ record.testObjectPrice || '0.00' }}
          </a-button>
          <span v-else>
            {{ consignFeeProcessor.whetherFeeHide ? '*' : record.testObjectPrice || '0.00' }}
          </span>
        </template>
        <template v-else-if="column.dataIndex === 'action'">
          <a-space :size="0" @click.stop>
            <a-button
              v-if="showDetail(record as any)"
              type="link" size="small"
              :title="detailTitle(record.type)"
              @click="handleAdd(record as any, true)"
            >
              查看
            </a-button>
            <a-button
              v-if="showEdit(record as any)"
              type="link" size="small"
              :title="editTitle(record.type)"
              @click="handleEdit(record as any)"
            >
              编辑
            </a-button>
            <a-button
              v-if="showAbandon(record as any)"
              type="link" size="small"
              :title="`作废本${term('样品')}`"
              @click="handleAbandon(record as any)"
            >
              作废
            </a-button>
            <a-button
              v-if="showDataCenter(record as IRenderSampleData)"
              v-permission="'dataCenterBtn'"
              type="link" size="small"
              title="数据中心数据查询"
              @click="AnyDialogHelper.showModel(DataCenterForDebugModal, {
                tableData: (record as IRenderSampleData).testParams?.map(i => {
                  return {
                    sysSampleId: record.testSampleId,
                    sysSampleName: record.testSampleName,
                    sysSampleDisplayName: record.testSampleDisplayName,
                    sysParamId: i.testParamId,
                    sysParamDisplayName: i.testParamDisplayName,
                    sysItemId: i.testItemId,
                  }
                }),
              })"
            >
              数据中心
            </a-button>
            <a-button
              v-if="showDelete(record as any)"
              type="link" danger size="small"
              :title="`删除本${term('样品')}`"
              @click="handleDelete(record as IRenderSampleData)"
            >
              删除
            </a-button>
          </a-space>
        </template>
      </template>
    </IlisTable>

    <QualificationSelector
      v-model:open="qualificationSelectorVisible"
      :selected="cacheRow?.qualifications || []"
      @on-select="onSelectQulification"
    />
  </div>
</template>

<script setup lang='ts'>
import type { IConsginPageParam, IConsignSamples, IRenderSampleData, IViewTestParamsItem } from '../../interface'
import type { EGenerateCode } from '~/api/consign/consign-management'
import type { IlisMark } from '~/components/ilisComponent/marks/IlisMarks.vue'
import type { ExternalObjectEntity } from '~/components/selectorViaMethodCall/entity/ExternalObjectEntity'
import type { Qualification } from '~/views/consign/consignList/api'
import { CopyOutlined, LinkOutlined, PlusCircleOutlined, SettingOutlined, StarFilled, StarOutlined } from '@ant-design/icons-vue'
import { List, message, Modal } from 'ant-design-vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { checkBindElectronLabelApi, sampleAssignmentsApi } from '~/api/consign/consign-management'
import IframeLayer from '~/components/IframeLayer.vue'
import { CustomMarkManagePage, CustomMarkRange, MarkTypeCode } from '~/components/ilisComponent'
import DataCenterForDebugModal from '~/components/ilisComponent/dataCenter/DataCenterForDebugModal.vue'
import IlisCustomMarkModal from '~/components/ilisComponent/IlisCustomMarkModal.vue'
import QualificationSelector from '~/components/QualificationSelector.vue'
import ConsignedSampleSelector from '~/components/selectorViaMethodCall/ConsignedSampleSelector.vue'
import ExternalObjectSelector from '~/components/selectorViaMethodCall/ExternalObjectSelector.vue'
import { useIndustryStore } from '~/store/industryStore.ts'
import { modalConfirm, modalError, opinionModal } from '~/utils/modalUtil'
import { SelectSampleModal } from '~/views/consign/component/selectSample'
import { CONSIGN_STATUS } from '~/views/consign/consignList/dict'
import { useConsignDetailLoading, useConsignProcessor, useConsignSave } from '../../composables/useProviderInject'
import { SampleInfoEntity } from '../../entities/SampleInfoEntity'
import { SampleStatus } from '../../interface'
import AddExternalObjectModal from './AddExternalObjectModal.vue'
import EditExternalObjectModal from './EditExternalObjectModal.vue'

const { consignProcessor } = useConsignProcessor()
const { loading } = useConsignDetailLoading()
const { saveConsign } = useConsignSave()

const consignFeeProcessor = consignProcessor.consignFeeProcessor
const consignSampleProcessor = consignProcessor.consignSampleProcessor
const consignOffineDataService = consignProcessor.consignOffineDataService
const SYSTEM_PARAM = consignProcessor.systemParams
const pageStateService = consignProcessor.pageStateService

const { WRITE, FINISH, RETURN, SAMPLE_RETURN, EDIT } = CONSIGN_STATUS

const { industryId, industry, term, getModuleConfig } = useIndustryStore()

const { canUseMarkList } = useCustomMark({
  module: CustomMarkManagePage.MANAGE_ASSIGN_PAGE,
  range: CustomMarkRange.CONSIGN,
  markType: MarkTypeCode.OBJECT,
})

const disabled = pageStateService.readonly

/** 通知修改委托 */
const isNoticeModify = computed(() => !pageStateService.readonly && consignProcessor.isNoticeModifyConsign)

/** 样品退回 */
const isObjectRollback = computed(() => !pageStateService.readonly && consignSampleProcessor.isSampleRollback)

/** 显示领域业务模块 */
const showIndustryModule = (field: string) => getModuleConfig(field)?.selected

const showPresetNumber = ref(false)

const renderSampleDatas = ref<IRenderSampleData[]>([])

watch(
  () => consignSampleProcessor.consignSampleData,
  (list: IConsignSamples[]) => {
    if (!list.length) {
      renderSampleDatas.value = []
      return
    }
    renderSampleDatas.value = consignSampleProcessor.initRenderSampleDatas()
    console.warn('渲染的样品列表', renderSampleDatas.value)
  },
  {
    immediate: true,
    deep: true,
  },
)

watch(() => consignProcessor.data.id, (id?: string) => {
  if (!id || !pageStateService.readonly)
    return

  const flagName = consignProcessor.data.snPresetMode
  const isSubcontract = consignProcessor.data.isSubcontract
  const presetNumber = pageStateService.presetNumber
  // 自动弹出编号预设
  if (presetNumber && flagName !== 'disabled' && !isSubcontract) {
    showPresetNumber.value = true
    handlePresetNumber()
  }

  // 完成委托后，校验是否绑定电子标签
  if (SYSTEM_PARAM.SAMPLE_BINDING_RFID && pageStateService.checkBindElectronLabel)
    handleBindRFID()
})

/** ## 编号预设 */
async function handlePresetNumber() {
  await AnyDialogHelper.showModel(IframeLayer, {
    title: '预设编号',
    url: `rest/snPreset/goSnPresetPage?consignId=${consignProcessor.data.id}`,
    hideConfirm: true,
  })
}

/** ## 绑定电子标签 */
async function handleBindRFID() {
  const { data } = await checkBindElectronLabelApi(consignProcessor.data.id || '')
  if (!data)
    return
  const id = `bl_${generateGUID()}`
  sessionStorage.setItem(id, JSON.stringify(data))
  await AnyDialogHelper.showModel(IframeLayer, {
    title: '绑定电子标签',
    url: `consignController.do?goBindElectronLabel&dataId=${id}&formPage=consignComplete`,
    hideConfirm: true,
  })
  sessionStorage.removeItem(id)
}

/** 是否可编辑资质 */
function isEditQualification(row: IRenderSampleData) {
  if (!SYSTEM_PARAM.SET_QUA_WITH_OBJECT)
    return false
  if (
    (!isEqual(row.type, 1) && !isEqual(row.type, 3) && consignProcessor.data.status !== CONSIGN_STATUS.SAMPLE_RETURN && !pageStateService.readonly)
    || (consignProcessor.data.status === CONSIGN_STATUS.SAMPLE_RETURN && row.status === '2')
  ) {
    return true
  }
  return false
}

/** 选择资质 */
const qualificationSelectorVisible = ref(false)
const cacheRow = ref()
/** 选择样品资质 */
function openQualificationSelector(row: any) {
  cacheRow.value = row
  qualificationSelectorVisible.value = true
}
/** 选择资质回调 */
function onSelectQulification(rows: any[]) {
  consignSampleProcessor.updateQulifications(cacheRow.value, rows)
}

/** ## 点击行 */
function customRow(record: IRenderSampleData) {
  return {
    onClick: () => {
      if (record.disabled || record.parentMark)
        return

      const key = record.id || ''
      if (consignSampleProcessor.selectedSample[key]) {
        consignSampleProcessor.selectedSample[key] = false
      }
      else {
        consignSampleProcessor.selectedSample[key] = true
      }
    },
  }
}

/** 显示列 */
function tableFieldList() {
  const fields = SampleInfoEntity.getTableFieldList()
  if (SYSTEM_PARAM.ENABLE_PROVIDE_TO_CUSTOMER_SAMPLE_CODE)
    return fields
  return fields.filter(d => d !== 'provideToCustomerSampleCode')
}

/** 标记 */
function sampleMarks(record: IRenderSampleData) {
  const marks: IlisMark[] = []
  if (record.urgentStatus === '10')
    marks.push({ mark: '急', description: '委托方要求加急检测', color: 'green' })
  if (isEqual(record.type, 1) || record.referred)
    marks.push({ mark: '引', description: term('引用样品'), color: '#f17011' })
  if (isEqual(record.type, 2))
    marks.push({ mark: '参', description: term('参配样品'), color: 'green' })
  if (isEqual(record.type, 3))
    marks.push({ mark: '外', description: term('外来样品'), color: 'green' })
  if (isEqual(record.type, 4))
    marks.push({ mark: '子', description: `添加的${term('子样品')}`, color: '#103ff3' })
  return marks
}

/** 自定义标记 */
function sampleCustomMark(record: IRenderSampleData) {
  const markIds = record.markObjectColorTextIds?.split(',') || []
  return canUseMarkList.value.filter(i => markIds.includes(i.id))
}

/** 检测参数 */
function renderTestParams(params?: IRenderSampleData['testParams']) {
  if (!params || !params.length)
    return ''
  return params.map((d) => {
    const remark = d.remark ? `（${d.remark}）` : ''
    return `${d.testParamDisplayName}${remark}`
  }).join('；')
}

/** 渲染资质 */
function renderQualifications(datas: Qualification[]) {
  if (!datas || !datas.length)
    return ''
  return datas.map(d => d.name).join('；')
}

/** 价格详情 */
async function openPriceDetailList(priceDetailList: any[]) {
  Modal.info({
    title: `${term('样品')}合计金额明细`,
    content: h('div', { style: 'min-height: 200px;max-height: 400px;overflow-y: auto;' }, [
      h(List, {
        dataSource: priceDetailList,
        renderItem: ({ item }) => h(List.Item, `${item.name}：${item.computeProcess}`),
      }),
    ]),
    centered: true,
    okText: '关闭',
    okType: 'default',
  })
}

/**
 * 如果当前样品是主样品、子样品，直接返回样品状态
 * 如果当前样品是引用原材料、外来样品，则返回父样品状态
 */
function objectState(record: IRenderSampleData) {
  if (!record.type || isEqual(record.type, 4)) {
    return record.status
  }
  return record.parentStatus
}

/** 详情按钮控制 */
function showDetail(record: IRenderSampleData) {
  const s = consignProcessor.data.status
  if (pageStateService.readonly && s && [WRITE, RETURN, SAMPLE_RETURN].includes(s))
    return true
  if (s && [FINISH, EDIT].includes(s))
    return true
  const objState = objectState(record)
  if (s === SAMPLE_RETURN && objState !== SampleStatus.ROLLBACK)
    return true

  return false
}
/** 详情按钮title */
function detailTitle(type: number) {
  return isEqual(type, 1) ? '查看引入原材料信息' : isEqual(type, 3) ? `查看${term('外来样品')}信息` : term('查看收样信息')
}

/** 编辑按钮控制 */
function showEdit(record: IRenderSampleData) {
  const s = consignProcessor.data.status
  if (!s)
    return true
  if ([WRITE, RETURN, SAMPLE_RETURN, EDIT].includes(s) && !pageStateService.readonly) {
    const objState = objectState(record)
    if (s === SAMPLE_RETURN && objState !== SampleStatus.ROLLBACK)
      return false
    return true
  }
  return false
}
/** 编辑按钮title */
function editTitle(type: number) {
  return isEqual(type, 1) ? '编辑引入原材料信息' : isEqual(type, 3) ? `编辑${term('外来样品')}信息` : term('修改收样信息')
}

/** 删除按钮控制 */
function showDelete(record: IRenderSampleData) {
  if (pageStateService.readonly)
    return false
  const s = consignProcessor.data.status
  if (!s || s === WRITE || s === RETURN)
    return true
  const objState = objectState(record)
  if (s === SAMPLE_RETURN && objState === SampleStatus.ROLLBACK)
    return true
  return false
}

/** 作废按钮控制 */
function showAbandon(record: IRenderSampleData) {
  if (pageStateService.readonly)
    return false
  const s = consignProcessor.data.status
  const t = !record.type || isEqual(record.type, 4)
  const objState = objectState(record)
  if ((s === RETURN && !!record.originId && t) || (s === SAMPLE_RETURN && objState === SampleStatus.ROLLBACK && t))
    return true
  return false
}

/** 数据中心按钮控制 */
function showDataCenter(record: IRenderSampleData) {
  return !pageStateService.isCreateTest && record.testParams?.length
}

/** 修改样品 */
async function handleEdit(record: IRenderSampleData) {
  // 主样品、子样品
  if (!record.type || isEqual(record.type, 4)) {
    handleAdd(record, false)
  }
  // 引用已委托原材料
  else if (isEqual(record.type, 1)) {
    const row = consignSampleProcessor.getMetaDataItemByMark(record.mark)
    const datas: any[] = await AnyDialogHelper.showModel(EditExternalObjectModal, {
      title: '编辑引入原材料其他信息',
      datas: [row],
    })
    if (record.parentMark) {
      const sample = consignSampleProcessor.getMetaDataItemByMark(record.parentMark)
      if (!sample)
        return
      for (let i = 0; i < sample.otherMaterials.length; i++) {
        if (sample.otherMaterials[i].mark === record.mark) {
          sample.otherMaterials[i] = datas[0]
          break
        }
      }
    }
  }
  // 参配样品
  else if (isEqual(record.type, 2)) {
    message.info('开发中...')
  }
  // 外来样品
  else if (isEqual(record.type, 3)) {
    const row = consignSampleProcessor.getMetaDataItemByMark(record.mark)
    const data: ExternalObjectEntity = await AnyDialogHelper.showModel(AddExternalObjectModal, row)
    if (record.parentMark) {
      const sample = consignSampleProcessor.getMetaDataItemByMark(record.parentMark)
      if (!sample)
        return
      for (let i = 0; i < sample.otherMaterials.length; i++) {
        if (sample.otherMaterials[i].mark === record.mark) {
          sample.otherMaterials[i] = data as any
          break
        }
      }
    }
  }
}

/**
 * 添加/编辑主样品、子样品
 * @param record 样品信息
 * @param detail 是否为查看详情
 * @param isAddChild 是否为添加子样品
 */
async function handleAdd(record?: IRenderSampleData, detail?: boolean, isAddChild?: boolean) {
  const metaData = record ? (consignSampleProcessor.getMetaDataItemByMark(record.mark) as IConsignSamples) : undefined
  const isDetailPage = pageStateService.readonly || !!detail

  // 一个委托是否允许添加多个样品
  if (!record && !isAddMultipleSample())
    return

  const selectedRows = Object.values(consignSampleProcessor.selectedSample).filter(d => d)
  if (isAddChild && selectedRows.length !== 1) {
    message.warning(`请选择一条${term('检测样品')}`)
    return
  }

  const titleType = record ? detail ? '查看' : '编辑' : '添加'

  await consignOffineDataService.beforeAddOfflineSampleCheck()

  const param: IConsginPageParam = {
    title: titleType + term('样品信息'),
    industryName: industry?.name || '',
    industryId,
    consignDetail: consignProcessor.data,
    sampleDatas: consignSampleProcessor.consignSampleData,
    priceStandardId: consignFeeProcessor.feeVo.chargeStandard || '',
    SYSTEM_PARAM,
    pageState: {
      isAddPage: !record,
      isDetailPage,
      isEditPage: !!record && !detail && !pageStateService.readonly,
      isCreateTest: pageStateService.isCreateTest || consignProcessor.data.consignBigType === '2',
      offlineDataId: pageStateService.offlineDataId,
      cloneReport: pageStateService.cloneReport,
      projectId: pageStateService.projectId,
      isTaskRedirect: pageStateService.isTaskRedirect,
      isLocalTest: consignProcessor.isLocalTest,
      isNoticeModifyConsign: consignProcessor.isNoticeModifyConsign,
      objectRollback: consignSampleProcessor.sampleRollback,
    },
    metaData,
    feeCalculateWithScript: (type: string, object: IConsignSamples, params: IViewTestParamsItem[]) => consignFeeProcessor.calculateWithScript(type, object, params),
    placeholder: (text: string) => isDetailPage ? '' : text,
    onSaveSample: async (res: IConsignSamples[], isSaveConsign?: boolean, generateCode?: EGenerateCode) => {
      consignProcessor.setConsignData({
        generateCode,
      })
      await consignSampleProcessor.saveSample({
        metaDatas: res.map(item => ({ ...item })), // 返回的类实例，转为对象，cloneDeep不会拷贝类实例
        isAddChild,
        isSaveConsign,
      })
      // 保存样品后数据处理
      await consignFeeProcessor.saveSampleAfter()

      if (isSaveConsign)
        return consignSampleProcessor.consignSampleData
    },
  }
  // if (top?.TopAnyDialogHelper) {
  //   top.TopAnyDialogHelper.showModel(TopComponent.SelectSampleModal, param)
  // }
  // else {
  AnyDialogHelper.showModel(SelectSampleModal, param)
  // }
}

/** 获取选中样品 */
function selectedKeys() {
  const keys = Object.keys(consignSampleProcessor.selectedSample)
  return keys.filter(key => consignSampleProcessor.selectedSample[key])
}

/** 是否只选择了1条数据 */
function isSelectedOne() {
  const keys = selectedKeys()
  if (keys.length !== 1) {
    message.warning(`请选择一条${term('检测样品')}`)
    return
  }
  return keys[0]
}

/** 一个委托是否允许添加多个样品 */
function isAddMultipleSample() {
  if (!SYSTEM_PARAM.CONSIGN_WITH_MULTIPLE_OBJECT && consignSampleProcessor.consignSampleData.length >= 1) {
    message.warning(`当前系统控制参数不允许一个委托添加多个${term('样品')}，如果需要添加多个${term('样品')}，请在系统控制参数中启用该参数！`)
    return false
  }
  return true
}

/** 复制样品 */
async function handleCopy() {
  // 一个委托是否允许添加多个样品
  if (!isAddMultipleSample())
    return

  const keys = selectedKeys()
  if (keys.length === 0) {
    message.warning(`请选择需要复制的${term('检测样品')}`)
    return
  }
  loading.value = true
  // 复制样品
  await consignSampleProcessor.handleCloneSample(keys)

  if (consignProcessor.data.project?.projectId) {
    // 如果设置了工程项目，则根据工程项目设置支付合同，并进行重新计费
    // 添加样品渲染后根据工程项目设置支付合同
    await consignFeeProcessor.commonSetPayContract()
  }
  else {
    // 添加样品渲染后重新计算价格
    await consignFeeProcessor.computeTotalFee({
      feeState: consignFeeProcessor.consignFeeData,
      sampleDatas: consignSampleProcessor.consignSampleData,
    })
  }
  message.success('复制成功')
  loading.value = false
}

/** ## 删除样品 */
async function handleDelete(row: IRenderSampleData) {
  if (consignProcessor.data.id && !row.parentMark && consignSampleProcessor.consignSampleData.length === 1) {
    modalError(`当前委托仅有一个主${term('样品')}，如果需要删除请使用委托删除功能或者添加新${term('样品')}后再删除`)
    return
  }

  if ((!row.status && !consignProcessor.data.id) || isEqual(row.type, 1) || isEqual(row.type, 3)) {
    const isOk = await modalConfirm(`确认删除该${term('样品')}？`)
    loading.value = true
    if (isOk)
      await consignSampleProcessor.deleteSampleDatas(row)
    loading.value = false
    delete consignSampleProcessor.selectedSample[row.mark]
    return
  }

  loading.value = true
  await sampleAssignmentsApi(row.mark)
  loading.value = false

  const msg = await opinionModal(`删除${term('样品')}`, undefined, {
    subTitle: `删除${term('样品')}后不可恢复，请输入删除原因：`,
    placeholder: '请输入删除原因',
  })
  if (!msg)
    return

  await consignSampleProcessor.commonDeleteSample(row, msg, true)
  await consignFeeProcessor.computeTotalFee({
    feeState: consignFeeProcessor.consignFeeData,
    sampleDatas: consignSampleProcessor.consignSampleData,
  })
  // 保存委托：跳过核定费用变更提示
  await saveConsign(undefined, true)
}

/** 作废样品 */
async function handleAbandon(row: IRenderSampleData) {
  if (consignProcessor.data.id && !row.type && consignSampleProcessor.consignSampleData.length < 2) {
    modalError(`当前委托仅有一个${term('主样品')}，如果需要作废请使用委托作废功能或者添加新${term('样品')}后再作废！`)
    return
  }

  const opinion = await opinionModal(`作废${term('样品')}`, undefined, {
    subTitle: `作废${term('样品')}后，${term('样品编号')}及后续生成的任务、记录、报告编号仍会被占用，若需取消作废请在“已作废${term('样品')}管理”中处理；请输入作废原因：`,
    placeholder: '请输入作废原因',
  })

  if (!opinion)
    return

  loading.value = true
  await consignSampleProcessor.commonDeleteSample(row, opinion, false)
  await consignFeeProcessor.computeTotalFee({
    feeState: consignFeeProcessor.consignFeeData,
    sampleDatas: consignSampleProcessor.consignSampleData,
  })
  // 保存委托：跳过核定费用变更提示
  await saveConsign(undefined, true)

  loading.value = false
}

/** 引用外来样品 */
async function handleUseExternalObject() {
  const key = isSelectedOne()
  if (!key)
    return
  const datas = await AnyDialogHelper.showSelector<any>(ExternalObjectSelector, {
    multiple: true,
    isCacheSelect: true,
  })
  const sample = consignSampleProcessor.getMetaDataItemByMark(key)
  sample?.otherMaterials.push(...datas)
}

/** 引用已委托原材料 */
async function handleAddConsignedSample() {
  const key = isSelectedOne()
  if (!key)
    return
  const sample = consignSampleProcessor.getMetaDataItemByMark(key)
  const datas = await AnyDialogHelper.showSelector<IConsignSamples>(ConsignedSampleSelector, {
    multiple: true,
    isCacheSelect: true,
    payload: {
      testObjectId: sample?.id || '',
      unitId: consignProcessor.data.consignUnit.consignUnitId,
    },
  })
  sample?.otherMaterials.push(...datas)
}

/** 录入外来样品 */
async function handleAddExternalObject() {
  const key = isSelectedOne()
  if (!key)
    return

  const data: any = await AnyDialogHelper.showModel(AddExternalObjectModal)
  const sample = consignSampleProcessor.getMetaDataItemByMark(key)
  sample?.otherMaterials.push(data)
}

/** 标记/取消标记 */
async function handleSampleMark(isAdd: boolean) {
  const keys = selectedKeys()
  if (keys.length === 0) {
    message.warning(`请选择一条${term('检测样品')}`)
    return
  }

  const samples = consignSampleProcessor.consignSampleData.filter(item => keys.includes(item.mark))
  let selMarkIds
  if (keys.length === 1)
    selMarkIds = samples[0].markObjectColorTextIds?.split(',') || []

  const checkedMarks: any[] = await AnyDialogHelper.showModel(IlisCustomMarkModal, {
    title: isAdd ? '添加标记' : '取消标记',
    markList: canUseMarkList.value,
    checkedMarkIds: isAdd ? selMarkIds : undefined,
  })
  const markIds = checkedMarks.map(item => item.id)
  samples.forEach((sample) => {
    const selMarkIds = sample.markObjectColorTextIds?.split(',') || []
    if (isAdd) {
      const mergeMark = new Set([...selMarkIds, ...markIds])
      sample.markObjectColorTextIds = [...mergeMark].join(',')
    }
    else {
      sample.markObjectColorTextIds = selMarkIds.filter(item => !markIds.includes(item)).join(',')
    }
  })
}
</script>
