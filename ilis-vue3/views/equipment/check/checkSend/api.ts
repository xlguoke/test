import { message } from 'ant-design-vue'
import type { PlanEntity } from './component/plan'
import type { IConfirmHistoryEntity } from './component/confirmHistory'
import type { ICustomProperties, ICustomRecord } from './component/customRecord'
import type { CheckSendEntity } from '.'
import { ILISHTTPError } from '~/types'

interface ParamRequest {
  page?: number
  size?: number
  sendCheckDateBegin?: string
  sendCheckDateEnd?: string
  order?: string
  orderBy?: string
  quickQry?: string
  timeRange?: [string, string]
}

/**
 * # 获取送检登记分页列表
 */
export function getCheckSendPage(obj: ParamRequest) {
  obj.sendCheckDateBegin = obj.timeRange?.[0]
  obj.sendCheckDateEnd = obj.timeRange?.[1]
  obj.timeRange = undefined
  return ilisAxios.get<{ count: number, rows: CheckSendEntity[], total: number }>('rest/checkSendController.do?datagrid', {
    params: obj,
  })
}

/**
 * # 新增
 */
export function addCheckSend(data: Partial<CheckSendEntity>, loading?: Ref<boolean>) {
  delete data.createDate
  delete data.updateDate
  return ilisAxios.postForm<any>(`rest/checkSendController.do?save`, data).catch((err) => {
    if (err instanceof ILISHTTPError) {
      message.error(err.message)
      if (loading) {
        loading.value = false
      }
    }
    throw err
  })
}

/**
 * # 删除
 */
export function deleteCheckSend(data: CheckSendEntity[]) {
  return ilisAxios.delete<any>(`rest/checkSendController.do?del`, {
    params: {
      id: data.map(i => i.id).join(','),
    },
  }).catch((err) => {
    if (err instanceof ILISHTTPError) {
      message.error(err.message)
    }
    throw err
  })
}

/**
 * # 获取指定送检登记的信息
 */
export function getCheckSendDetail(id: string) {
  return ilisAxios.get<any>('rest/checkSendController.do?getById', {
    params: {
      sendId: id,
    },
  })
}

/**
 * # 提交送检(到审核流程)
 */
export function submitPlanAudit(obj: Record<string, any>) {
  return ilisAxios.postForm<any>(`/checkSendController.do?submitPlanAudit`, obj)
}

/**
 * # 获取指定送检登记的设备明细
 */
export function getCheckSendDetailDeviceList(data: CheckSendEntity) {
  return ilisAxios.get<any>('rest/checkSendController.do?datagridSendDetail', {
    params: {
      sendId: data.id,
    },
  })
}

/**
 * # 获取检校计划分页列表
 */
export function getPlanPage(obj: Record<string, any>) {
  return ilisAxios.postForm<{ msg: '', rows: PlanEntity[], total: number }>('rest/checkPlanController.do?datagrid', obj)
}

/**
 * # 通过计划id获取设备明细列表
 */
export function getDeviceByPlanId(obj: Record<string, any>) {
  return ilisAxios.postForm<{ msg: '', rows: PlanEntity[], total: number }>('rest/checkPlanController.do?datagridPlanDetail', obj)
}

/**
 * # 获取历史确认记录分页列表
 */
export function getConfirmHistoryPage(obj: Record<string, any>) {
  obj.checkDateBegin = obj.timeRange?.[0]
  obj.checkDateEnd = obj.timeRange?.[1]
  obj.timeRange = undefined
  return ilisAxios.get<{ rows: IConfirmHistoryEntity[], total: number }>(`/rest/checkController/${obj.id}/confirm/history`, {
    params: obj,
  })
}

/**
 * # 获取自定义列
 */
export function getProperties(customizeType: string) {
  return ilisAxios.get<ICustomProperties[]>(`/rest/common/custom-properties`, {
    params: {
      customizeType,
    },
  })
}

/**
 * # 通过记录id获取查看检校明细记录的过程记录
 */
export function getProcess(id: string) {
  return ilisAxios.get<ICustomRecord[]>(`/rest/checkController/${id}/detail/process`)
}

/**
 * # 通过设备id获取参数
 */
export function getParamsByDeviceId(id: string) {
  return ilisAxios.get<{ rows: any[] }>(`/checkItemController.do?datagrid&objId=${id}&rows=100`)
}
