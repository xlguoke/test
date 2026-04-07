import axios from "@/config/http.config"
import { queryParType, dataItemType } from "@/type/api/information.api"

//  获取分页列表
export function getPageList(params: queryParType) {
  return axios({
    url: "/news/page",
    method: "get",
    params
  })
}

//  获取本机构的分页列表
export function getOrgPageList(params: queryParType) {
  return axios({
    url: "/news/belong-page",
    method: "get",
    params
  })
}

// 获取详情
export function getDetail(id: string, edit: boolean) {
  return axios({
    url: "/news/" + id,
    method: "get",
    params: {
      edit
    }
  })
}

// 新增-编辑
export function saveNews(data: dataItemType) {
  const type = data.id ? "put" : "post"
  return axios({
    url: "/news",
    method: type,
    data
  })
}

// 删除
export function delById(id: string) {
  return axios({
    url: "/news/" + id,
    method: "delete"
  })
}

// 显示隐藏
export function showOrHide(id: string) {
  return axios({
    url: `/news/hide-show/${id}`,
    method: "get"
  })
}
