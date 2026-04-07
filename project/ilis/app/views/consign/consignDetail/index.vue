<template>
  <IlisContainer app-id="consign-detail" :body-style="{ height: '100%', padding: '0px' }">
    <BaseSpinWrapper :spinning="detailLoading || handleLoading">
      <a-flex
        v-if="!pageStateService.isTaskRedirect || showViewConsignOrder"
        justify="space-between"
        class="shadow-[0_2px_6px_rgba(0,0,0,0.05)] py-2 px-4"
      >
        <a-space>
          <template v-if="!pageStateService.isTaskRedirect">
            <a-button
              v-if="!consignProcessor.data.status && pageStateService.isCreateTest"
              v-permission="['createSynthesisTestTask', 'create:task']"
              type="primary"
              @click="handleCreateTest()"
            >
              创建综合试验
            </a-button>
            <a-button
              v-if="showSaveBtn"
              v-permission="'saveConsign'"
              type="primary"
              @click="handleSave()"
            >
              保存
            </a-button>
            <a-button
              v-if="showSaveBtn"
              v-permission="'completeConsignByData'"
              type="primary"
              @click="handleSave(EConsignSaveType.FINISH)"
            >
              完成
            </a-button>
            <!-- 预览/打印 -->
            <HandlePrint
              v-if="!!consignProcessor.data.id"
              v-permission="'consignCommonPrint'" :selected-rows="selectedRows"
              :json-params="{}"
            />
            <a-button
              v-if="!!consignProcessor.data.id && consignProcessor.data.isPreconsign === 1 && !pageStateService.cloneReport"
              @click="handleViewPreconsign()"
            >
              以预委托方式查看
            </a-button>
            <a-button
              v-if="!!consignProcessor.data.id && consignProcessor.data.isPreconsign === 1 && !pageStateService.cloneReport"
              @click="handlePushPreconsign()"
            >
              向预委托平台推送委托单{{ `${pushCount ? `（已推送${pushCount}次）` : ''}` }}
            </a-button>
            <a-button
              v-if="!!consignProcessor.data.id"
              @click.stop="AnyDialogHelper.showModel(LogModalByApi, { id: consignProcessor.data.id, logType: '0', relationQry: true })"
            >
              查看日志
            </a-button>
            <a-button
              v-if="!!consignProcessor.data.id && !constructParams.consignInfo?.isDelete && consignProcessor.data.status === CONSIGN_STATUS.FINISH"
              v-permission="'revocationConsign'"
              danger
              @click="handleWithdraw"
            >
              撤回委托
            </a-button>
            <a-button
              v-if="!!consignProcessor.data.id && copyConsignSpecified"
              @click="handleCopy"
            >
              {{ `复制为${copyConsignSpecified}委托` }}
            </a-button>
            <a-button
              v-if="
                consignProcessor.data.status === CONSIGN_STATUS.FINISH
                  && String(constructParams.consignInfo?.isDelete) !== '1'"
              @click="handleSign"
            >
              委托方签字
            </a-button>
            <a-button
              v-if="
                consignProcessor.data.status === CONSIGN_STATUS.FINISH
                  && String(constructParams.consignInfo?.isDelete) !== '1'"
              @click.stop="AnyDialogHelper.showModel(SeeSign, { consignId: consignProcessor.data.id })"
            >
              查看签名
            </a-button>
            <a-button
              v-if="consignProcessor.data.status === CONSIGN_STATUS.FINISH"
              v-permission="'consign::recreate::consignbill'"
              @click="handleCreateConsignBill"
            >
              重新生成委托单
            </a-button>
          </template>

          <a-button
            v-if="showViewConsignOrder"
            @click="viewConsignOrder()"
          >
            预览委托单
          </a-button>
        </a-space>

        <a-space v-if="!pageStateService.isTaskRedirect">
          <SpecialCharacterModal v-if="!pageStateService.readonly" @select="inputSpecialChar">
            <a-button type="text" size="small">
              <FontColorsOutlined />
              特殊字符
            </a-button>
          </SpecialCharacterModal>
          <CustomAttribute
            v-if="!pageStateService.readonly"
            customize-type="consign-property"
            :columns-type="ConsignCustomColumn.CONSIGN_INFO"
            show-blind-col
            show-pre-consign-col
          >
            <a-button type="text" size="small">
              <SettingOutlined />
              自定义属性配置
            </a-button>
          </CustomAttribute>
          <a-button v-if="!EmbeddedHelper.isEmbedded && !pageStateService.readonly" type="text" size="small" @click="handleLayoutConfig">
            <SettingOutlined />
            默认值/界面配置
          </a-button>
        </a-space>
      </a-flex>

      <div class="py-2 px-4 flex-1 overflow-auto">
        <a-alert v-if="industry?.name" :message="`领域：${industry.name}`" show-icon class="!mb-2" />
        <a-alert
          v-if="consignProcessor.data.status === CONSIGN_STATUS.RETURN && constructParams.withdrawOpinion"
          :message="constructParams.withdrawOpinion"
          type="warning" show-icon class="!mb-2"
        />
        <BaseTitle>
          委托信息
          <!-- 委托状态 -->
          <a-tag v-if="consignProcessor.data.status" style="margin-left: 8px;">
            {{ consignStatusDict.getLabelByKey(consignProcessor.data.status) }}
          </a-tag>
          <a-tag v-if="consignProcessor.data.status === CONSIGN_STATUS.FINISH && consignProcessor.data.sampleAcceptorName" style="margin: 0 8px;">
            收样人: {{ consignProcessor.data.sampleAcceptorName }}
          </a-tag>
          <template #right>
            <a-space :size="20">
              <a-checkbox
                v-if="!pageStateService.isCreateTest"
                v-model:checked="consignProcessor.data.isSubcontract"
                :disabled="pageStateService.readonly || consignProcessor.consignSampleProcessor.isSampleRollback"
              >
                分包检测
              </a-checkbox>
              <a-checkbox
                v-model:checked="consignProcessor.isLocalTest"
                :disabled="disabledLocalTest || pageStateService.readonly || consignProcessor.consignSampleProcessor.isSampleRollback"
              >
                现场检测
              </a-checkbox>
            </a-space>
          </template>
        </BaseTitle>

        <DynamicForm
          ref="dynamicFormRef"
          :layout-configs="layoutConfigs"
          :business-config="businessConfig"
          @ready="dynamicFormReady"
          @click="handleClick"
          @change="handleChange"
        >
        </DynamicForm>

        <template v-if="getModuleConfig('witnessInfo')?.selected">
          <div v-show="showMore" class="my-6">
            <BaseTitle>见证信息</BaseTitle>
            <WitnessList ref="witnessInfoRef" />
          </div>
        </template>

        <BaseTitle>{{ term('样品信息') }}</BaseTitle>
        <SampleList />
      </div>

      <FeeInfo v-if="readyFinish" />
    </BaseSpinWrapper>
    <!-- 委托方签名 -->
    <OnlineSginatureModal ref="onlineSginatureRef" @confirm="handleSignCallback" />
  </IlisContainer>
