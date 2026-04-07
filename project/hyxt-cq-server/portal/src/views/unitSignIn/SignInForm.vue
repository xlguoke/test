<template>
  <div style="padding-top: 30px">
    <div style="padding: 20px 50px">
      <a-steps :current="stepActive">
        <a-step title="选择机构" />
        <a-step title="资料完善" />
        <a-step title="提交成功" />
      </a-steps>
    </div>

    <div style="padding: 10px 30px 0">
      <a-alert type="success">
        <template #description>
          根据《重庆市公路建设市场信用管理实施细则》（渝交规〔2021〕29号）第二十三条之规定，进入重庆市公路建设市场的所有从业单位均应及时登录
          <a style="color: #74aff2" href="https://xyjt.jtj.cq.gov.cn:8088/gl" target="_blank">
            重庆市公路建设市场监督管理系统
          </a>
          发布其基本信息。
          根据《重庆市水运工程建设市场信用管理实施细则》（渝交规〔2021〕27号）第二十四条之规定，水运工程从业单位应按规定及时在
          <a style="color: #74aff2" href="https://xyjt.jtj.cq.gov.cn:8088/gl/sy" target="_blank">
            重庆市水运建设市场信用信息管理系统
          </a>
          录入和更新企业基本信息。
          请各检测机构先在对应的建设市场信用信息管理系统中发布基本信息，然后于本系统提交检测机构用户账号注册申请。
        </template>
      </a-alert>
    </div>

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
            <p class="hint">账户申请结果将通过短信通知，请注意查收</p>
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
import type { signinParType } from "@/api/home.api"

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

const formObj = reactive<signinParType>({
  orgId: "",
  orgName: "",
  isExternal: false,
  projectName: "",
  laboratoryType: null,
  laboratoryName: "",
  applicant: "",
  applicantPhone: "",
  captcha: "",
  attachments: [],
  auditAdmId: ""
})
provide("formObj", formObj)
provide("stepActive", stepActive)
provide("formKey", formKey)
provide("openConfirm", openConfirm)
</script>

<style scoped lang="less">
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
