import { Modal } from 'ant-design-vue'
import { compatibilityOldMetaData } from '../utils/oldMetaDataSpecification.ts'
import type { TestOtherInfoMetaDataItem, UseTestOtherInfo } from './UseTestOtherInfo'
import type { UseSamplingInfo } from './UseSamplingInfo.ts'
import type { SampleInfoEntity, UseSampleInfo } from './UseSampleInfo'
import type { AdditionalFeeItem, AdditionalFeeMetaDataItem, UseAdditionalFee } from './UseAdditionalFee'
import { VIEW_TYPE } from '~/views/consign/component/selectSpecification'
import { type BasicInfoEntity, UseBasicInfo } from '~/views/consign/component/selectSample/modules/UseBasicInfo.ts'
import type { UseAttachment } from '~/views/consign/component/selectSample/modules/UseAttachment.ts'
import type { PeriodMetaDataItem, UsePeriod } from '~/views/consign/component/selectSample/modules/UsePeriod.ts'
import type {
  TestParamsMetaDataItem,
  UseTestParams,
} from '~/views/consign/component/selectSample/modules/UseTestParams.ts'
import {
  checkQualificationUltra,
  getDefaultQualification,
  getLastSamplingByConsignUnit,
  getQualificationByTestParams,
  getUnitSample,
} from '~/views/consign/component/selectSample/api.ts'
import type { SampleTreeNodeAttr } from '~/views/consign/component/selectSampleParam/modules/UseTestSample.ts'
import type { SelectSampleParamEntity } from '~/views/consign/component/selectSampleParam'
import type {
  CodesInfoEntity,
  ObjectCodeItem,
  UseCodesInfo,
} from '~/views/consign/component/selectSample/modules/UseCodesInfo.ts'
import type { QualificationEntity } from '~/views/consign/component/selectSample/interface/Qualification.ts'
import type { ViewTestParamsItem } from '~/views/consign/component/selectSampleParam/modules/BaseTestParams.ts'

/**
 * 元数据管理
 */

/**
 * 元数据格式
 */
export class MetaDataEntity {
  id?: string

  /** 样品ID */
  systemTestSampleId = ''
  /** 本单位的样品ID */
  testUnitTestSampleId = ''
  /** 大类ID */
  bigCategoryId = ''
  /** 大类路径名称 */
  bigCategoryNames = ''
  bigCategoryInfo: {
    id: string
    level: number
    title: string
  }[] = []

  testSampleId = ''
  testSampleLevelName = ''
  /** 费用计算需要 */
  sampleAttributes?: SampleTreeNodeAttr

  /** 选择样品参数的根节点数据 */
  rootNode: {
    id?: string
    name?: string
    systemId?: string
  } = {}

  /** 样品编号明细 */
  objectCodeArr: ObjectCodeItem[] = []
  /** 样品编号后缀：复制的委托保留样品编号后缀，去掉空后缀后缓存 */
  objectCodeSuffixArr: string[] = []
  /** 样品编号 */
  multipleCode = ''
  /** 样品名称（TODO 疑似没用） */
  testSampleName = ''
  /** 抽样情况 */
  samplingInfo = ''

  /** 唯一标识 */
  mark = ''
  /** 是否留样 */
  isRetentionSample = false
  nodes: string[] = []

  /** 样品信息：样品名称 */
  testSampleDisplayName = ''
  /** 样品信息：代表数量 */
  delegatesNum: string = ''
  /** 样品信息：样品描述 */
  description = ''
  /** 样品信息：样品存放位置 */
  repository = ''
  /** 样品信息：样品层次名称 */
  level = ''
  /** 样品信息：检测部位 */
  testPart = ''
  /** 样品信息：工程部位/用途 */
  projectPartAndUse = ''
  /** 样品信息：工程部位/用途 选择的ebsId */
  externalInfo = ''
  /** 样品信息：备注 */
  remark = ''
  /** 样品信息：样品数量 */
  sampleNum: string = ''
  /** 样品信息：测后样品处理 */
  sampleProcessMethod?: string
  sampleProcessMethodCode?: string
  /** 样品信息：龄期 */
  retentionHowLong = ''
  /** 样品信息：龄期单位 */
  retentionTimeUnit: 'D' | 'M' | 'Y' = 'D'
  testObjectCode = ''
  /** 检测组数 */
  sampleAmount = 1

