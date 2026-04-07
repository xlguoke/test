import type { SampleStatus } from '../enum'
import type { NormalConsignProcessor } from '../modules/consign-processor/NormalConsignProcessor'
import type { SynthesisConsignProcessor } from '../modules/consign-processor/SynthesisConsignProcessor'
import type { PageStateService } from '../modules/PageStateService'
import type { IndustryLayoutConfig } from '~/api/consign/consign-form-layout/types'
import type { EGenerateCode } from '~/api/consign/consign-management'
import type { IAppointmentContractDTO, IConsignDataDTO, IFeeDTO, ISampleSender } from '~/api/consign/consign-management/types'
import type { IConsignProjectDTO } from '~/api/consign/project-management/types'
import type { ISystemParam } from '~/api/system/system-param/types'
import type { ExternalObjectEntity } from '~/components/selectorViaMethodCall/entity/ExternalObjectEntity'
import type { MixingAmountEntity } from '~/components/selectorViaMethodCall/entity/MixingAmountEntity'
import type { MetaDataEntity } from '~/views/consign/component/selectSample/modules/services/MetaDataBuilder'
import type { ViewTestParamsItem } from '~/views/consign/component/selectSampleParam/modules/BaseTestParams'

// 从 enum 目录导入枚举
export * from '../enum'

/** 委托处理器 */
export type IConsignProcessor = NormalConsignProcessor | SynthesisConsignProcessor

/** ## 样品列表：主样品和子样品 */
export type IConsignSamples = MetaDataEntity

/** ## 外来样品、已委托原材料 */
export type IExternalSample = ExternalObjectEntity & MixingAmountEntity

/** ## 选择样品页面，前端展示参数 */
export type IViewTestParamsItem = ViewTestParamsItem

/** ## 跳转委托详情携带参数 */
export interface IGoDetailConfig {
  /** ## 委托id */
  id: string
  /** ## 领域id */
  industryId: string
  /** ## 委托状态 */
  status?: string
  /** ## 委托编号 */
  consignCode?: string
  /** ## 是否显示编号预设 */
  presetNumber?: '1'
  /** ## 是否为详情 */
  detail?: 'detailPage'
  /** ## 完成委托后，校验是否绑定电子标签：仅查看详情时传入 */
  checkBindElectronLabel?: '1'
  /** ## 样品id： 其他页面查看委托时，通过id标识当前样品 */
  sampleId?: string
  /** ## 项目检测详情跳转 */
  testProject?: '1'
  /** ## 创建综合试验 */
  createTest?: '1'
  /** ## 离线数据id，创建综合试验 */
  offlineDataId?: string
  /** ## 任务id */
  taskId?: string
  /** ## 检测任务id */
  testTaskId?: string
  /** ## 任务分配、任务详情查看委托详情 */
  isTaskRedirect?: string
  /** ## 显示工程划分 */
  showUnitProject?: string
  /** ## 复制报告 */
  cloneReport?: string
  /** ## 工程项目id */
  projectId?: string
  /** ## 工程项目名称 */
  projectName?: string
  /** ## 是否保留当前标签页（传入后不关闭当前标签页） */
  keepCurrentTab?: boolean
  /** ## 非委托页面 */
  notConsignPage?: string
  /** ## 现场取样id */
  extractSampleId?: string
  /** ## 暂未确定该参数作用 */
  isTaskassigned?: string
  /** ## 是否有修订报告 */
  hasRevisedReport?: string
}

/** ## 选择工程划分返回的信息 */
export interface IUnitProjectTreeNode {
  id: string
  pid: string
  oid: string
  sid: string
  type: number
  name: string
  levelCode: null | string
  deleted: boolean
  children: IUnitProjectTreeNode[]
  disabledParam: null | any
  attributes: null | {
    supervisingUnit: string
    constructionUnit: string
  }
}

/** ## 选择委托单位工程项目返回的信息 */
export interface IConsignUnitProject {
  /** ## 委托单位信息 */
  consignUnit: IConsignProjectDTO['consignUnit']
  /** ## 工程项目信息 */
  project: IConsignProjectDTO
  /** ## 委托人信息 */
  sampleSender: ISampleSender
}

/** ## 动态表单业务功能配置 */
export interface IBusinessConfig {
  [key: string]: {
    init?: (v?: any, options?: any[]) => Promise<any>
    beforeClick?: () => boolean | Promise<boolean>
    showFormItem?: boolean
    disabled?: boolean
    rules?: (config?: IndustryLayoutConfig) => any[]
  }
}

