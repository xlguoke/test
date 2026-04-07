import { IlisApiHelper } from '~/utils/IlisApiHelper'

/**
 * 修改密码
 */
interface SavePwd {
  password: string
  newpassword: string
}
/**
 * 修改密码
 */
export function savenewpwdApi(data: SavePwd) {
  return IlisApiHelper.postForm<any>(`userController.do?savenewpwd`, data)
}
