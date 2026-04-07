<template>
  <van-popup
    v-model:show="visible"
    position="right"
    :style="{ width: '100%', height: '100%' }"
    destroy-on-close
  >
    <div class="flex flex-col h-screen bg-[#f5f5f5]">
      <van-sticky>
        <MobileTitleBar
          :title="isDetailMode ? '标准物质详情' : (isEdit ? '编辑标准物质' : '新增标准物质')"
          left-arrow
          @click-left="handleClose"
        />
      </van-sticky>

      <div class="flex-1 overflow-y-auto">
        <van-form ref="formRef">
          <div class="bg-white">
            <SubTitle bordered>
              基础信息
            </SubTitle>

            <van-cell-group :border="false">
              <van-field
                v-model="formData.materialName"
                label="标准物质名称"
                required
                placeholder="请输入或选择标准物质名称"
                input-align="left"
                :disabled="isDetailMode"
                :rules="[{ required: true, message: '请输入或选择标准物质名称' }]"
                @blur="handleMaterialNameBlur"
              >
                <template v-if="!isDetailMode" #button>
                  <van-button size="small" type="primary" plain @click="openMaterialSelector">
                    选择
                  </van-button>
                </template>
              </van-field>

              <van-field
                v-model="formData.materialSpecification"
                label="规格型号"
                required
                placeholder="请输入或选择规格型号"
                input-align="left"
                :disabled="isDetailMode || !formData.materialName"
                :rules="[{ required: true, message: '请输入或选择规格型号' }]"
                @blur="handleSpecificationBlur"
              >
                <template v-if="!isDetailMode" #button>
                  <van-button
                    size="small"
                    type="primary"
                    plain
                    :disabled="!formData.materialName || isCustomMaterial"
                    @click="openSpecificationSelector"
                  >
                    选择
                  </van-button>
                </template>
              </van-field>

              <FormItemInput
                v-model:value="formData.manufacturer"
                label="生产厂家"
                input-align="left"
                required
                placeholder="请输入生产厂家"
                :disabled="isDetailMode || (!isCustomMaterial && !isCustomSpecification)"
                :rules="[{ required: true, message: '请输入生产厂家' }]"
              />

              <FormItemDate
                v-model:value="formData.productionDate"
                label="生产日期"
                required
                placeholder="请选择生产日期"
                input-align="left"
                :disabled="isDetailMode || (!isCustomMaterial && !isCustomSpecification)"
                :rules="[{ required: true, message: '请选择生产日期' }]"
              />

              <van-field
                v-model="formData.unit"
                label="计量单位"
                required
                placeholder="请选择计量单位"
                input-align="left"
                :disabled="isDetailMode || (!isCustomMaterial && !isCustomSpecification)"
              >
                <template v-if="!isDetailMode" #button>
                  <van-button
                    size="small"
                    type="primary"
                    plain
                    :disabled="!isCustomMaterial && !isCustomSpecification"
                    @click="openUnitSelector"
                  >
                    选择
                  </van-button>
                </template>
              </van-field>

              <van-field
                v-model="formData.unitPrice"
                label="单价"
                required
                input-align="left"
                type="number"
                placeholder="请输入单价"
                :disabled="isDetailMode || (!isCustomMaterial && !isCustomSpecification)"
                :rules="[
                  { required: true, message: '请输入单价' },
                  { validator: (val: any) => val > 0, message: '单价必须大于0' },
                  { validator: (val: any) => val <= 9999, message: '单价不能超过9999' },
                ]"
              >
                <template #button>
                  <span class="text-gray-400">元/{{ formData.unit || '-' }}</span>
                </template>
              </van-field>

              <van-field
                v-model="formData.custodian"
                label="保管人"
                required
                placeholder="请选择保管人"
                input-align="left"
                :disabled="isDetailMode || (!isCustomMaterial && !isCustomSpecification)"
              >
                <template v-if="!isDetailMode" #button>
                  <van-button
                    size="small"
                    type="primary"
                    plain
                    :disabled="!isCustomMaterial && !isCustomSpecification"
                    @click="openCustodianSelector"
                  >
                    选择
                  </van-button>
                </template>
              </van-field>

              <van-field
                v-model="formData.quantity"
                label="购置数量"
                required
                type="number"
                placeholder="请输入购置数量"
                input-align="left"
                :disabled="isDetailMode"
                :rules="[
                  { required: true, message: '请输入购置数量' },
                  { validator: (val: any) => val > 0, message: '购置数量必须大于0' },
                  { validator: (val: any) => val <= 9999, message: '购置数量不能超过9999' },
                ]"
              >
                <template #button>
                  <span class="text-gray-400">{{ formData.unit || '-' }}</span>
                </template>
              </van-field>

              <FormItemDate
                v-model:value="formData.purchaseDate"
                label="购置日期"
                required
                input-align="left"
                placeholder="请选择购置日期"
                :disabled="isDetailMode"
                :rules="[{ required: true, message: '请选择购置日期' }]"
              />

              <FormItemInput
                v-model:value="formData.remark"
                label="备注"
                type="textarea"
                placeholder="请输入备注"
                input-align="left"
                :rows="2"
                autosize
                :disabled="isDetailMode"
              />
            </van-cell-group>
          </div>
        </van-form>

        <!-- 底部占位，防止内容被固定按钮遮挡 -->
        <div v-if="!isDetailMode" class="h-16" />
      </div>

      <div v-if="!isDetailMode" class="shrink-0 p-3 bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.05)]">
        <van-button type="primary" block class="!rounded" :loading="submitLoading" @click="handleSubmit">
          保存
        </van-button>
      </div>

      <MaterialNameSelector
        v-model:show="materialSelectorVisible"
        :initial-selected="formData.materialName"
        @confirm="onMaterialNameConfirm"
      />

      <SpecificationSelector
        v-model:show="specificationSelectorVisible"
        :material-name="formData.materialName"
        :initial-selected="formData.materialSpecification"
        @confirm="onSpecificationConfirm"
      />

      <UnitSelector
        v-model:show="unitSelectorVisible"
        :initial-selected="formData.unit"
        @confirm="onUnitConfirm"
      />

      <CustodianSelector
        v-model:show="custodianSelectorVisible"
        :initial-selected="formData.custodian"
        @confirm="onCustodianConfirm"
      />
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { showSuccessToast, showToast } from 'vant'
import { reactive, ref, watch } from 'vue'
import FormItemDate from '~/views/mobileApp/components/MobileFormItem/FormItemDate.vue'
import FormItemInput from '~/views/mobileApp/components/MobileFormItem/FormItemInput.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import SubTitle from '~/views/mobileApp/components/MobileUI/SubTitle.vue'
import { getMaterialListByName, getMaterialNameList } from '../api'
import CustodianSelector from './CustodianSelector.vue'
import MaterialNameSelector from './MaterialNameSelector.vue'
import SpecificationSelector from './SpecificationSelector.vue'
import UnitSelector from './UnitSelector.vue'

