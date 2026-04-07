import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { useAppUserStore } from '~/views/mobileApp/store/useUserStore.ts'

class ThirdLogin {
  // 标记第三方登录是否成功
  // 做页面级缓存，刷新页面后需要重新进行第三方登录
  isThirdLogined = false

  constructor() {}

  // 检查第三方登录逻辑
  async checkThirdLogin() {
    if (this.isThirdLogined === true) {
      return false
    }

    const r1 = await this.loginByIlisToken()
    if (r1 === true || r1 === 'error') {
      return r1
    }

    return false
  }

  // 根据ilis token进行第三方登录
  async loginByIlisToken() {
    const htplat_token = this.getLoginKey('htplat_token')
    const unitCode = this.getLoginKey('UnitCode') || this.getLoginKey('unitCode')

    if (!htplat_token) {
      return false
    }

    showLoadingToast({
      duration: 0,
      forbidClick: true,
      message: '授权登录中...',
    })
    const res = await mRequest.get('/api/loginController/token/login', {
      params: {
        token: htplat_token,
      },
      headers: {
        'Unit-Code': unitCode,
      },
    }).finally(() => {
      closeToast()
    })

    if (res.code !== 20010) {
      this.isThirdLogined = true
      // 由于是通过token直接登录的，目前接口没有返回类似登录接口的用户信息，此处调用该接口(PS：该接口本来也是应该调用的)，再组装出表单登录接口返回的用户信息存储
      await useAppUserStore().initUserBaseInfo()
      const userInfo = useAppUserStore().userInfo

      localStorage.setItem(
        'userInfo',
        JSON.stringify({
          pwdOverdue: userInfo.pwdOverdue,
          realName: userInfo.realName,
          birthDay: userInfo.birthDay,
          ssoName: userInfo.ssoName,
          jobTitle: userInfo.jobTitle,
          userId: userInfo.id,
          username: userInfo.userName,
          authVerify: null,
          kind: null,
          departName: null,
        }),
      )
      return true
    }
    else {
      showDialog({
        title: '授权登录失败',
        message: res.message,
      }).then(() => {
        window.history.go(-1)
      })
      return 'error'
    }
  }

  getLoginKey(name) {
    const urlParams = new URLSearchParams(location.search)
    const hashParams = new URLSearchParams(location.hash.split('?')[1])

    return urlParams.get(name) || hashParams.get(name) || null
  }
}

export const thirdLogin = new ThirdLogin()
