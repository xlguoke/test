export { default as ProcessModal } from './ProcessModal.vue'
export { type IProcessForm } from './ProcessModal.vue'

/**
 * # 审批流程类型
 */
export enum ProcessType {
  /** # 设备购置计划审批 */
  EQ_BUY_PLAN = '10',
  /** # 设备检校计划审批 */
  EQ_CHECK_PLAN = '20',
  /** # 设备检校确认审批 */
  EQ_CHECK_SURE = '30',
  /** # 其他成果审核 */
  OTHER_RESULT = '40',
  /** # 设备期间核查计划审批 */
  EQ_INSPECT_PLAN = '50',
  /** # 设备期间核查记录审批 */
  EQ_INSPECT = '60',
  /** # 设备购置申请审批 */
  EQ_BUY_APPLY = '70',
  /** # 设备购置信息审批 */
  EQ_BUY = '80',
  /** # 设备购置信息验收结果审批 */
  EQ_BUY_ACCEPTANCE = '90',
  /** # 设备保养计划审批 */
  EQ_UPKEEP_PLAN = '100',
  /** # 设备维修信息审批 */
  EQ_REPAIR = '110',
  /** # 设备维修结果验收审批 */
  EQ_REPAIR_VERIFY = '120',
  /** # 设备调拨信息审批 */
  EQ_ALLOT = '130',
  /** # 设备租借信息审批 */
  EQ_RENT = '140',
  /** # 设备启停信息审批 */
  EQ_STARTSTOP = '150',
  /** # 设备报废 */
  EQ_SCRAP = '160',
  /** # 培训计划 */
  COMMON_TRAIN_PLAN = '170',
  /** # 设备调拨申请审批 */
  EQ_TRANSFER_APPLY = '180',
  /** # 规则资料采购审批 */
  STANDARD_BOOK_PURCHASE = '190',
  /** # 供应商评价审批 */
  SUPPLIER_ASSESS = '200',
  /** # 设备送检登记审批 */
  EQ_CHECK_SEND = '210',
  /** # 用印审核 */
  STAMP_AUDIT = '88',
  /** # 规程查新 */
  STANDARD_CHECK_NEW = '300',
  /** 温湿度巡查台账审批 */
  TEM_HUM_AUDIT = '220',
  /** 温湿度巡查异常处理 */
  TEM_HUM_EXECEPTION = '230',
  /** 采购申请审批 */
  PURCHASE_REQUEST = '320',
  /** 设备盘点计划审批 */
  EQ_INVENTORY_PLAN = '340',
  /** 设备盘点记录审批 */
  EQ_INVENTORY_RECORD = '350',
  /** 设备人员授权 */
  EQ_USER_AUTH = '330',
  /** 设备外出申请 */
  EQ_EGRESS_APPLY = '310',
  /** 设备功能核查计划审核 */
  EQUIPMENT_FUNCTION_CHECK_PLAN = '360',
  /** 设备功能核查审核 */
  EQUIPMENT_FUNCTION_CHECK = '361',
  /** 固定资产调拨 */
  ASSET_ALLOT = '362',
}

/**
 * # 审批流程人员节点
 */
export interface IProcessUserNode {
  activitiNodeId: string
  processTaskName: string
  presetUserId: string
  presetUserRealName: string
  presetUsername: string
}

/**
 * # 审批流程表单配置
 */
export interface IProcessFormConfig {
  id: string
  name: string
  type: {
    mimeType: string
    name: string
  }
  value: null
  required: boolean
  readable: boolean
  writable: boolean
}