  /** 规格型号 - 组合值 */
  standard = ''
  /** 规格型号 - 规格 */
  specification = ''
  /** 规格型号 - 等级 */
  grade = ''
  /** 规格型号 - 名称 */
  label = ''
  /** 规格型号 - 类型 */
  model = ''

  /** 取样信息 - 取样人 */
  samplingPerson = ''
  /** 取样信息 - 取样人证书号 */
  samplingPersonNumber = ''
  /** 取样信息 - 取样单位 */
  samplingCompany = ''
  /** 取样信息 - 取样时间 */
  samplingDate = ''
  /** 取样信息 - 取样地点 */
  samplingPlace = ''

  /** 附加费用 - 已添加数据 */
  additionalFees: AdditionalFeeMetaDataItem[] = []
  /** 附加费用 - 全部数据 (TODO 后面可以删除该字段) */
  additionalFeesData: AdditionalFeeItem[] = []
  /** 附加费用 */
  additionalFeePrice = 0

  /** 附件相关参数 */
  attachmentQrKey = ''
  attachmentQrUrl = ''

  /** 已经选择的参数列表 */
  testParams: TestParamsMetaDataItem[] = []
  /** 收样辅助信息 */
  otherInfos: TestOtherInfoMetaDataItem[] = []
  /** 龄期信息 */
  periods: PeriodMetaDataItem[] = []

  /** 按照参数计算费用时使用 */
  testObjectPrice = 0
  /** 子样品集合 - 该字段在添加子样品后写入到元数据中 */
  subsampleList: any[] = []

  /**
   * 退回委托需要样品id查询数据
   */
  testObjectId? = ''
  /** 规格型号 */
  specificationConfig: string = ''
  /** 未知用处，处理预委托数据？ (TODO 疑似已废弃)  */
  specificationJoint = ''
  /** 是否需要评定结果 */
  isNeedConclusion = true
  /** 规程提供方 */
  baseStandardProvider?: string
  /** 选择规程时是否显示条款号 */
  displayClauseCode = true
  /** 加急检测 */
  urgentStatus: '10' | '00' = '00'
  /** 是否切换了单位样品ID */
  isChangeUnitTestSampleId = false

  /** 未知作用的参数 */
  generateAcceptSampleInfoByCount = false
  initalTestObjectPrice = 0
  isUpdateConsign = ''
  priceDetailList: any[] = []
  /** 来样编号 */
  provideToCustomerSampleCode = ''
  provideToCustomerSampleMultipleCode = ''
  qualificationType = ''

  /** 资质类型，会在样品委托页面赋值 */
  qualifications: QualificationEntity[] = []

  /** 关联材料信息 (该字段在委托编辑页维护) */
  otherMaterials: any[] = []
  /** 父级样品ID (该字段由后端写入) */
  parentSampleId = ''
}

/**
 * 元数据管理
 */
export class MainController {
  // 【系统参数】开启推荐规程逻辑
  USING_RECOMMENDED_PARAMETER_STANDARD = false

  // 基础信息
  useBasicInfo: UseBasicInfo
  // 编号信息
  useCodesInfo: UseCodesInfo
  // 取样信息
  useSamplingInfo: UseSamplingInfo
  // 检测参数
  useTestParams: UseTestParams
  // 样品信息
  useSampleInfo: UseSampleInfo
  // 收样辅助信息
  useTestOtherInfo: UseTestOtherInfo
  // 附加费用
  useAdditionalFee: UseAdditionalFee
  // 制样信息
  usePeriod: UsePeriod
  // 附件
  useAttachment: UseAttachment

  // 元数据
  metaData = new MetaDataEntity()

  // 样品/参数名称
  get sampleTestParamsName() {
    return (this.useSampleInfo.data.testSampleDisplayName || '') + (this.useBasicInfo.data.level || '')
  }

  /** url参数 */
  static get urlParams() {
    const urlParams = new URLSearchParams(window.location.search)

    return {
      detail: urlParams.get('detail'),
      status: urlParams.get('status'),
      testobjectid: urlParams.get('testobjectid'),
      qualificationType: urlParams.get('qualificationType'),
      isUpdateConsign: urlParams.get('isUpdateConsign'),
      createTest: urlParams.get('createTest'),
      compoundItems: urlParams.get('compoundItems'),
    }
  }

