<template>
  <HtModal
    v-model:open="visible"
    :title="modalTitle"
    width="700px"
    :confirm-loading="loading"
    :hide-confirm="mode === 'detail'"
    :after-close="onClosed"
    @ok="handleOk"
  >
    <a-spin :spinning="detailLoading">
      <div class="w-[90%]">
        <IlisForm
          ref="formRef"
          :entity="InboundRecordFormEntity"
          :init-data="formData"
          :disabled="mode === 'detail'"
          :cols="1"
          :label-col="{ span: 6 }"
          :wrapper-col="{ span: 16 }"
          :hidden-fields="hiddenFields"
        >
          <!-- 标准物质名称：AutoComplete -->
          <template #materialName="{ data }">
            <a-auto-complete
              v-model:value="data.materialName"
              :options="filteredMaterialNameOptions"
              placeholder="请输入或选择标准物质名称"
              :disabled="mode === 'detail'"
              @search="handleMaterialSearch"
              @select="(value: any) => handleMaterialNameSelect(value, data)"
              @blur="() => handleMaterialNameBlur(data)"
              @keydown.enter="handleEnter"
            />
          </template>

          <!-- 规格型号：AutoComplete -->
          <template #materialSpecification="{ data }">
            <a-auto-complete
              v-model:value="data.materialSpecification"
              :options="filteredSpecificationOptions"
              placeholder="请输入或选择规格型号"
              :disabled="isSpecificationDisabled(data)"
              @search="handleSpecificationSearch"
              @select="(value: any) => handleSpecificationSelect(value, data)"
              @blur="() => handleSpecificationBlur(data)"
              @keydown.enter="handleEnter"
            />
          </template>

          <!-- 生产厂家：手动输入 -->
          <template #manufacturer="{ data }">
            <a-input
              v-model:value="data.manufacturer"
              placeholder="请输入生产厂家"
              :disabled="isLinkedFieldsDisabled(data) || mode === 'detail'"
            />
          </template>

          <!-- 生产日期 -->
          <template #productionDate="{ data }">
            <a-date-picker
              v-model:value="data.productionDate"
              value-format="YYYY-MM-DD"
              :disabled="isLinkedFieldsDisabled(data) || mode === 'detail'"
              style="width: 100%"
            />
          </template>

          <!-- 单位：AutoComplete -->
          <template #unit="{ data }">
            <a-auto-complete
              v-model:value="data.unit"
              :options="unitOptions"
              placeholder="请输入或选择计量单位"
              :disabled="isLinkedFieldsDisabled(data) || mode === 'detail'"
              @keydown.enter="handleEnter"
            />
          </template>

          <!-- 保管人：AutoComplete -->
          <template #custodian="{ data }">
            <a-auto-complete
              v-model:value="data.custodian"
              :options="custodianOptions"
              placeholder="请输入或选择保管人"
              :disabled="isLinkedFieldsDisabled(data) || mode === 'detail'"
              @keydown.enter="handleEnter"
            />
          </template>

          <!-- 入库数量 -->
          <template #quantity="{ data }">
            <!-- <div class="flex items-center gap-2"> -->
            <a-input-number
              v-model:value="data.quantity"
              :min="1"
              :precision="0"
              placeholder="请输入入库数量"
              :disabled="mode === 'detail'"
              :addon-after="data.unit"
              style="width: 100%"
            />
            <!-- <span v-if="data.unit" class="text-gray-600">{{ data.unit }}</span> -->
            <!-- </div> -->
          </template>

          <template #form-after>
            <a-form-item label="附件">
              <HtUploadFile
                :business-type="BUSINES_TYPE.REF_STOCK_IN"
                :business-id="formData.id"
                :is-reandonly="mode === 'detail'"
                @get-qr-code-key="formData.attachmentQrKey = $event"
              />
            </a-form-item>
          </template>
        </IlisForm>
      </div>
    </a-spin>
  </HtModal>
</template>

