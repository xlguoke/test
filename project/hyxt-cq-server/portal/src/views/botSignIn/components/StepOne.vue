<template>
  <div class="step-one">
    <a-form ref="formRef" :model="projectFrom" :label-col="{ style: { width: '135px' } }">
      <a-row :gutter="24">
        <a-col :span="12">
          <a-form-item
            label="建设单位名称"
            name="name"
            :rules="[
              { required: true, message: '请输入建设单位名称' },
              { validator: checkUnitName, message: '该单位已存在账号信息', trigger: 'blur' }
            ]"
          >
            <a-input v-model:value="projectFrom.name" placeholder="请输入建设单位名称" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item
            label="统一社会信用代码"
            name="unifiedSocialCreditCode"
            :rules="[{ required: true, message: '请输入统一社会信用代码' }]"
          >
            <a-input
              v-model:value="projectFrom.unifiedSocialCreditCode"
              placeholder="请输入统一社会信用代码"
            />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="24">
        <a-col :span="12">
          <a-form-item
            label="单位所在地"
            name="unitAddress"
            :rules="[{ required: true, message: '请选择单位所在地' }]"
          >
            <a-cascader
              v-model:value="projectFrom.unitAddress"
              :options="cityData"
              placeholder="请选择单位所在地"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item
            label="单位联系地址"
            name="address"
            :rules="[{ required: true, message: '请输入单位联系地址' }]"
          >
            <a-input v-model:value="projectFrom.address" placeholder="请输入单位联系地址" />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="24">
        <a-col :span="12">
          <a-form-item
            label="单位联系人"
            name="contact"
            :rules="[{ required: true, message: '请输入单位联系人' }]"
          >
            <a-input v-model:value="projectFrom.contact" placeholder="请输入单位联系人" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item
            label="联系人手机号"
            name="phone"
            :rules="[
              { required: true, message: '请输入联系人手机号' },
              { validator: checkPhone, trigger: 'blur' }
            ]"
          >
            <a-input v-model:value="projectFrom.phone" placeholder="请输入联系人手机号" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="24">
        <a-col :span="12">
          <a-form-item
            label="短信验证码"
            name="verificationCode"
            :rules="[{ required: true, message: '请输入短信验证码' }]"
          >
            <a-input-group compact>
              <a-input
                v-model:value="projectFrom.verificationCode"
                style="width: calc(100% - 120px)"
                placeholder="请输入短信验证码"
              />
              <a-button
                type="primary"
                style="padding: 4px 8px; width: 120px"
                :disabled="isDisable"
                @click="getMsgCode"
              >
                {{ isDisable ? num + "后可再次发送" : "获取验证码" }}
              </a-button>
            </a-input-group>
          </a-form-item>
        </a-col>
        <a-col :span="12"></a-col>
      </a-row>
      <div>
        <p class="form-title">授权承诺书</p>
        <UploadFile
          v-model:value="fileList"
          :before-upload="beforeUpload"
          :config="{
            types: ['pdf'],
            multiple: false,
            bucketUri: projectFrom.name
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
      </div>
      <br />
      <div>
        <p class="form-title">营业执照</p>
        <UploadFile
          v-model:value="businessLicence"
          :before-upload="beforeUpload2"
          :config="{
            types: ['pdf'],
            multiple: false,
            bucketUri: projectFrom.name
          }"
        />
        <div class="upload-hint">
          <p>1、请先对营业执照进行扫描或拍照，然后将文件上传至此处</p>
        </div>
      </div>

      <div class="handle-box">
        <a-button type="primary" :loading="loading" @click="nextStep">
          下一步
          <i class="iconfont icon-arrowRight"></i>
        </a-button>
      </div>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { ref, inject } from "vue"
import { checkConstructorUser, checkConstructorsPhone, enrollSms } from "@/api/home.api"
import { message } from "ant-design-vue"
import { EnrollmentConstructorType } from "@/type/api/botSignIn"
import cityData from "@/assets/js/citydata"
import UploadFile from "@/components/uploadFile/index.vue"
import { downloadByNameOrUrl } from "@/config/minio.config.js"

const projectFrom = ref<EnrollmentConstructorType>(inject("formObj") as EnrollmentConstructorType)
const stepActive = ref<number>(inject("stepActive") || 0)

const loading = ref<boolean>(false)
const formRef = ref()
const fileList = ref<
  {
    name: string
    url: string
  }[]
>([])
const businessLicence = ref<
  {
    name: string
    url: string
  }[]
>([])

const beforeUpload = async () => {
  if (!projectFrom.value.name) {
    message.error("请先输入建设单位")
    fileList.value = []
    return false
  }
  return Promise.resolve(true)
}
const beforeUpload2 = async () => {
  if (!projectFrom.value.name) {
    message.error("请先输入建设单位")
    businessLicence.value = []
    return false
  }
  return Promise.resolve(true)
}

// 检测单位是否已注册账号
const checkUnitName = async (rule, value) => {
  if (!value) return Promise.resolve()
  try {
    const res = await checkConstructorUser(value)
    if (res.availableUser === 0) {
      return Promise.resolve(true)
    } else {
      return Promise.reject(rule.message)
    }
  } catch (err: any) {
    message.error(err.message || "系统异常，请稍后重试！")
    return Promise.reject(err.message)
  }
}

// 检测手机号是否已存在
const reg = /^1\d{10}$/
const checkPhone = async (rule, value) => {
  if (!value) return Promise.resolve()
  if (!reg.test(value)) {
    return Promise.reject("手机号格式错误")
  }
  return Promise.resolve(true)
}

let num = ref(60)
let isDisable = ref(false)
const getMsgCode = async () => {
  const phone = projectFrom.value.phone as string
  const valid = await formRef.value.validateFields(["phone"])
  if (!valid) return
  try {
    await enrollSms(phone)
    message.success("已发送验证码,请注意查收!")
    isDisable.value = true
    let t = setInterval(() => {
      num.value--
      if (num.value == 0) {
        num.value = 60
        isDisable.value = false
        clearInterval(t)
      }
    }, 1000)
  } catch (err: any) {
    console.log(err)
    message.error(err.message || "系统异常，请稍后重试！")
  }
}

// 机构注册验证
const nextStep = async () => {
  try {
    await formRef.value.validateFields()
    if (fileList.value.length > 0) {
      projectFrom.value.authorizeCommitmentImages = fileList.value[0].url
    } else {
      return message.warning("请上传授权承诺书")
    }
    if (businessLicence.value.length > 0) {
      projectFrom.value.businessLicenceImages = businessLicence.value[0].url
    } else {
      return message.warning("请上传营业执照")
    }
    const address = projectFrom.value.unitAddress || []
    projectFrom.value.province = address[0] || ""
    projectFrom.value.city = address[1] || ""
    projectFrom.value.district = address[2] || ""
    stepActive.value++
  } catch (err) {
    console.error(err)
  }
}
</script>

<style lang="less" scoped>
.step-one {
  padding-top: 30px;
  margin: 0 auto;
  width: 92%;
  :deep(.ant-input[disabled]) {
    background-color: #f5f5f5;
    color: #666;
  }
}

.form-title {
  padding: 20px 0;
  font-weight: 700;
  font-size: 16px;
}

.handle-box {
  margin-top: 50px;
  text-align: center;
}

.upload-hint {
  padding-top: 10px;
  .download-link {
    color: @theme_color;
    cursor: pointer;
    &:hover {
      opacity: 0.8;
    }
  }
}
</style>