interface StandardMaterialItemForm {
  id?: string
  applyItemId?: string
  materialId?: string
  materialName: string
  materialSpecification: string
  manufacturer: string
  productionDate: string
  quantity: number | string
  unit: string
  unitPrice: number | string
  amount: number
  custodian: string
  purchaseDate: string
  remark: string
  isCustomMaterial?: boolean
  isCustomSpecification?: boolean
}

interface SpecificationItem {
  id: string
  specification: string
  manufacturer?: string
  productionDate?: string
  unitPrice?: number
  unit?: string
  custodian?: string
}

const props = defineProps<{
  show: boolean
  mode?: 'add' | 'edit' | 'detail'
  initialData?: StandardMaterialItemForm
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
  'save': [data: StandardMaterialItemForm]
}>()

const visible = computed({
  get: () => props.show,
  set: val => emit('update:show', val),
})

const formRef = ref<any>(null)
const submitLoading = ref(false)

const isEdit = computed(() => props.mode === 'edit')
const isDetailMode = computed(() => props.mode === 'detail')

const materialSelectorVisible = ref(false)
const specificationSelectorVisible = ref(false)
const unitSelectorVisible = ref(false)
const custodianSelectorVisible = ref(false)

const isCustomMaterial = ref(false)
const isCustomSpecification = ref(false)

