import type { IndustryListEntity } from './IndustryConfigEntity'
import type { IndustryConfig, ProcessConfig, ProcessorConfigs } from './interface'
import { IlisApiHelper } from '~/utils/IlisApiHelper'
import { BUSINESS_SCOPE } from './enum'

/** 领域列表 */
export function pageListApi() {
  return IlisApiHelper.get<IndustryListEntity[]>(`rest/industry`)
}

/** 领域列表 */
export function getIndustryListByUser() {
  return IlisApiHelper.get<IndustryListEntity[]>(`rest/industry/user`)
}

/** 新增/编辑领域 */
export function saveApi(data: IndustryListEntity) {
  return IlisApiHelper.post(`rest/industry`, data)
}

/** 删除领域 */
export function deleteApi(data: IndustryListEntity[]) {
  const id = data[0].id
  return IlisApiHelper.delete(`rest/industry/${id}`)
}

/** 处理程序 */
export function processorApi() {
  return IlisApiHelper.get<ProcessorConfigs[]>(`rest/industry/processor`)
}
/** 处理程序-字典 */
export async function processorDictApi() {
  const { data } = await processorApi()
  return data.map(item => ({ ...item, label: item.title, key: item.program }))
}

/** 流程列表 */
export function processListApi() {
  return IlisApiHelper.get<ProcessConfig[]>(`rest/industry/process`)
}

/** 按模块获取字段库 */
export function industryFieldApi(params: { module: BUSINESS_SCOPE }) {
  let module = params.module
  const param: any = {}
  // 委托自定义布局还是查询通用字段，加一个过滤条件
  if (module === BUSINESS_SCOPE.CONSIGN) {
    module = BUSINESS_SCOPE.COMMON
    param.layoutEnum = 'CONSIGN'
  }
  return IlisApiHelper.get<IndustryConfig[]>(`rest/industry/field/lib/${module}`, param)
}

/** 按模块获取字段配置 */
export function industryFieldConfigApi(params: { industryId: string, module: BUSINESS_SCOPE }) {
  let module = params.module
  const param: any = {}
  // 委托自定义布局还是查询通用字段，加一个过滤条件
  if (module === BUSINESS_SCOPE.CONSIGN) {
    module = BUSINESS_SCOPE.COMMON
    param.layoutEnum = 'CONSIGN'
  }
  return IlisApiHelper.get<IndustryConfig[]>(`rest/industry/field/${params.industryId}/${module}`, param)
}

/** 保存字段配置 */
export function saveFieldConfigApi(data: IndustryConfig[]) {
  return IlisApiHelper.post(`rest/industry/field`, data)
}
