<template>
  <div class="min-h-screen bg-[#f5f5f5] pb-20">
    <!-- 顶部导航 -->
    <van-sticky>
      <MobileTitleBar :title="isReadonly ? '验收详情' : '验收登记'" left-arrow @click-left="router.back()" />
    </van-sticky>

    <van-form ref="formRef">
      <!-- 验收结果 -->
      <div class="bg-white mb-2">
        <SubTitle bordered>
          验收结果
        </SubTitle>

        <van-cell-group :border="false">
          <FormItemDate
            v-model:value="formData.verifyTime"
            :required="!isReadonly"
            enable-time
            label="验收时间"
            placeholder="请选择验收时间"
            :disabled="isReadonly"
            :rules="isReadonly ? [] : [{ required: true, message: '请选择验收时间' }]"
          />

          <FormItemInput
            v-model:value="formData.verifyConclusion"
            :required="!isReadonly"
            label="验收结论"
            placeholder="请输入验收结论"
            type="textarea"
            :rows="2"
            autosize
            :disabled="isReadonly"
            :rules="isReadonly ? [] : [{ required: true, message: '请输入验收结论' }]"
          />
        </van-cell-group>

        <!-- 附件 -->
        <div class="px-4 py-3">
          <div class="text-sm text-[#333] mb-2">
            附件
          </div>
          <UploadWithQrKey
            v-if="detailData.id"
            :value="formData.attachmentQr"
            :business-id="detailData.id"
            business-type="CHEMICAL"
            accept="*"
            :disabled="isReadonly"
            @update:value="formData.attachmentQr = $event"
          />
        </div>
      </div>

      <!-- 验收登记 -->
      <SubTitle bordered>
        验收登记
      </SubTitle>

      <!-- 化学品列表 -->
      <div v-if="detailData.items && detailData.items.length > 0" class="p-3 data-list">
        <van-cell-group
          v-for="(item) in detailData.items"
          :key="item.id"
          class="py-2 rounded-md"
        >
          <FormItemInput v-model:value="item.chemicalName" label="化学名称" disabled />
          <FormItemInput v-model:value="item.productName" label="品名" disabled />
          <FormItemInput v-model:value="item.productCode" label="品名编号" disabled />
          <FormItemInput v-model:value="item.specification" label="规格" disabled />
          <FormItemInput v-model:value="item.supplier" label="供应商" disabled />
          <FormItemInput v-model:value="item.purchaseQuantity" label="采购数量" disabled />
          <FormItemInput v-model:value="item.unit" label="单位" disabled />

          <!-- 验收表单 -->
          <FormItemInput
            v-model:value="getVerifyItem(item.id).verifyQuantity"
            :required="!isReadonly"
            label="验收数量"
            placeholder="输入验收数量"
            type="number"
            min="0"
            :disabled="isReadonly"
            :rules="isReadonly ? [] : [
              { required: true, message: '请输入验收数量' },
              { validator: (val: number) => val > 0, message: '采购数量不能小于0' }]"
          />

          <FormItemInput
            v-model:value="getVerifyItem(item.id).verifyQuality"
            :required="!isReadonly"
            label="验收情况"
            placeholder="输入验收情况"
            type="textarea"
            :rows="1"
            autosize
            :disabled="isReadonly"
            :rules="isReadonly ? [] : [{ required: true, message: '请输入验收情况' }]"
          />

          <FormItemInput
            v-model:value="getVerifyItem(item.id).verifyExtra"
            label="其他"
            placeholder="输入其他信息"
            type="textarea"
            :rows="1"
            autosize
            :disabled="isReadonly"
          />
        </van-cell-group>
      </div>

      <!-- 空状态 -->
      <van-empty v-if="!loading && (!detailData.items || detailData.items.length === 0)" description="暂无化学品数据" />
    </van-form>

    <!-- 底部操作按钮 -->
    <div v-if="!isReadonly" class="fixed bottom-0 left-0 right-0 p-3 px-4 bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.05)]">
      <van-button type="primary" block class="!rounded" :loading="saveLoading" @click="onSubmit">
        确定
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PurchaseDetail, PurchaseItem, PurchaseItemVerify } from '~/views/mobileApp/types/chemical/purchase'
import { showToast } from 'vant'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import UploadWithQrKey from '~/views/mobileApp/components/form/UploadWithQrKey.vue'
import FormItemDate from '~/views/mobileApp/components/MobileFormItem/FormItemDate.vue'
import FormItemInput from '~/views/mobileApp/components/MobileFormItem/FormItemInput.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import SubTitle from '~/views/mobileApp/components/MobileUI/SubTitle.vue'
import { getPurchaseRegisterDetail, verifyPurchaseRegister } from '~/views/mobileApp/provides/api/chemical.api'

