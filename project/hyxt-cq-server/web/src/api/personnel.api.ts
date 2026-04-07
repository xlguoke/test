import axios from "@/config/http.config"

interface queryParType {
  current: number | undefined
  size: number | undefined
  key?: string // 模糊查询
  registerOrgId?: string // 机构id
}

export interface personParType {
  id?: string
  name: string //姓名
  gender: string //性别
  idNum: string //证件号码
  certsType: string //证书类型
  certsNo: string //证书编号
  registerOrgId: string // 机构id
  registerOrgName: string // 机构名称
  jobTitle: string // 职称
  duties: string // 职务
}

//  获取分页列表
export function getPageList(params: queryParType) {
  return axios({
    url: "/org/person/pages",
    method: "get",
    params
  })
}

// 详情
export function getDetail(id: string) {
  return axios({
    url: "/org/person/" + id,
    method: "get"
  })
}

// 获取所有人员
export function getDataList(params: queryParType) {
  return axios({
    url: "/org/person/all/pages",
    method: "get",
    params
  })
}
export function getDataListUrl() {
  return "/org/person/all/pages"
}
