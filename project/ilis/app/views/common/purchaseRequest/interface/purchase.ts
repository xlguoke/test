import type { RequestStatusType, RequestType } from '~/views/common/purchaseRequest'

/**
 * PurchaseRequestDTOOnCreate
 */
export class PurchaseEntity {
  id?: string

  requestCode?: string
  /**
   * 申请人
   */
  applicant?: string
  /**
   * 申请备注
   */
  description?: string
  /**
   * 明细
   */
  items: PurchaseRequestItem[] = []
  /**
   * 申请部门
   */
  requestDepartment?: string
  /**
   * 申请部门ID
   */
  requestDepartmentId?: string
  /**
   * 申请原因
   */
  requestReason?: string
  /**
   * 申请时间
   */
  requestTime?: string
  /**
   * 申请单类型
   */
  requestType?: RequestType
  /**
   * 状态
   */
  status?: RequestStatusType
}

/**
 * 采购申请明细表 数据流转对象
 *
 * PurchaseRequestItemDTOOnUpdate
 */
export class PurchaseRequestItem {
  /**
   * 数量
   */
  amount?: number
  /**
   * 编号
   */
  code?: string
  /**
   * 备注
   */
  description?: string
  /**
   * 名称
   */
  name?: string
  /**
   * 数据来源ID(耗材来源于t_eq_consumables，化学品来源于t_chemical，后续如果存在其他的请自行添加并补充注释)
   */
  sourceId?: string
  /**
   * 规格
   */
  standard?: string
  /**
   * 单位
   */
  unit?: string
}
