import axios from "@/config/http.config"

//大屏示警统计
export function getDashAlarmsAPI(): Promise<any> {
  return axios({
    url: "/dash/alarms",
    method: "get"
  })
}

//大屏采集统计
export function getDashCollectAPI(): Promise<any> {
  return axios({
    url: "/dash/collect/statistics",
    method: "get"
  })
}
//大屏地图数据统计
export function getDashDistributionMapAPI(): Promise<any> {
  return axios({
    url: "/dash/org/distribution",
    method: "get"
  })
}

//检测机构-检测报告概览
export function getOverviewReportAPI(params): Promise<any> {
  return axios({
    url: "/dash/report/chart",
    method: "get",
    params
  })
}

//不合格统计
export function getunqualifiedAllAPI(): Promise<any> {
  return axios({
    url: "/dash/report/unqualifiedAll",
    method: "get"
  })
}

//当日报告实时数据接口
export function getTodayReportAPI(): Promise<any> {
  return axios({
    url: "/dash/report/todayReport",
    method: "get"
  })
}
//获取今日示警总数
export function getTodayAlarmsAPI(): Promise<any> {
  return axios({
    url: "/dash/alarms/today",
    method: "get"
  })
}
//获取今日采集异数据
export function getTodayUnusualAPI(): Promise<any> {
  return axios({
    url: "/dash/collect/cur/statistics",
    method: "get"
  })
}
