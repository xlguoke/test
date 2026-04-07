import type { ConsignFeeProcessor } from '../ConsignFeeProcessor'
import type { ConsignOffineDataService } from '../ConsignOffineDataService'
import type { ConsignSampleProcessor } from '../ConsignSampleProcessor'
import type { ConsignStorageManager } from '../ConsignStorageManager'
import type { ConsignUnitProcessor } from '../ConsignUnitProcessor'
import type { IndustryLayoutConfig } from '~/api/consign/consign-form-layout/types'
import type { IConsignConstructReqDTO, IConsignConstructResDTO, IConsignDataDTO, IConsignInfoResDTO } from '~/api/consign/consign-management/types'
import type { ISystemParam } from '~/api/system/system-param/types'
import type { EventEmitter } from '~/utils/EventEmitter.ts'
import type { QualificationEntity } from '~/views/consign/component/selectSample/interface/Qualification'
import type {
  IConsignDataSaveParam,
  IConsignUnitProject,
  IGoDetailConfig,
  ISaveConsignResFail,
  IUnitProjectTreeNode,
} from '~/views/consign/consignDetail/interface'
import type { PageStateService } from '~/views/consign/consignDetail/modules/PageStateService.ts'
import { cloneDeep } from '@unovis/ts'
import { message } from 'ant-design-vue'
import {
  consignConstructParamsApi,
  createConsignNoApi,
  EWitnessType,
  getExtractSampleInfo,
  getExtractSampleOtherInfo,
  getUnitProjectApi,
  synthesisTestCreateProgressApi,
  updateConsignInfoApi,
} from '~/api/consign/consign-management'
import { FORM_TYPE } from '~/components/customAttribute'
import { modalError } from '~/utils/modalUtil'
import { EConsignEventEmit } from '~/views/consign/consignDetail/interface'
import { CONSIGN_STATUS } from '~/views/consign/consignList/dict.ts'
import { initDateFormat } from '../../utils/formTools'

/** ## 预设编号重复提示 */
const snTypes: any = computed(() => ({
  10: '委托',
  20: '样品',
  30: '任务',
  40: '记录',
  50: '报告',
}))

/**
 * 委托处理器 基类
 */
export abstract class BaseConsignProcessor {
  /** 委托详情构造参数 */
  consignConstructParams: IConsignConstructResDTO | null = null

  /** 委托数据 */
  protected consignData: IConsignDataDTO = {
    qualificationTypeId: undefined,
    testType: '',
    snTypeId: '',
    checkTypeId: '',
    reportHandOverType: '1',
    sampleSendType: '1',
    consignUnit: {
      name: '',
      consignUnitId: '',
      consignUnitName: '',
    },
    project: {
      name: '',
      projectId: '',
      projectTenderName: '',
    },
    sampleSender: {
      name: '',
      sampleSenderId: '',
      sampleSenderName: '',
    },
    unitProject: {
      name: '',
      unitProjectType: '',
      unitProjectObjId: '',
      unitProjectName: '',
    },
    metaData: '',
    consignBigType: '1',
  }

  /** ## 检测类别的 scopeOfApp */
  contralConfirm: string = ''

  /** ## 提示不能导入离线试验数据时，是否已点击确认按钮 */
  isConfirmHint: boolean = false

  /** ## 保存委托后，不重载详情页面 */
  unReloadPage: boolean = false

  activeMenuId: string = ''

  /**
   * ## 现场检测
   * @description 对应委托类型 consignDetail.consignType 0-原材料检测 1-现场检测
   */
  isLocalTest: boolean = false

  /**
   * ## 通知修改委托
   * @description 委托详情加载完成后不再变化，consignDetail.status === '50'
   */
  get isNoticeModifyConsign() {
    return this.consignConstructParams?.consignInfo?.status === CONSIGN_STATUS.EDIT
  }

  /** ## 获取委托数据 */
  get data() {
    return this.consignData
  }

  /** ## 设置委托数据 */
  setConsignData(data: Record<string, any>) {
    Object.assign(this.consignData, data)
  }

  /** 委托费用控制器 */
  public abstract consignFeeProcessor: ConsignFeeProcessor
  /** 委托样品控制器 */
  public abstract consignSampleProcessor: ConsignSampleProcessor
  /** 离线数据服务 */
  public abstract consignOffineDataService: ConsignOffineDataService
  /** 委托单位工程项目控制器 */
  public abstract consignUnitProcessor: ConsignUnitProcessor

  /**
   * ## 依赖注入
   * @param pageStateService 页面状态服务
   * @param systemParams 系统参数
   * @param industryStore 领域状态管理器
   * @param consignEventEmitter 委托事件订阅/发布器
   * @param consignStorageManager 委托存储管理器
   */
  constructor(
    public pageStateService: PageStateService,
    public systemParams: ISystemParam,
    public industryStore: any,
    public consignEventEmitter: EventEmitter,
    public consignStorageManager: ConsignStorageManager,
  ) {}

  /** ## 委托初始化 */
  async init() {
    // 初始化委托构造参数
    await this.loadConsignConstructParams()
    this.refreshConsignList()
    // 根据构造参数初始化领域id
    this.initIndustryId()

    // 初始化样品退回状态
    this.initSampleRollbackStatus()

    // 订阅表单渲染完成后执行数据加载逻辑
    this.subscribeFormLoadedEvent()
  }

