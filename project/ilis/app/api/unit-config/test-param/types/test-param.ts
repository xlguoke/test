/** ## 检测参数查询参数 */
export interface ITestParamQueryParam {
  'bigCategory.id': string
  'bigCategory.paramVersionId': string
  'showDeleted'?: number
  'isTree'?: boolean
  'testItemName'?: string
  'name'?: string
  'displayName'?: string
  'paramCategoryId'?: string
}

/**
 * ## 大类信息
 */
export interface IBigCategory {
  /** ## 大类ID */
  id: string
  /** ## 系统公司编码 */
  sysCompanyCode: string
  /** ## 创建人名称 */
  createName: string
  /** ## 创建人ID */
  createBy: string
  /** ## 创建日期 */
  createDate: string
  /** ## 更新人名称 */
  updateName: string | null
  /** ## 更新人ID */
  updateBy: string | null
  /** ## 更新日期 */
  updateDate: string | null
  /** ## 单位编码 */
  unitCode: string | null
  /** ## 其他平台ID */
  otherPlatformId: string | null
  /** ## 行业ID */
  industryId: string
  /** ## 大类名称 */
  name: string
  /** ## 大类编码 */
  code: string | null
  /** ## 检测类型 */
  testType: string | null
  /** ## 资质类型 */
  qualificationType: string | null
  /** ## 层级 */
  level: string
  /** ## 排序号 */
  orderNum: number
  /** ## 是否删除 */
  isDeleted: string
  /** ## 备注 */
  remark: string
  /** ## 参数版本ID */
  paramVersionId: string
  /** ## 计量单位 */
  unitMeasure: string | null
  /** ## 仪表盘选择 */
  dashboardSelect: string | null
  /** ## 仪表盘排序号 */
  dashboardOrderNum: string | null
  /** ## 子节点 */
  children: any[]
}

/**
 * ## 参数表格信息
 */
export interface IParamTableInfo {
  /** ## 表格ID */
  id: string
  /** ## 系统公司编码 */
  sysCompanyCode: string
  /** ## 创建人名称 */
  createName: string
  /** ## 创建人ID */
  createBy: string
  /** ## 创建日期 */
  createDate: string
  /** ## 更新人名称 */
  updateName: string | null
  /** ## 更新人ID */
  updateBy: string | null
  /** ## 更新日期 */
  updateDate: string | null
  /** ## 单位编码 */
  unitCode: string | null
  /** ## 记录唯一编码 */
  recordUniqCode: string
  /** ## 记录表名称 */
  recordTableName: string
  /** ## 报告唯一编码 */
  reportUniqCode: string | null
  /** ## 报告表名称 */
  reportTableName: string | null
  /** ## 版本号 */
  version: number
}

/**
 * ## 检测参数详情
 */
export interface ITestParamDetail {
  /** ## 参数ID */
  id: string
  /** ## 系统公司编码 */
  sysCompanyCode: string
  /** ## 创建人名称 */
  createName: string
  /** ## 创建人ID */
  createBy: string
  /** ## 创建日期 */
  createDate: string
  /** ## 更新人名称 */
  updateName: string | null
  /** ## 更新人ID */
  updateBy: string | null
  /** ## 更新日期 */
  updateDate: string | null
  /** ## 单位编码 */
  unitCode: string | null
  /** ## 其他平台ID */
  otherPlatformId: string | null
  /** ## 参数名称 */
  name: string
  /** ## 显示名称 */
  displayName: string
  /** ## 系统ID */
  systemId: string
  /** ## 参数编码 */
  code: string | null
  /** ## 检测项目ID */
  testItemId: string
  /** ## 检测项目名称 */
  testItemName: string
  /** ## 自动添加混合样品 */
  autoAddBlendSample: boolean
  /** ## 是否临时参数 */
  isTempParam: string
  /** ## 是否本地项目 */
  isLocaleItem: string
  /** ## 是否生成样品编码 */
  isBuildSampleCode: string
  /** ## 按数量生成收样信息 */
  generateAcceptSampleInfoByCount: boolean
  /** ## 生成过程对象 */
  generateProcessObject: boolean
  /** ## 是否删除 */
  isDeleted: string
  /** ## 是否离线报告 */
  isOfflineReport: string
  /** ## 备注 */
  remark: string
  /** ## 收样要求内容 */
  acceptRequireContent: string | null
  /** ## 收样要求图片 */
  acceptRequireImageSrc: string | null
  /** ## 排序号 */
  orderNum: number
  /** ## 参数工作日 */
  paramWorkDay: string | null
  /** ## 参数备注 */
  paramNote: string | null
  /** ## 父ID */
  pid: string | null
  /** ## 参数类型 */
  paramType: string
  /** ## 是否有UDR */
  isHaveUdr: boolean
  /** ## 是否化学类 */
  chemically: boolean
  /** ## 工时 */
  manHour: number
  /** ## 参数类别ID */
  paramCategoryId: string | null
  /** ## 参数类别名称 */
  paramCategoryName: string | null
  /** ## 强度试验 */
  qdmTest: boolean
  /** ## 单位 */
  unit: string | null
  /** ## 预委托显示 */
  preConsignShow: string | null
}

