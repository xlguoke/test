import axios from "@/config/http.config"

// export function getStatistic(data) {
//   return axios({
//     url: '/services/app/Dashboard/GetStatistic',
//     method: 'get',
//     data
//   })
// }

export function getNewsListAPI() {
  return axios({
    url: "/news/home-page",
    method: "get"
  })
}

//获取新闻更多列表
export function getMoreNewsListAPI(params) {
  return axios({
    url: "/news/page",
    method: "get",
    params
  })
}

//
//获取新闻详情
export function getNewsDetailsAPI(id) {
  return axios({
    url: `/news/${id}`,
    method: "get"
  })
}
//获取采集示警详情
export function getCollectAlarmsAPI(id) {
  return axios({
    url: `/alarms/analysis/collect/${id}`,
    method: "get"
  })
}
//获取设备示警详情
export function getEqAlarmsAPI(id) {
  return axios({
    url: `/alarms/analysis/eq/${id}`,
    method: "get"
  })
}
//获取人员示警详情
export function getStaffAlarmsAPI(id) {
  return axios({
    url: `/alarms/analysis/staff/${id}`,
    method: "get"
  })
}
//获取处理详情
export function getSchemeAlarmsAPI(id) {
  return axios({
    url: `/alarms/analysis/scheme/${id}`,
    method: "get"
  })
}

//获取月度示警
export function getSummarizeAPI() {
  return axios({
    url: `/alarms/summarize`,
    method: "get"
  })
}
//获取月度报告
export function getReportAPI() {
  return axios({
    url: `/reports?home-stat`,
    method: "get"
  })
}
//获取采集数据
export function getCollectAPI(type) {
  return axios({
    url: `/collect/data/count?timeScope=${type}`,
    method: "get"
  })
}
