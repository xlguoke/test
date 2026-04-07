import axios from "@/config/http.config"

interface queryType {
  current: number | undefined
  size: number | undefined
  title?: string
  type?: string
}

export interface dataItemType {
  id?: string
  title: string
  content: string
  contact: string
  contactNo?: string
}

interface repliesType {
  id: string //回复id
  technicalExchangeId: string // 咨询id
  content: string //回复内容
  unitName: string // 回复单位
  adopt: boolean // 是否被采纳
  replyTime: number // 回复时间
}
export interface detailType {
  id: string
  title: string //标题
  content: string //内容
  contact: string // 联系方式
  contactNo: string //联系电话
  unitName: string //咨询单位
  solved: boolean //是否已解决
  createdAt: number | null // 咨询时间
  replies: repliesType[] // 回复内容
}

//  获取分页列表
export function getPageList(params: queryType) {
  return axios({
    url: "/technical/exchange",
    method: "get",
    params
  })
}

// 获取详情
export function getDetail(id: string) {
  return axios({
    url: "/technical/exchange/" + id,
    method: "get"
  })
}

// 新增-编辑
export function saveApi(data: dataItemType) {
  const type = data.id ? "put" : "post"
  return axios({
    url: "/technical/exchange",
    method: type,
    data
  })
}

// 删除
export function delById(id: string) {
  return axios({
    url: "/technical/exchange/" + id,
    method: "delete"
  })
}

// 新增-编辑回复
export function saveReply(data) {
  const type = data.id ? "put" : "post"
  return axios({
    url: "/technical/exchange/reply",
    method: type,
    data
  })
}

// 删除回复
export function delReplyById(id: string) {
  return axios({
    url: "/technical/exchange/reply/" + id,
    method: "delete"
  })
}

interface adoptParType {
  id: string
  technicalExchangeId: string
}
// 采纳回复
export function adoptApi(data: adoptParType) {
  return axios({
    url: "/technical/exchange/adopt",
    method: "put",
    data
  })
}