  /** ## 初始化样品退回状态 */
  initSampleRollbackStatus() {
    const isSampleRollback = this.consignConstructParams?.consignInfo?.status === CONSIGN_STATUS.SAMPLE_RETURN
    this.consignSampleProcessor.setSampleRollback(isSampleRollback)
  }

  /** ## 订阅表单渲染完成后执行数据加载逻辑 */
  subscribeFormLoadedEvent() {
    this.consignEventEmitter.subscribe(EConsignEventEmit['委托表单加载完成'], async (layoutConfigs: IndustryLayoutConfig[]) => {
      // 不存在委托id时，为新增委托
      if (!this.pageStateService.consignId) {
        // 初始化新增委托页面
        await this.initNewConsignData(layoutConfigs)
      }
      else {
        // 数据回显
        await this.initConsignData()
      }

      // 初始化解析脚本价格需要的数据
      this.consignFeeProcessor.initFormOptions(layoutConfigs)

      // 当前委托单位挂账检查
      if (this.consignData.consignUnit.consignUnitId) {
        await this.consignFeeProcessor.checkCredit(
          this.consignData.consignUnit.consignUnitId,
          this.consignData.id || '',
          this.consignFeeProcessor.consignFeeData.feeVo.ratedFee || 0,
        )
      }

      // 初始化复制报告逻辑
      if (this.pageStateService.cloneReport) {
        this.initCloneReport()
        this.consignSampleProcessor.initCloneReport()
      }

      // 发布委托数据初始化完成通知
      this.consignEventEmitter.publish(EConsignEventEmit['委托数据初始化完成'], this.consignData)

      // eslint-disable-next-line no-console
      console.log('委托数据初始化完成', this.consignData)
    })
  }

  /** ##  加载旧版委托中后端注入在jsp中的参数数据 / 构造参数 */
  async loadConsignConstructParams() {
    const { pageStateService } = this

    const param: IConsignConstructReqDTO = {
      id: pageStateService.consignId,
    }

    if (pageStateService.isTaskRedirect)
      param.taskRedirect = true
    else
      param.main = true

    const { data } = await consignConstructParamsApi(param)

    this.consignConstructParams = data
  }

  /** ## 初始化领域id */
  initIndustryId() {
    const industryId = this.consignConstructParams?.consignInfo?.industryId

    // 如果接口中返回了领域id，直接更新领域状态管理器中的id
    if (industryId) {
      this.industryStore.setIndustryId(industryId)
    }
  }

  /** ## 初始化委托页面回显数据 */
  async initConsignData() {
    const consignInfo = this.consignConstructParams?.consignInfo
    const consignCustomAttributes = this.consignConstructParams?.consignCustomAttributes

    if (!consignInfo) {
      return
    }

    this.isLocalTest = consignInfo?.consignType === '1'

    // 加载委托基础数据
    if (consignInfo)
      this.setConsignBaseData(consignInfo)

    // 加载委托自定义属性数据
    this.setConsignCustomAttributesData(consignCustomAttributes)

    // 加载委托见证数据
    this.setWitnessesData(consignInfo.consignWitnessInfo)

    // 加载委托样品数据
    this.consignSampleProcessor.setConsignSampleData(this.consignSampleProcessor.parseSampleMetaData(consignInfo.metaData.metaData))
  }

  /** ## 获取缓存编号类别 */
  protected abstract getStorageSnType(): string

  /** ## 初始化新增委托数据 */
  async initNewConsignData(layoutConfigs: IndustryLayoutConfig[]) {
    // 系统参数控制是否默认上次填写数据
    if (this.systemParams.USE_LAST_CONSIGN_DATA) {
      // 从缓存获取委托单位/工程项目信息
      const consignUnitData = this.consignUnitProcessor.getConsignUnitStorage()

      if (consignUnitData) {
        // 设置委托单位、委托人、工程项目默认值
        this.setConsignUnitProjectRelationData(consignUnitData)
      }
    }

    // 设置表单默认值
    this.setConsignFormDefaultValue(layoutConfigs)

    // 现场取样 - 新建委托
    if (this.pageStateService.extractSampleId) {
      this.initExtractSample(this.pageStateService.extractSampleId)
    }
  }

