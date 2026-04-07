import type { SampleInfoEntity } from './UseSampleInfo'
import type { MetaDataEntity } from '~/views/consign/component/selectSample/modules/services/MetaDataBuilder.ts'
import type { IConsginPageParam } from '~/views/consign/consignDetail/interface/index.ts'
import { Modal } from 'ant-design-vue'
import { useIndustryStore } from '~/store/industryStore'
import { EventCoordinator } from '~/views/consign/component/selectSample/modules/services/EventCoordinator.ts'
import { MetaDataBuilder } from '~/views/consign/component/selectSample/modules/services/MetaDataBuilder.ts'
import { MetaDataParser } from '~/views/consign/component/selectSample/modules/services/MetaDataParser.ts'
import { QualificationManager } from '~/views/consign/component/selectSample/modules/services/QualificationManager.ts'
import { SampleIndustryService } from '~/views/consign/component/selectSample/modules/services/SampleIndustryService.ts'
import { UseAttachment } from '~/views/consign/component/selectSample/modules/UseAttachment.ts'
import { UseBasicInfo } from '~/views/consign/component/selectSample/modules/UseBasicInfo.ts'
import {
  UseCodesInfo,
} from '~/views/consign/component/selectSample/modules/UseCodesInfo.ts'
import { UsePeriod } from '~/views/consign/component/selectSample/modules/UsePeriod.ts'
import {
  UseTestParams,
} from '~/views/consign/component/selectSample/modules/UseTestParams.ts'
import { VIEW_TYPE } from '~/views/consign/component/selectSpecification'
import { ConsignStorageManager } from '~/views/consign/consignDetail/modules/ConsignStorageManager.ts'
import { getLastSamplingByConsignUnit, getUnitSample } from '../api.ts'
import { UseAdditionalFee } from './UseAdditionalFee'
import { UseSampleInfo } from './UseSampleInfo'
import { UseSamplingInfo } from './UseSamplingInfo.ts'
import { UseTestOtherInfo } from './UseTestOtherInfo'

/**
 * 主入口
 * 相关类都在该类中初始化和调用，避免多次调用影响性能
 */
export class MainController {
  // 领域控制服务
  sampleIndustryService: SampleIndustryService
  // 资质管理器
  qualificationManager: QualificationManager
  // 元数据构建器
  metaDataBuilder: MetaDataBuilder
  // 元数据解析器
  metaDataParser: MetaDataParser
  // 事件协调器
  eventCoordinator: EventCoordinator

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

  industryStore = useIndustryStore()

  /** 缓存服务 */
  consignStorageManager = new ConsignStorageManager(this.industryStore)

  // 样品/参数名称
  get sampleTestParamsName() {
    return (this.useSampleInfo.data.testSampleDisplayName || '') + (this.useBasicInfo.data.level || '')
  }

  /** 用于回显的元数据 */
  get sessionStorageMetaDataStr() {
    const metaData = this._consginPageParam.metaData
    return metaData ? JSON.stringify(metaData) : null
  }

  /** 系统参数 */
  get SYSTEM_PARAM() {
    return this.consginPageParam.SYSTEM_PARAM
  }

  /** 页面状态 */
  get pageState() {
    return this.consginPageParam.pageState
  }

  /** 委托详情界面的参数 */
  get consginPageParam() {
    return this._consginPageParam
  }

  constructor(private _consginPageParam: IConsginPageParam) {
    this.useBasicInfo = reactive(new UseBasicInfo(_consginPageParam)) as UseBasicInfo
    this.useTestParams = reactive(new UseTestParams(this.useBasicInfo, _consginPageParam)) as UseTestParams
    this.useSampleInfo = reactive(new UseSampleInfo(this.useBasicInfo, _consginPageParam)) as UseSampleInfo
    this.useCodesInfo = reactive(new UseCodesInfo(_consginPageParam)) as UseCodesInfo
    this.useSamplingInfo = reactive(new UseSamplingInfo(_consginPageParam)) as UseSamplingInfo
    this.useTestOtherInfo = reactive(new UseTestOtherInfo(_consginPageParam)) as UseTestOtherInfo
    this.useAdditionalFee = reactive(new UseAdditionalFee(_consginPageParam)) as UseAdditionalFee

    this.sampleIndustryService = reactive<any>(new SampleIndustryService(_consginPageParam.industryId))
    this.metaDataBuilder = new MetaDataBuilder(this)
    this.metaDataParser = new MetaDataParser(this)
    this.eventCoordinator = new EventCoordinator(this)
    this.qualificationManager = new QualificationManager(this)
    this.usePeriod = reactive(new UsePeriod(_consginPageParam)) as UsePeriod
    this.useAttachment = reactive(new UseAttachment(_consginPageParam)) as UseAttachment
  }

  init() {
    this.sampleIndustryService.init()
    this.useBasicInfo.init()
    this.useCodesInfo.init()

    // 事件中心，监听并处理各个模块之间业务
    this.eventCoordinator.initEmitCenter()

    // 新增
    if (this.pageState.isAddPage) {
      this.onAddPage()
    }

    // 回显
    if (!this.pageState.isAddPage) {
      const metaDataStr = this.sessionStorageMetaDataStr

      if (metaDataStr) {
        const metaData = JSON.parse(metaDataStr) as MetaDataEntity
        this.metaDataBuilder.setMetaData(metaData)
        this.metaDataParser.parseMetaData(metaData)
      }
      else {
        console.error('解析元数据失败')
      }
    }

    // 详情
    if (this.pageState.isDetailPage) {
      this.useTestOtherInfo.specificationsView = VIEW_TYPE.DETAIL
    }

    // 编辑
    if (this.pageState.isEditPage) {
      this.useTestOtherInfo.specificationsView = VIEW_TYPE.EDIT
    }

    getBusinessParam('USING_RECOMMENDED_PARAMETER_STANDARD').then((val: boolean) => {
      this.USING_RECOMMENDED_PARAMETER_STANDARD = val
    })
  }

  /** 新增页面初始化 */
  onAddPage() {
    // 默认上一次取样信息填写内容
    this.setLastSampling()
  }

  /** 获取元数据 */
  async getMetaData(samplePageSave: boolean) {
    const { useTestParams } = this

    // 是否根据检测组数生成样品
    // 不需要，则直接返回
    if (!useTestParams.generateAcceptSampleInfoByCount || samplePageSave) {
      const metaData = await (this as any).buildMetaData()
      return [metaData]
    }

    // 根据检测组数生成样品
    return await this.getMetaDataByCount()
  }

  /** 根据检测组数生成样品的元数据 */
  async getMetaDataByCount() {
    const { useBasicInfo } = this
    const metaData = await (this as any).buildMetaData()
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

  /**
   * 获取样品信息并设置默认值
   */
  async setUnitSampleData() {
    const { useBasicInfo, useSampleInfo } = this
    const testUnitTestSampleId = useBasicInfo.data.testUnitTestSampleId

    if (this.pageState.isAddPage && testUnitTestSampleId) {
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
    const data = this.consignStorageManager.getConsignUnitStorage()

    if (data) {
      if (data.consignUnit && data.consignUnit.id && data.project && data.project?.consignProject?.id) {
        const res = await getLastSamplingByConsignUnit({
          cosnignUnitId: data.consignUnit.id,
          projectId: data.project.consignProject.id,
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
}
