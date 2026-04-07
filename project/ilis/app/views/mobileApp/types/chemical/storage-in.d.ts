/**
 * 化学品入库登记模块类型定义
 */

/** 入库登记列表查询参数 */
export interface StorageInListQueryParams {
  /** 每页数量 */
  size: number
  /** 页码 */
  page: number
  /** 搜索关键词 - 化学名称/化学品编号/品名/保管人 */
  quickQry?: string
  /** 入库类型 */
  inventoryType?: string
  /** 入库状态 */
  inventoryStatus?: string
  /** 化学名称 */
  categoryName?: string
  /** 管理级别ID */
  manageLevelId?: string
  /** 生产日期开始 */
  productionDateStart?: string
  /** 生产日期结束 */
  productionDateEnd?: string
  /** 失效日期开始 */
  invalidDateStart?: string
  /** 失效日期结束 */
  invalidDateEnd?: string
  /** 入库日期开始 */
  putawayDateStart?: string
  /** 入库日期结束 */
  putawayDateEnd?: string
  /** 是否更换容器 */
  allowChangeContainer?: string
  /** 排序字段 */
  orderBy?: string
  /** 排序方式 */
  order?: 'asc' | 'desc'
}

/** 入库登记列表项 */
export interface StorageInListItem {
  /** 入库ID */
  id: string
  /** 化学品ID */
  chemicalId?: string
  /** 采购ID */
  purchaseId?: string
  /** 分类ID */
  categoryId?: string
  /** 分类名称 */
  categoryName?: string
  /** 化学名称 */
  name?: string
  /** 化学品编号 */
  sn?: string
  /** 缩写标识 */
  acronym?: string
  /** 管理级别 */
  manageLevel?: string
  /** 管理级别ID */
  manageLevelId?: string
  /** 数量 */
  amount?: string
  /** 计量单位 */
  unit?: string
  /** 纯度 */
  purity?: string
  /** 浓度 */
  concentration?: string
  /** 规格型号 */
  specification?: string
  /** 用途 */
  effect?: string
  /** 化学品来源 */
  sourceFrom?: string
  /** 状态描述 */
  status?: string
  /** 生产日期 */
  productionDate?: string
  /** 失效日期 */
  invalidDate?: string
  /** 包装方式 */
  packing?: string
  /** 是否允许更换容器 */
  allowChangeContainer?: boolean
  /** 存放位置 */
  storageLocation?: string | null
  /** 返还类型 */
  returnType?: string | null
  /** 备注 */
  remark?: string
  /** 保管人 */
  keepers?: string
  /** 保管人ID */
  keeperIds?: string
  /** 监管人 */
  managers?: string | null
  /** 监管人ID */
  managerIds?: string | null
  /** 入库类型 */
  inventoryType?: string
  /** 入库状态 */
  inventoryStatus?: string
  /** 入库批次 */
  inventoryBatch?: string
  /** 入库批号 */
  inventoryBatchSn?: string
  /** 入库数量 */
  inventoryAmount?: string
  /** 入库前数量 */
  beforeAmount?: string
  /** 入库后数量 */
  afterAmount?: string
  /** 入库日期 */
  putawayDate?: string
  /** 生产厂家 */
  manufacturer?: string
  /** 采购批号 */
  purchaseBatchSn?: string
  /** 证书编号 */
  certificateSn?: string
  /** 供应商 */
  supplier?: string
  /** 采购日期 */
  purchaseDate?: string
  /** 采购单号 */
  purchaseSn?: string
  /** 采购数量 */
  purchaseAmount?: string
  /** 自定义字段值 */
  customValues?: CustomFieldValue[] | null
}

/** 自定义字段值 */
export interface CustomFieldValue {
  /** 字段ID */
  columnId: string
  /** 字段值 */
  columnValue: string
}

/** 附件信息 */
export interface AttachmentInfo {
  /** 附件ID */
  id: string
  /** 文件名 */
  name: string
  /** 文件URL */
  url?: string
  /** 文件URL */
  realpath: string
  /** 文件名 */
  attachmenttitle: string
  status?: string
}

/** 入库登记详情 */
export interface StorageInDetail {
  /** 化学品信息 */
  chemicalVO: ChemicalInfo
  /** 采购信息 */
  purchaseVO?: PurchaseInfo
  /** 入库信息 */
  inventoryInVO: InventoryInInfo
  /** 自定义字段值 */
  customValues?: CustomFieldValue[]
  /** 附件信息 */
  attachments?: AttachmentInfo[]
}

/** 化学品信息 */
export interface ChemicalInfo {
  /** ID */
  id?: string
  /** 化学名称 */
  categoryName?: string
  categoryId?: string
  /** 品名 */
  name: string
  /** 化学品编号 */
  sn: string
  /** 生产日期 */
  productionDate: string
  /** 失效日期 */
  invalidDate: string
  /** 保管人ID */
  keeperIds: string
  /** 保管人名称 */
  keepers: string
  /** 管理级别 */
  manageLevel?: string
  /** 管理级别ID */
  manageLevelId?: string
  /** 计量单位 */
  unit?: string
  /** 纯度 */
  purity?: string
  /** 浓度 */
  concentration?: string
  /** 规格型号 */
  specification?: string
  /** 用途 */
  effect?: string
  /** 包装方式 */
  packing?: string
  /** 化学品来源 */
  sourceFrom?: string
  /** 状态描述 */
  status?: string
  /** 缩写标识 */
  acronym?: string
  /** 配置日期 */
  confectDate?: string
  /** 备注 */
  remark?: string
  /** 验收人ID */
  acceptorIds?: string
  /** 验收人名称 */
  acceptors?: string