  /** 是否为通知修改委托 */
  static get isNoticeModifyConsign() {
    return MainController.urlParams.status === '50'
  }

  /** 是否为详情页 */
  static get isDetailPage() {
    return MainController.urlParams.detail === 'detailPage'
  }

  /** 是否为编辑页 */
  static get isEditPage() {
    return !MainController.isDetailPage && !!MainController.urlParams.testobjectid && this.urlParams.testobjectid !== 'undefined'
  }

  /** 是否为新增页 */
  static get isAddPage() {
    return !MainController.isDetailPage && !MainController.isEditPage
  }

  /** 是否为创建综合试验页面 */
  static get isCreateTestPage() {
    return MainController.urlParams.createTest === '1'
  }

  // 委托编辑页面窗口
  static get consignWindow() {
    let consignWindow: Window | null = null
    try {
      consignWindow = top && top.consignWindow
    }
    catch (e) {
      consignWindow = parent && parent.consignWindow
      // eslint-disable-next-line no-console
      console.log(e)
    }

    if (!consignWindow) {
      throw new Error('未找到委托页面window对象！')
    }
    return consignWindow
  }

  /** 用于回显的元数据 */
  get sessionStorageMetaDataStr() {
    const testobjectid = MainController.urlParams.testobjectid
    if (testobjectid) {
      return sessionStorage.getItem(testobjectid)
    }
    return null
  }

  constructor(opts: {
    useBasicInfo: UseBasicInfo
    useCodesInfo: UseCodesInfo
    useTestParams: UseTestParams
    useSamplingInfo: UseSamplingInfo
    useSampleInfo: UseSampleInfo
    useTestOtherInfo: UseTestOtherInfo
    useAdditionalFee: UseAdditionalFee
    usePeriod: UsePeriod
    useAttachment: UseAttachment
  }) {
    this.useBasicInfo = opts.useBasicInfo
    this.useTestParams = opts.useTestParams
    this.useSamplingInfo = opts.useSamplingInfo
    this.useSampleInfo = opts.useSampleInfo
    this.useTestOtherInfo = opts.useTestOtherInfo
    this.useAdditionalFee = opts.useAdditionalFee
    this.usePeriod = opts.usePeriod
    this.useAttachment = opts.useAttachment
    this.useCodesInfo = opts.useCodesInfo

    // 事件中心，监听并处理各个模块之间业务
    this.initEmitCenter()

    // 新增
    if (MainController.isAddPage) {
      this.onAddPage()
    }

    // 回显
    if (!MainController.isAddPage) {
      this.parseMetaData()
    }

    // 详情
    if (MainController.isDetailPage) {
      this.useTestOtherInfo.specificationsView = VIEW_TYPE.DETAIL
    }

    // 编辑
    if (MainController.isEditPage) {
      this.useTestOtherInfo.specificationsView = VIEW_TYPE.EDIT
    }

    getBusinessParam('USING_RECOMMENDED_PARAMETER_STANDARD').then((val: boolean) => {
      this.USING_RECOMMENDED_PARAMETER_STANDARD = val
    })
  }

  /** 新增页面初始化 */
  onAddPage() {
    const { useAttachment, useBasicInfo } = this

    // 附件
    const consignWindow = MainController.consignWindow
    const ele = consignWindow.document.getElementById('attachmentQrKey-CONSIGN') as HTMLInputElement
    useAttachment.initQrCodeUrl(useBasicInfo.data.mark, ele.value)

    // 默认上一次取样信息填写内容
    this.setLastSampling()
  }

