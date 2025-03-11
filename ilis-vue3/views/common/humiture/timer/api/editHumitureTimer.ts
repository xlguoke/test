import { IlisApiHelper } from '~/utils/IlisApiHelper'
import type { CreateTimerSettingEntity } from '~/views/common/humiture/timer/api/createHumitureTimer.ts'

/** 编辑 温湿度定时设置 */
export function editHumitureTimer(id: string, data: CreateTimerSettingEntity) {
  const params: any = { ...data }
  if (params.customValue) {
    params.customValue = params.customValue.join(',') || null
  }

  return IlisApiHelper.put<any>(`rest/humiture/${id}`, params)
}
