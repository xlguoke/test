import type { IndustryLayoutConfig } from '~/api/consign/consign-form-layout/types'
import type { IAppointmentContractDTO } from '~/api/consign/consign-management/types'
import type {
  IAppointmentContract,
  IConsignProcessor,
  IConsignSamples,
  IFeeState,
  IParseScriptPriceParam,
  IViewTestParamsItem,
} from '~/views/consign/consignDetail/interface'
import { cloneDeep } from '@unovis/ts'
import { Modal } from 'ant-design-vue'
import {
  adjustAuxiliaryFeeApi,
  appointmentContractApi,
  checkCreditApi,
  checkIsUsedTremCodeApi,
  consignFeeApi,
  feeCumputeApi,
  feeStandardApi,
  getContractParamsApi,
  useableContractApi,
} from '~/api/consign/consign-management'
import sseRequestProgress from '~/components/sseRequestProgress'
import { parseScript } from '../utils/parseScriptPrice'

interface ComputeFeeCb {
  feeState: IFeeState
  sampleDatas: IConsignSamples[]
}

/** 获取合同接口参数 */
export interface ContractQueryParam {
  consignUnitId: string
  projectId: string
  testParamIds: string[]
}

/** 缓存下拉类型表单的待选数据 */
const consignFormOptions: any = {}

/**
 * 委托费用处理器
 */
export class ConsignFeeProcessor {
  /** ## 委托费用数据 */
  private feeData: IFeeState = {
    feeVo: {
      discount: 1,
      additionalFeeInvolvedInDiscount: 1,
    },
    oldFeeVo: {},
    additionalFees: [],
    originRatedFee: 0,
  }

  /** ## 收费标准 */
  feeStandards: any[] = []

  /** ## 是否*显示费用信息 */
  whetherFeeHide: boolean = false

  constructor(
    private consignProcessor: IConsignProcessor,
  ) {}

  /** ## 委托费用数据 */
  get feeVo() {
    return { ...this.feeData.feeVo }
  }

  /** ## 获取委托费用数据 */
  get consignFeeData() {
    return cloneDeep(this.feeData)
  }

  /** ## 委托单位/工程项目控制器 */
  get consignUnitProcessor() {
    return this.consignProcessor.consignUnitProcessor
  }

  get consignSampleProcessor() {
    return this.consignProcessor.consignSampleProcessor
  }

  /** ## 系统参数 */
  get systemParams() {
    return this.consignProcessor.systemParams
  }

  /** ## 页面状态服务 */
  get pageStateService() {
    return this.consignProcessor.pageStateService
  }

  /** ## 委托数据 */
  get consignData() {
    return this.consignProcessor.data
  }

  /** ## 样品列表数据 */
  get consignSampleData() {
    return this.consignSampleProcessor.consignSampleData
  }

  /** ## 设置委托费用数据 */
  setConsignFeeData(feeState: IFeeState) {
    Object.assign(this.feeData, feeState)
  }

  /** ## 初始化下拉类型表单的待选数据 */
  initFormOptions(layoutConfigs: IndustryLayoutConfig[]) {
    for (let i = 0; i < layoutConfigs.length; i++) {
      const c = layoutConfigs[i]
      const options = c.options || []
      const opt = options.map(d => ({ id: d.value, name: d.label }))
      if (opt.length === 0)
        continue
      consignFormOptions[c.fieldCode] = opt
    }
  }

  /** ## 获取样品列表全部样品 - 将子样品平铺，返回新数组，排除关联样品 */
  getSampleAllData(sampleDatas: IConsignSamples[]) {
    const arr = []
    for (let i = 0; i < sampleDatas.length; i++) {
      const item = sampleDatas[i]
      arr.push(item)
      if (item.otherMaterials && item.otherMaterials.length > 0) {
        const subSample = item.otherMaterials.filter(d => d.type === 4) as IConsignSamples[]
        arr.push(...subSample)
      }
    }
    return cloneDeep(arr)
  }

