import * as CryptoJS from "crypto-js"
import request from "@/utils/request.js"

export type QueryRangeType =
  | "ALL"
  | "YEAR"
  | "MONTH"
  | "WEEK"
  | "DAY"
  | "NEARLY_A_YEAR"
  | "NEARLY_A_MONTH"

// 今日统计
export function todayStatistics() {
  return request({
    url: `/api/data-screen/today-statistics`,
    method: "get"
  })
}

// 参数委托排行榜
export function rankedListParam(range: QueryRangeType) {
  return request({
    url: "/api/data-screen/ranked-list-param",
    method: "get",
    params: { range }
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
    url: "/api/data-screen/testing-statistics",
    method: "get"
  })
}

// 功能室环境
export function labEnvironment(envLevel?: string) {
  return request({
    url: "/api/data-screen/lab-environment",
    method: "get",
    params: { envLevel }
  })
}

// 功能室列表
export function getLabList() {
  const unitCode = localStorage.getItem("unitCode")
  return request({
    url: `/api/thirdPlatform/lab/list?unitCode=${unitCode}`,
    method: "get"
  })
}

// 获取摄像头直播数据流
export function getWvpToken(username: string, password: string, loginUrl: string) {
  const query = {
    username,
    password: CryptoJS.MD5(password)
  }
  const urlQueryStr = new URLSearchParams(query)
  return request({
    url: `${loginUrl}?${urlQueryStr}`,
    method: "get"
  })
}

// 获取摄像头直播数据流
export async function getLiveplay(videoData) {
  const wvpParams = JSON.parse(videoData?.configParam)
  const query = {
    startTime: wvpParams.startTime,
    endTime: wvpParams.endTime
  }
  const { data } = await getWvpToken(wvpParams.username, wvpParams.password, wvpParams.loginUrl)
  const urlQueryStr = new URLSearchParams(query)
  return request({
    url: `${videoData.interfaceUrl}/${wvpParams.deviceId}/${wvpParams.channelId}?${urlQueryStr}`,
    method: "get",
    headers: {
      "access-token": data.accessToken
    }
  })
}

// 获取摄像头直播数据流：获取海康威视直播数据
export function getLiveplayOld(id) {
  return request({
    url: `/api/laboratoryController/lab/live/url?equId=${id}`,
    method: "get"
  })
}

// 获取公司宣传视频
export function getCompanyVideo() {
  const unitCode = localStorage.getItem("unitCode")
  return request({
    url: `${window.location.origin}/cabinet-server/publicity-video/search/unit?page=0&size=999&sort=sequence&unit=${unitCode}`,
    method: "get"
  })
}

// 样品梳理统计
export function sampleStatistics(section?: QueryRangeType) {
  return request({
    url: `/api/data-screen/sample-process-statistics`,
    method: "get",
    params: { section }
  })
}

/**
 * 试验检测数据统计（山西交通）
 */
export function testDetectionStatistics(unitCode: string) {
  return request({
    url: `/api/iot/task-statistical-total`,
    method: "get",
    params: { unitCode }
  })
}

// 人员统计
export function personStatistics(params?: Record<string, any>) {
  return request({
    url: `/api/data-screen/people-statistics`,
    method: "get",
    params
  })
}

// 设备统计
export function deviceStatistics() {
  return request({
    url: `/api/data-screen/equipment-statistics`,
    method: "get"
  })
}

// 检测任务
export function testTaskStatistics(range?: QueryRangeType) {
  return request({
    url: `/api/data-screen/test-data-statistics`,
    method: "get",
    params: { range }
  })
}

/**
 * # 标养统计
 */
export function periodStat() {
  return request({
    url: `/api/data-screen/period-stat`,
    method: "get"
  })
}

/** # 试验检测数据统计类型枚举 */
export enum ApprovedReportStatTimeType {
  /** # 近30天每天 */
  LAST_30_DAYS = "LAST_30_DAYS",
  /** # 近12个月每月 */
  LAST_12_MONTHS = "LAST_12_MONTHS"
}
/**
 * # 试验检测数据统计
 */
export function approvedReportStat(type: ApprovedReportStatTimeType) {
  return request({
    url: `/api/data-screen/approved-report-stat?timeType=${type}`,
    method: "get"
  })
}

/**
 * # 试验检测（报告提交统计）
 */
export function submitedReportStat() {
  return request({
    url: `/api/data-screen/submited-report-stat`,
    method: "get"
  })
}

/**
 * # 试验检测（最近n条提交的报告）
 * 查询份数：默认5，最大99
 */
export function lastReport() {
  return request({
    url: `/api/data-screen/last-n-report/99`,
    method: "get"
  })
}