</template>

<script setup lang='ts'>
import type { Key } from 'ant-design-vue/es/_util/type'
import type { IBusinessConfig, IConsignDataSaveParam } from './interface'
import type { ConfigTreeOption, IndustryLayoutConfig } from '~/api/consign/consign-form-layout/types'
import type { IConsignDataDTO } from '~/api/consign/consign-management/types'
import { FontColorsOutlined, SettingOutlined } from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import { EFormItemDynamicType } from '~/anyThing/enum/EFormItemType'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { LAYOUT_FORM_TYPE } from '~/api/consign/consign-form-layout/types'
import {
  checkAutoPrintApi,
  copyConsignApi,
  createConsignNoApi,
  EConsignSaveType,
  EGenerateCode,
  getPreWebUrlApi,
  getPushTimesApi,
} from '~/api/consign/consign-management'
import LogModalByApi from '~/components/commonSystemLog/LogModalByApi.vue'
import { OnlineSginatureModal } from '~/components/onlineSignature'
import { useIndustryStore } from '~/store/industryStore.ts'
import { usePermissionStore } from '~/store/permissionStore'
import { useSystemParamStore } from '~/store/systemParamStore'
import { useLayoutConfig } from '~/views/consign/consignFormLayout/composables/useLayoutConfig'
import HandlePrint from '../consignList/components/HandlePrint.vue'
import SeeSign from '../consignList/components/SeeSign.vue'
import { ConsignListEntity } from '../consignList/ConsignListEntity'
import { CONSIGN_STATUS, ConsignCustomColumn, consignStatusDict } from '../consignList/dict'
import { modalConfirm, modalError } from '../consignList/modules/modalUtil'
import { useHandler } from '../consignList/modules/useHandler'
import { DynamicForm, FeeInfo, SampleList, ViewByPreConsign, WitnessList } from './components'
import { useConsignDetailLoadingProvider, useConsignEventEmitterProvider, useConsignProcessorProvider, useConsignSaveProvider } from './composables/useProviderInject'
import { EConsignEventEmit } from './interface'
import { NormalConsignProcessor } from './modules/consign-processor/NormalConsignProcessor'
import { SynthesisConsignProcessor } from './modules/consign-processor/SynthesisConsignProcessor'
import { ConsignPrintService } from './modules/ConsignPrintService'
import { ConsignStorageManager } from './modules/ConsignStorageManager'
import { PageStateService } from './modules/PageStateService'

