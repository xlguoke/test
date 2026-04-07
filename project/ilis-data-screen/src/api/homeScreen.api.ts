import request from "@/utils/request.js"

// 今日统计
export function todayStatistics() {
  return request({
    url: `/api/home-screen/today-statistics`,
    method: "get"
  })
}

// 参数委托排行榜
export function rankedListParam() {
  return request({
    url: "/api/home-screen/ranked-list-param",
    method: "get"
  })
}

// 最新通知消息
export function newestNotice() {
  return request({
    url: "/api/home-screen/newest-notice",
    method: "get"
  })
}

// 委托趋势
export function consignTrend() {
  return request({
    url: "/api/home-screen/consign-trend",
    method: "get"
  })
}

// 在检任务
export function testingTask() {
  return request({
    url: "/api/home-screen/testing",
    method: "get"
  })
}

// 功能室使用情况
export function labState() {
  return request({
    url: "/api/home-screen/lab-state",
    method: "get"
  })
}
