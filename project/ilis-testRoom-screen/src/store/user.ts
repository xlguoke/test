import { CurrentUserDTO, userLogout } from "@/api/functionRoom2.api"
import { defineStore } from "pinia"
import dayjs from "dayjs"
import { message } from "ant-design-vue"
import { showToast } from "vant"
import { toRefs } from "vue"
import { functionRoom2Store } from "./functionRoom2"

let autoLoginOutTimer: any = null

const { authConfig } = toRefs(functionRoom2Store())

export const userStore = defineStore("user", {
  persist: true,
  state: () => {
    return {
      userInfo: null as CurrentUserDTO | null,
      token: null as string | null
    }
  },
  actions: {
    /** 检查自动退出登录 */
    checkAuthLoginOut() {
      ;(window as any).authToken = this.token

      if (!authConfig.value.staticExitTime || !this.token) {
        return
      }

      const expireTime = dayjs().add(authConfig.value.staticExitTime, "minute").valueOf()

      // 移除监听、移除定时检查
      document.body.removeEventListener("touchstart", this.checkAuthLoginOut)
      document.body.removeEventListener("click", this.checkAuthLoginOut)
      if (autoLoginOutTimer) {
        clearInterval(autoLoginOutTimer)
        autoLoginOutTimer = null
      }

      // 设置监听、设置定时检查
      document.body.addEventListener("touchstart", this.checkAuthLoginOut)
      document.body.addEventListener("click", this.checkAuthLoginOut)

      let tipFlag = false

      autoLoginOutTimer = setInterval(() => {
        const now = new Date().getTime()
        const d = now - expireTime

        if (Math.abs(d / 1000) <= 10 && !tipFlag) {
          showToast("屏幕无操作，将在10秒后自动退出登录！")
          tipFlag = true
        }

        if (d >= 0) {
          message.success("已自动退出登录！")
          this.logout()
        }
      }, 1000)
    },
    /** 扫码登录 */
    async scanLogin(userInfo: CurrentUserDTO, token: string) {
      userInfo.birthDay = dayjs(userInfo.birthDay).format("YYYY-MM-DD")
      this.userInfo = userInfo
      this.token = token
      ;(window as any).authToken = token
    },
    async logout() {
      this.$reset()

      document.body.removeEventListener("touchstart", this.checkAuthLoginOut)
      document.body.removeEventListener("click", this.checkAuthLoginOut)
      clearInterval(autoLoginOutTimer)
      autoLoginOutTimer = null
      ;(window as any).authToken = null

      await userLogout()

      window.location.reload()
    }
  }
})