defineProps({
  status: {
    type: String,
    default: '',
  },
})

const detailLoading = ref(false)
const industryStore = useIndustryStore()
const { hasPermission } = usePermissionStore()
const { term, getModuleConfig, industry } = industryStore
const { systemParams } = useSystemParamStore()

/** 动态表单 */
const dynamicFormRef = ref()
/** 见证信息表单 */
const witnessInfoRef = ref()
/** 当前操作的表单 */
const handleFormTarget = ref<IndustryLayoutConfig>()
/** 光标位置 */
const selectionStart = ref(-1)
/** 复制为指定委托 */
const copyConsignSpecified = ref('')

// 委托事件发布订阅器
const consignEventEmitter = new EventEmitter([
  EConsignEventEmit['委托表单加载完成'],
  EConsignEventEmit['委托数据初始化完成'],
])

// 页面状态服务
const pageStateService = new PageStateService()

// 委托打印服务
const consignPrintService = new ConsignPrintService()

// 委托缓存服务
const consignStorageManager = new ConsignStorageManager(industryStore)

// 实例化委托控制器
let consignProcessor: NormalConsignProcessor | SynthesisConsignProcessor

// 根据参数控制不同的委托类型实例化
if (pageStateService.isCreateTest) {
  // 综合试验委托
  consignProcessor = reactive(new SynthesisConsignProcessor(
    pageStateService,
    systemParams,
    consignEventEmitter,
    consignStorageManager,
    industryStore,
  )) as SynthesisConsignProcessor
}
else {
  // 通用委托
  consignProcessor = reactive(new NormalConsignProcessor(
    pageStateService,
    systemParams,
    consignEventEmitter,
    industryStore,
    consignStorageManager,
    consignPrintService,
  )) as NormalConsignProcessor
}

const constructParams = computed(() => consignProcessor.consignConstructParams || {})
const showMore = ref(false)
const readyFinish = ref(false)
const pushCount = ref(0)
const disabledLocalTest = ref(false)
const disabledLocalTestText = ref('')

const selectedRowKeys = computed(() => [consignProcessor.data.id as Key])

