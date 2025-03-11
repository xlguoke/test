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
