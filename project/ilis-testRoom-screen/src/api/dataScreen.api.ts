import request from "@/utils/request.js"

// 今日统计
export function todayStatistics() {
  return request({
    url: `/api/data-screen/today-statistics`,
    method: "get"
  })
}

// 参数委托排行榜
export function rankedListParam() {
  return request({
    url: "/api/data-screen/ranked-list-param",
    method: "get"
  })
}

// 最新通知消息
export function newestNotice() {
  return request({
    url: "/api//data-screen/newest-notice",
    method: "get"
  })
}

// 委托趋势
export function consignTrend() {
  return request({
    url: "/api/data-screen/consign-trend",
    method: "get"
  })
}

// 在检任务
export function testingTask() {
  return request({
    url: "/api/data-screen/testing",
    method: "get"
  })
}

// 功能室环境
export function labEnvironment() {
  return request({
    url: "/api/data-screen/lab-environment",
    method: "get"
  })
}

// 功能室列表
export function getLabList() {
  const unitCode = localStorage.getItem("unitCode")
  return request({
    url: `/rest/thirdPlatform/lab/list?unitCode=${unitCode}`,
    method: "get"
  })
}

// 获取摄像头直播数据流
export function getLiveplay(id) {
  return request({
    url: `/api/laboratoryController/wvp/lab/live/play?id=${id}`,
    method: "get"
  })
}

// 获取公司宣传视频
export function getCompanyVideo() {
  const unitCode = localStorage.getItem("unitCode")
  return request({
    url: `${window.location.origin}/cabinet-server/publicity-video/search/unit?page=0&size=1&sort=sequence&unit=${unitCode}`,
    method: "get"
  })
}