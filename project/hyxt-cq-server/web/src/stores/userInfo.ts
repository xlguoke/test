import { defineStore } from "pinia"
import { checkJtTokenAPI } from "@/api/login.api"
import { getUsersInfoAPI } from "@/api/system.api"
import { userLocalStorage, getMenuData } from "@/assets/js/common"
import { storeToRefs } from "pinia"
import userStore from "@/stores/userInfo"
import menuStore from "@/stores/menuTree"

export default defineStore("userInfo", {
  state: () => {
    return {
      isJt: false, // 是否从交通综合业务管理门户系统跳转
      jtHeadUrl: "http://119.3.178.54:8990/jtportal/head",
      jtLoginUrl: "http://119.3.178.54:8990/jtportal/login",
      userInfo: {} as any
    }
  },
  actions: {
    async checkJtToken(token: string) {
      return await checkJtTokenAPI({ id_token: token })
        .then((res) => {
          return Promise.resolve(res)
        })
        .catch(() => {
          return Promise.reject()
        })
    },
    getMenuTree(idToken: string) {
      return new Promise(async (resolve, reject) => {
        if (!idToken) {
          return reject(401)
        }
        try {
          const { menuTree } = storeToRefs(menuStore())
          const { userInfo } = storeToRefs(userStore())
          const res = await this.checkJtToken(idToken)
          userLocalStorage.set("userToken", res)
          try {
            let userData = await getUsersInfoAPI()
            let v = await getMenuData()
            userInfo.value = userData
            menuTree.value = v
            if (!userData.orgId) {
              return resolve(1)
            }
          } catch (err) {
            reject(500)
            return
          }
          resolve("")
        } catch (err) {
          console.log(`output->2`, err)
          reject(err)
        }
      })
    }
  },
  // 所有数据持久化
  // persist: true,
  // 持久化存储插件其他配置
  persist: {
    // 修改存储中使用的键名称，默认为当前 Store的 id
    // key: 'existTags',
    // 修改为 sessionStorage，默认为 localStorage
    // storage: window.sessionStorage,
    // 部分持久化状态的点符号路径数组，[]意味着没有状态被持久化(默认为undefined，持久化整个状态)
    paths: ["userInfo", "isJt", "jtHeadUrl", "jtLoginUrl"]
  }
})
