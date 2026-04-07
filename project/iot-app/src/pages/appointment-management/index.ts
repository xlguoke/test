import { usePermissionStore } from '@/stores'
import { IsNeedAuth } from '@/stores/modules/permissionStore'
import { AnyDictionaryHelper } from '@/utils/AnyDictionaryHelper'
import request from '@/utils/request'

/** 控制类型 */
export enum CustomType {
  不处理 = 'SET',
  自动关闭设备 = 'CLOSE',
}

/** 预约状态 */
export enum ResStatus {
  已预约 = 'OPEN',
  已取消 = 'CLOSE',
}

/** 预约类型 */
export enum LaboratoryIotEqType {
  功能室 = 'LAB',
  调养箱 = 'BOX',
}

/** 控制类型下拉 */
export const CustomTypeDict = AnyDictionaryHelper.createDictionaryArray([
  { label: '不处理', key: CustomType.不处理 },
  { label: '自动关闭设备', key: CustomType.自动关闭设备 },
])

/** 控制类型下拉 */
export const LaboratoryIotEqTypeDict = AnyDictionaryHelper.createDictionaryArray([
  { label: '功能室', key: LaboratoryIotEqType.功能室 },
  { label: '调养箱', key: LaboratoryIotEqType.调养箱 },
])

/** 温湿度预约新增 */
export function createHumitureRes(data: Record<string, any>) {
  const { isNeedAuth } = usePermissionStore()
  const apiUrl = isNeedAuth === IsNeedAuth.YES ? `rest/humiture/res` : `/api/indoor-screen/humiture/res`
  return request.post<any>(apiUrl, data)
}

/** 温湿度预约编辑 */
export function editHumitureRes(params: Record<string, any> & { id: string }) {
  const { isNeedAuth } = usePermissionStore()
  const apiUrl = isNeedAuth === IsNeedAuth.YES ? `rest/humiture/res/${params.id}` : `/api/indoor-screen/humiture/res/${params.id}`
  return request.put<any>(apiUrl, params)
}

/** 获取任务关联温湿度 */
export function getTaskHumiture(id: string) {
  const { isNeedAuth } = usePermissionStore()
  const apiUrl = isNeedAuth === IsNeedAuth.YES ? `/rest/humiture/res/task/${id}` : `/api/indoor-screen/humiture/res/task/${id}`
  return request.post<any>(apiUrl)
}

/** 获取试验任务下检测参数配置的温湿度 */
export function getHumitureTestParamConfig(labId: string, taskId: string) {
  const { isNeedAuth } = usePermissionStore()
  const apiUrl = isNeedAuth === IsNeedAuth.YES ? `rest/humiture/res/${labId}/${taskId}/param/config` : `/api/indoor-screen/humiture/res/${labId}/${taskId}/param/config`
  return request.post<any>(apiUrl)
}
