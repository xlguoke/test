import { defineStore } from 'pinia'
import type { UserInfo } from '@/api/user'
import { jwtDecode } from 'jwt-decode'

import { getUserInfo, login, refreshToken } from '@/api/user'
import { InEmbed } from '@/utils/referrer'

export const useUserStore = defineStore('user', {
  persist: true,
  state: () => {
    return {
      unitCode: '',
      token: null,
      refreshToken: null,
      userInfo: null as UserInfo,
    }
  },
  actions: {
    setToken(token) {
      this.token = token
    },
    setUnitCode(unitCode) {
      this.unitCode = unitCode
    },
    async initUserInfo() {
      const { data } = await getUserInfo()
      this.userInfo = data

      if (!this.unitCode) {
        if (data.unitCode) {
          this.unitCode = data.unitCode
        }
        else {
          try {
            const baseUserInfo = localStorage.getItem('baseUserInfo')
            if (baseUserInfo) {
              const baseUserInfoData = JSON.parse(baseUserInfo)
              if (baseUserInfoData.unitCode) {
                this.unitCode = baseUserInfoData.unitCode
              }
            }
          }
          catch (e) {
            // eslint-disable-next-line no-console
            console.log(e)
          }
        }
      }
    },
    async login(userName: string, password: string, unitCode: string) {
      const res = await login(userName, password, unitCode).catch((err) => {
        if (err.status === 500) {
          showDialog({
            title: '登录失败',
            message: '请检查公司登录名！',
          })
        }
      })

      if (res && res.code !== 20010) {
        this.token = res.data.ACCESS_TOKEN
        this.unitCode = unitCode
        this.refreshToken = res.data.REFRESH_TOKEN
        this.initUserInfo()
      }

      return res
    },
    async refresh() {
      const { data } = await refreshToken(this.unitCode, this.refreshToken)
      this.token = data.ACCESS_TOKEN
      this.refreshToken = data.REFRESH_TOKEN
    },
    async checkLoginStatus() {
      if (!InEmbed && this.token) {
        const now = Math.floor(Date.now() / 1000)
        const expiresAt = jwtDecode(this.token).exp ?? 0

        if (now < expiresAt) {
          if (expiresAt - now < 60 * 30) {
            await this.refresh()
          }
        }
        else {
          showDialog({
            title: '请重新登录',
            message: '无效或已过期的登录凭证',
          }).then(() => {
            this.$reset()
            window.location.reload()
          })
        }
      }
    },
  },
})
