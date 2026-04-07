<template>
  <div class="min-h-screen bg-[#f5f5f5] pb-20">
    <van-sticky>
      <MobileTitleBar
        title="返还入库"
        left-arrow
        @click-left="router.go(-1)"
      />
    </van-sticky>

    <!-- 表单内容 -->
    <van-form ref="formRef" label-width="7em" @submit="onSubmit">
      <!-- 返还信息 -->
      <div class="bg-white mt-2">
        <SubTitle bordered>
          返还信息
        </SubTitle>

        <van-cell-group :border="false">
          <!-- 返还数量 -->
          <FormItemInput
            v-model:value="form.amount"
            required
            label="返还数量"
            type="number"
            placeholder="请输入"
            :rules="[
              { required: true, message: '请输入返还数量' },
              { validator: validateReturnQuantity, message: `返还数量不能大于可用余量：${remainingQuantity}` },
            ]"
          />

          <!-- 返还日期 -->
          <FormItemDate
            v-model:value="form.putawayDate"
            required
            label="返还日期"
            placeholder="请选择"
            :rules="[{ required: true, message: '请选择返还日期' }]"
          />

          <!-- 备注 -->
          <FormItemInput
            v-model:value="form.remark"
            label="备注"
            placeholder="请输入"
            type="textarea"
            :rows="2"
          />
        </van-cell-group>
      </div>
    </van-form>

    <!-- 底部按钮 -->
    <div class="fixed bottom-0 left-0 right-0 p-3 px-4 bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.05)]">
      <van-button type="primary" block class="!rounded" @click="onSubmit">
        确定
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { showDialog, showLoadingToast, showSuccessToast, showToast } from 'vant'
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FormItemDate from '~/views/mobileApp/components/MobileFormItem/FormItemDate.vue'
import FormItemInput from '~/views/mobileApp/components/MobileFormItem/FormItemInput.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import SubTitle from '~/views/mobileApp/components/MobileUI/SubTitle.vue'
import { returnStorageOut } from '~/views/mobileApp/provides/api/chemical.api'

const router = useRouter()
const route = useRoute()
const formRef = ref()

// 出库ID
const outId = ref('')
// 可用余量
const remainingQuantity = ref(0)

// 表单数据
const form = reactive({
  amount: undefined as number | undefined,
  putawayDate: '',
  remark: '',
})

// 验证返还数量
function validateReturnQuantity(value: string | number) {
  const num = Number(value)
  if (Number.isNaN(num) || num <= 0) {
    return false
  }
  if (num > remainingQuantity.value) {
    return false
  }
  return true
}

// 提交返还
async function onSubmit() {
  // 表单验证
  try {
    await formRef.value?.validate()
  }
  catch (err: any) {
    const msg = err[0]?.message || err?.message || '请填写必填项'
    showToast(msg)
    return
  }

  // 额外验证返还数量
  if (!form.amount || form.amount <= 0) {
    showToast('返还数量必须大于0')
    return
  }
  if (form.amount > remainingQuantity.value) {
    showToast(`返还数量不能大于剩余待返还数量(${remainingQuantity.value})`)
    return
  }

  const loadingToast = showLoadingToast({
    message: '提交中...',
    forbidClick: true,
    duration: 0,
  })

  try {
    const res = await returnStorageOut({
      amount: form.amount,
      putawayDate: form.putawayDate,
      remark: form.remark,
      chemicalInventoryOutId: outId.value,
    })

    if (res.code !== 20010) {
      showSuccessToast({
        message: '返还入库成功',
        forbidClick: true,
      })
      await new Promise(resolve => setTimeout(resolve, 1000))
      router.back()
    }
    else {
      showDialog({
        message: res.message || '返还失败',
      })
    }
  }
  catch (error: any) {
    console.error('返还失败:', error)
    showDialog({
      message: error?.message || '返还失败',
    })
  }
  finally {
    loadingToast.close()
  }
}

onMounted(() => {
  const id = route.params.id as string
  if (id) {
    outId.value = id
  }
  // 获取可用余量
  const remaining = route.query.remainingQuantity as string
  if (remaining) {
    remainingQuantity.value = Number(remaining) || 0
  }
})
</script>

<style scoped>
:deep(.van-field__control) {
  text-align: right;
}
:deep(.van-field__control::placeholder) {
  text-align: right;
}
</style>
