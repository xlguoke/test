<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { translateError } from '@/utils/translateError'
import { useReportedError } from '@/composables/useReportedError'
import { useReportErrorStore } from '@/stores/reportError'

const { err, showReportedErrorDialog, closeDialog } = useReportErrorStore()

const show = ref(false)

const errDescribe = ref('')

async function handleConfirm(action: string) {
  if (action === 'cancel')
    return true

  if (!errDescribe.value) {
    showToast({ type: 'fail', message: '请填写错误描述!' })
    return false
  }
  try {
    await useReportedError().reportedFetch(err, errDescribe.value)
    showToast({ type: 'success', message: '上报成功!' })
    closeDialog()
  }
  catch (err) {
    const error = translateError(err)
    if (error.type === 'UnknownError') {
      showToast({ type: 'fail', message: '上报失败，请联系系统管理员!' })
      return false
    }
    throw err
  }
  return true
}

watchEffect(() => {
  show.value = showReportedErrorDialog
})
</script>

<template>
  <van-dialog
    v-model:show="show"
    title="未知错误"
    show-cancel-button
    confirm-button-color="red"
    confirm-button-text="上报错误"
    cancel-button-text="关闭"
    :before-close="handleConfirm"
  >
    <div class="main">
      <p class="describtion">
        系统遇到未知错误，给您带来的不便深表歉意，我们已经产生了一个关于此错误的日志文件，我们希望您选择上报此日志信息给我们以帮助改善产品质量。
      </p>
      <van-field
        v-model="errDescribe"
        placeholder="这个问题是如何出现的？（最多可输入50字符）"
        type="textarea"
        rows="3"
        maxlength="50"
      />
      <p class="tips">
        您可以在我的-系统设置-系统日志中查看错误记录。
      </p>
    </div>
  </van-dialog>
</template>

<style lang="less" scoped>
:deep(.van-field){
  border: 1px solid #ebebfc;
}
.main{
  font-size: 12px;
  line-height: 16px;
  padding: 16px 20px;
  .describtion {
    margin-bottom: 10px;
  }
  .tips{
    margin-top:10px;
    color: #999;
  }
}
</style>
