import request from '@/utils/request'

export interface UserInfo {
  id: '8a8ab0b246dc81120146dc8181950052'
  userName: 'admin'
  ssoName: 'cs01'
  realName: '管理员'
  browser: null
  userKey: '分部主任,管理员'
  status: 1
  deleteFlag: 0
  signatureFile: ''
  mobilePhone: '15215017478'
  officePhone: ''
  email: ''
  createDate: 1469003175000
  createBy: null
  createName: null
  updateDate: 1741157378000
  updateBy: 'admin'
  updateName: '管理员'
  signPhoto: 'http://192.168.2.65:8080/fileShare/gfzx/A03/images/2023/158f59c1-df03-48c8-b61d-3ab74261b417.png'
  loginTimes: 24001
  jobTitle: ''
  certificateNo: '1'
  birthDay: 1580659200000
  iconUrl: 'http://192.168.2.65:8080/fileShare/gfzx/A03/images/2024/3e965ac2-00d2-4b33-a66e-438cd822bd05.jpg'
  signKey: '16879c91492942ef8fbb6ecf17f97aaf'
  tripartiteUserId: '16879c91492942ef8fbb6ecf17f97aaf'
  tripartiteType: 'FDD'
  rfid: ''
  idCard: '522426199605153246'
  deedStatus: null
  type: 1
}

export interface SaveNewPwdEntity {
  password: string
  newpassword: string
}

// 登录
export function login(username: string, password: string, unitCode: string): Promise<any> {
  return request.post('/api/handbook/login', {
    username,
    password: btoa(password),
  }, {
    headers: {
      'Unit-Code': unitCode,
    },
  })
}

// 获取用户信息
export function getUserInfo(): Promise<any> {
  return request.post('/rest/userController/user/info')
}

// 刷新token
export function refreshToken(unitCode: string, refreshToken: string): Promise<any> {
  return request.post('/api/auth/refresh/token', null, {
    headers: {
      'Unit-Code': unitCode,
      'Refresh-Token': refreshToken,
    },
  })
}

// 修改密码
export function saveNewPwd(data: SaveNewPwdEntity): Promise<any> {
  return request.post('userController.do?savenewpwd', data, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    },
  })
}

// 退出登录
export function logout(): Promise<any> {
  return request.get('loginController.do?logout')
}

/**
 * # 更新用户信息
 */
export function updateUserInfo(data: Record<string, any>) {
  return request.get('/userController.do?updateUserBasicInfo', {
    params: data,
  })
}
