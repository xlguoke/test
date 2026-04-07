import type { GetEqAuthUserQuery } from '~/views/equipment/auth/api.ts'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

/** 获取授权控制列表 */
export function getEqAuthList(id: string, query: GetEqAuthUserQuery) {
  return IlisApiHelper.get<any>(`/api/eq/auth/${id}/auth/info`, query)
}

/** 获取用户授权设备 */
export function getUserAuthEqAuth(userId: string, companyId: string) {
  return IlisApiHelper.get<any>(`/api/eq/auth/${userId}/eq/info`, {
    companyId,
  })
}
