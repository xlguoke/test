import { Modal } from 'ant-design-vue'
import { IlisApiHelper } from '~/utils/IlisApiHelper'
import type { IResponseCommonEntity, IResponseNewRowsEntity } from '~/interface/IResponseEntity.ts'
import { ILISHTTPError } from '~/types'
import type { CheckType, CreateEqCheckEntity } from '~/views/equipment/specialType/check/interface/CreateEqCheck.ts'

/** 特种设备检查数据项 */
export interface EqCheckDataItem {
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

/** 特种设备检查列表参数 */
export interface GetCheckListParams {
  page?: number
  size?: number
  q?: string
  checkType?: CheckType
}

/** 特种设备检查列表 */
export function getCheckList(data: GetCheckListParams) {
  return IlisApiHelper.get<IResponseNewRowsEntity<EqCheckDataItem>>('rest/special/equipment/check-pagination', data)
}

/** 新增特种设备检查 */
export function createEqCheck(data: CreateEqCheckEntity) {
  return IlisApiHelper.post<IResponseCommonEntity<any>>('rest/special/equipment/check', data)
}

/** 更新特种设备检查 */
export function updateEqCheck(data: CreateEqCheckEntity) {
  return IlisApiHelper.put<IResponseCommonEntity<any>>('rest/special/equipment/check', data)
}

/** 特种设备检查详情 */
export function eqCheckDetail(id: string) {
  return IlisApiHelper.get<CreateEqCheckEntity>(`rest/special/equipment/check/${id}`)
}

/** 删除特种设备检查 */
export function delCheckDetail(id: string) {
  return IlisApiHelper.delete<IResponseCommonEntity<any>>(`rest/special/equipment/check/${id}`)
}

/** 导出 */
export function exportCheck(data: GetCheckListParams) {
  return ilisAxios.get<any>('rest/special/equipment/check-export', {
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
