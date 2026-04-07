import type { ReportSealEntity } from './reportSealEntity'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

// 获取 - 扫码报告用印登记记录
export async function getReportSealHistoryList(params: Record<string, any>) {
  let url = 'rest/report/stamp/register/pagination'
  if (params.registerTimeRange?.length > 0 && params.registerTimeRange[0]) {
    const registerTimeStart = params.registerTimeRange[0] || undefined
    const registerTimeEnd = params.registerTimeRange[1] || undefined
    url = `rest/report/stamp/register/pagination?registerTime=${registerTimeStart}&registerTime=${registerTimeEnd}`
  }
  delete params.registerTimeRange
  return IlisApiHelper.get(url, params)
}

// 保存并导出 - 新增用印登记记录
export async function saveAndExportReportSealList(reportSealList: ReportSealEntity[]) {
  return IlisApiHelper.post(`rest/report/stamp/register/save-export`, reportSealList)
}

// 导出历史记录
export async function exportReportSealHistory(registerTimeStart: string, registerTimeEnd: string) {
  let url = 'rest/report/stamp/register/export'
  if (registerTimeStart && registerTimeEnd) {
    url += `?registerTime=${registerTimeStart}&registerTime=${registerTimeEnd}`
  }
  return IlisApiHelper.get(url, {}, { responseType: 'blob' })
}
// 扫描报告二维码
export async function scanReportQrCode() {
  return IlisApiHelper.get(`rest/report/stamp/register`)
}

// 删除扫码登记记录
export async function deleteSealHistory(id: string) {
  return IlisApiHelper.delete<any>(`rest/report/stamp/register/${id}`)
}
