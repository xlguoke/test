import request from "@/config/request.js"
import { getCookie } from "@/utils/cookie"

/**
 * # 获取用户信息
 */
export function getUserInfo() {
  const Authorization = getCookie("Authorization") ? "Bearer " + getCookie("Authorization") : ""
  return request({
    url: `https://cqykb.cq.gov.cn/pc/user/user/v2/getUserInfo`,
    method: "get",
    headers: {
      Authorization
    }
  })
}

/**
 * # 注销
 */
export function logoutAll() {
  const Authorization = getCookie("Authorization") ? "Bearer " + getCookie("Authorization") : ""
  return request({
    url: `https://cqykb.cq.gov.cn/pc/user/oauth/ali/logout/jwt`,
    method: "get",
    headers: {
      Authorization
    }
  })
}

/**
 * # 注销
 */
export function userLogout() {
  const Authorization = getCookie("Authorization") ? "Bearer " + getCookie("Authorization") : ""
  return request({
    url: `https://cqykb.cq.gov.cn/pc/user/user/logout`,
    method: "get",
    headers: {
      Authorization
    }
  })
}
