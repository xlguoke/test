<template>
  <div class="px-8 pt-12 bg-gray-100 h-full">
    <p class="mb-5 text-sm text-center">
      为确保信息安全，请您输入手机号后四位进行安全验证！
    </p>

    <!-- 密码输入框 -->
    <van-password-input
      :value="phoneNum"
      :focused="showKeyboard"
      :length="4"
      :gutter="10"
      :mask="false"
      :error-info="errorInfo"
      @focus="showKeyboard = true"
    />
    <!-- 数字键盘 -->
    <van-number-keyboard
      v-model="phoneNum"
      :show="showKeyboard"
      @blur="showKeyboard = false"
    />
  </div>
</template>

<script setup lang="ts">
import { closeToast, showLoadingToast, showNotify } from 'vant'
import { ref, watch } from 'vue'
import { phoneCheck } from '../api'

const props = defineProps({
  phone: {
    type: String,
    default: '',
  },
})
const emits = defineEmits(['success'])

const showKeyboard = ref(false)
const phoneNum = ref('')
const errorInfo = ref('')
let oldPhone = ''
watch(phoneNum, async (val) => {
  if (val.length > 4) {
    phoneNum.value = val.slice(0, 4)
  }
  else if (val.length === 4) {
    if (oldPhone === val)
      return
    oldPhone = val
    try {
      showLoadingToast({ message: '验证中...', duration: 0, forbidClick: true })
      const { data } = await phoneCheck({
        code: val,
        encodePhone: props.phone,
      })
      if (data) {
        showNotify({ type: 'success', message: '手机号验证成功' })
        emits('success')
      }
      else {
        errorInfo.value = '手机号验证失败'
      }
    }
    catch (err) {
      errorInfo.value = (err as Error).message || '手机号验证失败'
    }
    closeToast()
  }
  else {
    errorInfo.value = ''
  }
})
</script>