  /** ## 获取样品列表全部参数id */
  getSampleParamIds(sampleDatas: IConsignSamples[]) {
    const paramIds = new Set<string>()
    ;(function _each(datas: IConsignSamples[]) {
      for (let i = 0; i < datas.length; i++) {
        const d = datas[i].testParams as IConsignSamples['testParams']
        if (!d || d.length === 0)
          continue

        d.forEach((item) => {
          paramIds.add(item.testParamId)
        })
        if (datas[i].otherMaterials && datas[i].otherMaterials.length > 0) {
          const subSample = datas[i].otherMaterials.filter(item => item.type === 4)
          _each(subSample)
        }
      }
    })(sampleDatas)
    return Array.from(paramIds)
  }

  /** ## 费用标准、计费方式 */
  async getFeeStandard() {
    const { data } = await feeStandardApi()
    this.feeStandards = data

    const firstItem = data[0] || { id: '' }
    // 获取选择的工程项目缓存数据
    const unitProject = this.consignUnitProcessor.getConsignUnitStorage()
    const projectPriceStandardId = unitProject?.project?.consignProject?.priceStandardId
    let chargeStandard = ''
    // 如果选择的工程项目中设置有默认费用则优先使用
    if (projectPriceStandardId) {
      const item = data.find(d => d.id === projectPriceStandardId)
      chargeStandard = item ? item.id : firstItem.id
    }
    else {
      chargeStandard = firstItem.id
    }
    this.feeData.feeVo.chargeStandard = chargeStandard
  }

  /**
   * ## 是否*显示费用信息
   * @param permission 是否有查看费用权限
   * @description //非 （详情试验任务）进入模式不走此逻辑
   */
  async getWhetherFeeHide(permission: boolean) {
    const { readonly, isTaskRedirect } = this.pageStateService
    if (!(readonly && isTaskRedirect)) {
      this.whetherFeeHide = false
      return
    }

    if (permission)
      this.whetherFeeHide = false
    else
      this.whetherFeeHide = this.systemParams.TEST_DETECTION_39 || false
  }

  /** ## 初始化费用信息 - 已保存委托，非预委托 */
  async initFeeStateByConsignId(consignId: string) {
    // 回显费用
    const res = await this.echoFee()
    if (res)
      this.setConsignFeeData(res.feeState)

    // 修改委托时，获取计费调整添加的辅助费用
    this.feeData.additionalFees = await this.getAdjustAuxiliaryFee(consignId)
    return res?.sampleDatas
  }

  /** ## 初始化费用信息 - 已保存委托，预委托 */
  async initFeeStateByPreConsignId(consignId: string) {
    this.feeData.additionalFees = await this.getAdjustAuxiliaryFee(consignId)
    const res = await this.echoFee()
    if (!res)
      return {}

    this.setConsignFeeData(res.feeState)

    if (!res.feeRes.nonCompute)
      return { sampleDatas: res.sampleDatas }

    // 如果是回显的预委托数据上一次没有经过计算就保存的 则把当前实收费用清空 重新计算后在保存
    this.feeData.originRatedFee = 0

    const projectId = this.consignData.project?.projectId
    if (projectId) {
      await this.commonSetPayContract()
    }
    const feeRes = await this.computeTotalFee({
      feeState: this.feeData,
      sampleDatas: res.sampleDatas,
    })

    return {
      sampleDatas: feeRes?.sampleDatas,
      isSaveConsign: true,
    }
  }

  /** ## 初始化费用信息 */
  async initFeeState() {
    const consignId = this.pageStateService.consignId
    // 判断是否有委托id且不是预委托，满足条件说明上次是正常保存的委托无需计算费用，保持上一次的费用计算规则
    if (consignId && !this.consignData.isPreconsign) {
      const sampleDatas = await this.initFeeStateByConsignId(consignId)
      // 回显费用
      return { sampleDatas, isSaveConsign: false }
    }

    // 预委托，需要先回显费用，再重新计算
    if (consignId && this.consignData.isPreconsign) {
      return await this.initFeeStateByPreConsignId(consignId)
    }

    // 初始化费用
    const res = await this.computeTotalFee({
      feeState: this.feeData,
      sampleDatas: this.consignSampleData,
    })
    if (res && res.feeState)
      this.setConsignFeeData(res.feeState)

    return { sampleDatas: res?.sampleDatas, isSaveConsign: false }
  }