const selectedRows = computed(() => {
  return [ConsignListEntity.fromJSON({
    id: consignProcessor.data.id!,
    consignStatus: consignProcessor.data.status,
    consignUnitId: consignProcessor.data.consignUnit.consignUnitId,
    consignCode: consignProcessor.data.consignCode,
    consignUnitName: consignProcessor.data.consignUnit.consignUnitName,
    consignProjectId: consignProcessor.data.project?.projectId,
  })]
})

const {
  handleLoading,
  onlineSginatureRef,
  handleWithdraw,
  handleSign,
  handleSignCallback,
  handleCreateConsignBill,
} = useHandler(selectedRowKeys, selectedRows, () => consignProcessor.reOpenDetail(`修改委托 ${consignProcessor.data.consignCode}`, {
  id: consignProcessor.data.id!,
  industryId: pageStateService.industryId,
  status: consignProcessor.data.status,
  presetNumber: '1',
}))

/** 布局配置 */
const { layoutConfigs, initLayoutConfig } = useLayoutConfig(pageStateService.industryId)

const layoutFormType = computed(() => pageStateService.isCreateTest ? LAYOUT_FORM_TYPE.SYNTHESIS_CONSIGN : LAYOUT_FORM_TYPE.CONSIGN)

/**
 * ## 表单业务逻辑配置
 * @description 委托详情表单通过配置动态渲染,不易将复杂业务逻辑写在其中,通过传入业务配置方式对表单进行业务控制
 */
const businessConfig = reactive<IBusinessConfig>({
  // 委托日期
  consignDate: {
    disabled: !hasPermission('ALLOW_MODIFY_CONSIGN_DATE'),
  },
  // 检测类别
  checkTypeId: {
    init: onChangeCheckType,
  },
  // 委托单位
  consignUnit: {
    rules: (config?: IndustryLayoutConfig) => validateObject('consignUnitId', config),
  },
  // 工程项目
  project: {
    rules: (config?: IndustryLayoutConfig) => validateObject('projectId', config),
  },
  // 委托人
  sampleSender: {
    rules: (config?: IndustryLayoutConfig) => validateObject('sampleSenderId', config),
  },
  // 项目地址
  projectAddress: {
    disabled: true,
  },
  // 单位工程
  unitProject: {
    init: initUnitProject,
    /** 选择单位工程前验证工程项目 */
    beforeClick: () => {
      if (!consignProcessor.data.project?.projectId) {
        message.warning('请先选择工程项目')
        return false
      }
      return true
    },
    rules: (config?: IndustryLayoutConfig) => {
      const required = pageStateService.isCreateTest || config?.required || false
      if (config)
        config.required = required
      return [
        ...validateObject('unitProjectObjId', config),
        { required, message: '请选择工程划分' },
      ]
    },
  },
  /** 报告发放方式 */
  reportHandOverType: {
    init: onChangeReportHandOverType,
  },
  /** 送样方式 */
  sampleSendType: {
    init: onChangeSampleSendType,
  },
  /** 预委托编号 */
  preConsignCode: {
    disabled: true,
  },
})

onMounted(async () => {
  detailLoading.value = true

  // 初始化委托
  await consignProcessor.init()

  // 初始化委托动态表单
  await initLayoutConfig(layoutFormType.value, false, {
    customAttributes: consignProcessor.consignConstructParams?.consignCustomAttributes,
  })

  // 复制为指定委托 - 根据检测类型初始化显示信息
  initCopyConsignSpecified()

  detailLoading.value = false

  getPushTimes()

  // 委托数据
  // 初始化完成
  consignEventEmitter.subscribe(EConsignEventEmit['委托数据初始化完成'], async (consignData: IConsignDataDTO) => {
    readyFinish.value = true

    // 检查是否自动打印委托单
    if (consignProcessor.checkAutoPrintConsignForm()) {
      autoPrintConsignForm(consignData)
    }

    // 详情数据初始化完成后，根据详情值初始化关联表单视图
    for (const k in businessConfig) {
      const conf = businessConfig[k]
      if (typeof conf.init === 'function') {
        const layout = layoutConfigs.value.find(d => d.fieldCode === k)
        conf.init((consignProcessor.data as any)[k], layout?.options)
      }
    }
  })
})