  /**
   * 事件中心，监听并统一处理各个模块之间业务
   * 中介者
   */
  initEmitCenter() {
    const {
      useTestParams,
      useBasicInfo,
      useTestOtherInfo,
      useSampleInfo,
      useCodesInfo,
    } = this

    /** 监听参数列表变动 */
    useTestParams.subscribeFieldChange('testParams', () => {
      // 获取样品描述下拉项
      useSampleInfo.initDescriptionOptions(useBasicInfo.data.testUnitTestSampleId, useTestParams.selectedRowKey)

      // 计算脚本价格
      useTestParams.calcScriptPrice(useSampleInfo, useTestOtherInfo)
    })

    /** 监听检测组数 */
    useBasicInfo.subscribeFieldChange('sampleAmount', (sampleAmount) => {
      // 重新计算参数小记
      useTestParams.sampleAmount = sampleAmount
      useTestParams.refreshViewData()

      // 增加/减少样品组数 重新整理/生成编号
      useCodesInfo.arrangementTestObjectCodes(sampleAmount, useTestParams.selectedRowKey)
    })

    /** 监听选择样品参数 */
    useBasicInfo.subscribeFieldChange('onSelectTestParams', async (selectData: SelectSampleParamEntity) => {
      // 选择的参数
      const testParams = selectData.testParams

      const testItemIds = [...new Set(testParams.map(i => i.testItemId))].join(',')

      /** 是否切换了样品 */
      const isChangeTestSample = !useSampleInfo.data.testSampleDisplayName || useBasicInfo.data.isChangeUnitTestSampleId

      // 选择样品参数后，清空打包参数选项
      useTestParams.paramPackId = undefined

      // 选择样品参数后，重新加载收样辅助信息
      await useTestOtherInfo.initOtherInfos(selectData.testUnitTestSampleId, testItemIds)

      // 样品名称 - 未切换样品时，不更新样品名称，避免用户手动修改样品信息中的样品名称后，修改参数把修改后的样品名称覆盖了
      if (isChangeTestSample) {
        useSampleInfo.setDataField('testSampleDisplayName', selectData.Sample.attributes.displayName)

        //  切换样品清空规格型号配置
        useTestOtherInfo.specificationsView = VIEW_TYPE.ADD
        useSampleInfo.sampleLevelName = selectData.Sample.attributes.sampleLevelName
        useSampleInfo.sampleAttributeName = selectData.Sample.attributes.name
        useSampleInfo.setDataField('specificationConfig', [])
      }

      // 计算脚本价格
      useTestParams.calcScriptPrice(useSampleInfo, useTestOtherInfo)

      // 获取单位样品信息，并赋值
      this.setUnitSampleData()

      // 设置默认资质
      this.setDefaultQualifications(testParams)
    })

    /** 监听样品所有信息变化 */
    useSampleInfo.subscribeFieldChange('data', (sampleInfoData: SampleInfoEntity) => {
      // 赋值样品数量和代表数量
      useSampleInfo.setDataField('sampleNum', (sampleInfoData.sampleNumVal || '') + (sampleInfoData.sampleNumUnit || ''))
      useSampleInfo.setDataField('delegatesNum', (sampleInfoData.delegatesNumVal || '') + (sampleInfoData.delegatesNumUnit || ''))

      // 根据样品信息填写的数据赋值收样辅助信息
      useTestOtherInfo.updateValueBySampleInfo(sampleInfoData)

      // 计算脚本价格
      useTestParams.calcScriptPrice(useSampleInfo, useTestOtherInfo)
    })

    /** 监听收样辅助信息变化 */
    useTestOtherInfo.subscribeFieldChange('otherInfos', () => {
      // 计算脚本价格
      useTestParams.calcScriptPrice(useSampleInfo, useTestOtherInfo)
    })
  }

  /** 获取元数据 */
  async getMetaData() {
    const { useTestParams } = this
    const consignWindow = MainController.consignWindow

    // 父页面变量：是否为编辑样品信息弹窗中执行保存
    const samplePageSave = consignWindow && consignWindow.sampleObj && consignWindow.sampleObj.samplePageSave

    // 是否根据计价数量生成样品
    // 不需要，则直接返回
    if (!useTestParams.generateAcceptSampleInfoByCount || samplePageSave) {
      const metaData = await this.buildMetaData()
      return [metaData]
    }

    // 根据计价数量生成样品
    return await this.getMetaDataByCount()
  }

