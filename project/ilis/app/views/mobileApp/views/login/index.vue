<template>
  <div class="login">
    <div class="login-gfzx">
      <div class="login-gfzx-con">
        <div class="login-gfzx-title">
          登录智慧试验室
        </div>
        <div class="login-gfzx-name">
          <img v-if="companyLogo" :src="companyLogo" />{{
            companyName || '试验检测管理信息系统'
          }}
        </div>
      </div>
      <img :src="loginBgSvg" width="100%" />

      <a
        v-if="InMiniProgram"
        href="javascript:;"
        class="login-switch-unit"
        @click="onSwitchUnit"
      >切换服务器</a>
    </div>

    <div>
      <van-form @submit="onSubmit">
        <van-field
          v-model="formData.userName"
          name="userName"
          clearable
          center
          placeholder="账户/注册手机号"
          :rules="[{ required: true, message: '请输入用户名' }]"
        >
          <template #left-icon>
            <img :src="loginUserSvg" />
          </template>
        </van-field>
        <van-field
          v-if="!companyId"
          v-model="formData.companyId"
          name="companyId"
          clearable
          center
          placeholder="请输入公司登录名"
          :rules="[{ required: true, message: '请输入公司登录名' }]"
        >
          <template #left-icon>
            <img :src="loginCompanySvg" />
          </template>
        </van-field>
        <van-field
          v-model="formData.password"
          :type="showPasswrod ? 'text' : 'password'"
          name="password"
          center
          clearable
          placeholder="密码"
          :rules="[{ required: true, message: '请输入密码' }]"
        >
          <template #left-icon>
            <img :src="logoPasswordSvg" />
          </template>
          <template #right-icon>
            <van-icon
              v-if="showPasswrod"
              name="eye-o"
              @click="showPasswrod = false"
            />
            <van-icon v-else name="closed-eye" @click="showPasswrod = true" />
          </template>
        </van-field>
        <van-field
          v-if="randomCode"
          v-model="formData.randCode"
          name="randCode"
          center
          clearable
          placeholder="验证码"
          :rules="[{ required: true, message: '请输入验证码' }]"
        >
          <template #left-icon>
            <img :src="logoCodeSvg" />
          </template>
          <template #button>
            <div class="login-codeImg" @click="reloadRandCode">
              <img :src="`/ilis2/randCodeImage?a=${randCode}`" />
            </div>
          </template>
        </van-field>

        <div class="login-btn">
          <van-button block type="primary" native-type="submit">
            登录
          </van-button>
        </div>
        <!-- <div v-if="wechartAppid">
            <van-divider
              content-position="center"
              :style="{ borderColor: '#969799' }"
              >其他登录方式</van-divider
            >
            <div style="text-align: center">
              <van-icon
                color="#01d30e"
                class-prefix="iconfont"
                name="wechat"
                size="32"
                @click="wxLoginFn"
              />
            </div>
          </div> -->
      </van-form>
    </div>
  </div>
</template>

<script>
import { mapState } from 'pinia'
import qs from 'qs'
import { api } from '~/views/mobileApp/provides/api/api'
import { appConfig } from '~/views/mobileApp/provides/config/appConfig'
import { weChatConfig } from '~/views/mobileApp/provides/config/weChatConfig'
import { encrypt, encryptLocalStorage } from '~/views/mobileApp/provides/utils/aes'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { InMiniProgram } from '~/views/mobileApp/provides/utils/referrer'
import { useAppUserStore } from '~/views/mobileApp/store/useUserStore.ts'

