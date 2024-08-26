import { defineStore } from 'pinia'
import useMyFetch from '@/composables/useMyFetch'
import type { LoginUserInfo, PermissionTree, UserInfo } from '@/types/permission.d'

const initUserInfo: UserInfo = {
  id: '',
  username: '',
  name: '',
  avatar: '',
  roles: [],
  certificates: [],
}

export const USER = 'USER'
export const ADMIN = 'ADMIN'
export default defineStore('permissions', {
  persist: {
    storage: localStorage,
    paths: ['Authorization', 'permissions', 'userPermissions', 'userInfo', 'isAdmin'],
  },
  state: () => ({
    Authorization: '', // token
    // 全部权限信息
    permissions: [] as PermissionTree[],
    // 用户权限
    userPermissions: [] as string[],
    // 用户信息
    userInfo: {} as UserInfo,
    // 当前用户是否为管理员
    isAdmin: false,
    /**
     * 是否已获取用户信息
     * 不持久化，刷新浏览器时获取最新的权限
     */
    isUserInfo: false,
  }),
  actions: {
    // 登录页路由
    loginPath() {
      const path = this.isAdmin ? '/admin/login' : '/login'
      return path
    },
    /**
     * 首页路由
     * 从 /admin/login 登录，且存在权限，则进入后台管理，否则进入首页
     */
    homePath(entry?: string) {
      return entry === ADMIN && this.userPermissions.length > 0 ? '/admin' : '/'
    },
    // 验证路由权限信息
    checkRouteAuth(routeAuthName: string): boolean {
      // 后台管理admin下无首页，不做拦截，在渲染菜单时处理
      if (routeAuthName === 'home')
        return true
      const authRoute = this.userPermissions.find(item => item === routeAuthName)
      return !!authRoute
    },
    // 获取全部权限信息
    async getAllPermissions() {
      const { data, error } = await useMyFetch<PermissionTree[]>('/api/v1/permissions')
      if (error.value) {
        this.permissions = []
      }
      else {
        this.permissions = data.value || []
      }
      return true
    },
    // 获取用户权限信息
    async getUserPermissions() {
      if (this.isUserInfo)
        return
      const { data } = await useMyFetch<LoginUserInfo>('/api/v1/login/user/info')
      if (data.value) {
        const _user = data.value.userInfo || {}
        const datas = data.value?.permissions || []
        this.userInfo = { ..._user, id: data.value.id }
        this.userPermissions = datas.sort()
      }
      else {
        this.userInfo = { ...initUserInfo }
        this.userPermissions = []
      }
      this.isAdmin = this.userPermissions.length > 0
      this.isUserInfo = true
      return true
    },
    // 验证执行权限
    hasPermission(value: string) {
      if (!value)
        return true
      return this.userPermissions.includes(value)
    },
  },
})
