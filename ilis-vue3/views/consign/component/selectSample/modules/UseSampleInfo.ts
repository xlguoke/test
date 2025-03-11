import type { TestOtherInfoMetaDataItem } from './UseTestOtherInfo'
import { UseBase } from '~/views/consign/component/selectSample/modules/UseBase.ts'
import { getListByGroupId } from '~/api/common.ts'
import type { ScreenTypeEntity } from '~/views/admin/screen/configuration'
import {
  getDescriptionOptions,
  getDiscriptionHistory,
  getSysTypeList,
} from '~/views/consign/component/selectSample/api.ts'
import type { MetaDataEntity } from '~/views/consign/component/selectSample/modules/MainController.ts'
import { MainController } from '~/views/consign/component/selectSample/modules/MainController.ts'

export class SampleInfoEntity {
  /** 代表数量 */
  delegatesNum = ''
  /** 样品数量 */
  sampleNum = ''

  /** 样品名称 */
  testSampleDisplayName = ''
  /** 检测部位 */
  testPart = ''
  /** 工程部位/用途 */
  projectPartAndUse = ''
  externalInfo = ''
  /** 样品描述 */
  description = ''
  /** 样品数量（界面绑定用） */
  sampleNumVal?: number
  /** 样品数量单位（界面绑定用） */
  sampleNumUnit?: string
  /** 代表数量（界面绑定用） */
  delegatesNumVal?: number
  /** 代表数量单位（界面绑定用） */
  delegatesNumUnit?: string
  /** 测后样品处理 */
  sampleProcessMethod?: string
  sampleProcessMethodCode?: string
  /** 留样期限 */
  retentionHowLong = ''
  /** 留样期限单位 */
  retentionTimeUnit: 'D' | 'M' | 'Y' = 'D'
  /** 样品存放位置 */
  repository = ''
  /** 备注 */
  remark = ''

  /** 规格型号 */
  specificationConfig: TestOtherInfoMetaDataItem[] = []

  /** 规格型号 */
  standard = ''
  /** 规格型号 - 规格 */
  specification = ''
  /** 规格型号 - 等级 */
  grade = ''
  /** 规格型号 - 名称 */
  label = ''
  /** 规格型号 - 类型 */
  model = ''
}

interface DescriptionOptionItem {
  value: string
  options: Array<{ value: string }>[]
}

/**
 * 样品信息
 */
export class UseSampleInfo extends UseBase<SampleInfoEntity> {
  /** 开启设置 工程部位/用途控制 */
  Third_Party_BIM = false

  /** 开启 样品描述下拉选项中包含该样品历史输入的样品描述 */
  SAMPLE_DESCRIPTION_HISTORY_LOAD = false

  /** 测后样品处理下拉 */
  sampleProcessMethodOptions: ScreenTypeEntity[] = []

  /** 样品存放位置下拉 */
  repositoryOptions: Array<{ value: string }> = []

  /** 样品数量单位下拉 */
  sampleNumUnitOptions: Array<{ value: string }> = []

  /** 样品描述下拉 */
  descriptionOptions: DescriptionOptionItem[] = []

  /** 样品层级名称：旧版样品层级存在规格型号，选择了规格样品层级名称为规格型号（见变量UseTestOtherInfo.standardFields）时，样品信息处规格型号对应字段显示当前样品层级名称 */
  sampleLevelName: string = ''
  /** 样品属性名称 */
  sampleAttributeName: string = ''

  constructor() {
    super(new SampleInfoEntity())

    // 工程部位/用途控制
    getBusinessParam('Third_Party_BIM').then((val) => {
      this.Third_Party_BIM = val
    })

    // 样品描述下拉选项中包含该样品历史输入的样品描述
    getBusinessParam('SAMPLE_DESCRIPTION_HISTORY_LOAD').then((val) => {
      this.SAMPLE_DESCRIPTION_HISTORY_LOAD = val
    })

    this.initSampleProcessMethodOptions()
    this.initRepositoryOptions()
    this.initSampleNumUnitOptions()
  }