  /**
   * ## 获取委托费用
   * @returns 新的费用信息和样品数据
   */
  async echoFee() {
    const consignId = this.pageStateService.consignId
    const { data } = await consignFeeApi(consignId)
    if (!data)
      return

    const res = this.refreshFeeVoAndSampleFee({
      feeState: this.feeData,
      sampleDatas: this.consignSampleData,
      newFeeVo: data,
    })
    return {
      feeState: {
        ...res.feeState,
        originRatedFee: data.ratedFee || 0,
      },
      sampleDatas: res.sampleDatas,
      feeRes: data,
    }
  }

  /** ## 获取计费调整添加的辅助费用 */
  async getAdjustAuxiliaryFee(consignId: string) {
    try {
      const { data } = await adjustAuxiliaryFeeApi(consignId)
      return data
    }
    catch (err) {
      console.error(err)
      return []
    }
  }

  initContractQueryParam(): ContractQueryParam {
    return {
      consignUnitId: this.consignData.consignUnit.consignUnitId,
      projectId: this.consignData.project?.projectId || '',
      testParamIds: this.getSampleParamIds(this.consignSampleData),
    }
  }

  /** ## 根据支付合同绑定约定关联合同 */
  async bindAppintContract(param: ContractQueryParam) {
    const contract = await this.bindAppointContract({
      ...param,
      APPOINTMENT_CONTRACT: this.systemParams.APPOINTMENT_CONTRACT,
    })
    // #36787-按单价计费时原本关联的约定关联检测合同不做处理（如果上次是按照合同计费的，约定关联检测合同会默认成计费合同，再按单价计费是不清空约定关联检测合同）
    if (contract) {
      this.consignProcessor.setConsignData({
        appointContract: contract,
      })
    }
  }

  async commonSetPayContract() {
    const param = this.initContractQueryParam()

    const res = await this.setPayContract(this.feeData.feeVo, {
      ...param,
      PROJECT_BIND_BILLING_WAY: this.systemParams.PROJECT_BIND_BILLING_WAY,
    })
    if (res)
      this.feeData.feeVo = res

    // 根据检测项目选择合同后，根据支付合同绑定约定关联合同
    if (param.testParamIds.length > 0)
      await this.bindAppintContract(param)
  }

  /** ## 判断关联检测合同回显是否需要清空 */
  async testingContractEmpty() {
    const selectAppointContractId = this.consignData.appointContract?.id

    // 当前没有选择关联检测合同就不用清空
    if (!selectAppointContractId) {
      return
    }
    const testParamIds = this.getSampleParamIds(this.consignSampleData)
    const contracts = await this.loadAppointContract({
      testParamIds,
      consignUnitId: this.consignData.consignUnit.consignUnitId,
      projectId: this.consignData.project?.projectId || '',
    })

    const contract = contracts.filter(item => item.id === selectAppointContractId)
    if (!contract.length) {
      this.consignProcessor.setConsignData({
        appointContract: {
          id: '',
          name: '',
          no: '',
        },
      })
      Modal.error({
        title: '提示',
        content: '委托信息改动，约定关联检测合同被清空，请重新选择关联合同',
        centered: true,
        okText: '确定',
      })
    }
  }

