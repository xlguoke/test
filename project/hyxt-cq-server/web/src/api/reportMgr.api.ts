import axios from "@/config/http.config"
import {
  queryParType,
  dataItemType,
  importExcelType,
  importFilesType,
  disposeModeType,
  addOuterReportType
} from "@/type/api/report.api"

//  获取分页列表
export function getPageList(params: queryParType) {
  return axios({
    url: "/reports",
    method: "get",
    params
  })
}

//  导入外委报告
export function importOuterReport(params: Object) {
  return axios({
    url: "/report/subcontract/excel",
    method: "post",
    data: params
  })
}

// export function getPageList(data: queryParType) {
//   return axios({
//     url: "/report/pages",
//     method: "post",
//     data
//   })
// }

//  导出excel
export function exportExcelAPI(params: queryParType) {
  return axios({
    url: "/reports/export",
    method: "get",
    responseType: "blob",
    params
  })
}

//添加外委报告
export function addOuterReportAPI(params: addOuterReportType) {
  return axios({
    url: "/report/subcontract/add",
    method: "post",
    data: params
  })
}

// 获取详情
export function detailApi(id: string) {
  return axios({
    url: "/report/" + id,
    method: "get"
  })
}
// 新增
// 新增时接口返回报告id被转为数字，超出长度丢失精度，所以修改返回数据的类型为text类型
export function addApi(data: dataItemType) {
  return axios({
    responseType: "text",
    url: "/report/submit",
    method: "post",
    data,
    errorMsg: false
  })
}
// 编辑
export function editApi(data: dataItemType) {
  return axios({
    url: "/report/modify",
    method: "post",
    data,
    errorMsg: false
  })
}
// 更正
export function amendApi(data: dataItemType) {
  return axios({
    url: "/report/amend",
    method: "post",
    data,
    errorMsg: false
  })
}

// 删除外委报告
export function delOuterReportAPI(id: string) {
  return axios({
    url: "/report/subcontract/" + id,
    method: "delete"
  })
}

// 删除
export function delApi(id: string) {
  return axios({
    url: "/report/" + id,
    method: "delete"
  })
}
// 注销
export function cancelApi(id: string) {
  return axios({
    url: "/report/cancel/" + id,
    method: "post"
  })
}
// 恢复
export function recoverApi(id: string) {
  return axios({
    url: "/report/recover/" + id,
    method: "post"
  })
}

// 强制注销
export function forceCancelApi(id: string) {
  return axios({
    url: "/report/forceCancel/" + id,
    method: "post"
  })
}
// 强制恢复
export function forceRecoverApi(id: string) {
  return axios({
    url: "/report/forceRecover/" + id,
    method: "post"
  })
}
// 强制编辑
export function forceEditApi(data: dataItemType) {
  return axios({
    url: "/report/forceModify",
    method: "post",
    data,
    errorMsg: false
  })
}

// 导入报告数据
export function importReportExcel(data: importExcelType) {
  const formData = new FormData()
  formData.append("labId", data.labId || "")
  formData.append("testLab", data.testLab || "")
  formData.append("isSubcontract", data.isSubcontract + "")
  formData.append("file", data.file[0])
  return axios({
    url: "/report/import/excel",
    method: "post",
    data: formData
  })
}

// 导入报告文件
export function importReportFiles(data: importFilesType) {
  return axios({
    url: "/report/import/saveReportFiles",
    method: "post",
    data
  })
}

// 导入报告文件前检查
export function importReportCheckFile(data: importFilesType) {
  return axios({
    url: "/report/import/checkFileNames",
    method: "post",
    data
  })
}

// 获取详情
export function downloadQrCode(number: number) {
  return axios({
    url: "/report/security/qr-code/" + number,
    method: "get",
    responseType: "blob"
  })
}

// 查看不合格报告处理方式
export function disposeInfoApi(reportId: string) {
  return axios({
    url: `/report/dispose/${reportId}`,
    method: "get"
  })
}

// 保存不合格报告处理方式
export function disposeSaveApi(data: disposeModeType) {
  return axios({
    url: "/report/dispose/save",
    method: "post",
    data
  })
}

// 获取报告变更记录
// @params
//  id 报告id     count：变更次数
export function getHistoryByVersion(
  id: string,
  versionType?: string,
  startV?: number,
  endV?: number
) {
  return axios({
    url: `/report/versions/${id}`,
    method: "get",
    params: {
      startVersion: startV,
      endVersion: endV,
      versionType: versionType || null
    }
  })
}
