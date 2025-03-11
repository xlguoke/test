import { message } from 'ant-design-vue'

/**
 * # 获取测试任务配置信息
 */
export function getTaskViewMonitorConfig(obj: Record<string, any>) {
  return ilisAxios.get<any>(`/rest/testTaskController/playback/config`, {
    params: obj,
  }).catch((err) => {
    message.error(err.message)
    throw err
  })
}
