<template>
  <div class="settingBaseInfo">
    <van-sticky>
      <MobileTitleBar left-arrow @click-left="$router.go(-1)" />
    </van-sticky>

    <van-form ref="form">
      <van-field
        v-model="formData.realName"
        label-width="5.5em"
        disabled
        label="姓名"
      />
      <van-field
        v-model="formData.userName"
        label-width="5.5em"
        disabled
        label="账号"
      />
      <van-field name="uploader" label-width="5.5em" label="头像">
        <template #input>
          <van-uploader :after-read="afterRead">
            <div
              v-if="formData.iconUrl"
              style="
                width: 80px;
                height: 80px;
                display: flex;
                justify-content: center;
                align-items: center;
                border-radius: 50%;
                overflow: hidden;
              "
            >
              <img
                style="max-width: 80px; max-height: 80px"
                :src="formData.iconUrl"
              />
            </div>
          </van-uploader>
        </template>
      </van-field>
      <van-field
        v-model="formData.mobilePhone"
        label-width="5.5em"
        label="手机号码"
        placeholder="请输入"
        :rules="[
          { validator: validatePhone, message: '请输入正确格式的手机号码' },
        ]"
      />
      <van-field
        v-model="formData.officePhone"
        label-width="5.5em"
        label="办公电话"
        placeholder="请输入"
      />
      <van-field
        v-model="formData.email"
        label-width="5.5em"
        label="常用邮箱"
        placeholder="请输入"
        :rules="[
          {
            validator: validateEmail,
            message: '请输入正确格式的邮箱',
          },
        ]"
      />
      <van-field
        v-model="formData.birthDay"
        label-width="5.5em"
        label="生日"
        placeholder="请选择"
        readonly
      >
        <template #button>
          <van-button
            size="small"
            plain
            hairline
            type="primary"
            native-type="button"
            @click="selectDate"
          >
            选择
          </van-button>
        </template>
      </van-field>
    </van-form>

    <div class="settingBaseInfo-btns">
      <van-button type="primary" block square @click="save">
        确定修改
      </van-button>
    </div>

    <MobileDateSelector
      v-model:open="selectDateVisible"
      @select="(val) => { formState.birthDay = val }"
    />
  </div>
</template>

<script>
import { showDialog, showNotify } from 'vant'
import MobileDateSelector from '~/views/mobileApp/components/MobileSelector/MobileDateSelector.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'

export default {
  components: {
    MobileDateSelector,
    MobileTitleBar,
  },
  data() {
    return {
      formatDate,
      formData: {},
      selectDateVisible: false,
      currentDate: new Date(),
    }
  },
  created() {
    this.getUserBaseInfo()
  },
  methods: {
    validatePhone(val) {
      // eslint-disable-next-line regexp/no-unused-capturing-group
      const reg = /^1([3-9])\d{9}$/
      if (!val) {
        return true
      }
      else if (val && reg.test(val)) {
        return true
      }
      else {
        return false
      }
    },
    validateEmail(val) {
      // eslint-disable-next-line regexp/no-unused-capturing-group
      const reg = /^[A-Z0-9\u4E00-\u9FA5]+@[\w-]+(\.[\w-]+)+$/i
      if (!val) {
        return true
      }
      else if (val && reg.test(val)) {
        return true
      }
      else {
        return false
      }
    },
    // 获取用户基本信息
    async getUserBaseInfo() {
      const res = await mRequest.get(api.setting.getCurrentUser)
      if (res.success) {
        const birthDay = res.obj.birthDay
        res.obj.birthDay = birthDay ? formatDate(birthDay, 'YYYY-MM-DD') : ''
        this.formData = res.obj
      }
    },
    selectDate() {
      this.selectDateVisible = true
    },
    getSelectDate(value) {
      this.currentDate = value
      this.formData.birthDay = formatDate(value, 'YYYY-MM-DD')
      this.selectDateVisible = false
    },
    async afterRead(file) {
      file.status = 'uploading'
      file.message = '上传中...'
      const formData = new FormData()
      formData.append('file', file.file)
      const res = await mRequest.post(api.common.upload, formData)
      file.status = 'done'
      file.message = '上传成功'
      this.formData.iconUrl = res.obj[0].realpath
    },
    async save() {
      const result = await this.$refs.form.validate()
      if (result) {
        return
      }

      const {
        id,
        userName,
        realName,
        mobilePhone,
        officePhone,
        email,
        birthDay,
        iconUrl,
      } = this.formData
      const params = {
        id,
        userName,
        realName,
        mobilePhone,
        officePhone,
        email,
        birthDay,
        iconUrl,
      }

      const res = await mRequest.get(api.setting.updateUserBasicInfo, {
        params,
      })
      if (res.success) {
        showNotify({ type: 'success', message: '保存成功' })
        this.$router.push({ name: 'setting' })
      }
      else {
        showDialog({ message: res.msg || res.message || '操作失败' })
      }
    },
  },
}
</script>

<style lang="less" scoped>
@import url('./index');
</style>
