import type { RecordEntity } from '.'

/**
 * # 获取管理级别分页列表
 */
export function getLevelPage() {
  return ilisAxios.get<{ data: RecordEntity[] }>('rest/chemical/level/all')
}

/**
 * # 修改管理级别
 */
export function updateLevel(data: RecordEntity) {
  return ilisAxios.post<any>('rest/chemical/level/modify', data)
}

/**
 * # 切换启用
 */
export function updateEnabled(params: Pick<RecordEntity, 'id' | 'enabled'>) {
  return ilisAxios.get<any>('/rest/chemical/level/enabledSwitch', {
    params,
  })
}