/**
 * ## 检测参数DTO
 */
export interface ITestParamDTO {
  /** ## 强度试验 */
  qdmTest: boolean
  /** ## 记录名称变更 */
  recordNameChange: boolean
  /** ## 记录唯一编码 */
  recordUniqCode: string
  /** ## 按数量生成收样信息 */
  generateAcceptSampleInfoByCount: boolean
  /** ## 父ID */
  pid: string | null
  /** ## 系统公司编码 */
  sysCompanyCode: string
  /** ## 是否有样品检测数量 */
  hasSampleTestQuantity: boolean
  /** ## 大类信息 */
  bigCategory: IBigCategory
  /** ## 生成过程对象 */
  generateProcessObject: boolean
  /** ## 参数类别ID */
  paramCategoryId: string | null
  /** ## 参数类型 */
  paramType: string
  /** ## 收样要求内容 */
  acceptRequireContent: string | null
  /** ## 资质列表 */
  qualifications: any[]
  /** ## 子节点 */
  children?: any[]
  /** ## 单位编码 */
  unitCode: string | null
  /** ## 参数类别名称 */
  paramCategoryName: string | null
  /** ## 参数ID */
  id: string
  /** ## 是否有UDR */
  isHaveUdr: boolean
  /** ## 附加费用 */
  additionalFees: any[]
  /** ## 关联参数 */
  relationParams: string | null
  /** ## 检测项目ID */
  testItemId: string
  /** ## 是否离线报告 */
  isOfflineReport: string
  /** ## 预委托显示 */
  preConsignShow: string | null
  /** ## 报告唯一编码 */
  reportUniqCode: string | null
  /** ## 更新人名称 */
  updateName: string | null
  /** ## 版本号 */
  version: number
  /** ## 检测项目名称 */
  testItemName: string
  /** ## 收样要求图片 */
  acceptRequireImageSrc: string | null
  /** ## 单位 */
  unit: string | null
  /** ## 参数表格信息列表 */
  paramTableInfoList: IParamTableInfo[]
  /** ## 报告表名称 */
  reportTableName: string | null
  /** ## 报告名称变更 */
  reportNameChange: boolean
  /** ## 是否本地项目 */
  isLocaleItem: string
  /** ## 参数名称 */
  name: string
  /** ## 创建人名称 */
  createName: string
  /** ## 其他平台ID */
  otherPlatformId: string | null
  /** ## 是否化学类 */
  chemically: boolean
  /** ## 是否生成样品编码 */
  isBuildSampleCode: string
  /** ## 更新日期 */
  updateDate: string | null
  /** ## 参数编码 */
  code: string | null
  /** ## 显示名称 */
  displayName: string
  /** ## 排序号 */
  orderNum: number
  /** ## 备注 */
  remark: string
  /** ## 序列化版本UID */
  serialVersionUID: number
  /** ## 是否删除 */
  isDeleted: string
  /** ## 更新人ID */
  updateBy: string | null
  /** ## 报告编码变更 */
  reportCodeChange: boolean
  /** ## 检测参数详情 */
  testParam: ITestParamDetail
  /** ## 记录编码变更 */
  recordCodeChange: boolean
  /** ## 是否临时参数 */
  isTempParam: string
  /** ## 自动添加混合样品 */
  autoAddBlendSample: boolean
  /** ## 创建日期（时间戳） */
  createDate: number
  /** ## 系统ID */
  systemId: string
  /** ## 工时 */
  manHour: number
  /** ## 参数备注 */
  paramNote: string | null
  /** ## 记录表名称 */
  recordTableName: string
  /** ## 创建人ID */
  createBy: string
  /** ## 参数工作日 */
  paramWorkDay: string | null
}
