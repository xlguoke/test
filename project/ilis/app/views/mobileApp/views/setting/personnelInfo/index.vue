<template>
  <div class="settingBaseInfo">
    <van-sticky>
      <MobileTitleBar left-arrow @click-left="$router.go(-1)" />
    </van-sticky>

    <van-form>
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
      <van-field name="uploader" disabled label-width="5.5em" label="头像">
        <template #input>
          <img
            style="max-width: 80px; max-height: 80px"
            :src="formData.iconUrl"
          />
        </template>
      </van-field>
      <van-field
        v-model="formData.mobilePhone"
        label-width="5.5em"
        disabled
        label="手机号码"
        placeholder=""
      />
      <van-field
        v-model="formData.officePhone"
        label-width="5.5em"
        disabled
        label="办公电话"
        placeholder=""
      />
      <van-field
        v-model="formData.email"
        label-width="5.5em"
        disabled
        label="常用邮箱"
        placeholder=""
      />
      <van-field
        label-width="5.5em"
        :value="formData.birthDay"
        disabled
        label="生日"
        placeholder=""
        readonly
      ></van-field>
    </van-form>
  </div>
</template>

<script>
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'

export default {
  components: {
    MobileTitleBar,
  },
  data() {
    return {
      formData: {},
      selectDateVisible: false,
      currentDate: new Date(),
    }
  },
  created() {
    this.getUserInfo()
  },
  methods: {
    getUserInfo() {
      mRequest
        .get(`rest/userController/getUser?userId=${this.$route.query.id}`)
        .then((res) => {
          if (res.code === 20000) {
            this.formData = res.data
            this.formData.birthDay = this.formData.birthDay
              ? formatDate(Number.parseInt(this.formData.birthDay), 'YYYY-MM-DD')
              : ''
          }
          else {
            // eslint-disable-next-line no-alert
            alert(res.message || res.msg)
          }
        })
    },
  },
}
</script>

<style>
.van-field__control:disabled {
  color: #5b5b5b;
  -webkit-text-fill-color: #787878;
}
</style>

<style lang="less" scoped>
@import url('./index');
</style>
