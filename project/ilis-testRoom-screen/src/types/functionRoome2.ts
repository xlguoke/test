/** 分页参数 */
interface Page {
  page: number
  size: number
}

/** ## 版本 */
export enum VERSION {
  /** 2024版 */
  V1 = "V1",
  /** 2025版 */
  V2 = "V2"
}

/** ## 留样室详情-查询类型 */
export enum SampleStorageRoomQueryTypeEnum {
  /** 所有 */
  ALL = "ALL",
  /** 入库 */
  IN = "IN",
  /** 出库 */
  OUT = "OUT",
  /** 七日内到期 */
  SEVEN_DAY_EXPIRE = "SEVEN_DAY_EXPIRE",
  /** 三日内到期 */
  THREE_DAY_EXPIRE = "THREE_DAY_EXPIRE",
  /** 当日到期 */
  TODAY_EXPIRE = "TODAY_EXPIRE",
  /** 已超期 */
  EXPIRED = "EXPIRED",
  /** 今日入库 */
  TODAY_IN = "TODAY_IN",
  /** 今日出库 */
  TODAY_OUT = "TODAY_OUT",
  /** 本周入库 */
  WEEK_IN = "WEEK_IN",
  /** 本周出库 */
  WEEK_OUT = "WEEK_OUT",
  /** 本月入库 */
  MONTH_IN = "MONTH_IN",
  /** 本月出库 */
  MONTH_OUT = "MONTH_OUT"
}

/** ## 留样室详情-查询参数 */
export interface SampleStorageRoomQueryParams extends Page {
  sampleQry?: string // 样品名称查询
  queryType: SampleStorageRoomQueryTypeEnum
  labId?: string // 功能室id
  version?: VERSION // 版本
}

/** ## 留样室详情-列表 */
export interface SampleStorageRoomData {
  id: string
  bigCategoryName?: string
  testObjectId: string
  consignId: string
  testSampleDisplayName: string
  testObjectCode: string
  sampleNum: string
  standard: string
  reserveTime: number
  reserveOverDue: number
  inOperator: string
  inSaveSite: string
  laboratoryName: string
  inAmount: string
  outOperator?: string
  outTime?: string
  status?: string // 到期状态，前端计算
}

/** 标养室详情-列表 */
export interface StandardRoomData {
  standard: string
  operationDate: number | string // 出入库日期
  planTestTime: number
  sampleNum: string
  formingDate: number //制样日期
  periodCode: string
  operator: string
  periodHours: number //单位小时
  saveSite: string //存放地点
  processObjectId: string
  testObjectId: string
  consignInfoId: string
  testTaskId?: string
  bigCategoryName: string
  periodDays: string //龄期
  producer: string //入库人员
  operationType: string //1入库 2出库
  id: string
  testSampleDisplayName: string
  testObjectCode: string
  isTested: string //是否已检测 0未检测 1已检测
  status?: string // 状态，前端计算
  expireDate?: string // 到期日期 制样日期+periodHours=到期日期，前端计算
}

/** 标准物质间详情 - 列表 */
export interface StandardSubstanceRoomData {
  id: string
  sn?: string
  type: string // 类别
  name: string // 物资名称
  standard: string // 型号
  /** 1-入库 2-出库 */
  recordType: string
  outType?: string
  mixedInOrOutType: string
  recordDate: string // 记录时间
  recordCount: number
  amount: number | string
  amountUnit: string
  amountWithUnit: string //本次出入库数量
  inOperator: string
  inManager: string
  inAuditor: string
  outRecorder?: string
  outOperator?: string
  site: string //存放地点
  depart?: string //所属部门
  departId?: string
  recordPersonId?: string
  recordPersonName?: string
  operatorId: string
  operatorName: string //经手人
  managerId: string
  managerName: string
  auditPersonId: string
  auditPersonName: string
  status?: string
}

/** 外检室详情 - 列表 */
export interface ExternalCheckRoomData {
  standard: string //规格型号
  borrowUser: string //借用人
  egressTime: number //借用时间
  egressId: string
  name: string //设备名称
  accuracy?: string //精度
  eqRange: string //量程
  equipmentSn: string //设备编码
  expectReturnTime?: string //预还时间
  status?: string
}

/** 样品室 - 列表 */
export interface SampleRoomData {
  standard: string
  saveSite: string
  laboratoryName: string
  testObjectId: string
  consignId: string
  bigCategoryName: string
  sampleNum: string
  id: string
  testSampleDisplayName: string
  testObjectCode: string
  operator: string
  testTaskCode: string
  operationTime: number
  type?: string // 0 出库 00 入库
  status?: string
}

/** 药品室 - 列表 */
export interface ChemicalRoomData {
  id: string
  categoryId: string
  chemicalType: string
  name: string
  sn: string
  acronym: string
  manageLevel: string
  manageLevelId: string
  amount: number
  warningAmount: number
  unit: string
  purity: string
  concentration: string
  specification: string
  effect: string
  sourceFrom: string
  status: string
  productionDate: Date
  invalidDate: Date
  packing?: string
  allowChangeContainer: boolean
  storageLocation: string
  returnType?: string
  remark: string
  keepers: string
  keeperIds: string
  managers: string
  managerIds?: string
  acceptors: string
  acceptorIds?: string
  createStatus: string
  manufacturer: string
}
