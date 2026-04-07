import type { AdditionalFeeItem, AdditionalFeeMetaDataItem } from '../UseAdditionalFee'
import type { TestOtherInfoMetaDataItem } from '../UseTestOtherInfo'
import type { QualificationEntity } from '~/views/consign/component/selectSample/interface/Qualification.ts'
import type { MainController } from '~/views/consign/component/selectSample/modules/MainController.ts'
import type { BasicInfoEntity } from '~/views/consign/component/selectSample/modules/UseBasicInfo.ts'
import type {
  CodesInfoEntity,
  ObjectCodeItem,
} from '~/views/consign/component/selectSample/modules/UseCodesInfo.ts'
import type { PeriodMetaDataItem } from '~/views/consign/component/selectSample/modules/UsePeriod.ts'
import type {
  TestParamsMetaDataItem,
} from '~/views/consign/component/selectSample/modules/UseTestParams.ts'
import type { SampleTreeNodeAttr } from '~/views/consign/component/selectSampleParam/modules/UseTestSample.ts'

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
  /** 多样品编号 */
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
  /** 样品单价 */
  samplePrice: number | null = null

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

  /** 子样品、关联材料信息集合 (该字段在委托编辑页维护) */
  otherMaterials: Array<MetaDataEntity> = []
  /** 父级样品ID (该字段由后端写入) */
  parentSampleId = ''

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

  /** 样品状态 */
  status?: string
  /** 手簿记录ID：手簿离线数据创建委托 */
  handbookRecordId: string | undefined = ''
  /** 样品类型：主样品无type 1-引用的原材料 2-参配样品 3-外来样品（referred属性为true的则是引用的外来样品） 4-添加的子样品 */
  type?: number
  /** 引用的外来样品 */
  referred?: boolean
  /** 自定义标记id */
  markObjectColorTextIds?: string
  /** 委托附件：已弃用，兼容历史数据，暂保留该字段 */
  accessories?: any[]
  /** 是否占用系统编号 */
  needOccupation?: boolean
}

/**
 * 元数据构建类
 */
export class MetaDataBuilder {
  // 元数据
  metaData = new MetaDataEntity()

  constructor(private mainController: MainController) {}

  /** 设置元数据 */
  setMetaData(metaData: MetaDataEntity) {
    this.metaData = metaData
  }

  /** 获取元数据 */
  async getMetaData(samplePageSave?: boolean) {
    const { useTestParams } = this.mainController

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
    const { useBasicInfo } = this.mainController
    const metaData = await this.buildMetaData()
    // 根据最大数量（检测组数），生成样品对象
    const sampleCount = useBasicInfo.data.sampleAmount

    const result: MetaDataEntity[] = []
    const objectCodeArr = metaData.objectCodeArr || []
    const provideSampleCodeArr = (metaData.provideToCustomerSampleCode || '').split(',')

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
      consginPageParam,
    } = this.mainController
    const metaData = this.metaData
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
    const { SET_QUA_WITH_OBJECT } = consginPageParam.SYSTEM_PARAM

    metaData.generateAcceptSampleInfoByCount = false
    metaData.systemTestSampleId = basicInfoMetaData.systemTestSampleId
    metaData.testUnitTestSampleId = basicInfoMetaData.testUnitTestSampleId
    metaData.bigCategoryId = basicInfoMetaData.bigCategoryId
    metaData.bigCategoryNames = basicInfoMetaData.bigCategoryNames
    metaData.bigCategoryInfo = basicInfoMetaData.bigCategoryInfo
    metaData.testSampleId = basicInfoMetaData.testUnitTestSampleId
    metaData.testSampleLevelName = basicInfoMetaData.sample?.text || ''
    metaData.sampleAttributes = basicInfoMetaData.sample?.attributes
    metaData.samplePrice = basicInfoMetaData.samplePrice
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
    metaData.testSampleName = this.mainController.sampleTestParamsName
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
    // metaData.isUpdateConsign = MainController.pageStateService.urlParams.isUpdateConsign || ''
    metaData.qualificationType = (consginPageParam.consignDetail.qualificationTypeId as string) || ''
    metaData.otherInfos = testOtherInfoMetaData.otherInfos
    metaData.periods = periodMetaData.periods
    metaData.isNeedConclusion = !!basicInfoMetaData.isNeedConclusion
    metaData.baseStandardProvider = basicInfoMetaData.baseStandardProvider

    metaData.urgentStatus = basicInfoMetaData.urgentStatus ? '10' : '00'
    metaData.isChangeUnitTestSampleId = basicInfoMetaData.isChangeUnitTestSampleId

    // metaData.id在元数据保存到后端后由后端生成
    metaData.testObjectId = metaData.id || ''

    if (!metaData.mark) {
      metaData.mark = generateGUID()

      metaData.otherMaterials.forEach((subItem) => {
        if (!subItem.type && !subItem.mark) {
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
      if (this.mainController.pageState.isAddPage) {
        metaData.qualifications = await this.mainController.qualificationManager.getQualificationsMetaData(testParamsMetaData.testParams)
      }
    }

    return metaData
  }
}
