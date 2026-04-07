import { usePermissionStore } from '@/stores'
import { IsNeedAuth } from '@/stores/modules/permissionStore'
import request from '@/utils/request'

/** 获取功能室下绑定的物联网设备 */
export function getRoomDivece(id: string) {
  const { isNeedAuth } = usePermissionStore()
  const apiUrl = isNeedAuth === IsNeedAuth.YES ? `/rest/eq/iots/env/${id}` : `/api/indoor-screen/eq/iots/env/${id}`
  return request.get<any>(apiUrl)
}