// 保存上一次的名称，用于比较是否发生变化
const lastMaterialName = ref('')

const materialNameList = ref<string[]>([])
const specificationList = ref<SpecificationItem[]>([])

const formData = reactive<StandardMaterialItemForm>({
  id: '',
  materialName: '',
  materialSpecification: '',
  materialId: '',
  manufacturer: '',
  productionDate: '',
  unit: '',
  unitPrice: '',
  amount: 0,
  custodian: '',
  quantity: '',
  purchaseDate: dayjs().format('YYYY-MM-DD'),
  remark: '',
})

// 监听初始数据变化
watch(() => props.initialData, (newVal) => {
  if (newVal) {
    Object.assign(formData, newVal)
    isCustomMaterial.value = newVal.isCustomMaterial || false
    isCustomSpecification.value = newVal.isCustomSpecification || false
    // 初始化上一次的名称
    lastMaterialName.value = newVal.materialName || ''
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
    materialId: '',
    manufacturer: '',
    productionDate: '',
    unit: '',
    unitPrice: '',
    amount: 0,
    custodian: '',
    quantity: '',
    purchaseDate: dayjs().format('YYYY-MM-DD'),
    remark: '',
  })
  isCustomMaterial.value = false
  isCustomSpecification.value = false
  lastMaterialName.value = ''
}

function handleClose() {
  visible.value = false
}

async function loadMaterialNameList() {
  try {
    const res = await getMaterialNameList()
    if (res.data) {
      materialNameList.value = res.data || []
    }
  }
  catch (error) {
    console.error('获取标准物质名称列表失败', error)
  }
}

async function loadSpecificationList(materialName: string) {
  if (!materialName) {
    specificationList.value = []
    return
  }
  try {
    const res = await getMaterialListByName(materialName)
    if (res.data) {
      specificationList.value = (res.data || []).map((item: any) => ({
        id: item.id,
        specification: item.specification || '',
        manufacturer: item.manufacturer || '',
        productionDate: item.productionDate || '',
        unitPrice: item.unitPrice || 0,
        unit: item.unit || '',
        custodian: item.custodian || '',
      }))
    }
  }
  catch (error) {
    console.error('获取规格型号列表失败', error)
    specificationList.value = []
  }
}

function openMaterialSelector() {
  materialSelectorVisible.value = true
}

function openSpecificationSelector() {
  if (!formData.materialName) {
    showToast('请先输入或选择标准物质名称')
    return
  }
  if (isCustomMaterial.value) {
    showToast('自定义标准物质，无需选择规格型号')
    return
  }
  specificationSelectorVisible.value = true
}

function openUnitSelector() {
  unitSelectorVisible.value = true
}

function openCustodianSelector() {
  custodianSelectorVisible.value = true
}

async function handleMaterialNameBlur() {
  // 如果名称为空，清空所有
  if (!formData.materialName) {
    isCustomMaterial.value = false
    isCustomSpecification.value = false
    formData.materialSpecification = ''
    formData.materialId = ''
    formData.manufacturer = ''
    formData.productionDate = ''
    formData.unit = ''
    formData.unitPrice = ''
    formData.custodian = ''
    lastMaterialName.value = ''
    return
  }

  // 如果名称没有变化，不做任何处理
  if (formData.materialName === lastMaterialName.value) {
    return
  }

  await loadMaterialNameList()

  const existsInList = materialNameList.value.some(
    name => name.toLowerCase() === formData.materialName.toLowerCase(),
  )

  if (existsInList) {
    // 名称存在于列表中，需要清空相关字段让用户重新选择规格型号
    isCustomMaterial.value = false
    await loadSpecificationList(formData.materialName)
    formData.materialSpecification = ''
    formData.materialId = ''
    formData.manufacturer = ''
    formData.productionDate = ''
    formData.unit = ''
    formData.unitPrice = ''
    formData.custodian = ''
    isCustomSpecification.value = false
  }
  else {
    // 名称不在列表中，是自定义物质
    // 如果之前已经是自定义物质，不清空其他字段
    if (!isCustomMaterial.value) {
      // 之前不是自定义物质，需要清空相关字段
      isCustomMaterial.value = true
      formData.materialSpecification = ''
      formData.materialId = ''
      formData.manufacturer = ''
      formData.productionDate = ''
      formData.unit = ''
      formData.unitPrice = ''
      formData.custodian = ''
      isCustomSpecification.value = false
    }
    // 如果之前已经是自定义物质，保持其他字段不变
    isCustomMaterial.value = true
  }

  // 更新上一次的名称
  lastMaterialName.value = formData.materialName
}