  /**
   * ## 计算费用
   * @param config
   * @param config.feeState 费用信息
   * @param config.sampleDatas 样品信息
   * @return 返回值 {feeState: IFeeState, sampleDatas: IConsignSamples[]}
   */
  async computeTotalFee(config: {
    feeState: IFeeState
    sampleDatas: IConsignSamples[]
  }): Promise<ComputeFeeCb | undefined> {
    const { feeVo, oldFeeVo, additionalFees } = config.feeState
    const samples = this.getSampleAllData(config.sampleDatas)

    // 组装费用接口所需参数
    const params: any = {
      contractId: '', // 合同id  ,如果是按单价计费不传合同id
      contract: {}, // 合同信息
      discount: feeVo.discount, // 折扣率
      computeMode: feeVo.additionalFeeInvolvedInDiscount, // 折扣模式
      chargeStandard: feeVo.chargeStandard, // 收费标准
      ratedFee: feeVo.ratedFee === oldFeeVo.ratedFee ? '' : feeVo.ratedFee, // 实收费用 ,如果实收费用等于上一次计算结果的实收费用则该参数为空，否则说明被修改过，按实际输入价格计算
      samples: [], // 样品信息
      additionalFees, // 如果存在计费调整添加的辅助费用，需要添加到计算参数当中
    }
    // 如果是合同计费方式，需要提供合同参数详细价格
    if (feeVo.contractId) {
      const paramData = await this.getContractParamPrice(
        samples,
        feeVo.contractId || '',
        this.getScripePriceData(),
      )
      if (!paramData)
        return
      params.contractId = feeVo.contractId || ''
      params.contract = {
        contractId: feeVo.contractId,
        contractPrices: paramData,
      }
    }
    // 循环样品，提取计算所需数据
    params.samples = this.getComputeFeeData(samples)
    // eslint-disable-next-line no-console
    console.log('计算提交数据：', params)
    try {
      const { data } = await feeCumputeApi(params)
      if (!data)
        return
      return this.refreshFeeVoAndSampleFee({
        feeState: this.feeData,
        sampleDatas: this.consignSampleData,
        newFeeVo: data,
      })
    }
    catch (err) {
      console.error(err)
    }
  }

  /** ## 获取合同里的参数价格等信息 */
  async getContractParamPrice(
    samples: IConsignSamples[],
    contractId: string,
    scripePriceData: IParseScriptPriceParam,
  ) {
    try {
      const { data } = await getContractParamsApi(contractId)
      // 处理合同参数价格是脚本价格，需要前端脚本计算后传入接口
      for (let i = 0; i < data.length; i++) {
        const d = data[i]
        for (let j = 0; j < samples.length; j++) {
          const sample = samples[j]
          if (!sample.testParams)
            continue

          for (let k = 0; k < sample.testParams.length; k++) {
            const param = sample.testParams[k]
            // 如果当前合同参数是脚本价格，且是当前样品中使用的参数，则前端进行脚本价格计算
            if (d.script != null && param.testParamId === d.paramId) {
              const scriptPrice = 0
              const script = parseScript(d.script, sample, scripePriceData)
              try {
                // eslint-disable-next-line no-eval
                eval(script)
              }
              catch (e) {
                console.error('eval Script', script)
                console.error('eval exception', e)
              }
              d.price = scriptPrice
              d.scriptPrice = true
            }
            else {
              d.scriptPrice = false
            }
          }
        }
      }
      return data
    }
    catch (err) {
      console.error('获取合同价格失败', err)
    }
  }

