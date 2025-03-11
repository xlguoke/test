import { Modal } from 'ant-design-vue'
import { IlisApiHelper } from '~/utils/IlisApiHelper'
import type { IResponseCommonEntity, IResponseNewRowsEntity } from '~/interface/IResponseEntity.ts'
import type { GetPurchaseListParams, PurchaseListItem } from '~/views/common/purchaseRequest/interface/purchaseList.ts'
import type { PurchaseEntity } from '~/views/common/purchaseRequest/interface/purchase.ts'
import { ILISHTTPError } from '~/types'

/** 耗材管理数据项 */
export interface ConsumablesDataItem {
  standard: ''
  updateDate: 1720073754000
  type: '标准物质'
  managerName: '管理员'
  sysCompanyCode: 'A03'
  operatorName: '管理员'
  auditPersonName: '管理员'
  updateBy: 'xiangl'
  unitCode: 'gfzx'
  inventoryAlarmAmount: 20
  auditPersonId: '8a8ab0b246dc81120146dc8181950052'
  departId: null
  id: '402882c181b90f5b0181cdb2f1160b1a'
  sn?: string
  depart?: string
  operatorId: '8a8ab0b246dc81120146dc8181950052'
  createDate: 1657013465000
  amount: 160
  managerId: '8a8ab0b246dc81120146dc8181950052'
  updateName: 'xl_test'
  amountUnit: '米'
  site: ''
  createBy: 'admin'
  name: '电缆'
  sysOrgCode: null
  createName: '管理员'
}

/** 化学品数据项 */
export interface ChemicalDataItem {
  id: '402882c18948ae84018948f9db4203b6'
  name: 'ww氯化钠9898'
  sn: '12134'
  chemicalType: '化学溶液'
  manageLevel: '4级'
  effect: '试验用兔'
  purity: '分析纯度'
  concentration: '0.05'
  unit: 'mL'
  amount: 0
  warningAmount: 50
  lastUpdateTime: null
}

/** 耗材列表参数 */
export interface ConsumablesListParams {
  quickQryParam?: string
}

export interface ChemicalListParams {
  quickQry?: string
}

/** 采购申请列表 */
export function purchaseList(data: GetPurchaseListParams) {
  return IlisApiHelper.get<IResponseNewRowsEntity<PurchaseListItem>>('rest/purchase/pagination', data)
}

export function purchaseDetails(id: string) {
  return IlisApiHelper.get<PurchaseEntity>(`rest//purchase/${id}`)
}

/** 获取耗材列表 */
export function getConsumablesList(params: ConsumablesListParams) {
  return IlisApiHelper.get<IResponseNewRowsEntity<ConsumablesDataItem>>('consumablesController.do?datagrid', params)
}

/** 获取化学品列表 */
export function getChemicalList(params: ConsumablesListParams) {
  return IlisApiHelper.get<IResponseNewRowsEntity<ChemicalDataItem>>('rest/chemical/inventory/paginationByCategory', params)
}

/** 创建采购申请 */
export function createPurchase(data: PurchaseEntity) {
  return IlisApiHelper.post<IResponseCommonEntity<any>>('rest/purchase', data)
}

/** 更新采购申请 */
export function updatePurchase(data: PurchaseEntity) {
  return IlisApiHelper.put<IResponseCommonEntity<any>>('rest/purchase', data)
}

/** 删除采购申请 */
export function deletePurchase(id: string) {
  return IlisApiHelper.delete<IResponseCommonEntity<any>>(`rest/purchase/${id}`)
}

/** 提交审核 */
export function submitAudit(data: any) {
  return IlisApiHelper.post<IResponseCommonEntity<any>>(`rest/purchase/submit`, data)
}

/** 导出 */
export function purchaseExport(data: GetPurchaseListParams) {
  return ilisAxios.get<any>('rest/purchase/export', {
    params: data,
    responseType: 'blob',
  }).catch((err) => {
    if (err instanceof ILISHTTPError) {
      Modal.error({
        title: '提示',
        content: err.message,
        centered: true,
        okText: '确定',
      })
    }
    throw err
  })
}