<script setup lang="ts">
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import type { IlisFormExpose } from '~/components/ilisComponent'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { getDictByCode } from '~/api/common'
import { BUSINES_TYPE, HtUploadFile } from '~/components/htUploadFile'
import { getGuardianNameList, getStandardMaterialLedgerDetail, getStandardMaterialLedgerList } from '../../standard-material-ledger/api'
import { createInboundRecord, getInboundRecordDetail, updateInboundRecord } from '../api'
import { InboundRecordFormEntity } from '../entity/InboundRecordFormEntity'

const props = defineProps<IDialogPropsParam<null, { mode: 'add' | 'edit' | 'detail', id?: string }>>()

const visible = ref(true)
const loading = ref(false)
const detailLoading = ref(false)
const formRef = ref<IlisFormExpose<InboundRecordFormEntity>>()

const mode = computed(() => props.param.mode)
const modalTitle = computed(() => {
  const titleMap = { add: '新增入库', edit: '编辑入库', detail: '入库详情' }
  return titleMap[mode.value]
})

const formData = ref(new InboundRecordFormEntity())
formData.value.id = props.param.id || ''

// ===================== AutoComplete 数据源 =====================

interface MaterialRawData {
  id: string
  name: string
  specification?: string
}
const allMaterialRawData = ref<MaterialRawData[]>([])

interface MaterialNameOption {
  value: string
}
const allMaterialNameOptions = ref<MaterialNameOption[]>([])
const filteredMaterialNameOptions = ref<MaterialNameOption[]>([])

interface SpecificationOption {
  value: string
  id: string
}
const allSpecificationOptions = ref<SpecificationOption[]>([])
const filteredSpecificationOptions = ref<SpecificationOption[]>([])

const unitOptions = ref<{ value: string }[]>([])
const custodianOptions = ref<{ value: string }[]>([])

async function loadMaterialData() {
  try {
    const { data } = await getStandardMaterialLedgerList({ page: 0, size: 10000 })
    const items = (data.content || []) as any[]
    allMaterialRawData.value = items.map((item: any) => ({
      id: item.id,
      name: item.name,
      specification: item.specification,
    }))

    const names = items
      .filter((item: any) => item.name)
      .map((item: any) => ({ value: item.name }))
    const uniqueNames = names.filter((name: MaterialNameOption, index: number, self: MaterialNameOption[]) =>
      self.findIndex(n => n.value === name.value) === index,
    )
    allMaterialNameOptions.value = uniqueNames
    filteredMaterialNameOptions.value = uniqueNames

    const specs = items
      .filter((item: any) => item.specification)
      .map((item: any) => ({
        value: item.specification,
        id: item.id,
      }))
    const uniqueSpecs = specs.filter((spec: SpecificationOption, index: number, self: SpecificationOption[]) =>
      self.findIndex(s => s.value === spec.value) === index,
    )
    allSpecificationOptions.value = uniqueSpecs
    filteredSpecificationOptions.value = uniqueSpecs
  }
  catch (e) {
    console.error('加载标准物质数据失败', e)
  }
}

async function loadDictData() {
  try {
    const unitRes = await getDictByCode('sampleAmountUnit')
    unitOptions.value = (unitRes.data || []).map((item: any) => ({
      value: item.typeName,
    }))

    const custodianRes = await getGuardianNameList({})
    custodianOptions.value = (custodianRes.data || []).map((item: string) => ({
      value: item,
    }))
  }
  catch (e) {
    console.error('加载字典数据失败', e)
  }
}

function handleMaterialSearch(val: string) {
  if (!val) {
    filteredMaterialNameOptions.value = allMaterialNameOptions.value
  }
  else {
    filteredMaterialNameOptions.value = allMaterialNameOptions.value.filter(item =>
      item.value.toLowerCase().includes(val.toLowerCase()),
    )
  }
}

