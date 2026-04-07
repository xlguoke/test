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
          :entity="StandardMaterialLedgerFormEntity"
          :init-data="formData"
          :cols="1"
          :label-col="{ span: 6 }"
          :wrapper-col="{ span: 16 }"
          :disabled="mode === 'detail'"
          :hidden-fields="hiddenFields"
        >
          <!-- 标准物质名称：AutoComplete -->
          <template #name="{ data }">
            <a-auto-complete
              v-model:value="data.name"
              :options="filteredMaterialNameOptions"
              placeholder="请输入标准物质名称"
              :disabled="mode === 'detail'"
              show-search
              @search="handleMaterialNameSearch"
              @blur="handleMaterialNameBlur"
              @keydown.enter="handleEnter"
            />
          </template>

          <!-- 规格型号：AutoComplete -->

          <!-- 生产厂家：手动输入 -->
          <template #manufacturer="{ data }">
            <a-input
              v-model:value="data.manufacturer"
              placeholder="请输入生产厂家"
              :disabled="mode === 'detail'"
            />
          </template>

          <!-- 生产日期 -->
          <template #productionDate="{ data }">
            <a-date-picker
              v-model:value="data.productionDate"
              value-format="YYYY-MM-DD"
              :disabled="mode === 'detail'"
              style="width: 100%"
            />
          </template>

          <!-- 保管人：AutoComplete -->
          <template #custodian="{ data }">
            <a-auto-complete
              v-model:value="data.custodian"
              :options="custodianOptions"
              placeholder="请输入或选择保管人"
              :disabled="mode === 'detail'"
              @keydown.enter="handleEnter"
            />
          </template>

          <!-- 计量单位：AutoComplete -->
          <template #unit="{ data }">
            <a-auto-complete
              v-model:value="data.unit"
              :options="unitOptions"
              placeholder="请输入或选择计量单位"
              :disabled="mode === 'detail'"
              @keydown.enter="handleEnter"
            />
          </template>

          <template #form-after>
            <a-form-item label="附件">
              <HtUploadFile
                :key="formData.id"
                :business-type="BUSINES_TYPE.REF_MATERIAL"
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
import { message } from 'ant-design-vue'
import { getDictByCode } from '~/api/common'
import { BUSINES_TYPE, HtUploadFile } from '~/components/htUploadFile'
import { createStandardMaterialLedger, getGuardianNameList, getLatestInboundRecord, getStandardMaterialLedgerDetail, getStandardMaterialLedgerList, updateStandardMaterialLedger } from '../api'
import { StandardMaterialLedgerFormEntity } from '../entity/StandardMaterialLedgerFormEntity'

const props = defineProps<IDialogPropsParam<null, { mode: 'add' | 'edit' | 'detail', id?: string }>>()

const visible = ref(true)
const loading = ref(false)
const detailLoading = ref(false)
const formRef = ref()

const mode = computed(() => props.param.mode)
const modalTitle = computed(() => {
  const titleMap = { add: '新增标准物质', edit: '编辑标准物质', detail: '标准物质详情' }
  return titleMap[mode.value]
})

const hiddenFields = computed(() => {
  return mode.value !== 'detail' ? ['lastPurchaseQuantity', 'lastPurchaseDate'] : []
})

const formData = ref(new StandardMaterialLedgerFormEntity())
formData.value.id = props.param.id || ''

// ===================== AutoComplete 数据源 =====================

interface MaterialNameOption {
  value: string
}
const allMaterialNameOptions = ref<MaterialNameOption[]>([])
const filteredMaterialNameOptions = ref<MaterialNameOption[]>([])

const unitOptions = ref<{ value: string }[]>([])
const custodianOptions = ref<{ value: string }[]>([])

async function loadMaterialData() {
  try {
    const { data } = await getStandardMaterialLedgerList({ page: 0, size: 10000 })
    const items = (data.content || []) as any[]

    const names = items
      .filter((item: any) => item.name)
      .map((item: any) => ({ value: item.name }))
    const uniqueNames = names.filter((name: MaterialNameOption, index: number, self: MaterialNameOption[]) =>
      self.findIndex(n => n.value === name.value) === index,
    )
    allMaterialNameOptions.value = uniqueNames
    filteredMaterialNameOptions.value = uniqueNames
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

function handleMaterialNameSearch(val: string) {
  if (!val) {
    filteredMaterialNameOptions.value = allMaterialNameOptions.value
  }
  else {
    filteredMaterialNameOptions.value = allMaterialNameOptions.value.filter(item =>
      item.value.toLowerCase().includes(val.toLowerCase()),
    )
  }
}

function handleMaterialNameBlur() {
  filteredMaterialNameOptions.value = allMaterialNameOptions.value
}

function handleEnter(e: KeyboardEvent) {
  e.preventDefault()
  e.stopPropagation()
}

async function init() {
  if (props.param.id) {
    detailLoading.value = true
    loading.value = true
    try {
      const [materialRes, lastPurchaseDataRes] = await Promise.all([
        getStandardMaterialLedgerDetail(props.param.id),
        getLatestInboundRecord('PURCHASE', props.param.id),
      ])
      const data = materialRes.data
      const lastPurchaseData = lastPurchaseDataRes.data

      formData.value = new StandardMaterialLedgerFormEntity().fromJSON({
        id: data.id,
        name: data?.name,
        specification: data?.specification,
        manufacturer: data?.manufacturer,
        productionDate: data?.productionDate,
        custodian: data?.custodian,
        inventoryQuantity: data?.inventoryQuantity,
        validPeriodMonths: data?.validPeriodMonths,
        unit: data?.unit,
        unitPrice: data?.unitPrice,
        standardValue: data?.standardValue,
        thresholdValue: data?.thresholdValue,
        lastPurchaseDate: lastPurchaseData?.purchaseDate || '',
        lastPurchaseQuantity: lastPurchaseData?.quantity || '',
      })
    }
    catch (e) {
      message.error('获取详情失败')
      console.error('获取详情失败', e)
    }

    finally {
      detailLoading.value = false
      loading.value = false
    }
  }
}

async function handleOk() {
  try {
    const submitData = await formRef.value?.getFormData()
    loading.value = true
    if (mode.value === 'edit' && props.param.id) {
      await updateStandardMaterialLedger({
        ...submitData,
        id: props.param.id,
        attachmentQrKey: formData.value.attachmentQrKey,
      })
      message.success('更新成功')
    }
    else if (mode.value === 'add') {
      await createStandardMaterialLedger({
        ...submitData,
        attachmentQrKey: formData.value.attachmentQrKey,
      })
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