/** ## 初始化复制为指定委托 */
async function initCopyConsignSpecified() {
  if (!systemParams.DETERMINE_INSPECTION)
    return

  const determineInspect = systemParams.DETERMINE_INSPECTION
  const checkTypeOptions = layoutConfigs.value.find(d => d.fieldCode === 'checkTypeId')?.options || []

  function _each(options: ConfigTreeOption[]) {
    for (let i = 0; i < options.length; i++) {
      const opt = options[i]
      if (opt.value === determineInspect) {
        copyConsignSpecified.value = opt.label
        return
      }
      if (opt.children && opt.children.length > 0) {
        _each(opt.children)
      }
    }
  }

  _each(checkTypeOptions)
}

/** 布局配置加载完成 */
async function dynamicFormReady() {
  // 获取委托详情
  consignEventEmitter.publish(EConsignEventEmit['委托表单加载完成'], layoutConfigs.value)
}

/** 构建保存委托的数据 */
async function buildSaveData() {
  const formData = await dynamicFormRef.value?.saveData()
  const witnessInfo = await witnessInfoRef.value?.saveData()
  return {
    consignData: formData ? { ...formData } : null,
    sampleData: consignProcessor.consignSampleProcessor.consignSampleData,
    feeState: consignProcessor.consignFeeProcessor.consignFeeData,
    witnessInfo: witnessInfo ? { ...witnessInfo } : null,
  }
}

/** ## 费用检查：修改委托时，会重新计算费用，导致手动修改过的实收费用被还原成了系统计算的费用，故在保存时进行提示 */
async function save_inspectFee(feeState: IConsignDataSaveParam['feeState']) {
  const ratedFee = feeState.feeVo.ratedFee
  const originRatedFee = feeState.originRatedFee
  if (originRatedFee && ratedFee !== originRatedFee) {
    const isOk = await modalConfirm(`费用变更，原核定费用为${originRatedFee}元，变更后费用为${ratedFee}元`, '提示', {
      okText: '维持原费用',
      cancelText: '变更',
    })

    if (isOk) {
      feeState.feeVo.ratedFee = originRatedFee
      // 后台保存了相关费用信息，所以使用原核定费用需要重新执行一次计算费用的方法
      // 费用变更维持原价，重新根据参数计算费用
      await consignProcessor.consignFeeProcessor.computeTotalFee({
        feeState,
        sampleDatas: consignProcessor.consignSampleProcessor.consignSampleData,
      })
      return true
    }
  }
  return true
}

/** 保存委托前验证 */
async function checkDataBeforeSave(saveParam: IConsignDataSaveParam, saveType?: EConsignSaveType) {
  const { consignData, witnessInfo, sampleData, feeState } = saveParam
  const isWitnessSelected = getModuleConfig('witnessInfo')?.selected
  // 验证委托信息、见证信息
  if (!consignData || (isWitnessSelected && !witnessInfo))
    return false

  // 验证样品数据
  if (saveType !== EConsignSaveType.GENERATE_CODE && (!sampleData || sampleData.length === 0)) {
    message.error(`请${term('添加样品')}`)
    return false
  }

  // 费用检查
  const isFeeOk = await save_inspectFee(feeState)
  if (!isFeeOk)
    return false

  return true
}

/**
 * ## 保存委托
 * @param saveType 保存方式
 * @param unReloadPage 是否不重新加载页面
 */
async function handleSave(saveType?: EConsignSaveType, unReloadPage?: boolean) {
  const data = await buildSaveData()
  const isComplete = saveType === EConsignSaveType.FINISH

  consignProcessor.unReloadPage = !!unReloadPage

  // 验证数据
  const isOk = await checkDataBeforeSave(data, saveType)
  if (!isOk)
    return

  detailLoading.value = true
  try {
    await consignProcessor.saveConsign(data, isComplete)
  }
  finally {
    detailLoading.value = false
  }
}

