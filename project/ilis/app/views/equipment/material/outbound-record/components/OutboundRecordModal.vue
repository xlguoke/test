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
          :entity="OutboundRecordFormEntity"
          :init-data="formData"
          :disabled="mode === 'detail'"
          :cols="1"
          :label-col="{ span: 6 }"
          :wrapper-col="{ span: 16 }"
        >
          <!-- 标准物质名称：Select -->
          <template #materialName="{ data }">
            <a-select
              v-model:value="data.materialName"
              :options="materialNameOptions"
              placeholder="请选择标准物质名称"
              :disabled="mode === 'detail'"
              show-search
              :filter-option="filterMaterialNameOption as any"
              @change="(val: unknown) => handleMaterialNameChange(val as string, data)"
            />
          </template>

          <!-- 规格型号：Select -->
          <template #specification="{ data }">
            <a-select
              v-model:value="data.specification"
              :options="filteredSpecificationOptions"
              placeholder="请选择规格型号"
              :disabled="isSpecificationDisabled(data) || mode === 'detail'"
              @change="(val: unknown) => handleSpecificationChange(val as string, data)"
            />
          </template>

          <!-- 单位：只读 -->
          <template #unit="{ data }">
            <a-input
              v-model:value="data.unit"
              placeholder="请先选择标准物质"
              disabled
            />
          </template>

          <!-- 出库数量 -->
          <template #quantity="{ data }">
            <a-input-number
              v-model:value="data.quantity"
              :min="1"
              :precision="0"
              placeholder="请输入出库数量"
              :disabled="mode === 'detail'"
              :addon-after="data.unit"
              style="width: 100%"
            />
          </template>

          <template #form-after>
            <a-form-item label="附件">
              <HtUploadFile
                :business-type="BUSINES_TYPE.REF_STOCK_OUT"
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
import { BUSINES_TYPE, HtUploadFile } from '~/components/htUploadFile'
import { getStandardMaterialLedgerDetail, getStandardMaterialLedgerList } from '../../standard-material-ledger/api'
import { createOutboundRecord, getOutboundRecordDetail, updateOutboundRecord } from '../api'
import { OutboundRecordFormEntity } from '../entity/OutboundRecordFormEntity'

const props = defineProps<IDialogPropsParam<null, { mode: 'add' | 'edit' | 'detail', id?: string }>>()

const visible = ref(true)
const loading = ref(false)
const detailLoading = ref(false)
const formRef = ref<IlisFormExpose<OutboundRecordFormEntity>>()

const mode = computed(() => props.param.mode)
const modalTitle = computed(() => {
  const titleMap = { add: '新增出库', edit: '编辑出库', detail: '出库记录' }
  return titleMap[mode.value]
})

const formData = ref(new OutboundRecordFormEntity())
formData.value.id = props.param.id || ''

// ===================== Select 数据源 =====================

interface MaterialRawData {
  id: string
  name: string
  specification?: string
}
const allMaterialRawData = ref<MaterialRawData[]>([])

interface MaterialNameOption {
  value: string
  label: string
}
const materialNameOptions = ref<MaterialNameOption[]>([])

interface SpecificationOption {
  value: string
  label: string
  id: string
}
const allSpecificationOptions = ref<SpecificationOption[]>([])
const filteredSpecificationOptions = ref<SpecificationOption[]>([])

async function loadMaterialData() {
  try {
    const { data } = await getStandardMaterialLedgerList({ page: 0, size: 10000 })
    const items = (data.content || []) as any[]
    allMaterialRawData.value = items.map((item: any) => ({
      id: item.id,
      name: item.name,
      specification: item.specification,
    }))

    const nameMap = new Map<string, string>()
    items.forEach((item: any) => {
      if (item.name && !nameMap.has(item.name)) {
        nameMap.set(item.name, item.name)
      }
    })
    materialNameOptions.value = Array.from(nameMap.entries()).map(([value, label]) => ({
      value,
      label,
    }))

    const specs = items
      .filter((item: any) => item.specification)
      .map((item: any) => ({
        value: item.specification,
        label: item.specification,
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

function filterMaterialNameOption(input: string, option: MaterialNameOption) {
  return option.label.toLowerCase().includes(input.toLowerCase())
}

function handleMaterialNameChange(materialName: string, record: OutboundRecordFormEntity) {
  record.materialName = materialName
  record.materialId = undefined
  record.specification = undefined
  record.unit = undefined

  const matchedItems = allMaterialRawData.value.filter(
    item => item.name.toLowerCase() === materialName.toLowerCase(),
  )

  const specs = matchedItems
    .filter(item => item.specification)
    .map(item => ({
      value: item.specification!,
      label: item.specification!,
      id: item.id,
    }))
  filteredSpecificationOptions.value = specs

  if (matchedItems.length === 1) {
    const item = matchedItems[0]
    record.specification = item.specification
    record.materialId = item.id
    getStandardMaterialLedgerDetail(item.id).then(({ data }) => {
      if (data) {
        record.unit = data.unit
      }
    }).catch((e) => {
      console.error('获取标准物质详情失败', e)
    })
  }
}

async function handleSpecificationChange(specification: string, record: OutboundRecordFormEntity) {
  record.specification = specification

  const matchedItem = allMaterialRawData.value.find(
    item => item.name.toLowerCase() === record.materialName!.toLowerCase()
      && item.specification?.toLowerCase() === specification.toLowerCase(),
  )

  if (matchedItem) {
    record.materialId = matchedItem.id
    try {
      const { data } = await getStandardMaterialLedgerDetail(matchedItem.id)
      if (data) {
        record.unit = data.unit
      }
    }
    catch (e) {
      console.error('获取标准物质详情失败', e)
    }
  }
}

const isSpecificationDisabled = computed(() => {
  return (data: OutboundRecordFormEntity) => {
    if (mode.value === 'detail')
      return true
    return !data.materialName
  }
})

async function init() {
  if (mode.value === 'add') {
    const localUserInfo = getLocalUserInfo()
    formData.value = new OutboundRecordFormEntity().fromJSON({
      outDate: dayjs().format('YYYY-MM-DD'),
      operator: localUserInfo?.realName || '',
      operatorId: localUserInfo?.userId || '',
    })
  }

  if (props.param.id) {
    detailLoading.value = true
    try {
      const { data } = await getOutboundRecordDetail(props.param.id)
      formData.value = new OutboundRecordFormEntity().fromJSON({
        id: data.id,
        materialId: data?.material?.id || '',
        materialName: data?.material?.name || '',
        unit: data?.material?.unit || '',
        specification: data?.material?.specification || '',
        outType: data?.outType || undefined,
        quantity: data?.quantity || undefined,
        purpose: data?.purpose || undefined,
        operatorId: data?.operatorId || '',
        operator: data?.operator || '',
        outDate: data?.outDate || '',
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
      quantity: submitData?.quantity,
      purpose: submitData?.purpose,
      outDate: dayjs(submitData?.outDate).format('YYYY-MM-DD'),
      operator: submitData?.operator,
      operatorId: submitData?.operatorId,
      outType: submitData?.outType,
      attachmentQrKey: submitData?.attachmentQrKey,
    }
    loading.value = true
    if (mode.value === 'edit' && props.param.id) {
      await updateOutboundRecord({ ...data, id: props.param.id })
      message.success('更新成功')
    }
    else if (mode.value === 'add') {
      await createOutboundRecord(data!)
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
  init()
})
</script>