  /** 根据计价数量生成样品的元数据 */
  async getMetaDataByCount() {
    const { useBasicInfo } = this
    const metaData = await this.buildMetaData()
    // 根据最大数量（检测组数），生成样品对象
    const sampleCount = useBasicInfo.data.sampleAmount

    const result: MetaDataEntity[] = []
    const objectCodeArr = metaData.objectCodeArr
    const provideSampleCodeArr = metaData.provideToCustomerSampleCode.split(',')

    for (let i = 0; i < sampleCount; i++) {
      // 由于要生成多个样品对象保存，此处简单深拷贝下然后改数据
      const data: MetaDataEntity = JSON.parse(JSON.stringify(metaData))
      const objectCodeArrItem = objectCodeArr[i]
      const provideSampleCodeArrItem = provideSampleCodeArr[i] || ''

      // 处理样品参数，将count全部修改为1
      data.testParams.forEach((j) => {
        j.count = 1
      })

      data.sampleAmount = 1
      data.generateAcceptSampleInfoByCount = true

      // 按顺序将样品编号写入各个样品中
      if (objectCodeArrItem) {
        data.testObjectCode = objectCodeArrItem.testObjectCode || ''
        data.multipleCode = objectCodeArrItem.testObjectCode || ''
        data.objectCodeArr = [objectCodeArrItem]
      }
      else {
        data.testObjectCode = ''
        data.multipleCode = ''
        data.objectCodeArr = []
      }

      // 按顺序将来样编号写入各个样品中
      data.provideToCustomerSampleCode = provideSampleCodeArrItem
      data.provideToCustomerSampleMultipleCode = provideSampleCodeArrItem

      // 此处主要是解决已生成样品编号的样品被退回后，点击编辑增加计价数量并确认后，拆分生成的其他样品也带有样品编号
      if (i > 0) {
        if (!objectCodeArr.length || !provideSampleCodeArr.length) {
          data.id = undefined
          data.mark = ''

          if (!objectCodeArr.length) {
            data.testObjectCode = ''
          }
          else {
            data.provideToCustomerSampleCode = ''
          }
        }

        if (!data.testObjectCode || !data.provideToCustomerSampleCode) {
          data.id = undefined
          data.mark = ''

          if (!data.testObjectCode) {
            data.testObjectCode = ''
          }
          else {
            data.provideToCustomerSampleCode = ''
          }
        }
      }

      result.push(data)
    }

    return result
  }

  /**
   * 获取样品信息并设置默认值
   */
  async setUnitSampleData() {
    const { useBasicInfo, useSampleInfo } = this
    const testUnitTestSampleId = useBasicInfo.data.testUnitTestSampleId

    if (MainController.isAddPage && testUnitTestSampleId) {
      const res = await getUnitSample(testUnitTestSampleId)
      const unitSampleData = res.data

      // 默认龄期数据
      if (useSampleInfo.data.retentionHowLong === '') {
        if (unitSampleData.isRetentionSample) {
          useSampleInfo.setDataField('retentionHowLong', unitSampleData.retentionHowLong)
          useSampleInfo.setDataField('retentionTimeUnit', unitSampleData.retentionTimeUnit)
        }
      }
    }
  }

  /** 默认上次填写取样信息 */
  async setLastSampling() {
    const useSamplingInfo = this.useSamplingInfo
    const dataStr = localStorage.getItem('consignUnit-project-sampleSender')

    if (dataStr) {
      const data = JSON.parse(dataStr)

      if (data.consignUnit && data.consignUnit.id && data.project && data.project.id) {
        const res = await getLastSamplingByConsignUnit({
          cosnignUnitId: data.consignUnit.id,
          projectId: data.project.id,
        })

        const resData = res.data
        if (resData.success && resData.obj.length > 0) {
          const obj = resData.obj[0]

          useSamplingInfo.setDataField('samplingPerson', obj.samplingPerson)
          useSamplingInfo.setDataField('samplingCompany', obj.samplingCompany)
          useSamplingInfo.setDataField('samplingPlace', obj.samplingPlace)
          useSamplingInfo.setDataField('samplingPersonNumber', obj.samplingPersonNumber)
        }
      }
    }
  }

