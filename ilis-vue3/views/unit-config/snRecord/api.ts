import { modalError } from '../standard/api'
import { ILISHTTPError } from '~/types'

/**
 * # 编号类型字典
 */
export function getSnDictContent(data: any) {
  return ilisAxios.postForm<any>(`/systemController.do?getDictContent`, data).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  })
}

/**
 * # 历史用户改编号列表
 */
export function getSnHistoryList(typeCode: string, sn: string) {
  return ilisAxios.get<any>(`rest/sn/history/${typeCode}/${sn}`).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  })
}

/**
 * # 编号使用日志
 */
export function getSnHistoryLog(typeCode: string, sn: string) {
  return ilisAxios.get<any>(`rest/sn/history/log/${typeCode}/${sn}`).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  })
}
