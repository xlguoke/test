import axios from "@/config/http.config"
import { queryParType, dataItemType } from "@/type/api/dataMonitoring.api"
/* ---- 采集设备 ---------------------- */
//  获取分页列表
export function getPageList(params: queryParType) {
  return axios({
    url: "/collect/equipment/page",
    method: "get",
    params
  })
}

// 获取详情
export function getDetail(id: string) {
  return axios({
    url: "/collect/equipment/" + id,
    method: "get"
  })
}

// 新增-编辑
export function saveEq(data: dataItemType) {
  const type = data.id ? "put" : "post"
  return axios({
    url: "/collect/equipment",
    method: type,
    data
  })
}

// 删除
export function delById(id: string) {
  return axios({
    url: "/collect/equipment/" + id,
    method: "delete"
  })
}

/* ---- 数据采集 ---------------------- */
//  获取分页列表
export function testPageList(params: queryParType) {
  return axios({
    url: "/collect/data/page",
    method: "get",
    params
  })
}

// 获取详情
export function testDetail(id: string) {
  return axios({
    url: "/collect/data/" + id,
    method: "get"
  })
}
// 删除
export function testDelAPI(data) {
  return axios({
    url: "/collect/data",
    method: "delete",
    data
  })
}
// 强制删除
export function testDelAPIForce(data) {
  return axios({
    url: "/collect/data/physics",
    method: "delete",
    data
  })
}
// 详情页动态字段
// @param  collectItemId  采集项目ID
export function autoFieldsAPI(collectItemId: string) {
  return axios({
    url: "/item/field/detail/list/" + collectItemId,
    method: "get"
  })
}