/** ## 创建综合试验 */
async function handleCreateTest() {
  const bol = await consignProcessor.consignOffineDataService.beforeCreateTest()
  if (bol)
    handleSave()
}

// 提供依赖
// 委托处理器
useConsignProcessorProvider(consignProcessor)
// 事件发布订阅器
useConsignEventEmitterProvider(consignEventEmitter)
// 委托详情加载状态
useConsignDetailLoadingProvider(detailLoading)
// 保存委托
useConsignSaveProvider(handleSave)

/**
 * 自动打印委托单
 */
async function autoPrintConsignForm(consignData: IConsignDataDTO) {
  if (!consignData.consignCode) {
    const isGenConsignCode = await modalConfirm('委托尚未完成，暂未生成委托编号。是否需要生成委托编号？', '', {
      okText: '生成并预览',
      cancelText: '直接预览',
    })

    if (isGenConsignCode) {
      if (consignData.id) {
        // 生成委托编号
        await consignProcessor.generateConsignCode(consignData.id)
      }
      else {
        modalError('委托id为空，无法生成委托编号！')
      }
    }
  }

  const { data } = await checkAutoPrintApi()

  // TODO 这里考虑向后端提工单，直接支持传递打印份数
  if (data && data.printNum) {
    for (let i = 0; i < data.printNum; i++) {
      consignPrintService.printConsignOrder(consignData.id as string)
    }
  }
}

/** ## 显示保存按钮 */
const showSaveBtn = computed(() => {
  const { FINISH, CANCEL } = CONSIGN_STATUS
  const isCreateTest = pageStateService.isCreateTest && !consignProcessor.data.status
  return !pageStateService.readonly && (!consignProcessor.data.status || ![FINISH, CANCEL].includes(consignProcessor.data.status)) && !isCreateTest
})

/**
 * ## 显示预览委托单
 * @description 查看详情时，开启盲样且有权限才显示，未开启盲样始终显示
 */
const showViewConsignOrder = computed(() => {
  const sysParm = systemParams.TEST_DETECTION_39
  const permission = hasPermission('seeThroughTheMist')
  return pageStateService.readonly && (!sysParm || (sysParm && permission))
})

// 获取检测类别选中项数据
function findCheckType(id: string, options?: any[]) {
  if (!options)
    return
  function find(datas: any[]) {
    for (let i = 0; i < datas.length; i++) {
      const item = datas[i]
      if (item.id === id)
        return item
      if (item.children && item.children.length > 0) {
        const d: any = find(item.children)
        if (d)
          return d
      }
    }
  }
  return find(options)
}

/** 动态表单，保存值为对象类型的，无法触发验证，添加自定义验证 */
function validateObject(field: string, config?: IndustryLayoutConfig) {
  return [
    {
      validator: (rule: any, value: any) => {
        if (config && config.required && !value[field])
          return Promise.reject(new Error(rule.message))
        return Promise.resolve()
      },
      message: `请选择${config?.fieldDisplayName || field}`,
    },
  ]
}

/** 构建综合实验检测相关ui：处理工程项目、工程划分 */
async function initUnitProject() {
  if (pageStateService.readonly)
    return

  if (pageStateService.isCreateTest || consignProcessor.data.consignBigType === '2') {
    const projectId = pageStateService.projectId
    const projectName = pageStateService.projectName
    if (projectId) {
      consignProcessor.setConsignData({
        project: {
          projectId,
          projectTenderName: projectName,
          name: projectName,
        },
      })
      await consignProcessor.getUnitData(projectId)
    }
    else {
      const id = consignProcessor.data.project?.projectId
      if (id)
        await consignProcessor.getUnitData(id)
      else
        businessConfig.unitProject.disabled = true
    }

    // 复制报告时自动保存委托（仅执行一次）
    if (consignProcessor.data.id && pageStateService.isCreateTest && pageStateService.cloneReport) {
      handleSave()
    }
  }
}

