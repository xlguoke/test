<template>
  <div class="settingPasswrod">
    <van-sticky>
      <MobileTitleBar left-arrow @click-left="$router.go(-1)" />
    </van-sticky>

    <div v-if="formData.newpassword" class="settingPasswrod-level">
      当前密码强度：
      <span v-if="passwordLevel === '低'" style="color: red">低</span>
      <span v-if="passwordLevel === '中'" style="color: #ff976a">中</span>
      <span v-if="passwordLevel === '高'" style="color: green">高</span>
    </div>
    <van-form ref="form">
      <van-field
        v-model="formData.password"
        label-width="5.5em"
        label="原密码"
        placeholder="请输入"
        required
        type="password"
        :rules="[{ required: true, message: '请输入原密码' }]"
      >
        <template #left-icon>
          <img
            :src="logoPasswordSvg"
            style="width: 20px; margin-right: 8px"
          />
        </template>
      </van-field>
      <van-field
        v-model="formData.newpassword"
        label-width="5.5em"
        label="新密码"
        placeholder="请输入"
        required
        type="password"
        :rules="[{ validator: validatePassword, message: '请输入新密码' }]"
      >
        <template #left-icon>
          <img
            :src="logoPasswordSvg"
            style="width: 20px; margin-right: 8px"
          />
        </template>
      </van-field>
      <van-field
        v-model="renewpassword"
        label-width="5.5em"
        name="renewpassword"
        label="确认密码"
        placeholder="请输入"
        required
        type="password"
        :rules="[
          { validator: validateRePassword, message: '请再次输入新密码' },
        ]"
      >
        <template #left-icon>
          <img
            :src="logoPasswordSvg"
            style="width: 20px; margin-right: 8px"
          />
        </template>
      </van-field>
    </van-form>
    <div class="settingPasswrod-btns">
      <van-button type="primary" block square @click="submit">
        修改密码
      </van-button>
    </div>
  </div>
</template>

<script>
import qs from 'qs'
import { showDialog, showLoadingToast, showNotify } from 'vant'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'

export default {
  components: {
    MobileTitleBar,
  },
  data() {
    return {
      logoPasswordSvg: new URL(`~/views/mobileApp/assets/icon/logo-password.svg`, import.meta.url).href,
      formData: {
        password: '',
        newpassword: '',
      },
      renewpassword: '',
      passwordLevel: '低',
    }
  },
  watch: {
    'formData.newpassword': function (val) {
      if (val !== '' && val.length >= 6 && val.length <= 18) {
        this.getPasswordLvl(val)
      }
      else {
        this.passwordLevel = '低'
      }
    },
  },
  methods: {
    validatePassword(val, rule) {
      if (val === '') {
        rule.message = '请输入新密码'

        this.renewpassword !== '' && this.$refs.form.validate('renewpassword')
        return false
      }
      else if (val.length < 6 || val.length > 18) {
        rule.message = '密码至少6个字符,最多18个字符'

        this.renewpassword !== '' && this.$refs.form.validate('renewpassword')
        return false
      }
      else {
        this.renewpassword !== '' && this.$refs.form.validate('renewpassword')
        return true
      }
    },
    getPasswordLvl(pwd) {
      let lvl = '低'
      if (/[a-z]/i.test(pwd)) {
        lvl = '中'
      }
      if (/[a-z]/i.test(pwd) && pwd.length > 10) {
        lvl = '中'
      }
      if (/\W/.test(pwd) && pwd.length < 8) {
        lvl = '中'
      }
      if (/\W/.test(pwd) && pwd.length >= 8) {
        lvl = '高'
      }
      this.passwordLevel = lvl
    },
    validateRePassword(val, rule) {
      if (this.formData.newpassword === '') {
        rule.message = '请输入新密码'
        return false
      }
      else if (this.formData.newpassword && val === '') {
        rule.message = '请再次输入新密码'
        return false
      }
      else if (this.formData.newpassword !== val) {
        rule.message = '确认密码与新密码不同'
        return false
      }
      else {
        return true
      }
    },
    async submit() {
      const result = await this.$refs.form.validate()
      if (result) {
        return
      }

      const toast = showLoadingToast({
        duration: 0,
        forbidClick: true,
      })
      const res = await mRequest(api.setting.saveNewPassword, {
        method: 'POST',
        data: qs.stringify(this.formData),
      }).finally(() => {
        toast.close()
      })

      if (res.success) {
        showNotify({ type: 'success', message: '密码修改成功' })
        this.$router.push({ name: 'setting' })
      }
      else {
        showDialog({ message: res.msg || '操作失败' })
      }
    },
  },
}
</script>

<style lang="less" scoped>
@import url('./index');
</style>
