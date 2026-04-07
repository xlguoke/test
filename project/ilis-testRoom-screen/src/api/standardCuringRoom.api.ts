import request from "@/utils/request.js"

// 标养室数据统计
export function getStandardCuringRoom(labId) {
  return request({
    url: `/api/standardCuringRoom/statistics/${labId}`,
    method: "get"
  })
}


//标养室 本周  本月  本日详情出入库列表
export function getStandardOutAndIn(params) {
  return request({
    url: "api/standardCuringRoom/inventoryDetail",
    method: "get",
    params
  })
}


//标养室 今日到期详情列表
export function getTodayExpireList(params) {
  return request({
    url: "api/standardCuringRoom/todayExpire",
    method: "get",
    params
  })
}
//标养室 龄期到期详情列表
export function getExpiredList(params) {
  return request({
    url: "api/standardCuringRoom/expired",
    method: "get",
    params
  })
}

