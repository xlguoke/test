interface LocalUserInfoEntity {
  pwdOverdue: boolean
  realName: string
  birthDay: number
  ssoName: string
  authVerify: string
  kind: number
  jobTitle: string
  userId: string
  username: string
  departName: string
}

export function getLocalUserInfo(): LocalUserInfoEntity | null {
  const u = localStorage.getItem('userInfo')
  if (u) {
    return JSON.parse(u)
  }
  else {
    return null
  }
}
