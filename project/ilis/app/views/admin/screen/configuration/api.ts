import type { ScreenConfigEntity, ScreenTypeEntity } from '.'

interface ScreenConfigRequest {
  page?: number
  size?: number
  screenType?: string
  orderBy?: string
  order?: string
  quickQry?: string
}

/**
 * 获取屏幕配置分页列表
 * @param obj
 */
export function getScreenConfigPage(obj: ScreenConfigRequest) {
  return ilisAxios.get<{ count: number, rows: ScreenConfigEntity[], total: number }>('rest/smart-screen/config/pager', {
    params: obj,
  })
}

/**
 * 新增屏幕配置
 * @param obj
 */
export function addScreenConfig(obj: ScreenConfigEntity) {
  return ilisAxios.post<ScreenConfigEntity>(`rest/smart-screen/config/add`, obj)
}

/**
 * 修改屏幕配置
 * @param obj
 */
export function editScreenConfig(obj: ScreenConfigEntity) {
  return ilisAxios.post<ScreenConfigEntity>(`rest/smart-screen/config/edit`, obj)
}

/**
 * 删除屏幕配置
 * @param obj
 */
export function deleteScreenConfig(obj: ScreenConfigEntity) {
  return ilisAxios.delete<ScreenConfigEntity>(`rest/smart-screen/config/delete/${obj.id}`)
}
/**
 * 字典查询
 * @param code
 */
export function getDictByCode(code: string) {
  return ilisAxios.get<ScreenTypeEntity[]>(`rest/dictionaryController/types`, {
    params: {
      code,
    },
  })
}

/**
 * 编号候选数据接口
 */
export function getUnused() {
  return ilisAxios.get<any[]>('rest/smart-screen/license/unused')
}

/**
 * 重启指定屏
 * @param ids
 */
export function restartBatch(ids: string) {
  return ilisAxios.get<any>('rest/smart-screen/config/restart/batch', {
    params: {
      ids,
    },
  })
}

/**
 * 重启全部屏
 */
export function restartAll() {
  return ilisAxios.get<any>('rest/smart-screen/config/restart/all')
}

/**
 * 获取操作屏授权配置
 */
export function getScreenAuthConfig() {
  return ilisAxios.get<any>('rest/screen/auth/config')
}

/**
 * 配置
 */
export interface SetScreenAuthConfigEntity {
  /**
   * 是否需要授权
   */
  authorizationRequired: boolean
  /**
   * 操作预约任务（修改、删除）
   */
  optAppointmentTask: boolean
  /**
   * 操作功能室温湿度设备（打开、关闭、调节、设置）
   */
  optEquipment: boolean
  /**
   * 操作智能送样任务（新增任务、送达确认、取消送样）
   */
  optIntelligentSampleTask: boolean
  /**
   * 操作定时任务（添加、修改、删除、开启、关闭）
   */
  optScheduleTask: boolean
  /**
   * 操作试验检测任务（针对任务、子任务、设备使用的开始、结束、撤销、删除）
   */
  optTestTask: boolean
  /**
   * 静置退出时间（分钟）
   */
  staticExitTime: number
}

/**
 * 获取操作屏授权配置
 */
export function setScreenAuthConfig(data: SetScreenAuthConfigEntity) {
  return ilisAxios.put<any>('rest/screen/auth/config', data)
}
