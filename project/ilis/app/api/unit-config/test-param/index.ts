import type { ICreateParamProcessRequest, IParamProcessDTO, IParamProcessPageResDTO, IParamProcessQueryParam, ITestParamDTO, ITestParamQueryParam, IUpdateParamProcessRequest } from './types'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

export * from './constant'
export * from './enum'
export * from './types'

/** ## 分页查询检测参数列表 */
export function getTestParamListApi(params: ITestParamQueryParam) {
  return IlisApiHelper.get<ITestParamDTO>('testParamController.do?datagrid', params)
}

/**
 * ## 分页查询参数过程信息
 * @param params 查询参数
 * @returns 分页响应数据
 */
export function getParamProcessListApi(params: IParamProcessQueryParam) {
  return IlisApiHelper.get<IParamProcessPageResDTO>('/test/param/inter', params)
}

/**
 * ## 新增测试参数过程信息
 * @param data 新增请求数据
 * @returns 新增后的实体数据
 */
export function saveParamProcessApi(data: ICreateParamProcessRequest) {
  return IlisApiHelper.post<IParamProcessDTO>('/test/param/inter', data)
}

/**
 * ## 修改测试参数过程信息
 * @param id 主键ID
 * @param data 更新请求数据
 * @returns 修改后的实体数据
 */
export function updateParamProcessApi(id: string, data: IUpdateParamProcessRequest) {
  return IlisApiHelper.put<IParamProcessDTO>(`/test/param/inter/${id}`, data)
}

/**
 * ## 根据ID获取测试参数过程详情
 * @param id 主键ID
 * @returns 详情数据
 */
export function getParamProcessDetailApi(id: string) {
  return IlisApiHelper.get<IParamProcessDTO>(`/test/param/inter/${id}`)
}

/**
 * ## 删除测试参数过程信息（支持批量）
 * @param ids 主键ID，多个用逗号分隔
 */
export function deleteParamProcessApi(ids: string) {
  return IlisApiHelper.delete<void>(`/test/param/inter/${ids}`)
}

/**
 * ## 同步参数过程信息
 * @param testParamIds 测试参数ID数组
 */
export function syncParamProcessApi(testParamIds: string[]) {
  return IlisApiHelper.post<void>('/test/param/inter/sync/param/inter', testParamIds)
}