  /**
   * 获取元数据前检查数据是否填写完整
   * 该方法抛给委托页面调用
   */
  checkFormData() {
    const { USING_RECOMMENDED_PARAMETER_STANDARD, useBasicInfo, useTestParams, usePeriod } = this

    const { bigCategoryId, testUnitTestSampleId } = useBasicInfo.data

    if (!bigCategoryId || !testUnitTestSampleId) {
      Modal.warning({
        title: '提示',
        content: '请选择试验检测对象！',
      })
      return false
    }

    if (!useTestParams.selectedRows.length) {
      Modal.warning({
        title: '提示',
        content: '请选择试验参数！',
      })
      return false
    }

    if (USING_RECOMMENDED_PARAMETER_STANDARD && useBasicInfo.data.isNeedConclusion) {
      const hasEmptyStandard = useTestParams.selectedRows.find((i) => {
        return !i.standards.find(j => j.selected)
      })
      if (hasEmptyStandard) {
        Modal.warning({
          title: '提示',
          content: '请选择参数的评定标准！',
        })
        return
      }
    }

    if (usePeriod.data.periods.some(i => !i.testParamId)) {
      Modal.warning({
        title: '提示',
        content: '龄期制样参数为必选！',
      })
      return false
    }

    return true
  }

  /**
   * 未知原因导致样品中的规格型号拼接属性与辅助信息不符，检查并收集一下信息
   * 该方法抛给委托页面调用
   */
  validateSpecifications() {
    const { useSampleInfo, useTestOtherInfo } = this

    const { standard } = useSampleInfo.data
    const otherInfos = useTestOtherInfo.data.otherInfos
    const { standardFields, systemField2NameEnum } = useTestOtherInfo

    // standard 是一个拼接而成的属性
    const specificationConcat = standard || ''
    const validations: any = otherInfos.filter((info) => {
      return standardFields.includes(info.systemFieldName)
    }).map((info) => {
      const key = (systemField2NameEnum[info.systemFieldName] || '') as keyof SampleInfoEntity
      const ownProperty = info.value || ''
      const objProperty = useSampleInfo.data[key] || ''

      return {
        key,
        name: info.name,
        displayName: info.displayName,
        fieldName: info.systemFieldName,
        ownProperty,
        objProperty,
        valid: ownProperty === objProperty,
      }
    })

    validations.push({
      ownProperty: specificationConcat,
      valid: validations.every((info: any) => {
        return specificationConcat.includes(info.ownProperty)
      }),
    })

    return validations
  }

