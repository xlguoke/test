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

interface GetTestHiKvisionPlaybackQuery {
  id: string
  startTime: string
  endTime: string
}

/**
 * # 获取海康威视回放信息
 */
export function getTestHiKvisionPlayback(params: GetTestHiKvisionPlaybackQuery) {
  return ilisAxios.get<any>(`/rest/laboratoryController/hikvision/lab/live/url`, {
    params,
  }).catch((err) => {
    message.error(err.message)
    throw err
  })
}