  /** ## 循环样品，提取计算所需数据 */
  getComputeFeeData(samples: IConsignSamples[]) {
    const arr = []
    // 循环样品，提取计算所需数据
    for (let i = 0; i < samples.length; i++) {
      const sampleItem = samples[i]
      const sample: any = {
        mark: sampleItem.mark,
        displayName: sampleItem.testSampleDisplayName, // 样品名称
        sampleAmount: sampleItem.sampleAmount, // 样品组数
        additionalFees: sampleItem.additionalFees, // 附加费用
        samplePrice: sampleItem.samplePrice, // 样品单价
        params: [], // 参数集合
      }
      // 循环参数，提取所需数据
      for (let j = 0; j < sampleItem.testParams.length; j++) {
        const paramItem = sampleItem.testParams[j]
        const newParams: any = {
          id: paramItem.testParamId,
          displayName: paramItem.testParamDisplayName,
          count: paramItem.checkPoint || 1,
          price: {},
          sampleId: sampleItem.testUnitTestSampleId,
        }
        // 获取当前参数的标准价格，也就是参数价格
        let standardPrice = 0

        // 设置参数的标准价格
        if (paramItem.prices && paramItem.prices.length) { // 如果当前有多个选项价格，则从中找出参数价格作为参数的标准价格
          paramItem.prices.forEach((item) => {
            if (item.type === 1) {
              standardPrice = item.price
            }
          })
        }
        else if (paramItem.price) { // 如果没有选项，则把当前价格设置为标准价格
          standardPrice = paramItem.price
        }
        else {
        // 什么价格都没有说明当前价格没有维护，价格为空undiefind，则把当前标准价格设置0
          newParams.price.standardPrice = 0
        }

        // 设置当前参数的使用的价格类型，价格，及标准价格用作接口费用计算
        if (paramItem.priceType === 3) { // 共享价格,公用价格没有在价格下拉选择中,所以如果当前参数有共用价格，则公用价格最优先使用
          newParams.price.type = paramItem.priceType
          newParams.price.sharePrice = paramItem.sharePrice
          newParams.price.sharePriceIdentity = paramItem.sharedPriceQualifier // 共享单价名称
          newParams.price.standardPrice = standardPrice
        }
        else if (paramItem.priceType === 0) { // 样品价格
          newParams.price.samplePrice = paramItem.price
          newParams.price.type = paramItem.priceType
          newParams.price.standardPrice = standardPrice
        }
        else if (paramItem.priceType === 1) { // 参数价格  ,
          newParams.price.standardPrice = paramItem.price
          newParams.price.type = paramItem.priceType
        }
        else if (paramItem.priceType === 2) { // 子价格
          newParams.price.childPrice = paramItem.price
          newParams.price.type = paramItem.priceType
          newParams.price.standardPrice = standardPrice
        }
        else if (paramItem.priceType === 4) { // 脚本价格
          newParams.price.type = 4
          newParams.price.scriptPrice = paramItem.price
          newParams.price.standardPrice = standardPrice
        }
        else if (paramItem.priceType === -1 || !paramItem.priceType) { // 如果价格类型为- 1 或者 价格类型为空
        // -1 代表其他，可能是原价格，可能是未维护的价格，那就直接用当前使用价格计算
        // 价格类型为空，则使用当前价格去计算，老数据可能会没有价格类型，只能按当前使用价格去找
          newParams.price.type = 1
          newParams.price.standardPrice = paramItem.price
        }
        else {
          console.error('费用选择错误，请检查参数费用')
        }
        sample.params.push(newParams)
      }
      arr.push(sample)
    }
    return arr
  }

  /**
   * ## 更新费用显示数据
   * @param {object} param 参数信息
   * @param param.feeState 费用数据
   * @param param.sampleDatas 样品数据
   * @param param.newFeeVo 重新计算后的费用数据
   * @return 返回对象 {feeState: IFeeState, sampleDatas: IConsignSamples[]}
   */
  refreshFeeVoAndSampleFee(param: {
    feeState: IFeeState
    sampleDatas: IConsignSamples[]
    newFeeVo: IFeeState['feeVo']
  }): { feeState: IFeeState, sampleDatas: IConsignSamples[] } {
    const { feeState, sampleDatas, newFeeVo } = cloneDeep(param)
    const chargeStandard = feeState.feeVo.chargeStandard
    feeState.oldFeeVo = newFeeVo
    feeState.feeVo = { ...newFeeVo }

    if (!newFeeVo.chargeStandard)
      feeState.feeVo.chargeStandard = chargeStandard

    for (let i = 0; i < sampleDatas.length; i++) {
      const item = sampleDatas[i]
      item.testObjectPrice = newFeeVo.samplePrice?.[item.mark] as any
      item.priceDetailList = newFeeVo.feeDetail?.[item.mark] as any[]
      item.testParams.forEach((itemParams) => {
        itemParams.priceStandardId = feeState.feeVo.chargeStandard || ''
      })
      // 如果有子样品 也需要修改价格 详情和参数
      if (item.otherMaterials.length) {
        item.otherMaterials.forEach((childItem) => { // 循环子样品
          if (childItem.type === 4) {
            childItem.testObjectPrice = newFeeVo.samplePrice?.[childItem.mark] || 0
            childItem.priceDetailList = newFeeVo.feeDetail?.[childItem.mark] || []

            if (childItem.testParams && childItem.testParams.length) {
              childItem.testParams.forEach((childItemParams: any) => { // 循环子样品参数
                childItemParams.priceStandardId = feeState.feeVo.chargeStandard // 当前使用的参数标准
              })
            }
          }
        })
      }
    }
    return {
      feeState,
      sampleDatas,
    }
  }