function handleSpecificationSearch(val: string) {
  const materialName = formData.value.materialName
  const baseOptions = materialName
    ? allMaterialRawData.value
        .filter(item => item.name.toLowerCase() === materialName.toLowerCase())
        .filter(item => item.specification)
        .map(item => ({
          value: item.specification!,
          id: item.id,
        }))
    : allSpecificationOptions.value

  if (!val) {
    filteredSpecificationOptions.value = baseOptions
  }
  else {
    filteredSpecificationOptions.value = baseOptions.filter(item =>
      item.value.toLowerCase().includes(val.toLowerCase()),
    )
  }
}

async function handleMaterialNameSelect(materialName: string, record: InboundRecordFormEntity) {
  record.materialName = materialName
  record.isCustomMaterial = false
  record.isCustomSpecification = false
  record.materialSpecification = undefined
  record.materialId = undefined
  record.manufacturer = undefined
  record.productionDate = undefined
  record.unit = undefined
  record.custodian = undefined

  const matchedItems = allMaterialRawData.value.filter(
    item => item.name.toLowerCase() === materialName.toLowerCase(),
  )

  const specs = matchedItems
    .filter(item => item.specification)
    .map(item => ({
      value: item.specification!,
      id: item.id,
    }))
  filteredSpecificationOptions.value = specs

  if (matchedItems.length === 1) {
    const item = matchedItems[0]
    record.materialSpecification = item.specification
    record.materialId = item.id
    try {
      const { data } = await getStandardMaterialLedgerDetail(item.id)
      if (data) {
        record.manufacturer = data.manufacturer
        record.productionDate = data.productionDate
        record.unit = data.unit
        record.custodian = data.custodian
      }
    }
    catch (e) {
      console.error('获取标准物质详情失败', e)
    }
  }
}

function handleMaterialNameBlur(record: InboundRecordFormEntity) {
  if (!record.materialName) {
    record.isCustomMaterial = false
    record.isCustomSpecification = false
    record.materialId = undefined
    record.materialSpecification = undefined
    record.manufacturer = undefined
    record.productionDate = undefined
    record.unit = undefined
    record.custodian = undefined
    filteredSpecificationOptions.value = allSpecificationOptions.value
    return
  }

  if (record.materialId) {
    return
  }

  const matchedItems = allMaterialRawData.value.filter(
    item => item.name.toLowerCase() === record.materialName!.toLowerCase(),
  )

  if (matchedItems.length > 0) {
    handleMaterialNameSelect(record.materialName, record)
  }
  else {
    record.isCustomMaterial = true
    record.isCustomSpecification = true
    record.materialId = undefined
    record.manufacturer = undefined
    record.productionDate = undefined
    record.unit = undefined
    record.custodian = undefined
  }
}

async function handleSpecificationSelect(specification: string, record: InboundRecordFormEntity) {
  record.materialSpecification = specification
  record.isCustomSpecification = false

  const matchedItem = allMaterialRawData.value.find(
    item => item.name.toLowerCase() === record.materialName!.toLowerCase()
      && item.specification?.toLowerCase() === specification.toLowerCase(),
  )

  if (matchedItem) {
    record.materialId = matchedItem.id
    try {
      const { data } = await getStandardMaterialLedgerDetail(matchedItem.id)
      if (data) {
        record.manufacturer = data.manufacturer
        record.productionDate = data.productionDate
        record.unit = data.unit
        record.custodian = data.custodian
      }
    }
    catch (e) {
      console.error('获取标准物质详情失败', e)
    }
  }
}

