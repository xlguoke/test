import type { IDictionary } from '~/interface/IDictionary'
import { getLaboratoryData } from '~/api/laboratory.ts'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

/** 分页查询参数 */
export interface PageParams {
  quickQry?: string
  departId?: string
}
/** 列表数据 */
export interface PageListData {
  /** 样品名称 */
  sampleName: string
  /** 记录编号 */
  testRecordCode: string
  /** 报告编号 */
  reportNumber?: string
  /** 工程部位/用途 */
  projectPartAndUse: string
  /** 检测时间 */
  testTime: string
  id: string
  /** 委托编号 */
  consignCode: string
  projectName: string
  /** 所属部门 */
  department: string
  /** 任务编号 */
  testTaskCode: string
  /** 样品编号 */
  testObjectCode: string
  /** 检测人员 */
  taskUser: string
}

/** 分页查询 */
export function pageListApi(params: PageParams) {
  return IlisApiHelper.get<PageListData[]>('rest/humiture/ledger/task/page', params)
}

/** 获取记录详情 */
export function recordDetailApi(params: any) {
  const taskId = params.taskId
  delete params.taskId
  return IlisApiHelper.get<any>(`rest/humiture/ledger/${taskId}/humiture`, params)
}

/** 导出 */
export function exportApi(id: string) {
  return IlisApiHelper.get<any>(`rest/humiture/ledger/${id}/export`)
}

/** 获取功能室：字典 */
export async function allLaboratoryApi(): Promise<IDictionary[]> {
  try {
    const { data } = await getLaboratoryData()
    if (!data.success || !data.obj?.rows)
      return []

    return data.obj.rows.map(d => ({
      key: d.id,
      label: d.name,
    }))
  }
  catch (err) {
    console.error(err)
    return []
  }
}
