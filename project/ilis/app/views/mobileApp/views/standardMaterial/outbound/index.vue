<template>
  <div class="min-h-screen bg-[#f5f5f5] pb-20">
    <MobileTitleBar title="出库登记" left-arrow @click-left="router.go(-1)" />

    <van-loading v-if="pageLoading" class="mt-20" />

    <template v-else>
      <div class="bg-white m-3 p-3 rounded-lg shadow-sm">
        <div class="text-sm font-medium text-[#333]">
          {{ materialInfo.name }}
        </div>
        <div class="text-xs text-gray-500 mt-1">
          {{ materialInfo.specification }}
        </div>
      </div>

      <van-form ref="formRef">
        <van-cell-group :border="false">
          <FormItemSelect
            v-model:value="formData.outType"
            label="出库类型"
            required
            placeholder="请选择出库类型"
            :options="outboundTypeOptions"
            :rules="[{ required: true, message: '请选择出库类型' }]"
          />

          <FormItemInput
            v-model:value="formData.quantity"
            label="出库数量"
            required
            type="number"
            placeholder="请输入出库数量"
            :rules="[
              { required: true, message: '请输入出库数量' },
              { validator: (val: any) => Number(val) > 0, message: '出库数量必须大于0' },
            ]"
          >
            <template #button>
              <span class="text-gray-500">{{ materialInfo.unit }}</span>
            </template>
          </FormItemInput>

          <FormItemInput
            v-model:value="formData.purpose"
            label="用途"
            required
            placeholder="请输入用途"
            :rules="[{ required: true, message: '请输入用途' }]"
          />

          <FormItemPerson
            v-model:value="operatorPersonList"
            label="出库人员"
            required
            placeholder="请选择出库人员"
            :rules="[{ required: true, message: '请选择出库人员' }]"
            @select="onOperatorSelect"
          />

          <FormItemDate
            v-model:value="formData.outDate"
            label="出库日期"
            required
            placeholder="请选择出库日期"
            :rules="[{ required: true, message: '请选择出库日期' }]"
          />

          <van-cell title="附件">
            <template #value>
              <UploadWithQrKey
                v-model:value="formData.attachmentQrKey"
                business-id=""
                business-type="REF_STOCK_OUT"
                @update:value="formData.attachmentQrKey = $event"
              />
            </template>
          </van-cell>
        </van-cell-group>
      </van-form>
    </template>

    <div class="fixed bottom-0 left-0 right-0 p-3 px-4 bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.05)]">
      <van-button type="primary" block class="!rounded" :loading="saveLoading" @click="onSave">
        确认
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StandardMaterialItem } from '../api'
import dayjs from 'dayjs'
import { showLoadingToast, showSuccessToast, showToast } from 'vant'
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import UploadWithQrKey from '~/views/mobileApp/components/form/UploadWithQrKey.vue'
import FormItemDate from '~/views/mobileApp/components/MobileFormItem/FormItemDate.vue'
import FormItemInput from '~/views/mobileApp/components/MobileFormItem/FormItemInput.vue'
import FormItemPerson from '~/views/mobileApp/components/MobileFormItem/FormItemPerson.vue'
import FormItemSelect from '~/views/mobileApp/components/MobileFormItem/FormItemSelect.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { addOutbound, getStandardMaterialDetail } from '../api'

const route = useRoute()
const router = useRouter()
const formRef = ref<any>(null)

const outboundTypeOptions = [
  { value: 'USE', name: '领用出库' },
  { value: 'TRANSFER', name: '调拨出库' },
  { value: 'EXPIRED', name: '失效出库' },
]

const materialInfo = ref<StandardMaterialItem>({} as StandardMaterialItem)
const pageLoading = ref(true)

const operatorPersonList = ref<{ id: string, name: string, account: string }[]>([])

const formData = reactive({
  materialId: '',
  outType: '',
  quantity: '' as string | number,
  purpose: '',
  operator: '',
  operatorId: '',
  outDate: dayjs().format('YYYY-MM-DD'),
  attachmentQrKey: '',
})

const saveLoading = ref(false)

function onOperatorSelect(persons: { id: string, name: string }[]) {
  if (persons && persons.length > 0) {
    formData.operator = persons[0].name
    formData.operatorId = persons[0].id
  }
}

async function fetchMaterialInfo() {
  const materialId = route.query.materialId as string
  if (!materialId) {
    showToast('缺少标准物质ID')
    return
  }

  const appUser = JSON.parse(localStorage.getItem('appUser') || '{}')
  if (appUser && Object.keys(appUser).length > 0) {
    formData.operator = appUser.userInfo?.realName || ''
    formData.operatorId = appUser.userInfo?.id || ''
  }
  operatorPersonList.value = [{ id: formData.operatorId || '', name: formData.operator || '', account: '' }]

  pageLoading.value = true
  try {
    const res = await getStandardMaterialDetail(materialId)
    if (res.code === 20000 && res.data) {
      materialInfo.value = res.data
      formData.materialId = res.data.id
    }
    else {
      showToast(res.message || '获取标准物质信息失败')
    }
  }
  catch (error) {
    console.error(error)
    showToast('获取标准物质信息失败')
  }
  finally {
    pageLoading.value = false
  }
}

async function onSave() {
  try {
    await formRef.value?.validate()
  }
  catch (error: any) {
    showToast(error[0]?.message || '请填写必填项')
    return
  }

  const loadingToast = showLoadingToast({
    message: '保存中...',
    forbidClick: true,
    duration: 0,
  })

  try {
    const submitData = {
      materialId: formData.materialId,
      outType: formData.outType,
      quantity: Number(formData.quantity),
      purpose: formData.purpose,
      operator: formData.operator,
      operatorId: formData.operatorId,
      outDate: formData.outDate,
      attachmentQrKey: formData.attachmentQrKey,
    }
    const res = await addOutbound(submitData)
    if (res.code === 20010) {
      showToast(res.message || '保存失败')
      await new Promise(resolve => setTimeout(resolve, 1500))
    }
    else {
      showSuccessToast({ message: '保存成功', forbidClick: true })
      await new Promise(resolve => setTimeout(resolve, 1000))
      router.back()
    }
  }
  catch (error: any) {
    showToast(error?.message || '保存失败')
  }
  finally {
    loadingToast.close()
  }
}

onMounted(() => {
  fetchMaterialInfo()
})
</script>
