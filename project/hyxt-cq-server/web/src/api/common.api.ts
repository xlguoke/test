import axios from "@/config/http.config"

export function getDictDataAPI(code: string) {
  return axios({
    url: "/dict/category?code=" + code,
    method: "get"
  })
}
//用户密码验证
export function verifyPasswordAPI(pw: string) {
  return axios({
    url: "/sys/user?password=",
    method: "get",
    headers: {
      "x-pwd": pw
    }
  })
}

// 获取机构列表 - 所有
export function orgListAllAPI() {
  return axios({
    url: `/org/by-type/all`,
    method: "get"
  })
}
