<template>
  <div style="padding-top: 30px">
    <div style="padding: 20px 50px">
      <a-steps :current="stepActive">
        <a-step title="基本信息" />
        <a-step title="项目信息" />
        <a-step title="提交成功" />
      </a-steps>
    </div>

    <a-alert
      style="margin: 0 35px"
      message="公路工程建设管理单位在重庆市公路建设市场监督管理系统中注册通过后，在第二天可以在本系统申请获取管理账户，水运工程建设管理单位直接在本系统申请获取账户，申请结果将通过短信方式发送到联系人手机上。"
      type="success"
    />

    <!-- 步骤 1 -->
    <StepOne v-show="stepActive == 0" />

    <!-- 步骤 2 -->
    <StepTwo v-show="stepActive == 1" :key="formKey" />

    <!-- 步骤 3 -->
    <div v-show="stepActive == 2" class="submit-status">
      <a-card>
        <a-row>
          <a-col :span="11">
            <div class="icon-finish">
              <i class="iconfont icon-chenggong"></i>
              <p style="font-size: 16px; font-weight: 700">提交成功</p>
            </div>
            <p class="hint">账号申请结果将通过短信通知，请注意查收</p>
            <router-link to="/">
              <a-button type="primary">返回首页</a-button>
            </router-link>
          </a-col>
          <a-col :span="13" style="border-left: 1px solid #eee; padding: 20px 0 20px 30px">
            <p>扫码关注公众号【重庆市交通规划和技术发展中心】获取更多信息</p>
            <p class="qr-img">
              <img src="@/assets/images/wx-qr.png" />
            </p>
            <p>点击【中心咨询】>【绑定微信】绑定手机号码，可接收通知信息</p>
          </a-col>
        </a-row>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, createVNode, provide } from "vue"
import { ExclamationCircleOutlined } from "@ant-design/icons-vue"
import { Modal } from "ant-design-vue"
import StepOne from "./components/StepOne.vue"
import StepTwo from "./components/StepTwo.vue"
import type { EnrollmentConstructorType } from "@/type/api/botSignIn"

const stepActive = ref<number>(0)
const formKey = ref<number>()
//  确认弹窗
const openConfirm = (title: string, content?: any) => {
  return new Promise((resolve) => {
    Modal.confirm({
      title,
      icon: createVNode(ExclamationCircleOutlined),
      content,
      cancelText: "关闭",
      onOk() {
        resolve("")
      }
    })
  })
}

const formObj = reactive<EnrollmentConstructorType>({
  name: "",
  city: "",
  province: "",
  district: "",
  contact: "",
  phone: "",
  unifiedSocialCreditCode: "",
  address: "",
  verificationCode: "",
  authorizeCommitmentImages: "",
  businessLicenceImages: "",
  project: {}
})
provide("formObj", formObj)
provide("stepActive", stepActive)
provide("formKey", formKey)
provide("openConfirm", openConfirm)
</script>

<style scoped lang="less">
.signin-hint-text {
  padding: 0 50px;
  text-indent: 2em;
  color: #e33636;
  font-size: 14px;
}
.iconfont {
  margin-left: 5px;
  font-size: 14px;
}
.submit-status {
  margin-top: 30px;
  text-align: center;
  .icon-finish {
    color: @theme_color;
    i {
      font-size: 80px;
    }
  }
  .hint {
    padding: 20px 0;
  }
  .qr-img {
    margin: 20px auto;
    width: 200px;
    height: 200px;
    border: 1px solid #f5f5f5;
    img {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
