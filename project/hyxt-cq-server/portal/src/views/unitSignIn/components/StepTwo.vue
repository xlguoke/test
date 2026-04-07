<template>
  <div>
    <a-form ref="formref" :model="formObj" layout="vertical" @finish="submitForm">
      <a-row :gutter="60">
        <a-col :span="24">
          <p class="form-title">基本信息</p>
        </a-col>
        <a-col :span="12">
          <a-form-item
            label="审核单位"
            name="auditAdmId"
            :rules="[
              {
                required: true,
                message:
                  admOrgList.length == 0
                    ? '当前机构没有配置上级行业主管部门, 请联系管理员完善配置'
                    : '请选择审核单位'
              }
            ]"
          >
            <a-select
              v-model:value="formObj.auditAdmId"
              :disabled="disabledAuditAdm"
              placeholder="请选择审核单位"
            >
              <a-select-option v-for="adm in admOrgList" :key="adm.id" :value="adm.id">
                {{ adm.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <template v-if="formObj.isExternal">
          <a-col :span="12">
            <a-form-item
              label="项目名称"
              name="projectName"
              :rules="[{ required: formObj.laboratoryType != '0', message: '请输入项目名称' }]"
            >
              <a-input v-model:value="formObj.projectName" placeholder="请输入项目名称"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              label="开展业务类型"
              name="laboratoryType"
              :rules="[{ required: true, message: '请选择开展业务类型' }]"
            >
              <a-select
                v-model:value="formObj.laboratoryType"
                placeholder="请选择开展业务类型"
                @change="changeLaboratoryType"
              >
                <a-select-option value="工地试验室">工地试验室</a-select-option>
                <a-select-option value="中心试验室">中心试验室</a-select-option>
                <a-select-option value="监理试验室">监理试验室</a-select-option>
                <a-select-option value="现场检测项目">现场检测项目</a-select-option>
                <a-select-option value="其它">其它</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              label="试验室名称"
              name="laboratoryName"
              :rules="[{ required: formObj.laboratoryType != '0', message: '请输入试验室名称' }]"
            >
              <a-input
                v-model:value="formObj.laboratoryName"
                placeholder="请输入试验室名称"
              ></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              label="申请人"
              name="applicant"
              :rules="[{ required: true, message: '请输入申请人' }]"
            >
              <a-input v-model:value="formObj.applicant" placeholder="请输入申请人"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              label="手机号码"
              name="applicantPhone"
              :rules="[
                { required: true, message: '请输入手机号码' },
                { validator: validTel, trigger: 'blur' }
              ]"
            >
              <a-input
                v-model:value="formObj.applicantPhone"
                placeholder="请输入手机号码"
              ></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              label="验证码"
              name="captcha"
              :rules="[{ required: true, message: '请输入验证码' }]"
            >
              <div style="display: flex">
                <a-input v-model:value="formObj.captcha" placeholder="请输入验证码"></a-input>
                <a-button
                  :disabled="timer"
                  style="margin-left: 5px"
                  type="primary"
                  @click="getTelCode"
                >
                  {{ btnText }}
                </a-button>
              </div>
            </a-form-item>
          </a-col>
        </template>
      </a-row>
      <p class="form-title">授权承诺书</p>
      <UploadFile
        v-model:value="fileList"
        :config="{
          types: ['pdf'],
          multiple: false,
          bucketUri: formObj.orgName
        }"
      />
      <div class="upload-hint">
        <p>
          1、请先下载
          <span class="download-link" @click="downloadByNameOrUrl('授权承诺书.pdf')">
            授权承诺书
          </span>
          模板，仔细阅读后打印，签字盖章，并上传
        </p>
        <p>2、上传的授权承诺书必须为承诺书原件，盖有鲜章，复印件无效</p>
      </div>

      <div style="padding-top: 50px; text-align: center">
        <a-button style="margin-right: 30px" @click="prevStep">上一步</a-button>
        <a-button type="primary" html-type="submit" style="width: 120px" :loading="loading">
          提交
        </a-button>
      </div>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, inject, onMounted, createVNode, nextTick } from "vue"
