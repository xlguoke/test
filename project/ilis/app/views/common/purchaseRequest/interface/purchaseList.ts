import type { RequestStatusType, RequestType } from '~/views/common/purchaseRequest'

export class GetPurchaseListParams {
  /**
   * 申请人
   */
  applicant?: string
  page?: number
  /**
   * 申请单号
   */
  requestCode?: string
  /**
   * 申请日期结束
   */
  requestDateEnd?: string
  /**
   * 申请日期开始
   */
  requestDateStart?: string
  /**
   * 申请部门ID
   */
  requestDepartmentId?: string
  /**
   * 申请类型
   * CONSUMABLE :耗材
   * CHEMICAL :化学品
   * OTHER :其他
   */
  requestType?: RequestType
  size?: number
  /**
   * 状态
   * IN_FILLING :填写中
   * PENDING_SUBMIT :待提交
   * UNDER_REVIEW :审核中
   * NOT_APPROVED :未通过
   * COMPLETED :已完成
   */
  status?: RequestStatusType
}

export interface PurchaseListItem {
  id: '2c912081938746f00193875de3640020'
  requestCode: '202412020001'
  requestType: 'CONSUMABLE'
  requestReason: '没有啦'
  requestDepartmentId: '2c9284d5767eda4a01768438f1f4009e'
  requestDepartment: '科技设备处'
  applicant: '管理员'
  requestTime: 1733142898000
  description: '越统多或群直从动用象人起天。界斯她次识领而单标反际我志应。许月名王响件同听写社情么设打更。界比在特格完从传立切办权社老么住也。可头步今正了处存育才部照年铁活开才。'
  status: 'NOT_APPROVED'
}