  /** ## 初始化现场取样信息默认值 */
  async initExtractSample(extractSampleId: string) {
    const consignData = this.consignData
    const { data } = await getExtractSampleInfo(extractSampleId)

    if (!data.consignMeta || !data.meta) {
      return
    }

    const consignMeta = JSON.parse(data.consignMeta)
    const meta = JSON.parse(data.meta)
    const perjectInfo = consignMeta.perjectInfo

    // 默认样品信息
    meta.extractSampleId = extractSampleId
    delete meta.otherInfo
    delete meta.attachments
    delete meta.id

    const otherInfos = JSON.parse(data.otherInfo || '[]')
    for (let i = 0; i < otherInfos.length; i++) {
      otherInfos[i].attributeId = otherInfos[i].id
      delete otherInfos[i].id
    }
    meta.otherInfos = otherInfos

    if (meta.isStandard !== '1') {
      meta.periods = []
    }

    if (meta.isStandard === '1' && meta.periods.length > 0) {
      const paramIds = data.paramIds
      const paramNames = data.paramNames.replace(/\//g, ',')

      for (let j = 0; j < meta.periods.length; j++) {
        const period = meta.periods[j]
        period.testParamId = paramIds
        period.testParamName = paramNames
        period.objectGroupNum = 1
        period.index = j
        delete period.id
      }
    }

    // 样品编号已生成时，写入生成的样品编号等信息
    const sampleOtherRes = await getExtractSampleOtherInfo(extractSampleId)
    if (sampleOtherRes.data.testObjectCode) {
      meta.testObjectCode = sampleOtherRes.data.testObjectCode
      meta.testObjectId = sampleOtherRes.data.testObjectId
    }

    // 设置样品列表数据
    this.consignSampleProcessor.setConsignSampleData([meta])

    // 默认委托基本信息
    consignData.extractSampleId = extractSampleId
    consignData.sampleSource = '现场取样'
    consignData.sampleSourceCode = 'site_sampling'
    consignData.witnessUnitName = consignMeta.witnessUnitName
    consignData.buildUnitName = consignMeta.buildUnitName
    consignData.manualFeeTotal = meta.initalTestObjectPrice
    consignData.witnesses = [{
      witness: consignMeta.witness,
      witnessLicenseNumber: consignMeta.witnessLicenseNumber,
      witnessPhone: consignMeta.witnessPhone,
    }]
    consignData.buildWitnesses = [{
      witness: consignMeta.buildWitness,
      witnessLicenseNumber: consignMeta.buildWitnessLicenseNumber,
      witnessPhone: consignMeta.buildWitnessPhone,
    }]

    if (perjectInfo) {
      consignData.project = {
        projectId: perjectInfo.consignProjectId,
        name: perjectInfo.consignProjectName,
        projectTenderName: perjectInfo.consignProjectName,
      }
      consignData.unitProject = {
        name: perjectInfo.unitProjectName,
        unitProjectType: perjectInfo.unitProjectType,
        unitProjectObjId: perjectInfo.unitProjectObjId,
        unitProjectName: perjectInfo.unitProjectName,
      }

      const consignUnit = perjectInfo.consignUnit
      if (consignUnit) {
        consignData.consignUnit = {
          name: consignUnit.name,
          consignUnitId: consignUnit.id,
          consignUnitName: consignUnit.name,
          consignUnitAddress: consignUnit.contactAddress,
        }
      }

      const sampleSender = perjectInfo.sampleSender
      if (sampleSender) {
        consignData.sampleSender = {
          name: sampleSender.name,
          sampleSenderId: sampleSender.id,
          sampleSenderName: sampleSender.name,
          sampleSenderPhone: sampleSender.contactPhone,
        }
      }
    }
  }

  /** ## 设置委托表单数据 */
  setConsignFormDefaultValue(layoutConfigs: IndustryLayoutConfig[]) {
    const consignConstructParams = this.consignConstructParams
    const consignData = this.consignData

    for (let i = 0; i < layoutConfigs.length; i++) {
      const config = layoutConfigs[i]
      const options = config.options || []

      if (['consignDate', 'sampleSendDate'].includes(config.fieldCode)) {
        const systemDate = consignConstructParams?.systemDate || Date.now()
        const format = initDateFormat(config, this.systemParams.TIME_ACCURACY)
        ;(consignData as any)[config.fieldCode] = AnyDateTimeHelper.format(systemDate, format)
      }

      // 检测形式
      if (config.fieldCode === 'testType') {
        consignData.testType = config.value || options[0]?.value || ''
      }
      // 检测类别
      else if (config.fieldCode === 'checkTypeId') {
        this.setDefaultCheckTypeId(options)
      }
      // 样品来源
      else if (config.fieldCode === 'sampleSource') {
        consignData.sampleSource = options[0]?.value || ''
      }
      // 编号类型
      else if (config.fieldCode === 'snTypeId') {
        this.setDefaultSnTypeId(options)
      }
      // 其他表单项
      else if (config.defaulted) {
        (consignData as any)[config.fieldCode] = config.value
      }
    }
  }

  // 默认检测类别支持不同功能板块分别配置
  setDefaultCheckTypeId(options: any[]) {
    const isCreateTest = this.pageStateService.isCreateTest
    function _find(options: any[]) {
      for (let i = 0; i < options.length; i++) {
        const opt = options[i]
        const scopeOfApp = opt.scopeOfApp
        if (opt.isDefault === '1') {
          if (isCreateTest && (scopeOfApp === '1' || scopeOfApp === '3')) {
            return opt.id
          }
          else if (!isCreateTest && (scopeOfApp === '2' || scopeOfApp === '3')) {
            return opt.id
          }
        }
        if (opt.children && opt.children.length > 0) {
          const val: string = _find(opt.children)
          if (val)
            return val
        }
      }
    }
    const val = _find(options)
    this.consignData.checkTypeId = val || options[0]?.value || ''
  }

  //  默认编号类型支持不同功能板块分别配置
  setDefaultSnTypeId(options: any[]) {
    // 从缓存获取编号类别
    let snTypeId = this.getStorageSnType()
    const isCreateTest = this.pageStateService.isCreateTest
    if (!snTypeId) {
      for (let i = 0; i < options.length; i++) {
        const scopeOfApp = options[i].scopeOfApp
        if (options[i].isDefault === 'Y') {
          if (isCreateTest && (scopeOfApp === '1' || scopeOfApp === '3')) {
            snTypeId = options[i].id
          }
          else if (!isCreateTest && (scopeOfApp === '2' || scopeOfApp === '3')) {
            snTypeId = options[i].id
          }
        }
      }
    }
    this.consignData.snTypeId = snTypeId
  }

  /** ## 设置委托单位、工程项目关联数据 */
  setConsignUnitProjectRelationData(data: IConsignUnitProject) {
    const consignData = this.consignData
    const project = data.project
    const consignProject = project?.consignProject
    const consignUnit = data.consignUnit

    const transformUnitData = this.consignUnitProcessor.transformUnitProjectData(data)

    // 委托单位、工程项目信息
    consignData.consignUnit = transformUnitData.consignUnit
    consignData.project = transformUnitData.project
    consignData.sampleSender = transformUnitData.sampleSender
    consignData.consignUnitAddress = transformUnitData.consignUnit.consignUnitAddress
    consignData.projectAddress = transformUnitData.project?.projectAddress
    consignData.sampleSenderPhone = transformUnitData.sampleSender.sampleSenderPhone

    // 46103-送样单位名称随委托单位名称修改而修改
    consignData.sampleSendUnitName = data.consignUnit.name

    // 领域中配置了启用工程项目
    if (this.industryStore.getField('project')?.selected) {
      // 见证信息
      if (project) {
        // 根据工程项目设置见证信息
        this.setProjectWitness(data)

        // 更新见证信息到缓存
        this.consignUnitProcessor.updateConsignUnitStorage({
          projectId: project.consignProject?.id,
          buildWitnesses: consignData.buildWitnesses,
          witnesses: consignData.witnesses,
        })
      }

      // 缴费单位
      if (!consignProject?.payUnitName) {
        if (consignUnit.payUnitName) {
          consignData.paymentUnitName = consignUnit.payUnitName
          consignData.paymentUnitCode = consignUnit.payUnitCode
        }
        else {
          consignData.paymentUnitName = consignUnit.name
          consignData.paymentUnitCode = ''
        }
      }
      else {
        consignData.paymentUnitName = consignProject?.payUnitName
        consignData.paymentUnitCode = consignProject?.payUnitCode
      }
    }
  }

  /** ## 设置工程项目中的见证信息 */
  setProjectWitness(data: IConsignUnitProject) {
    const consignData = this.consignData
    const project = data.project
    const consignProject = data.project?.consignProject

    const constructionUnitName = (project.constructionUnitName || []).filter(i => i.selected).map(i => i.name)
    const witnessUnitName = (project.witnessUnitName || []).filter(i => i.selected).map(i => i.name)

    // 若未配置，默认使用工程项目中维护的数据
    // 施工单位
    if (constructionUnitName && constructionUnitName.length) {
      consignData.constructionUnitName = constructionUnitName[0]
    }
    else {
      consignData.constructionUnitName = consignProject?.constructionUnitName ? consignProject?.constructionUnitName.split(',')[0] : ''
    }

    // 监理单位
    if (witnessUnitName && witnessUnitName.length) {
      consignData.witnessUnitName = witnessUnitName[0]
    }
    else {
      consignData.witnessUnitName = consignProject?.witnessUnitName ? consignProject?.witnessUnitName.split(',')[0] : ''
    }

    // 公路登记
    consignData.highwayLevel = consignProject?.highwayLevel || ''
    // 建设单位
    consignData.buildUnitName = consignProject?.buildUnitName || ''

    // 使用工程项目-委托单位设置的见证人信息，若委托单位未设置见证人则使用工程项目配置的见证人信息
    // 建设单位见证信息
    const buildWitnesses = project.buildWitnesses || []
    const selBuildWitnesses = buildWitnesses.filter(d => d.selected)
    if (selBuildWitnesses.length > 0) {
      consignData.buildWitnesses = this.transformBuildWitness(selBuildWitnesses)
    }
    else {
      consignData.buildWitnesses = this.transformBuildWitness(buildWitnesses)
    }

    // 监理单位见证信息
    const witnesses = project.witnesses || []
    const selWitnesses = witnesses.filter(d => d.selected)
    if (selWitnesses.length > 0) {
      consignData.witnesses = this.transformBuildWitness(selWitnesses)
    }
    else {
      consignData.witnesses = this.transformBuildWitness(witnesses)
    }
  }

  /** ## 见证信息数据转换 */
  transformBuildWitness(witnessList: IConsignUnitProject['project']['witnesses']) {
    return witnessList.map(d => ({
      witness: d.witness,
      witnessLicenseNumber: d.witnessNum || '',
      witnessPhone: d.witnessPhone || '',
    }))
  }

  /** ## 加载已保存委托数据 */
  setConsignBaseData(consignInfo: IConsignInfoResDTO) {
    const consignData = this.consignData

    consignData.id = consignInfo.id || ''
    consignData.status = consignInfo.status || undefined
    consignData.consignCode = consignInfo.consignCode || ''

    consignData.isSubcontract = consignInfo.isSubcontract
    consignData.qualificationTypeId = consignInfo.qualificationTypeId ? consignInfo.qualificationTypeId.split(',') : []
    consignData.testType = consignInfo.testType || ''
    consignData.snTypeId = consignInfo.snTypeId || ''
    consignData.checkTypeId = consignInfo.checkTypeId || ''
    consignData.sampleSource = consignInfo.sampleSource || ''
    consignData.sampleSourceCode = consignInfo.sampleSourceCode || ''
    consignData.consignDate = consignInfo.consignDate || ''
    consignData.sampleSendDate = consignInfo.sampleSendDate || ''
    consignData.preConsignCode = consignInfo.preConsignCode || ''
    consignData.preConsignId = consignInfo.preConsignId || ''
    consignData.isPreconsign = consignInfo.isPreconsign || 0
    consignData.requireReportDate = consignInfo.requireReportDate || ''
    consignData.appointmentDate = consignInfo.appointmentDate || ''
    consignData.highwayLevel = consignInfo.highwayLevel || ''
    consignData.remark = consignInfo.remark || ''
    consignData.attachmentQrKey = consignInfo.attachmentQrKey || ''
    consignData.consignUnit = {
      name: consignInfo.consignUnit.name || '',
      consignUnitId: consignInfo.consignUnit.id || '',
      consignUnitName: consignInfo.consignUnit.name || '',
      consignUnitAddress: consignInfo.consignUnitAddress || '',
    }
    consignData.project = {
      name: consignInfo.project?.name || '',
      projectId: consignInfo.project?.id || '',
      projectTenderName: consignInfo.project?.name || '',
      projectAddress: consignInfo.project?.projectAddress || '',
    }
    consignData.sampleSender = {
      name: consignInfo.sampleSender.name || '',
      sampleSenderId: consignInfo.sampleSender.id || '',
      sampleSenderName: consignInfo.sampleSender.name || '',
      sampleSenderPhone: consignInfo.sampleSender.contactPhone || '',
    }
    consignData.unitProject = {
      name: consignInfo.unitProjectName || '',
      unitProjectObjId: consignInfo.unitProjectObjId || '',
      unitProjectName: consignInfo.unitProjectName || '',
      unitProjectType: consignInfo.unitProjectType || '',
    }
    consignData.consignUnitAddress = consignInfo.consignUnitAddress
    consignData.projectAddress = consignData.project.projectAddress
    consignData.sampleSenderPhone = consignInfo.sampleSender.contactPhone || ''
    consignData.reportHandOverType = consignInfo.reportHandOverType ? `${consignInfo.reportHandOverType}` : ''
    consignData.postFormId = consignInfo.postFormId || ''
    consignData.mailPayType = consignInfo.mailPayType || ''
    consignData.mailOrderNumber = consignInfo.mailOrderNumber || ''
    consignData.reportPrintNum = consignInfo.reportPrintNum
    consignData.buildUnitName = consignInfo.buildUnitName || ''
    consignData.witnessUnitName = consignInfo.witnessUnitName || ''
    consignData.paymentUnitName = consignInfo.paymentUnitName || ''
    consignData.paymentUnitCode = consignInfo.paymentUnitCode || ''
    consignData.extractSampleUnit = consignInfo.extractSampleUnit || ''
    consignData.extractSamplePerson = consignInfo.extractSamplePerson || ''
    consignData.extractSamplePersonTel = consignInfo.extractSamplePersonTel || ''
    consignData.extractSampleId = consignInfo.extractSampleId || ''
    consignData.sampleSendType = consignInfo.sampleSendType || ''
    consignData.sampleSendUnitName = consignInfo.sampleSendUnitName || ''
    consignData.constructionUnitName = consignInfo.constructionUnitName || ''
    consignData.consignBigType = consignInfo.consignBigType || ''
    consignData.fax = consignInfo.fax || ''
    consignData.snPresetMode = consignInfo.snPresetMode || ''
    consignData.sampleAcceptorName = consignInfo.sampleAcceptorName || ''
    consignData.appointContract = {
      id: consignInfo.appointContractId || '',
      name: consignInfo.appointContractName || '',
      no: consignInfo.appointContractNo || '',
    }
  }

  /** ## 设置自定义属性数据 */
  setConsignCustomAttributesData(consignCustomAttributes: IConsignInfoResDTO['consignCustomAttributes'] = []) {
    const consignData = this.consignData

    if (consignCustomAttributes && consignCustomAttributes.length > 0) {
      consignCustomAttributes.forEach((item) => {
        let val: string | string[] = item.attributeValue
        if (val && item.type === FORM_TYPE.SELECT_MULTIPLE) {
          val = val.split(',')
        }
        (consignData as any)[item.id] = val
      })
    }
  }

  /** ## 加载已保存见证信息 */
  setWitnessesData(witnessList: IConsignInfoResDTO['consignWitnessInfo'] = []) {
    const consignData = this.consignData

    consignData.buildWitnesses = witnessList.filter(d => d.type === EWitnessType.BUILD)
    consignData.witnesses = witnessList.filter(d => d.type === EWitnessType.SUPERVISION)
  }

  /** 选择工程划分回调 */
  selectedUnitProjectCallback(node: IUnitProjectTreeNode) {
    // 工程划分添加后，兼容以前的数据结构
    let unitProjectType
    if (node.type === -2)
      unitProjectType = '1'
    else if (node.type === -1)
      unitProjectType = '2'
    else
      unitProjectType = '3'

    // 设置委托数据
    this.setConsignData({
      unitProject: {
        unitProjectObjId: node.id,
        unitProjectName: node.name,
        unitProjectType,
        name: node.name,
      },
    })

    // 选择工程划分时，若工程划分上有挂载施工或监理单位信息，将其默认到表单中
    if (node.attributes) {
      const { constructionUnit, supervisingUnit } = node.attributes
      if (constructionUnit) {
        this.consignData.constructionUnitName = constructionUnit
      }
      if (supervisingUnit) {
        this.consignData.witnessUnitName = supervisingUnit
      }
    }
  }

  /** 选择委托单位工程项目回调 */
  async selectedConsignUnitProjectCallback(data: IConsignUnitProject) {
    const oldName = this.consignData.project?.projectTenderName
    const consignProject = data.project?.consignProject

    // 委托单位配置了资质信息时，默认值改为委托单位配置的资质
    if (this.consignData.id && data.consignUnit.qualificationTypeId) {
      const qId = this.getQualificationIdByConsignUnit(data.consignUnit.qualificationTypeId)
      this.consignData.qualificationTypeId = qId ? [qId] : []
    }

    // 项目检测创建综合试验时，本地工程项目不可编辑，保持当前数据不变
    // 离线数据创建综合试验时，本地工程项目、工程划分不可编辑，保持当前数据不变
    if (this.pageStateService.isTestProject || this.pageStateService.offlineDataId) {
      if (consignProject && consignProject.id && consignProject.id !== this.consignData.project?.projectId) {
        data.project = {
          consignUnit: {} as any,
          consignProject: {
            id: consignProject.id || '',
            name: consignProject.name || '',
            witnessList: [],
          },
          constructionUnitName: [],
          witnessUnitName: [],
          witnesses: [],
          buildWitnesses: [],
        }
      }
    }

    // 设置委托单位、工程项目关联数据
    this.setConsignUnitProjectRelationData(data)

    // 重新加载费用标准
    await this.consignFeeProcessor.getFeeStandard()

    // 重新加载单位工程树（创建综合试验或工程划分启用时）
    if (this.pageStateService.isCreateTest || this.consignData.consignBigType === '2') {
      const projectId = this.consignData.project?.projectId
      if (projectId) {
        await this.getUnitData(projectId)
      }
    }

    // #21253
    if (this.consignData.id) {
      updateConsignInfoApi(this.consignData.id).catch((err) => {
        console.error('尝试更新委托信息失败', err)
      })
    }

    // 工程项目参与编号规则的，变更时保存委托
    if (this.consignData.status && this.systemParams.SN_AUTO_MATCH_MASK && oldName && oldName !== consignProject?.name) {
      return await this.consignFeeProcessor.changeConsignUnitProject()
    }
  }

  /** ## 获取单位工程树数据 */
  async getUnitData(projectId: string) {
    try {
      const { data } = await getUnitProjectApi({ id: projectId })
      if (!data || !data.length)
        return
      const unitProjectId = this.consignData.unitProject?.unitProjectObjId
      let sampleOldData: any[] = []
      if (this.pageStateService.projectId && this.pageStateService.projectId === projectId) {
        const cacheData: any = sessionStorage.getItem(`testReport${projectId}`)
        sampleOldData = cacheData ? JSON.parse(cacheData) : []
      }
      if (!this.consignData.id && this.pageStateService.isCreateTest) {
        if (this.pageStateService.cloneReport) {
          // 克隆报告时清空单位工程选择
          this.consignData.unitProject = {
            name: '',
            unitProjectName: '',
            unitProjectObjId: '',
            unitProjectType: '',
          }
        }
        if (this.pageStateService.projectId) {
          if (sampleOldData.length)
            this.unitProjectHtml(sampleOldData[0])
          else
            this.unitProjectHtml(data[0])
        }
      }
      if (this.consignData.consignBigType === '2' && unitProjectId) {
        const _each = (list: any[]) => {
          for (let i = 0; i < list.length; i++) {
            const item = list[i]
            if (item.oid === unitProjectId) {
              this.unitProjectHtml(item)
              return true
            }
            else if (item.children) {
              const bol = _each(item.children)
              if (bol)
                return true
            }
          }
          return false
        }
        _each(data)
      }
    }
    catch (err) {
      console.error(err)
    }
  }

  /** ## 设置单位工程数据 */
  unitProjectHtml(res: any) {
    if (!res)
      return
    // 此处调整 工程划分默认合同段
    const obj: any = {}
    if (res && !res.pid) {
      if (res.disabledParam === true) {
        if (res.children && res.children.length > 0) {
          res = res.children[0]
          obj.name = res.name
          obj.id = res.oid
        }
      }
      else {
        obj.name = res.name
        obj.id = res.oid
      }
    }
    else if (res && isEqual(res.type, '-1')) {
      obj.name = res.name
      obj.id = res.oid
    }
    let unitProjectType = '1'
    if (isEqual(res.type, '-1')) {
      unitProjectType = '2'
    }
    else if (isEqual(res.type, '1')) {
      unitProjectType = '3'
    }

    obj.type = unitProjectType

    this.consignData.unitProject = {
      name: obj.name || '',
      unitProjectType,
      unitProjectObjId: obj.id || '',
      unitProjectName: obj.name || '',
    }
  }

  /** ## 获取资质信息：委托单位配置了资质信息时，默认值改为委托单位配置的资质 */
  getQualificationIdByConsignUnit(qualificationTypeId?: string) {
  // 设置资质：待选项存在时才设置
    const qualifications = JSON.parse(localStorage.getItem('qualifications') || '[]')
    if (qualifications.length > 0) {
      const item = qualifications.find((d: any) => d.id === qualificationTypeId)
      if (item) {
        return item.id
      }
    }
    return qualificationTypeId || ''
  }

  /** ## 初始化复制报告数据逻辑 */
  initCloneReport() {
    const consignInfo = this.consignConstructParams?.consignInfo
    const consignData = this.consignData

    if (!consignInfo) {
      return
    }

    consignData.id = undefined
    consignData.status = undefined
    consignData.consignCode = undefined
  }

  /** ## 生成委托编号 */
  async generateConsignCode(consignId: string): Promise<string> {
    const { data } = await createConsignNoApi(consignId)
    this.consignData.consignCode = data.obj
    return data.obj
  }

  /** ## 按委托设置资质时，检查样品资质数据是否正确（存在样品资质没有同步上的问题） */
  chechSampleQualification(qualifications: QualificationEntity[] = [], selQualIds?: string[]) {
    if (this.systemParams.SET_QUA_WITH_OBJECT)
      return qualifications

    const qualIds = qualifications.map(d => d.id) || []
    const qualificationDatas: QualificationEntity[] = JSON.parse(localStorage.getItem('qualifications') || '[]')
    if (selQualIds && selQualIds.length > 0) {
      const diffIds = selQualIds.filter(id => !qualIds.includes(id))
      qualifications.push(...qualificationDatas.filter(d => diffIds.includes(d.id)))
    }
    return qualifications
  }

  /** ## 构建保存样品数据 */
  saveBuildMetaData(sampleDatas: IConsignDataSaveParam['sampleData'], qualificationTypeId?: string[]) {
    const metaData = cloneDeep(sampleDatas)

    for (let i = 0; i < metaData.length; i++) {
      const metaItem = metaData[i]
      metaItem.qualifications = this.chechSampleQualification(metaItem.qualifications, qualificationTypeId)

      // 调整时间格式错误导致的报错
      if (metaItem.samplingDate === '/') {
        metaItem.samplingDate = ''
      }
    }
    return JSON.stringify(metaData)
  }

  /** ## 构建保存委托的数据 */
  saveBuildConsginData(saveParam: IConsignDataSaveParam): IConsignDataDTO {
    const saveData = {
      ...saveParam.consignData,
      ...(saveParam.witnessInfo || { buildWitnesses: [], witnesses: [] }),
    }
    saveData.consignType = this.isLocalTest ? '1' : '0'
    // 自定义属性
    const customAttributes = this.consignConstructParams?.consignCustomAttributes || []
    saveData.customAttributes = []
    for (let i = 0; i < customAttributes.length; i++) {
      const item = customAttributes[i]
      const val = (saveData as any)[item.id] || ''
      saveData.customAttributes.push({
        attributeId: item.id,
        attributeValue: val.toString(),
      })
    }
    // 委托单位地址、项目地址
    saveData.consignUnit.consignUnitAddress = saveData.consignUnitAddress || ''
    if (!this.industryStore.getField('project')?.selected) {
      delete saveData.project
    }
    else if (saveData.project) {
      saveData.project.projectAddress = saveData.projectAddress || ''
    }
    saveData.postedit = {
      postFormId: saveData.postFormId || '',
      mailPayType: saveData.mailPayType || '',
      mailOrderNumber: saveData.mailOrderNumber || '',
    }
    // 费用信息
    saveData.feeVo = saveParam.feeState.feeVo
    // 元数据
    saveData.metaData = this.saveBuildMetaData(saveParam.sampleData, saveData.qualificationTypeId as string[])

    return saveData
  }

  protected abstract submit(data: IConsignDataDTO, isComplete?: boolean): Promise<void>
  /** ## 保存委托 */
  async saveConsign(saveParam: IConsignDataSaveParam, isComplete?: boolean) {
    this.activeMenuId = this.getActiceMenu()

    // 构建保存数据
    const saveData = this.saveBuildConsginData(saveParam)

    // 更新缓存的委托单位工程项目信息
    this.consignUnitProcessor.updateConsignUnitStorage({
      projectId: saveData.project?.projectId,
      buildWitnesses: saveData.buildWitnesses,
      witnesses: saveData.witnesses,
    })

    await this.submit(saveData, isComplete)
  }

  /** ## 保存委托后，验证编号是否重复 */
  async afterSaveCheckSnRepeat(res: any) {
    if (res.code && res.code !== 20000) {
      if (res.code === -10000) {
        // 编号重复被占用
        this.showSnRepeatModal(res)
        return false
      }
      message.error(res.msg || '保存失败')
      return false
    }
    return true
  }

  /** ## 编号重复提示 */
  async showSnRepeatModal(res: ISaveConsignResFail) {
    const list = res.data || []
    const msg = res.msg || res.message || '编号已被占用！'
    const content = h('div', {}, [
      h('p', { }, [
        h('span', { style: { marginBottom: '10px', color: '#d91f1f' } }, msg),
        '编号详情如下:',
      ]),
      h(
        'ul',
        { style: { padding: '10px', marginTop: ' 5px', backgroundColor: '#f8f8f8', borderRadius: '4px' } },
        ...list.map((item: any) => {
          return h('li', { style: { lineHeight: '24px' } }, [
            `${this.industryStore.term(snTypes[item.snType])}编号：`,
            h('span', { style: `${item.preset === '1' ? 'color:#aaa;' : ''}` }, item.sn),
            item.preset === '1' ? h('span', { style: 'color:#aaa;' }, '(预设未占有)') : '(已占有)',
          ])
        }),
      ),
    ])

    modalError(content, '编号重复')
  }

  createCount = 0
  /**
   * ## 创建综合试验进度
   * @param consignId 委托id
   * @param repeat 是否重复执行，直至拿到结果
   * @param urlParam 打开综合试验详情页的url参数
   */
  async synthesisTestCreateProgress(consignId: string, repeat?: boolean, urlParam: Record<string, any> = {}) {
    try {
      const { data } = await synthesisTestCreateProgressApi(consignId)
      if (data && data.success && data.obj) {
        if (data.obj.isFinished) {
          message.success(data.msg || '创建成功')
          try {
            const urlParams = new URLSearchParams({
              industryId: this.pageStateService.industryId,
              id: data.obj.testTaskId,
              ...urlParam,
            })
            const url = `testTaskController.do?goTestTaskDetail&${urlParams}`
            window.open(url, '_blank')
          }
          catch (error) {
            console.error('构建综合试验详情页URL失败:', error)
            message.error('无法打开综合试验详情页，请手动查找')
          }
        }
        else if (repeat) {
          // 添加延迟，避免频繁请求
          await new Promise(resolve => setTimeout(resolve, 500))
          await this.synthesisTestCreateProgress(consignId, repeat, urlParam)
        }
      }
      else if (repeat) {
        if (this.createCount === 1) {
          modalError('创建失败')
          this.createCount = 0
        }
        else {
          this.createCount = 1
          // 添加延迟，避免频繁请求
          await new Promise(resolve => setTimeout(resolve, 500))
          await this.synthesisTestCreateProgress(consignId, repeat, urlParam)
        }
      }
    }
    catch (error) {
      console.error('创建综合试验进度失败:', error)
      this.createCount = 0
    }
  }

  /** ## 完成委托后， 刷新页面：重新打开委托详情 */
  reOpenDetail(title: string, config: IGoDetailConfig) {
    if (this.unReloadPage)
      return

    const urlParamStr = new URLSearchParams(config as any)
    const url = `consignController.do?goEdit&${urlParamStr}`

    // 在浏览器新标签页打开，直接刷新地址
    if (window === top) {
      window.location.href = url
      return
    }

    // 刷新委托列表
    this.refreshConsignList()

    // 关闭当前tab页
    ;(top as any).closeCurrentMenu({
      data: {
        id: this.activeMenuId,
      },
    })

    // 打开新的tab页
    openIlisTab(title, url, true)
  }

  getActiceMenu() {
    const tag = (top as Window).document.querySelector('.nav-tag-active') as HTMLElement
    return tag.getAttribute('data-id') as string
  }

  /** ## 刷新委托列表 */
  refreshConsignList() {
    (top as Window).document.querySelectorAll('.nav-tag').forEach((tag) => {
      const menuUrl = tag.getAttribute('data-url') as string
      if (menuUrl.includes('consignController.do?goConsignList')) {
        const $iframe: HTMLIFrameElement | null = parent.document.querySelector(`iframe[src*="${menuUrl}"]`)

        if (!$iframe)
          return

        const conWindow = $iframe.contentWindow
        if (!conWindow)
          return
        conWindow.InitObj?.reloadDataGrid()
      }
    })
    // menuStore.openMenus.forEach((menu) => {
    //   const menuUrl = menu.data.functionUrl
    //   if (menuUrl.includes('consignController.do?goConsignList')) {
    //     const $iframe: HTMLIFrameElement | null = parent.document.querySelector(`iframe[src*="${menuUrl}"]`)

    //     if (!$iframe)
    //       return

    //     const conWindow = $iframe.contentWindow
    //     if (!conWindow)
    //       return
    //     conWindow.InitObj?.reloadDataGrid()
    //   }
    // })
  }
}
