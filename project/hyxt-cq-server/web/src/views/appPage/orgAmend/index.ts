/** 流程节点类型 */
export enum NODE_TYPE {
  /** 阅示 */
  REVIEW = "REVIEW",
  /** 阅处 */
  PROCESSING = "PROCESSING",
  /** 阅办 */
  EXECUTION = "EXECUTION"
}

/** 流程节点类型 */
export const NODE_TYPE_DICT = [
  { label: "阅示", value: NODE_TYPE.REVIEW },
  { label: "阅处", value: NODE_TYPE.PROCESSING },
  { label: "阅办", value: NODE_TYPE.EXECUTION }
]

/** 状态 */
export enum NODE_STATUS {
  /** 填写中 */
  IN_FILLING = "IN_FILLING",
  /** 待阅示 */
  PENDING_REVIEW = "PENDING_REVIEW",
  /** 待阅处 */
  PENDING_PROCESSING = "PENDING_PROCESSING",
  /** 待阅办 */
  PENDING_EXECUTION = "PENDING_EXECUTION",
  /** 已完结 */
  COMPLETED = "COMPLETED"
}

/** 状态 */
export const NODE_STATUS_DICT = [
  { label: "填写中", value: NODE_STATUS.IN_FILLING },
  { label: "待阅示", value: NODE_STATUS.PENDING_REVIEW },
  { label: "待阅处", value: NODE_STATUS.PENDING_PROCESSING },
  { label: "待阅办", value: NODE_STATUS.PENDING_EXECUTION },
  { label: "已完结", value: NODE_STATUS.COMPLETED }
]

export const columns = [
  { title: "名称", dataIndex: "name" },
  { title: "用户名", dataIndex: "username" },
  { title: "保管人", dataIndex: "custodian" },
  { title: "电话", dataIndex: "custodianPhone" }
]
