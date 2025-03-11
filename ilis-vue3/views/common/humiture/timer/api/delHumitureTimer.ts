import { IlisApiHelper } from '~/utils/IlisApiHelper'

/** 删除 温湿度定时设置 */
export function delHumitureTimer(id: string) {
  return IlisApiHelper.delete<any>(`rest/humiture/${id}`)
}
