<template>
  <van-popup
    v-model:show="visible"
    position="right"
    :style="{ width: '100%', height: '100%' }"
    destroy-on-close
  >
    <div class="h-full flex flex-col bg-[#f5f5f5]">
      <MobileTitleBar
        :title="isDetailMode ? '验收登记详情' : '验收登记'"
        left-arrow
        @click-left="handleClose"
      />

      <div class="flex-1 overflow-y-auto">
        <van-collapse v-model="activeNames" class="mb-3">
          <van-collapse-item title="基础信息" name="1">
            <van-cell-group :border="false">
              <van-cell title="标准物质名称" :value="formData.materialName" />
              <van-cell title="规格型号" :value="formData.materialSpecification" />
              <van-cell title="生产厂家" :value="formData.manufacturer" />
              <van-cell title="生产日期" :value="formData.productionDate" />
              <van-cell title="计量单位" :value="formData.unit" />
              <van-cell title="单价" :value="formData.unitPrice !== null ? `${Number(formData.unitPrice).toFixed(2)}元/${formData.unit}` : ''" />
              <van-cell title="保管人" :value="formData.custodian" />
              <van-cell title="购置数量" :value="formData.quantity !== null ? `${Number(formData.quantity).toFixed(2)}${formData.unit}` : ''" />
              <van-cell title="购置日期" :value="formData.purchaseDate" />
              <van-cell title="备注" :value="formData.remark || '-'" />
            </van-cell-group>
          </van-collapse-item>

          <van-collapse-item title="验收情况" name="2">
            <van-form ref="formRef">
              <van-field
                v-model="acceptanceForm.actualQuantity"
                label="实购数量"
                type="number"
                required
                placeholder="请输入实购数量"
                :readonly="isDetailMode"
                :rules="[
                  { required: true, message: '请输入实购数量' },
                ]"
              >
                <template #right-icon>
                  <span class="text-gray-400">{{ formData.unit }}</span>
                </template>
              </van-field>

              <van-field
                v-model="acceptanceForm.acceptResult"
                label="验收情况"
                type="textarea"
                required
                placeholder="请输入验收情况"
                :rows="3"
                :maxlength="500"
                show-count
                :readonly="isDetailMode"
                :rules="[{ required: true, message: '请输入验收情况' }]"
              />
            </van-form>
          </van-collapse-item>
        </van-collapse>
      </div>

      <div v-if="!isDetailMode" class="p-3 bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.05)] shrink-0">
        <van-button type="primary" block class="!rounded" :loading="submitLoading" @click="handleSubmit">
          保存
        </van-button>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { showToast } from 'vant'
import { reactive, ref, watch } from 'vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'

interface AcceptanceEditForm {
  id?: string
  materialName: string
  materialSpecification: string
  manufacturer: string
  productionDate: string
  unit: string
  unitPrice: number | string
  custodian: string
  quantity: number
  purchaseDate: string
  remark: string
  actualQuantity?: number
  acceptResult?: string
}

const props = defineProps<{
  show: boolean
  mode?: 'edit' | 'detail'
  initialData?: AcceptanceEditForm
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
  'save': [data: { actualQuantity: number, acceptResult: string }]
}>()

const visible = computed({
  get: () => props.show,
  set: val => emit('update:show', val),
})

const formRef = ref<any>(null)
const submitLoading = ref(false)
const activeNames = ref(['1', '2'])

const isDetailMode = computed(() => props.mode === 'detail')

const formData = reactive<AcceptanceEditForm>({
  id: '',
  materialName: '',
  materialSpecification: '',
  manufacturer: '',
  productionDate: '',
  unit: '',
  unitPrice: 0,
  custodian: '',
  quantity: 0,
  purchaseDate: '',
  remark: '',
  actualQuantity: 0,
  acceptResult: '',
})

const acceptanceForm = reactive({
  actualQuantity: '' as string | number,
  acceptResult: '',
})

// 监听初始数据变化
watch(() => props.initialData, (newVal) => {
  if (newVal) {
    Object.assign(formData, newVal)
    acceptanceForm.actualQuantity = newVal.actualQuantity || ''
    acceptanceForm.acceptResult = newVal.acceptResult || ''
  }
  else {
    resetForm()
  }
}, { immediate: true })

// 监听显示状态，关闭时重置表单
watch(() => props.show, (newVal) => {
  if (!newVal) {
    resetForm()
  }
})

function resetForm() {
  Object.assign(formData, {
    id: '',
    materialName: '',
    materialSpecification: '',
    manufacturer: '',
    productionDate: '',
    unit: '',
    unitPrice: 0,
    custodian: '',
    quantity: 0,
    purchaseDate: '',
    remark: '',
    actualQuantity: 0,
    acceptResult: '',
  })
  acceptanceForm.actualQuantity = ''
  acceptanceForm.acceptResult = ''
}

function handleClose() {
  visible.value = false
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()
  }
  catch (error) {
    console.error(error)
    showToast('请填写必填项')
    return
  }

  if (!acceptanceForm.actualQuantity && acceptanceForm.actualQuantity !== 0) {
    showToast('请输入实购数量')
    return
  }
  if (!acceptanceForm.acceptResult) {
    showToast('请输入验收情况')
    return
  }

  const num = Number(acceptanceForm.actualQuantity)
  if (num < 0) {
    showToast('实购数量不能为负数')
    return
  }

  submitLoading.value = true
  try {
    emit('save', {
      actualQuantity: Number(acceptanceForm.actualQuantity),
      acceptResult: acceptanceForm.acceptResult,
    })
    showToast('保存成功')
    visible.value = false
  }
  catch (error) {
    console.error(error)
    showToast('保存失败')
  }
  finally {
    submitLoading.value = false
  }
}
</script>