  /** 构建元数据 */
  private async buildMetaData() {
    const {
      useBasicInfo,
      useCodesInfo,
      useTestParams,
      useSamplingInfo,
      useSampleInfo,
      useTestOtherInfo,
      useAdditionalFee,
      usePeriod,
      useAttachment,
      metaData,
    } = this
    const basicInfoMetaData: BasicInfoEntity = useBasicInfo.getMetaData()
    const codesInfoMetaData: CodesInfoEntity = useCodesInfo.getMetaData()
    const testParamsMetaData = useTestParams.getMetaData()
    const samplingInfoMetaData = useSamplingInfo.getMetaData()
    const sampleInfoMetaData = useSampleInfo.getMetaData()
    const testOtherInfoMetaData = useTestOtherInfo.getMetaData()
    const additionalFeeMetaData = useAdditionalFee.getMetaData()
    const periodMetaData = usePeriod.getMetaData()
    const attachmentMetaData = useAttachment.getMetaData()

    /** 【系统参数】按样品设置资质 */
    const SET_QUA_WITH_OBJECT = await getBusinessParam('SET_QUA_WITH_OBJECT')

    metaData.generateAcceptSampleInfoByCount = false
    metaData.systemTestSampleId = basicInfoMetaData.systemTestSampleId
    metaData.testUnitTestSampleId = basicInfoMetaData.testUnitTestSampleId
    metaData.bigCategoryId = basicInfoMetaData.bigCategoryId
    metaData.bigCategoryNames = basicInfoMetaData.bigCategoryNames
    metaData.bigCategoryInfo = basicInfoMetaData.bigCategoryInfo
    metaData.testSampleId = basicInfoMetaData.testUnitTestSampleId
    metaData.testSampleLevelName = basicInfoMetaData.sample?.text || ''
    metaData.sampleAttributes = basicInfoMetaData.sample?.attributes
    metaData.rootNode = basicInfoMetaData.rootNode
    metaData.objectCodeArr = codesInfoMetaData.objectCodeArr
    metaData.objectCodeSuffixArr = codesInfoMetaData.objectCodeSuffixArr
    metaData.multipleCode = codesInfoMetaData.multipleCode
    metaData.provideToCustomerSampleCode = codesInfoMetaData.provideToCustomerSampleCode
    metaData.provideToCustomerSampleMultipleCode = codesInfoMetaData.provideToCustomerSampleMultipleCode
    metaData.testObjectCode = codesInfoMetaData.testObjectCode
    metaData.samplingInfo = basicInfoMetaData.samplingInfo
    metaData.mark = basicInfoMetaData.mark
    metaData.nodes = basicInfoMetaData.nodes
    metaData.level = basicInfoMetaData.level
    metaData.testSampleName = this.sampleTestParamsName
    metaData.sampleAmount = basicInfoMetaData.sampleAmount
    metaData.isRetentionSample = !!sampleInfoMetaData.retentionHowLong
    metaData.testSampleDisplayName = sampleInfoMetaData.testSampleDisplayName
    metaData.delegatesNum = sampleInfoMetaData.delegatesNum
    metaData.description = sampleInfoMetaData.description
    metaData.repository = sampleInfoMetaData.repository
    metaData.testPart = sampleInfoMetaData.testPart
    metaData.projectPartAndUse = sampleInfoMetaData.projectPartAndUse
    metaData.externalInfo = sampleInfoMetaData.externalInfo
    metaData.remark = sampleInfoMetaData.remark
    metaData.sampleNum = sampleInfoMetaData.sampleNum
    metaData.sampleProcessMethod = sampleInfoMetaData.sampleProcessMethod
    metaData.sampleProcessMethodCode = sampleInfoMetaData.sampleProcessMethodCode
    metaData.retentionHowLong = sampleInfoMetaData.retentionHowLong
    metaData.retentionTimeUnit = sampleInfoMetaData.retentionTimeUnit
    metaData.specificationConfig = JSON.stringify(sampleInfoMetaData.specificationConfig)
    metaData.standard = sampleInfoMetaData.standard
    metaData.specification = sampleInfoMetaData.specification
    metaData.grade = sampleInfoMetaData.grade
    metaData.label = sampleInfoMetaData.label
    metaData.model = sampleInfoMetaData.model
    metaData.samplingPerson = samplingInfoMetaData.samplingPerson
    metaData.samplingPersonNumber = samplingInfoMetaData.samplingPersonNumber
    metaData.samplingCompany = samplingInfoMetaData.samplingCompany
    metaData.samplingDate = samplingInfoMetaData.samplingDate
    metaData.samplingPlace = samplingInfoMetaData.samplingPlace
    metaData.additionalFees = additionalFeeMetaData.additionalFees
    metaData.additionalFeesData = additionalFeeMetaData.additionalFeesData
    metaData.additionalFeePrice = useAdditionalFee.additionalFeePrice
    metaData.attachmentQrKey = attachmentMetaData.attachmentQrKey
    metaData.attachmentQrUrl = attachmentMetaData.attachmentQrUrl
    metaData.testParams = testParamsMetaData.testParams
    // 总价：参数费用+附加费用
    metaData.testObjectPrice = useTestParams.testObjectPrice + useAdditionalFee.additionalFeePrice
    metaData.initalTestObjectPrice = metaData.testObjectPrice
    metaData.isUpdateConsign = MainController.urlParams.isUpdateConsign || ''
    metaData.qualificationType = MainController.urlParams.qualificationType || ''
    metaData.otherInfos = testOtherInfoMetaData.otherInfos
    metaData.periods = periodMetaData.periods
    metaData.isNeedConclusion = basicInfoMetaData.isNeedConclusion
    metaData.baseStandardProvider = basicInfoMetaData.baseStandardProvider

    metaData.urgentStatus = basicInfoMetaData.urgentStatus ? '10' : '00'
    metaData.isChangeUnitTestSampleId = basicInfoMetaData.isChangeUnitTestSampleId

    // metaData.id在元数据保存到后端后由后端生成
    metaData.testObjectId = metaData.id || ''

    if (!metaData.mark) {
      metaData.mark = generateGUID()

      metaData.subsampleList.forEach((subItem) => {
        if (!subItem.mark) {
          subItem.mark = generateGUID()
        }
      })
    }

    // 以下字段为后端写入元数据或委托编辑页面维护，在样品编辑页前端无写入逻辑，需要注意编辑时要赋值
    // metaData.parentSampleId = null
    // metaData.priceDetailList = [];
    // metaData.otherMetarials = [];

    // TODO 该字段已失效，需确认是否还要
    // metaData.displayClauseCode = true;
    // TODO 该字段未使用，需确认是否还要
    // metaData.specificationJoint = null;

    if (SET_QUA_WITH_OBJECT) {
      metaData.qualifications = basicInfoMetaData.qualifications
    }
    else {
      if (MainController.isAddPage) {
        metaData.qualifications = await this.getQualificationsMetaData(testParamsMetaData.testParams)
      }
    }

    return metaData
  }

