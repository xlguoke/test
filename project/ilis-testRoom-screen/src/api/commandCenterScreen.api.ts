import request from "@/utils/request.js"

export enum FilterSection {
  全部 = "ALL",
  近一年 = "NEARLY_A_YEAR",
  近一月 = "NEARLY_A_MONTH"
}

/**
 * 获取驾驶舱名称
 */
export function getCockpitName() {
  return request({
    url: "/api/data-screen/cockpit-name",
    method: "get"
  })
}

/**
 * 检测数据统计
 */
export function getTestDataStatistics() {
  return request({
    url: `/api/data-screen/test-data-statistics`,
    method: "get"
  })
}

/**
 * 样品数量统计
 */
export function getSampleProcessStatistics(section: FilterSection) {
  return request({
    url: `/api/data-screen/sample-process-statistics`,
    method: "get",
    params: { section }
  })
}

/**
 * 委托单位对应的委托数量统计
 */
export function getConsignStatistics(section: FilterSection) {
  return request({
    url: `/api/data-screen/consign-statistics`,
    method: "get",
    params: { section }
  })
}

/**
 * 部门报告统计
 */
export function getDepartmentalReportStatistics(section: FilterSection) {
  return request({
    url: `/api/data-screen/departmental-report-statistics`,
    method: "get",
    params: { section }
  })
}

/**
 * 检测人员报告统计
 */
export function getTesterReportStatistics(section: FilterSection) {
  return request({
    url: `/api/data-screen/tester-report-statistics`,
    method: "get",
    params: { section }
  })
}

/**
 * 委托收样排行榜
 */
export function getSampleLeaderboard(section: FilterSection) {
  return request({
    url: `/api/data-screen/sample-leaderboard`,
    method: "get",
    params: { section }
  })
}

/**
 * 任务统计
 */
export function getTaskStatistics(section: FilterSection) {
  return request({
    url: `/api/data-screen/task-statistics`,
    method: "get",
    params: { section }
  })
}

/**
 * 设备使用频率排行榜
 */
export function getTopDeviceUsageFrequency(section: FilterSection) {
  return request({
    url: `/api/data-screen/top-device-usage-frequency`,
    method: "get",
    params: { section }
  })
}