const route = useRoute()
const router = useRouter()
const formRef = ref<any>(null)

const loading = ref(false)
const saveLoading = ref(false)

// 详情数据
const detailData = reactive<Partial<PurchaseDetail>>({
  id: '',
  registerCode: '',
  registrant: '',
  registerTime: '',
  items: [],
})

// 验收表单数据
const formData = reactive({
  verifyTime: '',
  verifyConclusion: '',
  attachmentQr: '',
  verifier: '',
  verifierId: '',
})

// 验收明细数据（按化学品ID存储）
const verifyItemsMap = reactive<Map<string, PurchaseItemVerify>>(new Map())

// 是否只读模式（已验收的只能查看，不能编辑）
const isReadonly = computed(() => route.query.isReadonly === '1')

onMounted(() => {
  loadDetail()
})

// 获取或创建验收项
function getVerifyItem(itemId: string): PurchaseItemVerify {
  if (!verifyItemsMap.has(itemId)) {
    verifyItemsMap.set(itemId, {
      id: itemId,
      verifyQuantity: 0,
      verifyQuality: '',
      verifyExtra: '',
    })
  }
  return verifyItemsMap.get(itemId)!
}

// 加载详情
async function loadDetail() {
  const { id } = route.params
  if (!id) {
    showToast('缺少参数')
    return
  }

  loading.value = true
  try {
    const res = await getPurchaseRegisterDetail(id as string)
    if (res.code !== 20010 && res.data) {
      Object.assign(detailData, res.data)

      // 回填验收结果数据
      formData.verifyTime = res.data.verifyTime || ''
      formData.verifyConclusion = res.data.verifyConclusion || ''
      formData.attachmentQr = res.data.attachmentQr || ''
      formData.verifier = res.data.verifier || ''
      formData.verifierId = res.data.verifierId || ''

      // 初始化验收明细数据
      res.data.items?.forEach((item: PurchaseItem) => {
        verifyItemsMap.set(item.id, {
          id: item.id,
          verifyQuantity: item.verifyQuantity || item.purchaseQuantity,
          verifyQuality: item.verifyQuality || '质量完好',
          verifyExtra: item.verifyExtra || '',
        })
      })
    }
    else {
      showToast(res.message || '获取详情失败')
    }
  }
  catch (error: any) {
    console.error('获取详情失败:', error)
    showToast(error?.message || '获取详情失败')
  }
  finally {
    loading.value = false
  }
}

// 提交验收
async function onSubmit() {
  // 1. 表单校验
  try {
    await formRef.value?.validate()
  }
  catch (error: any) {
    showToast(error[0]?.message || '请填写必填项')
    return
  }

  // 2. 校验验收明细
  const items: PurchaseItemVerify[] = []
  for (const item of detailData.items || []) {
    const verifyItem = verifyItemsMap.get(item.id)
    if (!verifyItem) {
      showToast(`化学品 ${item.chemicalName} 验收数据异常`)
      return
    }
    if (!verifyItem.verifyQuantity || verifyItem.verifyQuantity <= 0) {
      showToast(`化学品 ${item.chemicalName} 的验收数量不能小于0`)
      return
    }
    if (!verifyItem.verifyQuality) {
      showToast(`请输入化学品 ${item.chemicalName} 的验收情况`)
      return
    }

    items.push({
      id: item.id,
      verifyQuantity: verifyItem.verifyQuantity,
      verifyQuality: verifyItem.verifyQuality,
      verifyExtra: verifyItem.verifyExtra || '',
    })
  }

  if (items.length === 0) {
    showToast('没有需要验收的化学品')
    return
  }

  saveLoading.value = true
  try {
    const { id } = route.params
    const res = await verifyPurchaseRegister({
      id: id as string,
      verifyTime: formData.verifyTime,
      verifyConclusion: formData.verifyConclusion,
      items,
    })
    if (res.code !== 20010) {
      showSuccessToast({
        message: res.message || '验收成功',
        forbidClick: true,
      })
      router.back()
    }
    else {
      throw new Error(res.message || '验收失败')
    }
  }
  catch (error: any) {
    console.error('验收失败:', error)
    showDialog({ message: error?.message || '验收失败' })
  }
  finally {
    saveLoading.value = false
  }
}
</script>

<style scoped>
:deep(.data-list .van-cell){
  padding: 2px 16px;
}
</style>