  /**
   * 解析元数据，并赋值到各个模块
   */
  async parseMetaData() {
    const metaDataStr = this.sessionStorageMetaDataStr

    if (metaDataStr) {
      const metaData = JSON.parse(metaDataStr)

      this.metaData = metaData
      this.useBasicInfo.setData(metaData)
      this.useCodesInfo.setData(metaData)
      this.useTestParams.setData(metaData)
      this.useSamplingInfo.setData(metaData)
      this.useSampleInfo.setData(metaData)
      await this.useTestOtherInfo.setData(metaData)
      this.useAdditionalFee.setData(metaData)
      this.usePeriod.setData(metaData)
      this.useAttachment.setData(metaData)

      if (!this.useSampleInfo.data.specificationConfig) {
        this.useSampleInfo.setDataField('specificationConfig', compatibilityOldMetaData(metaData))
      }
    }
  }

  /** 根据选择参数获取默认资质 */
  private async setDefaultQualifications(testParams: ViewTestParamsItem[]) {
    /** 【系统参数】按样品设置资质 */
    const SET_QUA_WITH_OBJECT = await getBusinessParam('SET_QUA_WITH_OBJECT')

    if (!SET_QUA_WITH_OBJECT) {
      return
    }

    const ids = testParams.map(i => i.id)
    const res = await getQualificationByTestParams(ids.join(','))

    if (res.data.length > 0) {
      this.setQualifications(ids.join(','), res.data)
    }
  }

  /** 设置选择资质 */
  async setQualifications(paramIds: string, rows: QualificationEntity[]) {
    const { useBasicInfo } = this

    const res = await checkQualificationUltra({
      paramIds,
      quaIds: rows.map(i => i.id).join(','),
    })

    if (res.data) {
      if (UseBasicInfo.REPORT_QUA_SEAL_QUERY === 'NONE') {
        Modal.confirm({
          title: '请注意',
          content: h('div', {
            innerHTML: res.data,
          }),
          cancelText: '取消',
          okText: '确定',
          onOk: () => {
            useBasicInfo.setDataField('qualifications', rows)
          },
        })
      }
      else {
        Modal.info({
          title: '请注意',
          content: h('div', {
            innerHTML: res.data,
          }),
        })
      }
    }
    else {
      useBasicInfo.setDataField('qualifications', rows)
    }
  }

  /** 设置资质元数据 */
  private async getQualificationsMetaData(testParams: TestParamsMetaDataItem[]) {
    const consignWindow = MainController.consignWindow

    if (consignWindow.consign && consignWindow.consign.qualificationBySample) {
      // 根据所选参数生成默认资质，挂载到样品信息上
      const paramIds = testParams.map(i => i.testParamId)
      const res = await getDefaultQualification(paramIds.join(','))
      return res.data
    }
    else {
      const qualifications: any[] = []
      const qualificationsList = JSON.parse(localStorage.getItem('qualifications') || '[]')
      const nowQualificationId = (consignWindow.$('#qualificationTypeId').val() || '').split(',')

      // 根据委托上资质挂载到新添加的样品上,
      qualificationsList.forEach((it: any) => {
        nowQualificationId.forEach((nit: any) => {
          if (it.id === nit) {
            qualifications.push(it)
          }
        })
      })

      return qualifications
    }
  }
}