/** 表单点击事件 */
function handleClick(config: IndustryLayoutConfig, e?: Event) {
  handleFormTarget.value = config
  if (e?.target)
    selectionStart.value = (e?.target as any).selectionStart || -1

  // 生成委托编号
  if (config.fieldCode === 'consignCode') {
    consignProcessor.setConsignData({
      generateCode: EGenerateCode.CONSIGN_CODE,
    })
    handleSave(EConsignSaveType.GENERATE_CODE)
  }
}

/** ## 表单change事件  */
async function handleChange(v: any, field: string, options?: any[]) {
  // eslint-disable-next-line no-console
  console.log(`handleChange - ${field}:`, v)

  if (field === 'showMore') {
    showMore.value = v
  }
  // 委托单位、工程项目、委托人
  else if (['consignUnit', 'project', 'sampleSender', 'sampleSenderPhone'].includes(field)) {
    const isSave = await consignProcessor.selectedConsignUnitProjectCallback(v)
    if (isSave)
      handleSave()
  }
  // 单位工程
  else if (field === 'unitProject') {
    consignProcessor.selectedUnitProjectCallback(v)
  }
  // 报告发放方式
  else if (field === 'reportHandOverType') {
    onChangeReportHandOverType(v)
  }
  // 送样方式
  else if (field === 'sampleSendType') {
    onChangeSampleSendType(v)
  }
  // 缴费单位
  else if (field === 'paymentUnitName') {
    consignProcessor.setConsignData({
      paymentUnitCode: v.code,
    })
  }
  // 检测类别
  else if (field === 'checkTypeId') {
    onChangeCheckType(v, options)
  }
  // 修改资质
  else if (field === 'qualificationTypeId') {
    consignProcessor.consignSampleProcessor.updateQulificationByConsign(v)
  }
  // 样品来源
  else if (field === 'sampleSourceCode') {
    consignProcessor.setConsignData({
      sampleSource: options?.find(d => d.value === v)?.name || '',
    })
  }
}

/** 修改检测类别 */
async function onChangeCheckType(v: any, options?: any[]) {
  if (pageStateService.readonly || !v)
    return
  const item = findCheckType(v, options)
  if (!item) {
    console.error('检测类别未找到：', v, options)
    return
  }
  consignProcessor.contralConfirm = item.scopeOfApp
  if (item.scopeOfApp === '2') {
    disabledLocalTest.value = true
    consignProcessor.isLocalTest = false
    disabledLocalTestText.value = `检测类别${item.name}仅适用非现场检测`
  }
  else if (item.scopeOfApp === '1') {
    disabledLocalTest.value = true
    consignProcessor.isLocalTest = true
    disabledLocalTestText.value = `检测类别${item.name}仅适用现场检测`
  }
  else {
    disabledLocalTest.value = false
    disabledLocalTestText.value = ''
  }
}

/** 修改报告发放方式 */
async function onChangeReportHandOverType(v?: string) {
  for (let i = 0; i < layoutConfigs.value.length; i++) {
    const conf = layoutConfigs.value[i]
    if (conf.fieldCode === 'postFormId') {
      conf.isShow = v === '3'
      break
    }
  }
}
/** 修改送样方式 */
async function onChangeSampleSendType(v?: string) {
  const ind = layoutConfigs.value.findIndex(d => d.fieldCode === 'mailPayType')
  if (ind !== -1)
    layoutConfigs.value[ind].isShow = v === '3'
  const ind2 = layoutConfigs.value.findIndex(d => d.fieldCode === 'mailOrderNumber')
  if (ind2 !== -1)
    layoutConfigs.value[ind2].isShow = v === '3'
}

