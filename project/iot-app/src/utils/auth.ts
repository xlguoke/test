import { useUserStore } from '@/stores'

function isLogin() {
  const { token } = useUserStore()
  return !!token
}

function clearToken() {
  const user = useUserStore()
  user.$reset()
}

export { isLogin, clearToken }
