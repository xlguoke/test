import type { ILog } from '.'

/**
 * # 获取是否配置审批流程
 * @param {string} id 业务id
 * @param {string} logType 日志类型
 * @param {boolean} relationQry 是否查询关联日志，默认false
 */
export function getLogList(id: string, logType: string, relationQry = false) {
  return ilisAxios.get<{ rows: ILog[] }>(`tSLogProcessController.do?getProcessLogList&objectId=${id}&objectType=${logType}&relationQry=${relationQry}`)
}