/** 选择特殊字符 */
function inputSpecialChar(v: string) {
  if (!handleFormTarget.value)
    return
  const { i, formType } = handleFormTarget.value
  const { INPUT, INPUT_RANGE, INPUT_SELECTOR, TEXTAREA } = EFormItemDynamicType
  if (![INPUT, INPUT_RANGE, INPUT_SELECTOR, TEXTAREA].includes(formType))
    return

  const oldV = (consignProcessor.data as any)[i] || ''
  if (selectionStart.value === -1) {
    // 未获取到光标位置，直接追加
    (consignProcessor.data as any)[i] = oldV + v
    return
  }
  // 在光标位置插入特殊字符
  (consignProcessor.data as any)[i] = oldV.slice(0, selectionStart.value) + v + oldV.slice(selectionStart.value)
  selectionStart.value++
}

/** 默认值/界面配置 */
function handleLayoutConfig() {
  openIlisTab('委托信息默认值', `systemController.do?goConsignFormLayout&industryId=${pageStateService.industryId}`)
}

/** 预览委托单 */
async function viewConsignOrder() {
  detailLoading.value = true
  await consignPrintService.printConsignOrder(consignProcessor.data.id!)
  detailLoading.value = false
}

/** 以预委托方式查看 */
async function handleViewPreconsign() {
  const { data: preWebUrl } = await getPreWebUrlApi()
  if (!preWebUrl) {
    message.warning('未配置预委托信息！')
    return
  }
  const consignType = consignProcessor.data?.preConsignCode?.indexOf('CL-') === 0 ? '1' : '2'
  const param: any = {
    id: consignProcessor.data.preConsignId,
    consignType,
    pageSource: '4',
    isIlis: '1',
    unitCode: `${localStorage.getItem('unitCode') || ''}_A03`,
  }
  const query = new URLSearchParams(param).toString()
  const targetUrl = `/#/preconsign-management/detail?${query}`
  const url = new URL(targetUrl, preWebUrl)
  await AnyDialogHelper.showModel(ViewByPreConsign, {
    url: url.toString(),
  })
}

/** ## 委托单推送次数 */
async function getPushTimes() {
  const { data } = await getPushTimesApi(consignProcessor.data!.id!, consignProcessor.data!.preConsignId!)
  pushCount.value = data?.pushCount || 0
}

async function handlePushPreconsign() {
  Modal.confirm({
    title: '推送提示',
    content: () => h('div', {}, [
      h('div', {}, '本操作将推送预委托单PDF到预委托平台，请确保委托单信息正确！'),
      h('div', { style: { color: 'var(--colorPrimary)', cursor: 'pointer' }, onClick: () => { IlisPrintUdr.commonPrint([], 'consignOrder') } }, `委托单预览>>`),
    ]),
    okText: '确认',
    okType: 'primary',
    centered: true,
    onOk: async () => {
      const consignCode = consignProcessor.data?.consignCode?.replace(/ /g, '')
      // 打印委托单以前自动生成委托编号
      if (consignCode === '') {
        const { data } = await createConsignNoApi(consignProcessor.data.id!)
        const consignCode = data.obj
        consignProcessor.setConsignData({
          consignCode,
        })
      }
      else {
        consignProcessor.setConsignData({
          generateCode: EGenerateCode.RECEIVE_CODE,
        })
        await handleSave()
      }
      IlisPrintUdr.convertUdr2Pdf(consignProcessor.data.id!, consignProcessor.data.preConsignId!)
      getPushTimes()
    },
  })
}

async function handleCopy() {
  Modal.confirm({
    title: '提示',
    content: '确定复制委托吗？',
    okText: '确认',
    okType: 'primary',
    centered: true,
    onOk: async () => {
      await copyConsignApi(consignProcessor.data.id!)
      message.success('复制成功')
      consignProcessor.reOpenDetail('修改委托', {
        id: consignProcessor.data.id!,
        industryId: pageStateService.industryId,
      })
    },
  })
}
</script>

<style scoped>
.ant-btn >.anticon+span, .ant-btn >span+.anticon{
  margin-left: 4px;
}
:deep(.css-dev-only-do-not-override-gwxsbm.ant-empty-normal){
  margin-top: 8px;
  margin-bottom: 0;
}
</style>
