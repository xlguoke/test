import { usePermissionStore } from '@/stores'
import { IsNeedAuth } from '@/stores/modules/permissionStore'
import { AnyDictionaryHelper } from '@/utils/AnyDictionaryHelper'
import request from '@/utils/request'

export interface IHumitureLog {
  name: '试验室1'
  iotEqType: 'LAB'
  laboratoryName: '功能室'
  createDate: 1732536935000
  type: 'CON'
  commandWay: 'RES'
  reqStatus: 'SUCCESS'
  source: null
  operator: '管理员'
  operationDate: 1732536921000
  content: null
  remark: null
}

/** 状态 */
export enum StatusType {
  开启 = 'OPEN',
  关闭 = 'CLOSE',
}

export enum CreateType {
  预约 = 'RES',
  定时任务 = 'TIMER',
}

/** 控制方式 */
export enum CommandWayType {
  定时 = 'TIMER',
  预约 = 'RES',
  立刻 = 'NOW',
}

/** 控制方式 */
export const CommandWayTypeDict = AnyDictionaryHelper.createDictionaryArray([
  {
    key: CommandWayType.定时,
    label: '定时',
  },
  {
    key: CommandWayType.预约,
    label: '预约',
  },
  {
    key: CommandWayType.立刻,
    label: '立刻',
  },
])

/** 控制结果 */
export enum ReqStatus {
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
}

/** 控制结果 */
export const ReqStatusDict = AnyDictionaryHelper.createDictionaryArray([
  {
    key: ReqStatus.SUCCESS,
    label: '成功',
  },
  {
    key: ReqStatus.FAIL,
    label: '失败',
  },
])

/** 定时设置列表 */
export function getHumitureTimerList(data: Record<string, any>) {
  const params = { ...data }
  params.status = params.status ? StatusType.开启 : undefined
  const { isNeedAuth } = usePermissionStore()
  const apiUrl = isNeedAuth === IsNeedAuth.YES ? `rest/humiture/page` : `/api/indoor-screen/humiture/page`
  return request.get<any>(apiUrl, {
    params,
  })
}

/** 功能室详情 */
export function getRoomDetail(id: string) {
  const { isNeedAuth } = usePermissionStore()
  const apiUrl = isNeedAuth === IsNeedAuth.YES ? `/rest/laboratory/controller/${id}` : `/api/indoor-screen/lab/${id}`
  return request.get<any>(apiUrl)
}

/** 温湿度预约控制列表 */
export function getHumitureResList(data: Record<string, any>) {
  const params = { ...data }
  params.status = params.status ? StatusType.开启 : undefined
  params.notBackIssue = params.notBackIssue !== false
  params.onlyOne = params.onlyOne ? true : undefined
  const { isNeedAuth } = usePermissionStore()
  const apiUrl = isNeedAuth === IsNeedAuth.YES ? `/rest/humiture/res/page` : `/api/indoor-screen/humiture/res/page`
  return request.get<any>(apiUrl, {
    params,
  })
}

/** 温湿度预约删除 */
export function delHumitureRes(id: string) {
  const { isNeedAuth } = usePermissionStore()
  const apiUrl = isNeedAuth === IsNeedAuth.YES ? `rest/humiture/res/${id}` : `/api/indoor-screen/humiture/${id}`
  return request.delete<any>(apiUrl)
}

/** 控制记录列表 */
export function getHumitureLogList(data: Record<string, any>) {
  const params = { ...data }
  const { isNeedAuth } = usePermissionStore()
  const apiUrl = isNeedAuth === IsNeedAuth.YES ? `/rest/humiture/log/page` : `/api/indoor-screen/humiture/log/page`
  return request.get<any>(apiUrl, { params })
}
