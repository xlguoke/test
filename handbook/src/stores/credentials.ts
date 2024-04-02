import { defineStore } from 'pinia'
import { z } from 'zod'
import { jwtDecode } from 'jwt-decode'
import { useServerStore } from './servers'
import { request } from '@/axios'

interface LoginForm {
  code: string
  username: string
  password: string
}

export const useCredentialStore = defineStore('credential', {
  state: () => {
    return {
      code: '',
      token: '',
      refreshToken: '',
      authenticated: false,
      /**
       * epoch time in seconds
       */
      expiresAt: 0,
    }
  },
  actions: {
    /**
     * side effect:
     *
     * request token from server then stores it
     * @param form
     */
    async requestToken(form: LoginForm) {
      const serverStore = useServerStore()
      const server = await serverStore.getServer(form.code)
      const tokens = await request({
        baseURL: server.addr,
        url: '/ilis2/api/handbook/login',
        method: 'post',
        data: {
          username: form.username,
          password: btoa(form.password),
        },
        headers: {
          'Unit-Code': form.code,
        },
        useCredentials: false,
        useServer: false,
        schema: z.object({
          ACCESS_TOKEN: z.string(),
          REFRESH_TOKEN: z.string(),
        }),
      })
      this.code = form.code
      this.token = tokens.ACCESS_TOKEN
      this.refreshToken = tokens.REFRESH_TOKEN
      this.expiresAt = jwtDecode(this.token).exp ?? 0
      this.authenticated = true
    },
    async refresh() {
      const tokens = await request({
        url: '/ilis2/api/auth/refresh/token',
        method: 'post',
        headers: {
          'Unit-Code': this.code,
          'Refresh-Token': this.refreshToken,
        },
        useCredentials: false,
        schema: z.object({
          ACCESS_TOKEN: z.string(),
          REFRESH_TOKEN: z.string(),
        }),
      })
      this.token = tokens.ACCESS_TOKEN
      this.refreshToken = tokens.REFRESH_TOKEN
      this.expiresAt = jwtDecode(this.token).exp ?? 0
    },
    /**
     * This function will attempt to refresh token if it is about to expire
     *
     * If refresh token encounters error(e.g., refresh-token is expired or request failed), it just logs a warning message.
     * The next action(e.g., route changes or device pause/resume) will try to refresh token again.
     * Consequently, this action may result in two scenarios:
     * 1. Tokens are refreshed.
     * 2. Credentials remain in an invalid state.
     */
    async hasValidCredential() {
      // truncate milliseconds to coordinates JWT.exp
      const now = Math.floor(Date.now() / 1000)
      if (this.authenticated && now < this.expiresAt) {
        if (this.expiresAt - now < 60 * 30) {
          console.warn('token is about to expire, refreshing...')
          try {
            await this.refresh()
          }
          catch (e) {
            console.warn('failed to refresh token', e)
          }
        }
        return true
      }
      return false
    },
  },
})
