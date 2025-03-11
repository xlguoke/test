import { UseBase } from '~/views/consign/component/selectSample/modules/UseBase.ts'
import type { SelectSampleEntity, SelectSampleParamEntity } from '~/views/consign/component/selectSampleParam'
import { getListByGroupId } from '~/api/common.ts'
import type { ScreenTypeEntity } from '~/views/admin/screen/configuration'
import {
  getParamPacks,
} from '~/views/consign/component/selectSample/api.ts'
import type { ParamPackItem } from '~/views/consign/component/selectSample/modules/UseParamPack.ts'
import type { MetaDataEntity } from '~/views/consign/component/selectSample/modules/MainController.ts'
import { MainController } from '~/views/consign/component/selectSample/modules/MainController.ts'
import type { QualificationEntity } from '~/views/consign/component/selectSample/interface/Qualification.ts'
import { getBusinessParamValue } from '~/utils/getBusinessParam.ts'

export interface BigCategoryInfoItem {
  id: string
  level: number
  title: string
}

/**
 * 注：该对象中的属性不一定都是元数据中需要的，不要直接合并进元数据
 */
export class BasicInfoEntity {
  /** 选择的样品信息 */
  sample?: SelectSampleEntity

  /** 唯一标识 */
  mark = generateGUID()
  /** 检测组数 */
  sampleAmount = 1
  /** 抽样情况 */
  samplingInfo = ''
  /** 样品ID */
  systemTestSampleId = ''
  /** 本单位的样品ID */
  testUnitTestSampleId = ''
  /** 大类ID */
  bigCategoryId = ''
  /** 大类路径名称 */
  bigCategoryNames = ''
  /** 大类层级信息 */
  bigCategoryInfo: BigCategoryInfoItem[] = []

  rootNode: {
    id?: string
    name?: string
    systemId?: string
  } = {}

  nodes: string[] = []

  /** 样品信息：样品层次名称 */
  level = ''

  /** 是否切换了单位样品ID */
  isChangeUnitTestSampleId = false
  /** 规程提供方 */
  baseStandardProvider?: string
  /** 是否需要评定结果 */
  isNeedConclusion = true
  /** 加急检测 */
  urgentStatus = false
  /** 资质类型 */
  qualifications: QualificationEntity[] = []
}

/**
 * 基础信息
 */
export class UseBasicInfo extends UseBase<BasicInfoEntity> {
  /** 规程提供方下拉选项 */
  baseStandardProviderOptions: ScreenTypeEntity[] = []

  /** 打包参数下拉选项 */
  paramPackOptions: ParamPackItem[] = []

  /** 【系统参数】报告设置资质章时，资质对应报告参数 */
  static REPORT_QUA_SEAL_QUERY?: 'ALLCOVER' | 'PARTCOVER' | 'NONE'

  /** 【系统参数】选择样品及参数时，显示检测周期 */
  DISPLAYS_TEST_PERIOD = false

  constructor() {
    super(new BasicInfoEntity())
  }

  // 选择资质展示
  get selectedQualificationStr() {
    return (this.data.qualifications || []).map(i => i.name).join(',')
  }

  init() {
    // 页面初始化数据获取
    this.initBaseStandardProviderOptions()
    this.initParamPackOptions()

    getBusinessParamValue('REPORT_QUA_SEAL_QUERY').then((val) => {
      UseBasicInfo.REPORT_QUA_SEAL_QUERY = val as 'ALLCOVER' | 'PARTCOVER' | 'NONE'
    })

    getBusinessParam('DISPLAYS_TEST_PERIOD').then((val) => {
      this.DISPLAYS_TEST_PERIOD = val
    })
  }

  /**
   * 从选择样品参数页面返回的数据中，保存选择样品等信息
   */
  updateSelectSampleInfo(selectData: SelectSampleParamEntity) {
    const testUnitTestSampleId = this.data.testUnitTestSampleId
    const sample = selectData.Sample

    // 保存样品信息
    this.setDataField('sample', sample)

    // 是否切换了单位样品ID
    this.setDataField('isChangeUnitTestSampleId', testUnitTestSampleId && selectData.testUnitTestSampleId !== testUnitTestSampleId)

    this.setDataField('systemTestSampleId', selectData.systemTestSampleId)
    this.setDataField('testUnitTestSampleId', selectData.testUnitTestSampleId)
    this.setDataField('bigCategoryId', selectData.bigCategoryId)
    this.setDataField('bigCategoryNames', selectData.bigCategoryNames)
    this.setDataField('bigCategoryInfo', selectData.bigCategoryInfo)
    this.setDataField('rootNode', selectData.rootNode)
    this.setDataField('nodes', selectData.nodes)
    this.setDataField('level', sample.SampleLevelStr)
    this.setDataField('isNeedConclusion', selectData.isNeedConclusion)

    // 参数打包下拉
    this.initParamPackOptions()

    // 发布选择样品参数事件
    this.publishFieldChange('onSelectTestParams', selectData)
  }

  /** 获取规程提供方下拉 */
  initBaseStandardProviderOptions() {
    getListByGroupId('76698b96-e2ac-11ea-87d0-0242ac13').then((res) => {
      const options = res.data.obj

      this.baseStandardProviderOptions = options

      if (MainController.isAddPage && options.length > 0) {
        this.data.baseStandardProvider = options[0].typename
      }
    })
  }

  /** 获取参数打包下拉 */
  initParamPackOptions() {
    const bigCategoryId = this.data.bigCategoryId
    const testUnitTestSampleId = this.data.testUnitTestSampleId

    if (!bigCategoryId && !testUnitTestSampleId) {
      this.paramPackOptions = []
      return
    }

    getParamPacks({
      pagination: false,
      sampleId: testUnitTestSampleId,
      categoryId: bigCategoryId,
    }).then((res) => {
      this.paramPackOptions = res.data
    })
  }

  /** 回显 */
  setData(metaData: MetaDataEntity) {
    const data = new BasicInfoEntity()

    data.mark = metaData.mark
    data.sampleAmount = metaData.sampleAmount
    data.samplingInfo = metaData.samplingInfo
    data.systemTestSampleId = metaData.systemTestSampleId
    data.testUnitTestSampleId = metaData.testUnitTestSampleId
    data.bigCategoryId = metaData.bigCategoryId
    data.bigCategoryNames = metaData.bigCategoryNames
    data.bigCategoryInfo = metaData.bigCategoryInfo
    data.systemTestSampleId = metaData.systemTestSampleId
    data.testUnitTestSampleId = metaData.testUnitTestSampleId
    data.bigCategoryInfo = metaData.bigCategoryInfo
    data.rootNode = metaData.rootNode
    data.nodes = metaData.nodes
    data.level = metaData.level
    data.isChangeUnitTestSampleId = false
    data.baseStandardProvider = metaData.baseStandardProvider
    data.isNeedConclusion = metaData.isNeedConclusion
    data.urgentStatus = metaData.urgentStatus === '10'
    data.qualifications = metaData.qualifications

    this.data = data

    // 参数打包下拉
    this.initParamPackOptions()
  }
}
