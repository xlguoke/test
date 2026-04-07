import { IlisApiHelper } from '~/utils/IlisApiHelper'

/**
 * # 获取语音存储路径
 */
export function getVoiceFilePath(objectId: string, objectType: 'TASK' | 'HANDBOOK') {
  return IlisApiHelper.get<any>(`rest/ai/input/path/${objectId}/${objectType}`)
}

/**
 * # 获取语音文件
 */
export function getVoiceRecord(objectId: string) {
  return IlisApiHelper.get<any>(`rest/ai/input/files/${objectId}`)
}
