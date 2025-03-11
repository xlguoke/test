import type { ILog } from '.'

/**
 * # 获取是否配置审批流程
 */
export function getLogList(id: string, logType: string) {
  return ilisAxios.get<ILog[]>(`/rest/synthesis/log?id=${id}&objectType=${logType}&relationQry=false`)
}
