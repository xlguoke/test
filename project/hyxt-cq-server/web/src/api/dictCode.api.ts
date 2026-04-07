import axios from "@/config/http.config"

export interface listType {
  id?: string
  name: string
  code: string
  dict?: listType[]
}
interface queryParType {
  keyword: string
}
//  获取分页列表
export function getPageList(params: queryParType) {
  return axios({
    url: "/dict/category/page",
    method: "get",
    params
  })
}

// 获取详情 - 通过id查询
export function getDetail(id: string) {
  return axios({
    url: "/dict/category/" + id,
    method: "get"
  })
}

// 获取详情 - 通过code查询
export function getDetailByCode(code: string) {
  return axios({
    url: "/dict/category?code=" + code,
    method: "get"
  })
}

// 新增-编辑
export function save(data: listType) {
  const type = data.id ? "put" : "post"
  return axios({
    url: "/dict/category",
    method: type,
    data
  })
}

// 删除
export function delById(id: string) {
  return axios({
    url: "/dict/category/" + id,
    method: "delete"
  })
}
