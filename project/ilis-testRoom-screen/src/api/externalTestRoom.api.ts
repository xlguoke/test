import request from "@/utils/request.js"

// 外检室数据统计
export function getExternalInspectionRoom(labId) {
  return request({
    url: `/api/externalInspectionRoom/statistics/${labId}`,
    method: "get"
  })
}


//查询外检室详情
export function getExternalInspectionList(params) {
  return request({
    url: "api/externalInspectionRoom/inventoryDetail",
    method: "get",
    params
  })
}