  /** 获取测后样品处理下拉 */
  initSampleProcessMethodOptions() {
    getListByGroupId('999de77c-e05b-11ea-87d0-0242ac13').then((res) => {
      const data = this.getData()
      const options = res.data.obj

      if (MainController.isAddPage && options.length > 0) {
        this.setDataField('sampleProcessMethod', options[0].typename)
      }

      // 被删除的数据，追加进下拉列表
      if (!MainController.isAddPage) {
        if (data.sampleProcessMethod && !options.some(i => i.typename === data.sampleProcessMethod)) {
          options.push({
            typename: data.sampleProcessMethod,
            typecode: data.sampleProcessMethodCode || '',
            id: '',
            typeGroupId: '',
            parentType: null,
            createDate: 0,
            createName: '',
            sonTypes: [],
          })
        }
      }

      this.sampleProcessMethodOptions = options
    })
  }

  /** 存放位置下拉 */
  initRepositoryOptions() {
    getListByGroupId('6a2ff2e5-d8d5-4e4f-8ad3-eb6dd543').then((res) => {
      const options = res.data.obj
      this.repositoryOptions = options.map(i => ({ value: i.typename }))
    })
  }

  /** 样品数量下拉 */
  initSampleNumUnitOptions() {
    getSysTypeList('8a8ab0b246dc81120146dc8181c3006d').then((res: any) => {
      this.sampleNumUnitOptions = res.data.rows.map((i: any) => ({ value: i.typename }))
    })
  }

  /**
   * 样品描述下拉
   * 由系统配置和历史记录组成
   */
  async initDescriptionOptions(testUnitTestSampleId: string, paramIds: string[]) {
    if (!testUnitTestSampleId || paramIds.length === 0) {
      this.descriptionOptions = []
      return
    }

    const result: DescriptionOptionItem[] = []

    const res = await getDescriptionOptions(testUnitTestSampleId)
    const sysData = res.data
    if (sysData.length > 0) {
      result.push({
        value: '系统字段',
        options: sysData.map((i: any) => ({ value: i.description })),
      })
    }

    if (this.SAMPLE_DESCRIPTION_HISTORY_LOAD) {
      const res2 = await getDiscriptionHistory({
        testUnitTestSampleId,
        paramIds: paramIds.join(','),
      })
      const historyData = res2.data.obj
      if (historyData.length > 0) {
        result.push({
          value: '历史记录',
          options: historyData.map((i: string) => ({ value: i })),
        })
      }
    }

    this.descriptionOptions = result
  }

  getMetaData() {
    const data = this.data

    if (data.sampleProcessMethod) {
      const item = this.sampleProcessMethodOptions.find(i => i.typename === data.sampleProcessMethod)
      if (item) {
        data.sampleProcessMethodCode = item.typecode
      }
    }
    else {
      data.sampleProcessMethodCode = ''
    }

    return data
  }

  /** 解析试样数量和取样数量 */
  parseNumText(text: string) {
    const result: {
      num?: number
      unit?: string
    } = {}

    if (text) {
      const num = Number.parseInt(text)
      if (!Number.isNaN(num)) {
        result.num = num
        result.unit = text.replace(String(num), '')
      }
    }

    return result
  }

  /** 回显元数据 */
  setData(metaData: MetaDataEntity) {
    const data = new SampleInfoEntity()

    data.testSampleDisplayName = metaData.testSampleDisplayName
    data.testPart = metaData.testPart
    data.projectPartAndUse = metaData.projectPartAndUse
    data.externalInfo = metaData.externalInfo
    data.description = metaData.description
    data.sampleProcessMethod = metaData.sampleProcessMethod
    data.sampleProcessMethodCode = metaData.sampleProcessMethodCode
    data.retentionHowLong = metaData.retentionHowLong
    data.retentionTimeUnit = metaData.retentionTimeUnit
    data.repository = metaData.repository
    data.remark = metaData.remark
    data.specificationConfig = metaData.specificationConfig ? JSON.parse(metaData.specificationConfig) : ''
    data.standard = metaData.standard
    data.specification = metaData.specification
    data.grade = metaData.grade
    data.label = metaData.label
    data.model = metaData.model

    const sampleNumObj = this.parseNumText(metaData.sampleNum)
    data.sampleNum = metaData.sampleNum
    data.sampleNumVal = sampleNumObj.num
    data.sampleNumUnit = sampleNumObj.unit

    const delegatesNumObj = this.parseNumText(metaData.delegatesNum)
    data.delegatesNum = metaData.delegatesNum
    data.delegatesNumVal = delegatesNumObj.num
    data.delegatesNumUnit = delegatesNumObj.unit

    this.data = data
  }
}
