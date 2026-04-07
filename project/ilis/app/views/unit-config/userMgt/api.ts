import type { IResponseCommonEntity } from '~/interface/IResponseEntity.ts'
import { IlisApiHelper } from '~/utils/IlisApiHelper.ts'
import { UserAccountType } from '~/views/unit-config/userMgt/index.ts'

export class UserEntity {
  id = ''
  type = UserAccountType.业务类账户
  userName = ''
  ssoName = ''
  realName = ''
  departname?: string
  orgIds: string | string[] = []
  roleid: string | string[] = []
  roleName?: string
  jobTitle = ''
  idCard = ''
  mobilePhone = ''
  officePhone = ''
  email = ''
  birthDay = ''
  certificateNo = ''
  rfid = ''
  password?: string
  repassword?: string
}

interface UserDTO {
  id: '2c98308195a19b220195a1d431ed0022'
  unitCode: 'gfzx'
  userName: 'test2'
  ssoName: 'test2'
  realName: 'admin'
  browser: null
  userKey: '收样人员,收费人员'
  password: null
  pwdLastUpdateDate: null
  pwdOverdue: false
  activitiSync: null
  status: 1
  deleteFlag: 0
  signature: null
  departid: string
  strength: 10
  currentDepart: null
  departmentIds: string
  roleIds: null
  roleCodes: null
  signatureFile: null
  mobilePhone: '13628325492'
  officePhone: '486'
  email: '123@qq.com'
  createDate: 1742176793000
  createBy: 'admin'
  createName: '管理员'
  updateDate: 1742181327000
  updateBy: 'admin'
  updateName: '管理员'
  signPhoto: 'http://192.168.2.65:8080/fileShare/gfzx/A03/images/2025/541a87de-c131-48f1-82cc-3d4a36a4c990.jpg'
  loginTimes: null
  jobTitle: '开发'
  certificateNo: 'test123456789'
  birthDay: 824227200000
  iconUrl: null
  signKey: null
  tripartiteUserId: null
  tripartiteType: null
  rfid: '30041'
  idCard: '50022219951202243X'
  authStatus: null
  type: 1
  authNo: null
  deedStatus: null
}

export interface RoleList {
  id: string
  roleCode: string
  roleName: string
}

/** 保存用户 */
export function saveUser(data: UserEntity, signPhoto: string) {
  return IlisApiHelper.postForm<IResponseCommonEntity<any>>('userController.do?saveUser', data, {
    params: { signPhoto },
  })
}

/** 获取组织机构树 */
export function getDepartZTree(data: { parentid?: string, orgIds?: string }) {
  return IlisApiHelper.postForm<IResponseCommonEntity<any>>('orgController.do?getDepartZTree', data)
}

/** 获取角色列表 */
export function getRoles() {
  return IlisApiHelper.postForm<{ rows: RoleList[] }>('userController.do?datagridRole&field=id,roleName,roleCode')
}

/** 获取用户信息 */
export function getUser(userId: string) {
  return IlisApiHelper.postForm<UserDTO>('userController/getUser', { userId })
}

/**
 * 重置用户密码
 */
export function resetUserPwdApi(data: { id: string, password: string }) {
  return IlisApiHelper.postForm<any>(`userController.do?savenewpwdforuser`, data)
}
