import qs from 'qs'
import { api } from '~/views/mobileApp/provides/api/api'
import { decryptLocalStorage, encryptLocalStorage } from '~/views/mobileApp/provides/utils/aes'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { useAppUserStore } from '~/views/mobileApp/store/useUserStore.ts'

const expiresTime = 12 * 60 * 60 * 1000

// 重置session过期时间
export function setSessionExpiresTime() {
  const now = new Date().getTime()
  localStorage.setItem('sessionExpiresTime', now + expiresTime)
}

// 检查session是否过期
export function checkSessionIsExpires() {
  const now = new Date().getTime()
  let sessionExpiresTime = localStorage.getItem('sessionExpiresTime')
  if (sessionExpiresTime) {
    sessionExpiresTime = Number.parseInt(sessionExpiresTime)
    if (now >= sessionExpiresTime) {
      return true
    }
    else {
      return false
    }
  }

  return true
}

// 前端帮它重新登录..
export async function reLogin() {
  let userLoginInfo = decryptLocalStorage('userLoginInfo')

  // 做很多判断
  // 没有用户登录用的密码信息时，重登
  if (!userLoginInfo) {
    localStorage.removeItem('userInfo')
    return false
  }

  // 解析用户登录用的信息并登录，如果报错，重登
  try {
    userLoginInfo = JSON.parse(userLoginInfo)

    const loading = showLoadingToast({
      duration: 0,
      forbidClick: true,
      message: '加载中...',
    })
    const res = await mRequest({
      method: 'POST',
      url: api.applogin.checkUser,
      data: qs.stringify({
        ...userLoginInfo,
        orgId: undefined,
      }),
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      },
    }).finally(() => {
      loading.close()
    })

    if (res.success) {
      const loading = showLoadingToast({
        duration: 0,
        forbidClick: true,
        message: '加载中...',
      })
      const loginRes = await mRequest({
        method: 'GET',
        url: api.applogin.login,
        data: qs.stringify(userLoginInfo),
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).finally(() => {
        loading.close()
      })

      if (loginRes.success) {
        const { initUserBaseInfo } = useAppUserStore()
        encryptLocalStorage('userLoginInfo', JSON.stringify(userLoginInfo))

        const loading = showLoadingToast({
          duration: 0,
          forbidClick: true,
          message: '加载中...',
        })
        await initUserBaseInfo().finally(() => {
          loading.close()
        })
        return true
      }
      else {
        localStorage.removeItem('userInfo')
        return false
      }
    }
    else {
      localStorage.removeItem('userInfo')
      return false
    }
  }
  catch (err) {
    console.warn(err)
    localStorage.removeItem('userInfo')
    return false
  }
}
