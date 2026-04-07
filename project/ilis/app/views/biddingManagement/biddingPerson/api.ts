import { IlisApiHelper } from '~/utils/IlisApiHelper.ts'

interface GetUseRelateUserQuery {
  page: number
  size: number
  queryParam?: string
  realName?: string
}

/**
 * 获取关联用户
 */
export function getUseRelateUser(query: GetUseRelateUserQuery) {
  return IlisApiHelper.get<any>(`/biddingPersonController/exclude/user`, query)
}

/**
 * 关联用户管理系统账号
 */
export function relateAccount(id: string, userId: string) {
  return IlisApiHelper.put<any>(`/biddingPersonController/${id}/relevance/${userId}`)
}

/**
 * 删除用户的系统账号关联关系
 */
export function deleteRelateAccount(id: string) {
  return IlisApiHelper.delete<any>(`/biddingPersonController/${id}/relevance`)
}

/**
 * 导出用户Qr信息
 */
export function exportUserQrInfo(data: any) {
  return IlisApiHelper.post<any>(`/biddingPersonController?download`, data, {
    responseType: 'blob',
  })
}