/** ## 页面状态 */
type PageState = Pick<
  PageStateService,
  'isCreateTest' | 'offlineDataId' | 'cloneReport' | 'projectId' | 'isTaskRedirect'
>

/** ## 委托详情打开选择样品弹窗，传递的参数 */
export interface IConsginPageParam {
  title: string
  industryName: string
  /** ## 领域id */
  industryId: string
  /** ## 委托id */
  consignDetail: IConsignDataDTO
  /** ## 样品列表：生成样品编号时需要 */
  sampleDatas: IConsignSamples[]
  /** ## 系统参数 */
  SYSTEM_PARAM: ISystemParam
  /** ## 收费标准id */
  priceStandardId: string
  /** ## 只读属性：页面状态、业务变量 */
  pageState: PageState & {
    /** ## 现场检测 */
    isLocalTest: boolean
    /** ## 有样品退回 */
    objectRollback?: boolean
    /** ## 通知修改委托 */
    isNoticeModifyConsign?: boolean
    /** ## 新增 */
    isAddPage: boolean
    /** ## 编辑 */
    isEditPage: boolean
    /** ## 详情 */
    isDetailPage: boolean
  }
  /** ## 元数据: 当前编辑的样品 */
  metaData?: IConsignSamples
  /** ## 表单占位符 */
  placeholder: (text: string) => string
  /** ## 计算脚本价格 */
  feeCalculateWithScript: (type: string, object: any, params: ViewTestParamsItem[]) => IViewTestParamsItem[]
  /**
   * ## 保存样品
   * @param metaData 样品数据
   * @param saveConsign 是否保存委托
   * @param EGenerateCode 编号生成策略
   */
  onSaveSample: (metaData: IConsignSamples[], saveConsign?: boolean, EGenerateCode?: EGenerateCode) => Promise<IConsignSamples[] | undefined>
}

/** ## 检测合同 */
export interface IAppointmentContract extends IAppointmentContractDTO {
  /** ## 前端添加排序标识 */
  _count: number
}

/** ## 费用信息 */
export interface IFeeState {
  /** ## 费用模块 —— 最新数据 */
  feeVo: IFeeDTO
  /** ## 原费用信息 */
  oldFeeVo: IFeeDTO
  /** ## 附加费用/辅助费用 */
  additionalFees: any[]
  /** ## 原实收费用：用于保存委托时判断费用是否变更 */
  originRatedFee: number
}

/** ## 保存委托回调 —— code=20000 */
export interface ISaveConsignRes {
  code?: number
  data: {
    consignCode: string
    consignId: string
    generateCode?: string
    snMonitors?: string[]
    isSave: boolean
    msg?: string
  }
}

/** ## 保存委托回调 —— code != 20000 */
export interface ISaveConsignResFail {
  code?: number
  data: any[]
  msg?: string
  message?: string
}

/** ## 超资检查 */
export interface IOverQualificationCheckParam {
  /** ## 样品资质 */
  samples: {
    sampleId: string
    paramIds: string[]
    qualificationIds: string[]
  }[]
  /** ## 委托资质 */
  qualificationIds: string[]
}

interface Opt { id: string, name: string }
/** ## 解析脚本价格需要的数据 */
export interface IParseScriptPriceParam {
  consignFormOptions: {
    /** ## 资质 */
    qualifications?: Opt[]
    /** ## 委托单位 */
    consignUnit?: Opt[]
    /** ## 工程项目 */
    consignUnitProjects?: Opt[]
    /** ## 编号类别 */
    snTypeList?: Opt[]
    /** ## 检测类别 */
    checkType?: Opt[]
  }
  /** ## 委托表单数据 */
  consignInfoArr: { name: string, value: string | null }[]
}

export interface IConsignDataSaveParam {
  consignData: IConsignDataDTO
  sampleData: IConsignSamples[]
  feeState: IFeeState
  witnessInfo?: {
    buildWitnesses: IConsignDataDTO['buildWitnesses']
    witnesses: IConsignDataDTO['witnesses']
  }
}

/**
 * 样品列表
 * @description 处理后的数据仅用于前端渲染，若需要更新数据，请修改 inject 接收的 sampleDatas
 */
export interface IRenderSampleData extends IConsignSamples {
  /** 缓存初始id，id需要作为table唯一key使用，新增时不存在需要手动赋值，会改变id的值 */
  originId?: string
  parentMark?: string
  parentStatus?: SampleStatus
  disabled?: boolean
  children?: IRenderSampleData[]
  /** 外来样品id */
  externalObjectId?: string
}
