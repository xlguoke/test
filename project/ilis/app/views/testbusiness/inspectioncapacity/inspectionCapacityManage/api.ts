import { IlisApiHelper } from '~/utils/IlisApiHelper'

// 列表
export function getWarningList(query: Record<string, any>) {
  let baseUrl = 'rest/capacity-warning/pagination'
  if (query.creatDate) {
    baseUrl += `?createDate=${query.creatDate}`
    delete query.creatDate
  }
  return IlisApiHelper.get<any>(baseUrl, query)
}
// 详情
export function getWarningDetail(id: string) {
  return IlisApiHelper.get<any>('rest/capacity-warning/detail', {
    id,
  })
}
// 关闭预警
export function closeWarning(data: Record<string, any>) {
  return IlisApiHelper.post<any>('rest/capacity-warning/close', data)
}

// 预警处理
export function handleWarning(data: Record<string, any>) {
  return IlisApiHelper.post<any>('rest/capacity-warning/handle', data)
}
