<template>
  <div class="applogin-login">
    <div>
      <div class="applogin-login-title">
        登录
      </div>
      <a-input v-model:value="info.userName" placeholder="请输入账户">
        <template #addonBefore>
          <UserOutlined />
        </template>
      </a-input>
      <a-input
        v-if="!curCompany"
        v-model:value="info.companyId"
        placeholder="请输入公司登录名"
      >
        <template #addonBefore>
          <ApartmentOutlined />
        </template>
      </a-input>
      <a-input
        v-model:value="info.password"
        placeholder="请输入密码"
        type="password"
      >
        <template #addonBefore>
          <LockOutlined />
        </template>
      </a-input>
      <a-row :gutter="10">
        <a-col span="16">
          <a-input v-model:value="info.randCode" placeholder="请输入验证码">
            <template #addonBefore>
              <VerifiedOutlined />
            </template>
          </a-input>
        </a-col>
        <a-col span="8">
          <img :src="codeImg" class="h-[32px]" />
        </a-col>
      </a-row>
      <a-button type="primary" :loading="loginLoading" @click="checkOnline">
        登录
      </a-button>
    </div>
  </div>
</template>

<script>
import { ApartmentOutlined, LockOutlined, UserOutlined, VerifiedOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import CryptoJS from 'crypto-js'
import qs from 'qs'
import mAjax from '~/providers-moblie/common/ajax'
import mApi from '~/providers-moblie/common/api'
import { getQueryVariable } from '~/providers-moblie/common/utils'
import { rootUrl } from '~/providers-moblie/configs/rootUrl'

export default {
  components: {
    UserOutlined,
    LockOutlined,
    ApartmentOutlined,
    VerifiedOutlined,
  },
  data() {
    return {
      info: {
        userName: '',
        password: '',
        companyId: '',
        randCode: '',
        loginFrom: 'app',
      },
      codeImg: `${rootUrl}/randCodeImage?a=${new Date().getTime()}`,
      targetUrl: getQueryVariable('targetUrl'),
      curCompany: getQueryVariable('curCompany'),
      loginLoading: false,
    }
  },
  created() {
    // 如果url上没有返回curCompany，那就再targetUrl上取unitCode
    if (!this.curCompany) {
      this.curCompany = getQueryVariable('unitCode')
    }
    if (this.curCompany === 'hxcd') {
      document.title = '宏信创达试验检测云平台'
    }
    else {
      document.title = '试验检测管理信息系统'
    }
    this.info.companyId = this.curCompany
    localStorage.setItem('title', document.title)
  },
  methods: {
    encrypt(word) {
      const keyBase64 = 'o9szYIOq1rRMiouNhNvaq96lqUvCekxR'
      const key = CryptoJS.enc.Base64.parse(keyBase64)
      const srcs = CryptoJS.enc.Utf8.parse(word)
      const encrypted = CryptoJS.AES.encrypt(srcs, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
      })
      return encrypted.toString()
    },
    checkOnline() {
      const query = {
        ...this.info,
        password: this.encrypt(this.info.password),
        userName: this.encrypt(this.info.userName),
      }

      this.loginLoading = true
      mAjax({
        method: 'POST',
        url: mApi.applogin.checkUserOnlineStatus,
        data: qs.stringify(query),
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).then((res) => {
        if (res.success) {
          this.checkUser(this.info)
        }
        else {
          this.loginLoading = false
          message.error(res.msg)
        }
      }).catch(() => {
        this.loginLoading = false
      })
    },
    checkUser() {
      mAjax({
        method: 'POST',
        url: mApi.applogin.checkUser,
        data: qs.stringify(this.info),
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).then((res) => {
        if (res.success) {
          if (res.attributes.orgNum && res.attributes.orgNum > 1) {
            this.loginLoading = false
            this.loginByDepartment(res.attributes.user.id)
          }
          else {
            const userId = res.attributes.userId
            localStorage.setItem('userId', userId)
            this.login()
          }
        }
        else {
          message.error(res.msg)
        }
      }).catch(() => {
        this.loginLoading = false
      })
    },
    async loginByDepartment(userId) {
      const res1 = await mAjax({
        method: 'get',
        url: mApi.applogin.getUserOrgs,
        params: {
          userId,
          unitId: this.info.companyId,
        },
      })

      if (res1.success) {
        const department = res1.obj[0]

        mAjax({
          method: 'POST',
          url: mApi.applogin.orgLogin,
          data: qs.stringify({
            ...this.info,
            orgId: department.departId,
          }),
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
        }).then((res) => {
          if (res.success) {
            const userId = res.attributes.userId
            localStorage.setItem('userId', userId)

            message.success('登录成功')
            const backUrl = location.search.split('targetUrl=')[1]
            top.location.replace(decodeURIComponent(backUrl))
          }
          else {
            message.error(res.msg)
          }
        })
      }
      else {
        message.error(res1.msg || res1.message || '数据异常')
      }
    },
    login() {
      mAjax({
        method: 'GET',
        url: mApi.applogin.login,
        data: qs.stringify(this.info),
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).then((res) => {
        if (res.success) {
          message.success(res.msg)
          const backUrl = location.search.split('targetUrl=')[1]
          top.location.replace(decodeURIComponent(backUrl))
        }
        else {
          this.loginLoading = false
          message.error(res.msg)
        }
      }).catch(() => {
        this.loginLoading = false
      })
    },
  },
}
</script>

<style lang="less" scoped>
@import url('./index.less');
</style>
