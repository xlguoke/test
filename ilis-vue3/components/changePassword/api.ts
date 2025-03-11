import { IlisApiHelper } from '~/utils/IlisApiHelper'

/**
 * 修改密码
 */
interface SavePwd {
  password: string
  newpassword: string
}

/**
 * 重置用户密码
 */
interface UserPwd {
  /** 用户id */
  id: string
  /** 密码 */
  password: string
}
export function savenewpwdApi(data: SavePwd) {
  return IlisApiHelper.postForm<any>(`userController.do?savenewpwd`, data)
}

export function editUserPwdApi(data: UserPwd) {
  return IlisApiHelper.postForm<any>(`userController.do?savenewpwdforuser`, data)
}