  /**
   * ## 获取关联检测合同
   * @description 已排除不包含样品参数的合同
   */
  async loadAppointContract(param: ContractQueryParam) {
    try {
      const arr = []
      const { data } = await appointmentContractApi({
        consignUnitId: param.consignUnitId,
        projectId: param.projectId,
      })
      for (let i = 0; i < data.length; i++) {
        const item = data[i]
        if (item.type === '4' || item.type === '3') {
          // 当前合同
          const content = JSON.parse(item.content || '{}')
          // 判断参数是否不在合同中
          const unContain = param.testParamIds.some(paramId => !Object.prototype.hasOwnProperty.call(content, paramId))
          if (!unContain) {
            arr.push(item)
          }
        }
        else {
          arr.push(item)
        }
      }
      return arr
    }
    catch (err) {
      console.error('加载关联合同失败', err)
      return []
    }
  }

  /** ## 设置支付合同 */
  async setPayContract(
    feeVo: IFeeState['feeVo'],
    param: ContractQueryParam & {
      /** 【业务控制参数】根据工程项目关联计费合同 */
      PROJECT_BIND_BILLING_WAY?: boolean
    },
  ): Promise<IFeeState['feeVo'] | undefined> {
    const _feeVo = { ...feeVo }
    try {
      if (param.PROJECT_BIND_BILLING_WAY) {
        const list = await this.loadContractData(param)
        if (list.length > 0 && !feeVo.contractId) {
          // 如果选择的合同在项目关联的合同中，则不重置，否则将重置选择的合同信息
          const contract = list.find(d => d.id === feeVo.contractId)
          if (contract) {
            _feeVo.contractId = contract.id
            _feeVo.contractName = contract.name
            _feeVo.contractNo = contract.no
          }
        }
        else {
          _feeVo.contractId = ''
          _feeVo.contractName = ''
          _feeVo.contractNo = ''
        }
      }
      return _feeVo
    }
    catch (err) {
      console.error('加载可用收费合同失败', err)
    }
  }

  /**
   * ## 根据支付合同绑定约定关联合同
   * @description 前提：开启控制参数【委托收样时，可选择关联的检测合同（需合同范围与委托相匹配）（APPOINTMENT_CONTRACT）】
   */
  async bindAppointContract(
    param: ContractQueryParam & {
      /** 【系统参数】委托收样时，可选择关联的检测合同 */
      APPOINTMENT_CONTRACT?: boolean
    },
  ) {
    const _feeVo = { ...this.feeData.feeVo }
    if (!param.APPOINTMENT_CONTRACT || !_feeVo.contractId)
      return

    const contracts = await this.loadAppointContract(param)
    const contract = contracts.find(item => item.id === _feeVo.contractId)
    return contract
      ? {
          id: contract.id,
          name: contract.name,
          no: contract.no,
        }
      : {
          id: '',
          name: '',
          no: '',
        }
  }

  /** ## 加载可用收费合同 */
  async loadContractData(param: ContractQueryParam) {
    try {
      if (!param.consignUnitId || !param.testParamIds)
        return []
      const { data } = await useableContractApi({
        unitId: param.consignUnitId,
        testParamIds: param.testParamIds.join(','),
        projectId: param.projectId,
      })
      if (!data.success || !data.obj)
        return []
      // 过滤合同，只有折扣合同和参数价格合同才能用于计费
      const list = data.obj.filter(item => item.type === '1' || item.type === '2' || item.type === '4')
      if (list.length === 0)
        return []

      return this.sortContractList(list, param.testParamIds)
    }
    catch (err) {
      console.error('加载可用收费合同失败', err)
      return []
    }
  }

  /** ## 合同排序 */
  sortContractList(list: IAppointmentContractDTO[], testParamIds: string[]) {
    const arr: IAppointmentContract[] = []
    for (let i = 0; i < list.length; i++) {
      let count = 0
      const item = list[i]
      if (item.content) {
        for (let j = 0; j < testParamIds.length; j++) {
          if (item.content.includes(testParamIds[j])) {
            count++
          }
        }
      }
      arr.push({ ...item, _count: count })
    }
    arr.sort((a, b) => {
      return b._count - a._count
    })
    return arr
  }