async function handleSpecificationBlur() {
  if (!formData.materialSpecification || isCustomMaterial.value) {
    return
  }

  if (specificationList.value.length === 0) {
    await loadSpecificationList(formData.materialName)
  }

  const existsInList = specificationList.value.some(
    item => item.specification.toLowerCase() === formData.materialSpecification.toLowerCase(),
  )

  if (existsInList) {
    isCustomSpecification.value = false
    const matchedItem = specificationList.value.find(
      item => item.specification.toLowerCase() === formData.materialSpecification.toLowerCase(),
    )
    if (matchedItem) {
      formData.materialId = matchedItem.id
      formData.manufacturer = matchedItem.manufacturer || ''
      formData.productionDate = matchedItem.productionDate || ''
      formData.unit = matchedItem.unit || ''
      formData.unitPrice = matchedItem.unitPrice || ''
      formData.custodian = matchedItem.custodian || ''
    }
  }
  else {
    isCustomSpecification.value = true
    formData.materialId = ''
    formData.manufacturer = ''
    formData.productionDate = ''
    formData.unit = ''
    formData.unitPrice = ''
    formData.custodian = ''
  }
}

function onMaterialNameConfirm(name: string) {
  formData.materialName = name
  isCustomMaterial.value = false
  formData.materialSpecification = ''
  formData.materialId = ''
  formData.manufacturer = ''
  formData.productionDate = ''
  formData.unit = ''
  formData.unitPrice = ''
  formData.custodian = ''
  isCustomSpecification.value = false
  // 更新上一次的名称
  lastMaterialName.value = name
}

function onSpecificationConfirm(item: SpecificationItem) {
  formData.materialSpecification = item.specification
  formData.materialId = item.id
  formData.manufacturer = item.manufacturer || ''
  formData.productionDate = item.productionDate || ''
  formData.unit = item.unit || ''
  formData.unitPrice = item.unitPrice || ''
  formData.custodian = item.custodian || ''
  isCustomSpecification.value = false
}

function onUnitConfirm(unit: string) {
  formData.unit = unit
}

function onCustodianConfirm(custodian: string) {
  formData.custodian = custodian
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()
  }
  catch (error: any) {
    showToast(error[0]?.message || '请填写必填项')
    return
  }

  submitLoading.value = true
  try {
    const itemData: StandardMaterialItemForm = {
      id: formData.id || '',
      applyItemId: formData.applyItemId,
      materialName: formData.materialName,
      materialSpecification: formData.materialSpecification,
      materialId: formData.materialId,
      manufacturer: formData.manufacturer,
      productionDate: formData.productionDate,
      unit: formData.unit,
      unitPrice: Number(formData.unitPrice).toFixed(2) || 0,
      amount: Number(formData.unitPrice) * Number(formData.quantity) || 0,
      custodian: formData.custodian,
      quantity: Number(formData.quantity).toFixed(2) || 0,
      purchaseDate: formData.purchaseDate,
      remark: formData.remark,
      isCustomMaterial: isCustomMaterial.value,
      isCustomSpecification: isCustomSpecification.value,
    }

    emit('save', itemData)
    showSuccessToast({ message: '保存成功', forbidClick: true })
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

<style scoped>
:deep(.van-field__label) {
  width: 100px !important;
  flex: none !important;
  white-space: nowrap !important;
}
</style>
