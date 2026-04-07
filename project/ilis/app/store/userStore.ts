export interface UserInfo {
  pwdOverdue: boolean
  realName: string
  birthDay: number
  ssoName: string
  authVerify: boolean
  kind: number
  jobTitle: string
  userId: string
  username: string
  departName: string
}

export const userStore = defineStore('user', () => {
  const userInfo = ref<UserInfo>(localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo') || '{}') : {})

  const unitCode = ref<string>(localStorage.getItem('unitCode') || '')

  return {
    userInfo,
    unitCode,
  }
})