  /** --- 保存时需要的字段 --- */
  managers?: string
  managerIds?: string
  allowChangeContainer?: string | boolean
  storageLocation?: string | null
}

/** 采购信息 */
export interface PurchaseInfo {
  id?: string
  chemicalId?: string
  /** 生产厂家 */
  manufacturer?: string
  /** 生产批号 */
  batchSn?: string
  /** 证书编号 */
  certificateSn?: string
  /** 供应商 */
  supplier?: string
  /** 采购日期 */
  purchaseDate?: string
  /** 采购批号 */
  purchaseSn?: string
  /** 采购数量 */
  purchaseAmount?: number
}

/** 入库信息 */
export interface InventoryInInfo {
  chemicalId?: string
  /** ID */
  id?: string
  /** 入库批号 */
  batchSn?: string
  /** 入库批次 */
  batch?: string
  /** 入库类型 */
  type?: string
  /** 入库数量 */
  amount?: number
  /** 入库日期 */
  putawayDate?: string
  /** 存放位置 */
  storageLocation?: string
  /** 监管人ID */
  managerIds?: string
  /** 监管人名称 */
  managers?: string
  /** 是否允许更换容器 */
  allowChangeContainer?: string | boolean
}

/** 新增/编辑入库登记表单 */
export interface StorageInSaveForm {
  /** 化学品信息 */
  chemicalVO: ChemicalInfo
  /** 采购信息 */
  purchaseVO: PurchaseInfo
  /** 入库信息 */
  inventoryInVO: InventoryInInfo
  /** 自定义字段值 */
  customValues: CustomFieldValue[]
  /** 附件信息 */
  attachments: AttachmentInfo[]
}

/** 采购申请单列表查询参数 */
export interface PurchaseApplyListQueryParams {
  /** 每页数量 */
  size: number
  /** 页码 */
  page: number
  /** 搜索关键词 */
  keyword?: string
  /** 申请单状态 */
  status?: string
  /** 申请类型 */
  requestType?: string
}

/** 采购申请单列表项 */
export interface PurchaseApplyListItem {
  /** 申请单ID */
  id: string
  /** 申请单编号 */
  requestCode: string
  /** 申请类型 */
  requestType: string
  /** 申请原因 */
  requestReason?: string
  /** 申请部门ID */
  requestDepartmentId?: string
  /** 申请部门 */
  requestDepartment?: string
  /** 申请人 */
  applicant: string
  /** 申请时间 */
  requestTime?: string
  /** 描述 */
  description?: string | null
  /** 状态 */
  status: string
  /** 明细列表（展开时加载） */
  items?: PurchaseApplyDetailSubItem[]
}

/** 采购申请单明细项 */
export interface PurchaseApplyDetailItem extends PurchaseApplyListItem {
  /** 明细列表 */
  items: PurchaseApplyDetailSubItem[]
  /** 是否已删除 */
  deleted?: boolean
}

/** 采购申请单明细子项 */
export interface PurchaseApplyDetailSubItem {
  /** 明细ID */
  id: string
  /** 采购申请ID */
  purchaseRequestId: string
  /** 源ID */
  sourceId: string
  /** 编号 */
  code: string
  /** 化学名称 */
  name: string
  /** 规格 */
  standard: string
  /** 数量 */
  amount: number
  /** 单位 */
  unit: string
  /** 描述 */
  description?: string
}

/** 按采购申请批量保存参数 - 传入StorageInSaveForm数组 */
export type BatchSaveByApplyForm = StorageInSaveForm[]

/** 入库明细项（用于按采购申请新增） */
export interface StorageInItem {
  /** 明细ID */
  _id: string
  /** 分类ID */
  categoryId?: string
  /** 分类名称 */
  categoryName?: string
  /** 品名 */
  name: string
  /** 编号 */
  sn: string
  /** 规格 */
  specification?: string
  /** 数量 */
  amount?: number
  /** 单位 */
  unit?: string
  /** 生产日期 */
  productionDate?: string
  /** 失效日期 */
  invalidDate?: string
  /** 入库日期 */
  putawayDate?: string
  /** 存放位置 */
  storageLocation?: string
  /** 保管人 */
  keepers?: string
  /** 保管人ID */
  keeperIds?: string
  /** 监管人 */
  managers?: string
  /** 监管人ID */
  managerIds?: string
}

/** 入库类型选项 */
export interface InventoryTypeOption {
  /** 类型值 */
  value: string
  /** 类型标签 */
  label: string
}

/** 管理级别选项 */
export interface ManageLevelOption {
  /** 级别值 */
  value: string
  /** 级别标签 */
  label: string
}

/** 人员选项 */
export interface PersonOption {
  /** 人员ID */
  id: string
  /** 人员名称 */
  name: string
  /** 部门 */
  department?: string
}

/** 化学品选项 */
export interface ChemicalOption {
  /** 化学品ID */
  id: string
  /** 化学名称 */
  name: string
  /** 化学品编号 */
  code: string
  /** 管理级别 */
  manageLevel?: string
  /** 计量单位 */
  unit?: string
}

// 分页响应结构
export interface PageResponse<T = any> {
  /** 数据列表 */
  rows: T[]
  /** 总记录数 */
  count: number
}
