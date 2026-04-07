import axios from "@/config/http.config"

// 列表
export function getListAPI(params: any) {
  return axios({
    url: "/dash/report/find",
    method: "get",
    params
  })
}

// 获取委托类型
export function getEntrustTypeAPI() {
  return axios({
    url: "/dash/report/checkType",
    method: "get"
  })
}

// 获取详情
export function detailApi(id: string) {
  return axios({
    url: "/dash/report/" + id,
    method: "get"
  })
}
