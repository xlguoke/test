import { IlisApiHelper } from '~/utils/IlisApiHelper'

export function getProjectList(query: Record<string, any>) {
  return IlisApiHelper.get<any>(`projectController.do?datagridNew`, query)
}
export function mergeProject(data: Record<string, any>) {
  return IlisApiHelper.post<any>(`/projectController/mergeProject`, data)
}
