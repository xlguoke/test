import axios from "@/config/http.config"

// 列表
export function getList() {
  return axios({
    url: "/authenticator/aliases",
    method: "get"
  })
}

export interface addParType {
  key: string // 填写或者选择的对象ID，例如实验室的ID
  name: string // 填写或者选择的对象名称，例如实验室的名称
  kind: string // 对象类型
  orgKey: string // 填写或者选择的所属机构ID
  orgName: string // 填写或者选择的所属机构名称
  platform: string // 平台编码
  platformName: string // 平台名称
}
// 新增
export function addApi(data: addParType) {
  return axios({
    url: "/authenticator/alias",
    method: "post",
    data
  })
}
// 编辑
export function editApi(data: addParType) {
  return axios({
    url: "/authenticator/alias/reset",
    method: "post",
    data
  })
}
// 获取平台列表
export function getPlatformList() {
  return axios({
    url: "/report/third/party/platform/all",
    method: "get"
  })
}

// 启用禁用
export function triggleUseApi(id: string) {
  return axios({
    url: "/authenticator/alias/" + id,
    method: "patch"
  })
}
