import axios from "@/config/http.config"

import qs from "qs"

interface LoginParams {
  username: string
  password: string
  loginId: string //用于验证码次数验证
  code: string
}

//登录
export function loginAPI(params: LoginParams): Promise<any> {
  return axios({
    url: "/login",
    method: "post",
    data: qs.stringify({
      username: params.username,
      password: params.password,
      code: params.code
    }),
    headers: { "X-CNT-ID": params.loginId }
  })
}

// 退出登录
export function loginOutAPI(): Promise<any> {
  return axios({
    url: `/logout`,
    method: "get"
  })
}
// 退出登录日志
export function loginOutLogAPI(userId: string): Promise<any> {
  return axios({
    url: `/sys/bp-log/${userId}`,
    method: "get"
  })
}

// 验证用户和手机号
export function verifyUserNameAndPhoneAPI(username: string, phone: string): Promise<any> {
  return axios({
    url: `/portal/username/phone/existence?username=${username}&phone=${phone}`,
    method: "get"
  })
}

//发送修改密码短信验证
export function sendChangePasswordSMSAPI(phone: string): Promise<any> {
  return axios({
    url: `/portal/password-alter/code?phone=${phone}`,
    method: "get"
  })
}
//修改密码
export function changePasswordAPI(params): Promise<any> {
  return axios({
    url: "/portal/user-info",
    method: "post",
    data: qs.stringify(params)
  })
}

// 交通综合业务管理门户系统跳转登录验证
export function checkJtTokenAPI(data) {
  return axios({
    url: "/dash/idaas/sso",
    method: "get",
    params: data
  })
}

/** 提交验证 */
export function submitVerifyAPI(code: string, userId: string): Promise<any> {
  return axios({
    url: `/auth/2fa/verify/${userId}`,
    method: "get",
    params: { code }
  })
}

/** 发送验证码 */
export function sendCodeAPI(userId: string): Promise<any> {
  return axios({
    url: `/auth/2fa/send/code/${userId}`,
    method: "get"
  })
}