export default {
  data() {
    return {
      loginBgSvg: new URL(`~/views/mobileApp/assets/icon/login-bg.svg`, import.meta.url).href,
      loginUserSvg: new URL(`~/views/mobileApp/assets/icon/logo-user.svg`, import.meta.url).href,
      loginCompanySvg: new URL(`~/views/mobileApp/assets/icon/logo-company.svg`, import.meta.url).href,
      logoPasswordSvg: new URL(`~/views/mobileApp/assets/icon/logo-password.svg`, import.meta.url).href,
      logoCodeSvg: new URL(`~/views/mobileApp/assets/icon/logo-code.svg`, import.meta.url).href,
      formData: {
        userName: '',
        password: '',
        randCode: '',
        loginFrom: 'app',
        companyId: undefined,
      },
      wechatInfo: {},
      randCode: '',
      companyId: undefined,
      wechartAppid: '',
      wechatUrl: '',
      hasWechatLogin: false,
      randomCode: false,
      showPasswrod: false,
      InMiniProgram,
    }
  },
  computed: {
    ...mapState(useAppUserStore, ['userInfo', 'companyName', 'companyLogo']),
    userId() {
      return this.userInfo.id
    },
    logoBgColor() {
      return appConfig.logoBgColor
    },
  },
  created() {
    const appUserStore = useAppUserStore()

    const companyId = appUserStore.companyId
    this.companyId = companyId
    this.formData.companyId = companyId

    // 目前只有宏信创达有微信 登录
    if (companyId === 'hxcd') {
      this.hasWechatLogin = true

      const companyWechat = weChatConfig[companyId] || {}
      this.wechartAppid = companyWechat.appid
      this.wechatUrl = companyWechat.url
    }
  },
  mounted() {
    this.reloadRandCode()
  },
  methods: {
    onSwitchUnit() {
      showConfirmDialog({
        title: '提示',
        message: '确认切换服务器吗？',
      }).then(() => {
        wx.miniProgram.navigateTo({
          url: '/pages/index/index?switchUnit=1',
        })
      })
    },
    // 登录
    async onSubmit() {
      this.checkUserOnlineStatus(this.formData)
    },
    // 检查 登录状态
    async checkUserOnlineStatus(formData) {
      const query = {
        ...formData,
        password: encrypt(formData.password),
        userName: encrypt(formData.userName),
      }
      const toast = showLoadingToast({
        duration: 0,
        forbidClick: true,
      })
      const res = await mRequest({
        method: 'POST',
        url: api.applogin.checkUserOnlineStatus,
        data: qs.stringify({
          ...query,
          os: this.getOsInfo(),
          browser: this.getBrowser(),
        }),
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).finally(() => {
        toast.close()
      })

      if (res.success) {
        if (res.obj) {
          showConfirmDialog({
            title: '提示',
            message:
              '当前账号已在其他手机登录，继续登录将会导致其强制下线，点击“确认”前，请确保其资料已保存，否则可能会导致未保存数据丢失！',
          })
            .then(() => {
              this.checkUser(formData)
            })
            .catch(() => {})
        }
        else {
          this.checkUser(formData)
        }
      }
      else {
        if (res.attributes.loginState > 2) {
          this.randomCode = true
        }
        showDialog({
          message: res.msg || res.message || '系统错误，请联系管理员',
        })
      }
    },
    // 登录
    async checkUser(formData) {
      const query = {
        ...formData,
        password: encrypt(formData.password),
        userName: encrypt(formData.userName),
      }

      const toast = showLoadingToast({
        duration: 0,
        forbidClick: true,
      })
      const checkUserRes = await mRequest({
        method: 'POST',
        url: api.applogin.checkUser,
        data: qs.stringify(query),
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).finally(() => {
        toast.close()
      })

      if (checkUserRes.success) {
        this.appLogin(formData)
      }
      else {
        showDialog({
          message: checkUserRes.msg || checkUserRes.message || '登录失败',
        })
      }
    },
    // 登录
    async appLogin(formData) {
      const loginLoading = showLoadingToast({
        duration: 0,
        forbidClick: true,
        message: '登录中...',
      })
      const res = await mRequest({
        method: 'GET',
        url: api.applogin.login,
        data: qs.stringify(formData),
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).finally(() => {
        loginLoading.close()
      })

      if (res.success) {
        const { initUserBaseInfo } = useAppUserStore()
        encryptLocalStorage('userLoginInfo', JSON.stringify(this.formData))

        const loading = showLoadingToast({
          duration: 0,
          forbidClick: true,
          message: '加载中...',
        })
        await initUserBaseInfo().finally(() => {
          loading.close()
        })

        showSuccessToast('登录成功')
        if (this.$route.query.redirectURL) {
          this.$router.push(this.$route.query.redirectURL)
        }
        else {
          this.$router.push({ name: 'home' })
        }
      }
      else {
        showDialog({
          type: 'danger',
          message: res.msg || res.message || '登录失败',
        })
      }
    },
    // 刷新验证码
    reloadRandCode() {
      this.randCode = new Date().getTime()
    },
    outLogin() {
      if (!this.aweixin) {
        // plus.nativeUI.alert("当前环境不支持微信登录");
        return
      }
      this.aweixin.logout(
        () => {
          // plus.nativeUI.alert("注销登录认证成功!"+JSON.stringify(e));
        },
        () => {
          // console.log("注销登录认证失败: " + JSON.stringify(e));
        },
      )
    },
    async wechatLogin() {
      const toast = showLoadingToast({
        duration: 0,
        forbidClick: true,
      })
      const res = await mRequest.post(
        api.applogin.wechatLogin,
        qs.stringify({
          openId: this.wechatInfo.userInfo.openid,
          state: this.companyId,
          loginFrom: 'app',
        }),
      ).finally(() => {
        toast.close()
      })

      if (res.success) {
        showNotify({
          type: 'primary',
          message: '登录成功',
          duration: 1000,
        })
        this.$router.push({ name: 'home' })
      }
      else {
        showDialog({ message: res.message || res.msg || '微信 登录失败' })
      }
    },
    wxLoginFn() {
      // eslint-disable-next-line ts/no-this-alias
      const self = this
      getService()

      // 微信授权登录对象
      let aweixin = null
      // 当前环境支持的所有授权登录对象
      let auths = null

      // 获取登录授权认证服务列表，单独保存微信登录授权对象
      function getService() {
        plus.oauth.getServices(
          (services) => {
            auths = services
            authLogin()
          },
          () => {
            plus.nativeUI.alert('获取登录授权服务列表失败，请稍后重试')
          },
        )
      }

      // 获取微信登录授权对象后可进行登录认证操作
      function authLogin() {
        for (let i = 0; i < auths.length; i++) {
          if (auths[i].id === 'weixin') {
            aweixin = auths[i]
            // self.aweixin = aweixin;
            self.wechatInfo = aweixin
            break
          }
        }
        if (!aweixin) {
          plus.nativeUI.alert('当前环境不支持微信登录')
          return
        }
        if (!aweixin.authResult) {
          aweixin.login(
            () => {
              // plus.nativeUI.alert("登录认证成功!"+JSON.stringify(e));
              authUserInfo()
            },
            () => {
              // plus.nativeUI.alert("登录认证失败: "+JSON.stringify(e));
            },
          )
        }
        else {
          console.warn('已经登录认证!')
        }
      }

      // 获取微信登录授权对象后获取用户信息操作
      function authUserInfo() {
        console.warn('微信登录中...')
        if (!aweixin) {
          console.warn('结束')
          plus.nativeUI.alert('当前环境不支持微信登录')
          return
        }

        if (aweixin.authResult) {
          aweixin.getUserInfo(
            () => {
              // 登录成功处理
              console.warn('登录成功 结束')
              // plus.nativeUI.alert("获取用户信息成功："+JSON.stringify(aweixin.userInfo));
              // const wxUserInfo = aweixin.userInfo
              self.wechatLogin()
              // Storage.set("wxUserInfo", JSON.stringify(wxUserInfo));
              // authLoginOut(); //注销登录防止切换账号获取到旧信息
            },
            (e) => {
              console.warn(`获取用户信息失败： ${JSON.stringify(e)}`)
            },
          )
        }
        else {
          console.warn('结束')
          plus.nativeUI.alert('未登录认证!')
        }
      }
      //
      // // 注销登录认证
      // function authLoginOut() {
      //   if (!aweixin) {
      //     plus.nativeUI.alert('当前环境不支持微信登录')
      //     return
      //   }
      //   aweixin.logout(
      //     () => {
      //       // plus.nativeUI.alert("注销登录认证成功!"+JSON.stringify(e));
      //     },
      //     (e) => {
      //       console.warn(`注销登录认证失败: ${JSON.stringify(e)}`)
      //     },
      //   )
      // }
    },
    wxLoginByWechat() {
      // const redirect_uri = encodeURIComponent(wechatUrl)
      window.location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${wechartAppid}&redirect_uri=${wechatUrl}&response_type=code&scope=snsapi_userinfo&state=STATUS#wechat_redirect`
    },
    getOsInfo() {
      const userAgent = navigator.userAgent.toLowerCase()
      let name
      if (userAgent.includes('win')) {
        name = 'Windows'
        if (userAgent.includes('windows nt 5.0')) {
          name = 'Windows 2000'
        }
        else if (
          userAgent.includes('windows nt 5.1')
          || userAgent.includes('windows nt 5.2')
        ) {
          name = 'Windows XP'
        }
        else if (userAgent.includes('windows nt 6.0')) {
          name = 'Windows Vista'
        }
        else if (
          userAgent.includes('windows nt 6.1')
          || userAgent.includes('windows 7')
        ) {
          name = 'Windows 7'
        }
        else if (
          userAgent.includes('windows nt 6.2')
          || userAgent.includes('windows 8')
        ) {
          name = 'Windows 8'
        }
        else if (userAgent.includes('windows nt 6.3')) {
          name = 'Windows 8.1'
        }
        else if (
          userAgent.includes('windows nt 6.2')
          || userAgent.includes('windows nt 10.0')
        ) {
          name = 'Windows 10'
        }
        else {
          name = 'Unknown'
        }
      }
      else if (userAgent.includes('iphone')) {
        name = 'iPhone'
      }
      else if (userAgent.includes('mac')) {
        name = 'Mac'
      }
      else if (
        userAgent.includes('x11')
        || userAgent.includes('unix')
        || userAgent.includes('sunname')
        || userAgent.includes('bsd')
      ) {
        name = 'Unix'
      }
      else if (userAgent.includes('linux')) {
        if (userAgent.includes('android')) {
          name = 'Android'
        }
        else {
          name = 'Linux'
        }
      }
      else {
        name = 'Unknown'
      }
      return name
    },
    getBrowser() {
      const userAgent = navigator.userAgent

      const isIE11 = userAgent.toLowerCase().match(/rv:([\d.]+)\) like gecko/)
      const isOpera = userAgent.includes('Opera')
      const isIE
        = (userAgent.includes('compatible')
          && userAgent.includes('MSIE')
          && !isOpera)
        || isIE11
      const isEdge = userAgent.includes('Edge')
      const isFF = userAgent.includes('Firefox')
      const isSafari
        = userAgent.includes('Safari') && !userAgent.includes('Chrome')
      const isChrome
        = userAgent.includes('Chrome') && userAgent.includes('Safari')

      if (isIE) {
        const reIE = /MSIE \d+\.\d+;/
        reIE.test(userAgent)
        // eslint-disable-next-line regexp/no-legacy-features
        const fIEVersion = Number.parseFloat(RegExp.$1)
        if (fIEVersion === 7) {
          return 'IE7'
        }
        else if (fIEVersion === 8) {
          return 'IE8'
        }
        else if (fIEVersion === 9) {
          return 'IE9'
        }
        else if (fIEVersion === 10) {
          return 'IE10'
        }
        else if (isIE11) {
          return 'IE11'
        }
        else {
          return 'IE'
        }
      }
      if (isOpera) {
        return 'Opera'
      }
      if (isEdge) {
        return 'Edge'
      }
      if (isFF) {
        return 'Firefox'
      }
      if (isSafari) {
        return 'Safari'
      }
      if (isChrome) {
        return 'Chrome'
      }
      return 'Unknown'
    },
  },
}
</script>

<style lang="less" scoped>
@import url('./index.less');
</style>