  /** ## 修改样品，保存完成后数据处理 */
  async saveSampleAfter() {
    if (this.consignData.project?.projectId) {
      // 如果设置了工程项目，则根据工程项目设置支付合同，并进行重新计费
      // 添加样品渲染后根据工程项目设置支付合同
      await this.commonSetPayContract()
    }
    // 添加样品渲染后重新计算价格
    const feeRes = await this.computeTotalFee({
      feeState: this.consignFeeData,
      sampleDatas: this.consignSampleData,
    })

    if (feeRes) {
      this.setConsignFeeData(feeRes.feeState)
      this.consignSampleProcessor.setConsignSampleData(feeRes.sampleDatas)
    }

    // 约定合同数据是否清空
    await this.testingContractEmpty()
  }

  /** ## 变更委托单位工程项目 */
  async changeConsignUnitProject() {
    const { data } = await checkIsUsedTremCodeApi('TermProjectCode')
    const isSave = data === 'true'
    if (!this.consignSampleData.length)
      return isSave

    try {
      if (isSave)
        sseRequestProgress.showLoading('工程项目发生变化，委托保存中，请等待...')

      await this.commonSetPayContract()
      const res = await this.computeTotalFee({
        feeState: this.consignFeeData,
        sampleDatas: this.consignSampleData,
      })
      if (!res)
        return isSave

      this.setConsignFeeData(res.feeState)
      this.consignSampleProcessor.setConsignSampleData(res.sampleDatas)
    }
    finally {
      sseRequestProgress.hideLoading()
    }
    return isSave
  }

  /** ## 初始化解析脚本价格需要的数据 */
  getScripePriceData(): IParseScriptPriceParam {
    const consignData = this.consignData
    const qualifications = JSON.parse(localStorage.getItem('qualifications') || '[]')
    const arr: any = []
    for (const k in consignData) {
      const v = (consignData as any)[k]
      if (['consignUnit', 'project', 'sampleSender'].includes(k))
        continue
      arr.push({ name: k, value: v ? v.toString() : '' })
    }
    arr.push(...this.consignUnitProcessor.consignUnitProjectObjToArray(consignData))
    return {
      consignFormOptions: {
        qualifications,
        consignUnit: [{ id: consignData.consignUnit.consignUnitId, name: consignData.consignUnit.consignUnitName }],
        consignUnitProjects: [{ id: consignData.project?.projectId || '', name: consignData.project?.projectTenderName || '' }],
        snTypeList: consignFormOptions.snTypeId,
        checkType: consignFormOptions.checkTypeId,
      },
      consignInfoArr: arr,
    }
  }

  /** ## 计算脚本价格 */
  calculateWithScript(
    type: string,
    object: IConsignSamples,
    params: IViewTestParamsItem[],
  ) {
    if (!params || params.length < 1) {
      return []
    }
    const calculatedParams = []
    for (let i = 0; i < params.length; i++) {
      const param = params[i]
      let script = null
      if (type === 'calculateWithParamScript') {
        script = param.paramScript
      }
      if (type === 'calculateWithContractScript') {
        script = (param as any).contractScript
      }
      if (!script) {
        calculatedParams.push(param)
        continue
      }

      // eslint-disable-next-line prefer-const
      let scriptPrice = 0 // 脚本执行完成后赋值给该变量
      script = parseScript(script, object, this.getScripePriceData())
      try {
        // eslint-disable-next-line no-eval
        eval(script)
      }
      catch (e) {
        console.error('eval Script', script)
        console.error('eval exception', e)
      }
      // 如果有脚本价格计算结果，设置脚本价格和类型
      if (scriptPrice || scriptPrice === 0) {
        param.scriptPrice = scriptPrice
      }

      calculatedParams.push(param)
    }
    return calculatedParams
  }

  /** ## 检查当前信用余额是否足够支付委托费用（含退回委托的已支付费用计算） */
  async checkCredit(consignUnitId: string, consignId: string, feeTotal: number) {
    if (!this.systemParams.TEST_CHARGE_3)
      return

    const { data } = await checkCreditApi({
      consignUnitId,
      consignId,
      feeTotal,
    })
    if (!data.success)
      return Promise.resolve(data)

    if (data.obj === 2) {
      modalError('当前单位挂账额度已用完,本次委托必须收费')
      return Promise.resolve(data)
    }
    if (data.obj === 1) {
      modalError('当前单位挂账额度不足,本次委托必须收费')
      return Promise.resolve(data)
    }
  }
}
