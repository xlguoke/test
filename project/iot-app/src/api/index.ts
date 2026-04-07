import { usePermissionStore } from '@/stores'
import { IsNeedAuth } from '@/stores/modules/permissionStore'
import request from '@/utils/request'

export async function queryProse(): Promise<any> {
  return request('/prose')
}

export enum ControlType {
  CLOSE = 0,
  OPEN = 1,
}

export interface TemHumControl {
  iotEqId?: string
  laboratoryId?: string
  type?: 'tem' | 'hum' | 'all'
  minTem?: number
  maxTem?: number
  minHum?: number
  maxHum?: number
}
export interface LaboratoryDeviceStatus {
  /** # 空调开关状态 */
  temIotStatus: boolean
  /** # 空调的当前温度（在空调开启的情况下，温度大于房间温度展示升温，温度小于房间温度展示降温） */
  temIotValue: number
  /** # 加湿器开关状态 */
  addHumIotStatus: boolean
  /** # 除湿器开关状态 */
  subHumIotStatus: boolean
}
/** # 查询全部检测室 */
export async function getLaboratory(obj: Record<string, any>): Promise<any> {
  return request.get('/rest/laboratory/controller?dataGridPage', {
    params: obj,
  })
}
/** # 查询全部检测室（不带物联网信息，用于表单下拉框加载） */
export async function getLaboratoryWithoutIOT(obj: Record<string, any>): Promise<any> {
  const { isNeedAuth } = usePermissionStore()
  if (isNeedAuth === IsNeedAuth.NO) {
    obj = { ...obj, sysCompanyCode: 'A01' }
  }
  return request.get('/api/indoor-screen/lab-list', {
    params: obj,
  })
}

/** # 获取任务下的试验人员 */
export async function getPersonByTask(taskId: string): Promise<any> {
  return request.get(`/api/indoor-screen/test/task/${taskId}/person`)
}

/** # 查询检测室设备状态 */
export async function getLaboratoryDeviceStatusData(ids: string) {
  const { isNeedAuth } = usePermissionStore()
  const apiUrl = isNeedAuth === IsNeedAuth.YES ? `/rest/laboratory/controller/batch/get` : `/api/indoor-screen/lab/iot-eq/get`
  const { data } = await request.post<Record<string, LaboratoryDeviceStatus>>(apiUrl, { ids })
  return data
}

/**  控制所有功能室 恒温恒湿开关 */
export async function displayconAll(data: TemHumControl, status: ControlType): Promise<any> {
  return request.post(`/rest/humiture/display/con/all/lab/${status}`, data)
}