import { ExclamationCircleOutlined } from "@ant-design/icons-vue"
import type { Rule } from "ant-design-vue/es/form"
import { message, Modal } from "ant-design-vue"
import { orgnaizationSignin, getCaptcha, getAdmOrgList, signinParType } from "@/api/home.api"
import UploadFile from "@/components/uploadFile/index.vue"
import { downloadByNameOrUrl } from "@/config/minio.config.js"

const formObj = reactive<signinParType>(inject("formObj") as signinParType)
const stepActive = ref<number>(inject<number>("stepActive") || 0)
const fileList = ref<
  {
    name: string
    url: string
  }[]
>([])

const auditAdmId = "1660538900868845569"
const admOrgList = ref<any>([])
const disabledAuditAdm = ref(false)
onMounted(async () => {
  const orgId = formObj.isExternal ? "" : formObj.orgId
  formObj.auditAdmId = null
  getAdmOrgList(orgId).then((res) => {
    admOrgList.value = res
    if (!res || res.length === 0) {
      Modal.confirm({
        title: "提示",
        icon: createVNode(ExclamationCircleOutlined),
        content: "当前机构没有配置上级行业主管部门, 请联系管理员完善配置",
        cancelText: "关闭"
      })
    } else {
      const find = res.find((d) => d.id === auditAdmId)
      find && (formObj.auditAdmId = auditAdmId)
      disabledAuditAdm.value = !!find
    }
  })
})

const changeLaboratoryType = (val) => {
  if (val != "0") return
  nextTick(() => {
    formref.value.validateFields(["projectName", "laboratoryName"])
  })
}

// 自定义校验
const telReg = /^1[3456789]\d{9}$/
const validTel = (_rule: Rule, value: string) => {
  if (value && !telReg.test(value)) {
    return Promise.reject("手机号格式错误")
  } else {
    return Promise.resolve()
  }
}

const formref = ref()
const btnText = ref("获取验证码")
const t = ref(60)
const timer = ref<any>(null)
// 获取验证码
const getTelCode = () => {
  if (timer.value) return
  formref.value.validateFields(["applicantPhone"]).then(async () => {
    await getCaptcha({ phone: formObj.applicantPhone })
    changeBtnStatus()
    timer.value = setInterval(() => {
      t.value--
      changeBtnStatus()
    }, 1000)
  })
}

const changeBtnStatus = () => {
  btnText.value = `${t.value}s后重新获取`
  if (t.value == 0) {
    clearInterval(timer.value)
    timer.value = null
    btnText.value = "获取验证码"
    t.value = 60
  }
}

// 上一步
const prevStep = () => {
  stepActive.value = 0
}

const loading = ref<boolean>(false)
const submitForm = () => {
  formObj.attachments = fileList.value.map((d) => {
    return {
      name: d.name,
      url: d.url
    }
  })
  if (fileList.value.length === 0) {
    return message.error("请上传授权承诺书")
  }
  loading.value = true
  orgnaizationSignin(formObj)
    .then(() => {
      stepActive.value = 2
    })
    .catch(() => {
      loading.value = false
    })
}
</script>

<style lang="less" scoped>
.form-title {
  padding: 20px 0;
  font-weight: 700;
  font-size: 16px;
}
.upload-list-inline :deep(.ant-upload-list-picture-container) {
  width: 50%;
  display: inline-block;
  &:nth-child(2n) .ant-upload-list-item {
    margin-left: 12px;
  }
}
.upload-list-inline :deep(.ant-upload-list-item) {
  width: calc(100% - 12px);
}
.upload-hint {
  padding-top: 30px;
  .download-link {
    color: @theme_color;
    cursor: pointer;
    &:hover {
      opacity: 0.8;
    }
  }
}
</style>
