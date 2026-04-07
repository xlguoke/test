<template>
  <div class="sms_form">
    <div class="sms_title">短信验证</div>
    <div class="sms_input_wrap">
      <a-input :value="smsPhone" class="input_row" size="large" placeholder="请输入手机号" disabled>
        <template #prefix>
          <mobile-outlined />
        </template>
      </a-input>

      <div class="verify_row">
        <a-input
          v-model:value="smsCode"
          class="input_row"
          size="large"
          placeholder="请输入验证码"
          @keypress.enter="handleValid"
        >
          <template #prefix>
            <safety-certificate-outlined />
          </template>
        </a-input>
      </div>

      <div class="sms_btn">
        <a-button class="btn" type="primary" size="large" :loading="loading" @click="handleValid">
          验证
        </a-button>
      </div>

      <div class="send-tip">
        <span>验证码已发送至手机{{ smsPhone }}</span>
        <a-button type="link" size="small" :disabled="showDownCount" @click="handleSend">
          重新获取
          <span v-show="showDownCount">（{{ downCount }}）</span>
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import { MobileOutlined, SafetyCertificateOutlined } from "@ant-design/icons-vue"
import { message } from "ant-design-vue"
import { sendCodeAPI, submitVerifyAPI } from "@/api/login.api"

const props = defineProps<{
  smsPhone: string
  smsUserId: string
}>()

const emits = defineEmits<{
  (e: "valid", data: string): void
}>()

const smsCode = ref("")
const count = 60
let timer: any = null
const downCount = ref(count)
const showDownCount = ref(false)
const loading = ref(false)

/** 验证 */
async function handleValid() {
  if (!smsCode.value) {
    return message.warning("请输入验证码")
  }
  try {
    loading.value = true
    const token = await submitVerifyAPI(smsCode.value, props.smsUserId)
    emits("valid", token)
  } catch (err) {
    console.error(err)
  }
  loading.value = false
}

/** 获取验证码 */
async function handleSend() {
  if (showDownCount.value) return
  try {
    showDownCount.value = true
    await sendCodeAPI(props.smsUserId)
    runDownCount()
    message.success("验证码已发送")
  } catch (err) {
    showDownCount.value = false
    console.error(err)
  }
}

/** 倒计时 */
function runDownCount() {
  downCount.value = count
  timer = setInterval(() => {
    downCount.value--
    if (downCount.value <= 0) {
      showDownCount.value = false
      clearInterval(timer)
      timer = null
    }
  }, 1000)
}

onMounted(() => {
  handleSend()
})
</script>

<style scoped lang="less">
.sms_form {
  width: 380px;
  background: #fff;
  padding: 20px;
  border-radius: 5px;
  float: right;
  margin-right: 150px;
  margin-top: 150px;

  .sms_title {
    padding: 10px 20px;
    border-bottom: 1px solid #ebebeb;
    margin-bottom: 20px;
    color: #0066ec;
    font-size: 16px;
    font-weight: 900;
  }

  .sms_input_wrap {
    .input_row {
      margin-bottom: 20px;
    }

    span {
      font-size: 16px;
      color: #ccc;
    }

    .verify_row {
      display: flex;
      align-items: center;
      justify-content: flex-end;

      img {
        width: 60px;
      }

      input {
        margin: 0;
        width: 257px;
        margin-left: 20px;
      }
    }
  }

  .sms_btn {
    margin-bottom: 10px;

    .btn {
      width: 100%;
    }
  }

  .send-tip {
    display: flex;
    justify-content: space-between;
    align-items: center;
    span,
    .ant-btn {
      font-size: 12px;
    }
  }
}
</style>