async function handleSpecificationBlur(record: InboundRecordFormEntity) {
  if (!record.materialSpecification) {
    record.isCustomSpecification = record.isCustomMaterial
    record.materialId = undefined
    record.manufacturer = undefined
    record.productionDate = undefined
    record.unit = undefined
    record.custodian = undefined

    const matchedItems = allMaterialRawData.value.filter(
      item => item.name.toLowerCase() === record.materialName!.toLowerCase(),
    )
    const specs = matchedItems
      .filter(item => item.specification)
      .map(item => ({
        value: item.specification!,
        id: item.id,
      }))
    filteredSpecificationOptions.value = specs
    return
  }

  if (record.isCustomMaterial) {
    record.isCustomSpecification = true
    return
  }

  const matchedItem = allMaterialRawData.value.find(
    item => item.name.toLowerCase() === record.materialName!.toLowerCase()
      && item.specification?.toLowerCase() === record.materialSpecification!.toLowerCase(),
  )

  if (matchedItem) {
    if (record.materialId === matchedItem.id) {
      return
    }
    await handleSpecificationSelect(record.materialSpecification, record)
  }
  else {
    record.isCustomSpecification = true
    record.materialId = undefined
    record.manufacturer = undefined
    record.productionDate = undefined
    record.unit = undefined
    record.custodian = undefined
  }
}

function handleEnter(e: KeyboardEvent) {
  e.preventDefault()
  e.stopPropagation()
}

const isSpecificationDisabled = computed(() => {
  return (data: InboundRecordFormEntity) => {
    if (mode.value === 'detail')
      return true
    return !data.materialName
  }
})

const isLinkedFieldsDisabled = computed(() => {
  return (data: InboundRecordFormEntity) => {
    if (mode.value === 'detail')
      return true
    if (data.isCustomMaterial)
      return false
    if (data.isCustomSpecification)
      return false
    return true
  }
})

const hiddenFields = computed(() => {
  return formData.value.inType !== 'PURCHASE' ? ['purchaseDate'] : []
})

async function init() {
  if (mode.value === 'add') {
    const localUserInfo = getLocalUserInfo()
    formData.value = new InboundRecordFormEntity().fromJSON({
      stockInDate: dayjs().format('YYYY-MM-DD'),
      isCustomMaterial: false,
      isCustomSpecification: false,
      operator: localUserInfo?.realName || '',
      operatorId: localUserInfo?.userId || '',
    })
  }

  if (props.param.id) {
    detailLoading.value = true
    try {
      const { data } = await getInboundRecordDetail(props.param.id)
      const isCustom = !data.materialId
      formData.value = new InboundRecordFormEntity().fromJSON({
        id: data.id,
        inType: data?.inType || undefined,
        quantity: data?.quantity || undefined,
        operator: data?.operator || '',
        operatorId: data?.operatorId || '',
        stockInDate: data?.stockInDate || '',
        isCustomMaterial: isCustom,
        isCustomSpecification: isCustom,
        materialName: data?.material?.name || '',
        materialId: data?.materialId || '',
        materialSpecification: data?.material?.specification || '',
        unit: data?.material?.unit || '',
        manufacturer: data?.material?.manufacturer || '',
        productionDate: data?.material?.productionDate || '',
        purchaseDate: data?.purchaseDate || '',
        custodian: data?.material?.custodian || '',
      })
    }
    finally {
      detailLoading.value = false
    }
  }
}

async function handleOk() {
  try {
    const submitData = await formRef.value?.getFormData()
    const data = {
      materialId: submitData?.materialId,
      materialName: submitData?.materialName,
      manufacturer: submitData?.manufacturer,
      materialSpecification: submitData?.materialSpecification,
      productionDate: submitData?.productionDate,
      unit: submitData?.unit,
      custodian: submitData?.custodian,
      inType: submitData?.inType,
      quantity: submitData?.quantity,
      operator: submitData?.operator,
      operatorId: submitData?.operatorId,
      stockInDate: submitData?.stockInDate,
      purchaseDate: submitData?.purchaseDate, // 购置日期，当inType为PURCHASE时必填
      attachmentQrKey: submitData?.attachmentQrKey,
    }
    loading.value = true
    if (mode.value === 'edit' && props.param.id) {
      await updateInboundRecord({ ...data, id: props.param.id })
      message.success('更新成功')
    }
    else if (mode.value === 'add') {
      await createInboundRecord(data!)
      message.success('新增成功')
    }
    props.onConfirm(null)
    visible.value = false
  }
  finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadMaterialData()
  await loadDictData()
  init()
})
</script>
