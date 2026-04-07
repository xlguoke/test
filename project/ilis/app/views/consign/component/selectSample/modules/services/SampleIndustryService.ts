import { useIndustryStore } from '~/store/industryStore'
import { BUSINESS_SCOPE } from '~/views/unit-config/industryConfig'
import { industryFieldConfigApi } from '~/views/unit-config/industryConfig/api.ts'

type SampleIndustryType = 'samplingInfo' | 'sampleAttachment' | 'samplePreparationInf' | 'sampleReceivingRequirements' | 'sampleInfo' | 'sampleExtractionInfo' | 'additionalCharges'

type SampleIndustryConfig = Partial<Record<SampleIndustryType, {
  fieldName: string
  fieldCode: string
  fieldDisplayName: string
  selected: boolean
}>>

/**
 * 领域控制服务
 */
export class SampleIndustryService {
  config: SampleIndustryConfig = {}

  private industryStore = useIndustryStore()

  get data() {
    return this.industryStore.industry
  }

  get term() {
    return this.industryStore.term
  }

  /** 领域配置 - 通用字段中是否勾选 */
  get enableField() {
    return {
      /** 需要评定结果 */
      isNeedConclusion: !!(this.industryStore.getField('isNeedConclusion')?.selected),
      /** 检测点数 */
      checkPoint: !!(this.industryStore.getField('checkPoint')?.selected),
      /** 样品名称 */
      testSampleDisplayName: !!(this.industryStore.getField('testSampleDisplayName')?.selected),
      /** 检测部位 */
      testPart: !!(this.industryStore.getField('testPart')?.selected),
      /** 规格型号 */
      standard: !!(this.industryStore.getField('standard')?.selected),
      /** 工程部位/用途 */
      projectPartAndUse: !!(this.industryStore.getField('projectPartAndUse')?.selected),
      /** 样品描述 */
      testObjectDescription: !!(this.industryStore.getField('testObjectDescription')?.selected),
      /** 样品数量 */
      sampleNum: !!(this.industryStore.getField('sampleNum')?.selected),
      /** 代表数量 */
      delegatesNum: !!(this.industryStore.getField('delegatesNum')?.selected),
      /** 样品处理方式 */
      sampleProcessMethod: !!(this.industryStore.getField('sampleProcessMethod')?.selected),
      /** 留样期限 */
      retentionHowLong: !!(this.industryStore.getField('retentionHowLong')?.selected),
      /** 来样编号 */
      provideToCustomerSampleCode: !!(this.industryStore.getField('provideToCustomerSampleCode')?.selected),
      /** 选择打包参数 */
      selectedBuildParam: !!(this.industryStore.getModuleConfig('selectedBuildParam')?.selected),
    }
  }

  constructor(industryId: string) {
    this.industryStore.setIndustryId(industryId)
  }

  async init() {
    const industryId = this.industryStore.industryId
    const res = await industryFieldConfigApi({
      industryId,
      module: BUSINESS_SCOPE.MODULE,
    })

    res.data.forEach((item) => {
      this.config[item.fieldCode as SampleIndustryType] = {
        fieldName: item.fieldName,
        fieldDisplayName: item.fieldDisplayName || item.fieldName,
        fieldCode: item.fieldCode,
        selected: item.selected,
      }
    })
  }
}
