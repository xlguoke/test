import type { IResponseCommonEntity } from '~/interface/IResponseEntity.ts'
import { IlisApiHelper } from '~/utils/IlisApiHelper.ts'

interface SaveDashboardSelectEntity {
  bigCategoryId: string
  dashboardOrderNum: number
}

export interface DashboardSelectDTO {
  bigCategoryId: string
  dashboardOrderNum: number
  bigCategoryName: string
}

/** 列表 */
export function getDashboardList() {
  return IlisApiHelper.get<IResponseCommonEntity<any>>('/bigCategoryController/dashboard/list')
}

/** 保存 */
export function saveDashboardSelect(data: SaveDashboardSelectEntity[]) {
  return IlisApiHelper.post<IResponseCommonEntity<any>>('/bigCategoryController/dashboard/select', data)
}

/** 删除 */
export function delDashboardSelect(data: string[]) {
  return IlisApiHelper.delete<IResponseCommonEntity<any>>('/bigCategoryController/dashboard/del', {}, {
    data,
  })
}
