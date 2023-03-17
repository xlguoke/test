import request from "@/utils/request.js"

interface LoginParams {
  UserNameOrEmailAddress: string
  password: string
  RememberClient: boolean
}

//登录
export function loginAPI(params: LoginParams): Promise<any> {
  return request({
    url: "/api/TokenAuth/Authenticate",
    method: "post",
    data: params
  })
}
