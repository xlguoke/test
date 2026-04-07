<template>
  <HtModal
    v-model:open="visible"
    :title="modalTitle"
    :width="1600"
    :mask-closable="false"
    :confirm-loading="confirmLoading"
    :hide-confirm="isDetailMode"
    :after-close="onClosed"
    @ok="handleOk"
  >
    <div class="flex flex-col gap-3">
      <BaseTitle>标准物质列表</BaseTitle>
      <a-space v-if="!isDetailMode">
        <a-button type="primary" size="small" @click="handleAddRow">
          <PlusOutlined />
          新增
        </a-button>
        <a-button size="small" @click="handleAddFromWarning">
          <WarningOutlined />
          从余量预警中新增
        </a-button>
      </a-space>

      <a-form
        ref="formRef"
        class="table-form"
        :model="dataSource"
        :rules="rules"
      >
        <IlisTable
          row-key="id"
          bordered
          resizable
          size="small"
          :entity="PurchaseApplyDetailEntity"
          :data-source="dataSource"
          :pagination="false"
          :table-width="1000"
        >
          <template #headerCell="{ column, title }">
            <template v-if="['materialName', 'materialSpecification', 'quantity', 'unit'].includes(column.dataIndex as string)">
              <span class="required-title">{{ title }}</span>
            </template>
          </template>
          <template v-if="!isDetailMode" #bodyCell="{ column, record, index }">
            <!-- 标准物质名称：AutoComplete -->
            <template v-if="column.dataIndex === 'materialName'">
              <a-form-item :name="[index, 'materialName']">
                <a-auto-complete
                  v-model:value="record.materialName"
                  :options="filteredMaterialNameOptions"
                  placeholder="请输入或选择标准物质名称"
                  :disabled="isDetailMode"
                  @search="handleMaterialSearch"
                  @select="(value: any) => handleMaterialNameSelect(value, record as PurchaseApplyDetailFormEntity)"
                  @blur="() => handleMaterialNameBlur(record as PurchaseApplyDetailFormEntity)"
                  @keydown.enter="handleEnter"
                />
              </a-form-item>
            </template>
            <!-- 规格型号：AutoComplete -->
            <template v-else-if="column.dataIndex === 'materialSpecification'">
              <a-form-item :name="[index, 'materialSpecification']">
                <a-auto-complete
                  v-model:value="record.materialSpecification"
                  :options="record._specificationOptions || []"
                  placeholder="请输入或选择规格型号"
                  :disabled="isDisabled(record as PurchaseApplyDetailFormEntity, 'materialSpecification')"
                  @search="(val: string) => handleSpecificationSearch(val, record as PurchaseApplyDetailFormEntity)"
                  @select="(value: any) => handleSpecificationSelect(value, record as PurchaseApplyDetailFormEntity)"
                  @blur="() => handleSpecificationBlur(record as PurchaseApplyDetailFormEntity)"
                  @keydown.enter="handleEnter"
                />
              </a-form-item>
            </template>
            <!-- 数量 -->
            <template v-else-if="column.dataIndex === 'quantity'">
              <a-form-item :name="[index, 'quantity']">
                <a-input-number
                  v-model:value="record.quantity"
                  :min="1"
                  :precision="0"
                  placeholder="请输入数量"
                  :disabled="isDisabled(record as PurchaseApplyDetailFormEntity, 'quantity')"
                  style="width: 100%"
                  @change="() => handleQuantityOrPriceChange(record as PurchaseApplyDetailFormEntity)"
                />
              </a-form-item>
            </template>
            <!-- 单价 -->
            <template v-else-if="column.dataIndex === 'unitPrice'">
              <a-form-item :name="[index, 'unitPrice']">
                <a-input-number
                  v-model:value="record.unitPrice"
                  :min="0"
                  :precision="2"
                  placeholder="请输入单价"
                  :disabled="isDisabled(record as PurchaseApplyDetailFormEntity, 'unitPrice')"
                  style="width: 100%"
                  @change="() => handleQuantityOrPriceChange(record as PurchaseApplyDetailFormEntity)"
                />
              </a-form-item>
            </template>
            <!-- 单位：AutoComplete -->
            <template v-else-if="column.dataIndex === 'unit'">
              <a-form-item :name="[index, 'unit']">
                <a-auto-complete
                  v-model:value="record.unit"
                  :options="unitOptions"
                  placeholder="请输入或选择单位"
                  :disabled="isDisabled(record as PurchaseApplyDetailFormEntity, 'unit')"
                  @keydown.enter="handleEnter"
                />
              </a-form-item>
            </template>
            <!-- 保管人：AutoComplete -->
            <template v-else-if="column.dataIndex === 'custodian'">
              <a-form-item :name="[index, 'custodian']">
                <a-auto-complete
                  v-model:value="record.custodian"
                  :options="custodianOptions"
                  placeholder="请输入或选择保管人"
                  :disabled="isDisabled(record as PurchaseApplyDetailFormEntity, 'custodian')"
                  @keydown.enter="handleEnter"
                />
              </a-form-item>
            </template>
            <template v-if="column.dataIndex === 'amount'">
              <span>{{ formatSubtotal(record as PurchaseApplyDetailEntity) }}</span>
            </template>
            <template v-if="column.dataIndex === 'remark'">
              <a-input
                v-model:value="record.remark"
                :disabled="isDetailMode"
                placeholder="请输入备注"
                allow-clear
              />
            </template>
            <template v-if="column.dataIndex === 'operation'">
              <a-button type="link" danger size="small" @click="handleRemoveRow(index)">
                移除
              </a-button>
            </template>
          </template>
          <template v-else #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'amount'">
              <span>{{ formatSubtotal(record as PurchaseApplyDetailEntity) }}</span>
            </template>
          </template>
        </IlisTable>
      </a-form>

      <div class="flex justify-end gap-6 text-gray-600">
        <span>标准物质种数：{{ dataSource.length }}</span>
        <span>总金额：{{ formatTotalAmount() }} 元</span>
      </div>

      <BaseTitle>申请说明</BaseTitle>
      <a-form ref="mainFormRef" :model="formData">
        <a-form-item name="description">
          <a-textarea
            v-model:value="formData.description"
            :disabled="isDetailMode"
            :rows="3"
            :max-length="500"
            placeholder="请输入申请说明"
            show-count
          />
        </a-form-item>
      </a-form>
    </div>
  </HtModal>
</template>

<script setup lang="ts">
import type { FormInstance } from 'ant-design-vue'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { PlusOutlined, WarningOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { AnyValidatorHelper } from '~/anyThing/helper/AnyValidatorHelper'
import { getDictByCode } from '~/api/common'
import { BaseTitle } from '~/components/UI'
import { getGuardianNameList, getStandardMaterialLedgerDetail, getStandardMaterialLedgerList } from '../../standard-material-ledger/api'
import { createPurchaseApply, getPurchaseApplyDetail, updatePurchaseApply } from '../api'
import { PurchaseApplyDetailEntity } from '../entity/PurchaseApplyDetailEntity'
import { PurchaseApplyDetailFormEntity } from '../entity/PurchaseApplyDetailFormEntity'
import WarningMaterialSelectorModal from './WarningMaterialSelectorModal.vue'

const props = defineProps<IDialogPropsParam<null, { mode: 'add' | 'edit' | 'detail', id?: string }>>()

const visible = ref(true)
const confirmLoading = ref(false)
const formRef = ref<FormInstance>()
const mainFormRef = ref<FormInstance>()

const mode = computed(() => props.param.mode)
const modalTitle = computed(() => {
  const titles = { add: '新增采购申请', edit: '编辑采购申请', detail: '采购申请详情' }
  return titles[mode.value]
})
const isDetailMode = computed(() => mode.value === 'detail')

const formData = reactive({
  id: undefined as string | undefined,
  description: '',
})

const dataSource = ref<PurchaseApplyDetailFormEntity[]>([])

const rules = computed(() => {
  const rule = {} as Record<string, any>
  dataSource.value.forEach((_item, index) => {
    rule[index] = AnyValidatorHelper.getValidateRules(new PurchaseApplyDetailFormEntity())
  })
  return rule
})

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

function handleSpecificationSearch(val: string, record: PurchaseApplyDetailFormEntity) {
  const baseOptions = record._originalSpecificationOptions || allSpecificationOptions.value
  if (!val) {
    record._specificationOptions = baseOptions
  }
  else {
    record._specificationOptions = baseOptions.filter(item =>
      item.value.toLowerCase().includes(val.toLowerCase()),
    )
  }
}

async function handleMaterialNameSelect(materialName: string, record: PurchaseApplyDetailFormEntity) {
  record.materialName = materialName
  record.isCustomMaterial = false
  record.isCustomSpecification = false
  record.materialSpecification = undefined
  record.materialId = undefined
  record.unitPrice = undefined
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
  record._specificationOptions = specs
  record._originalSpecificationOptions = specs

  if (matchedItems.length === 1) {
    const item = matchedItems[0]
    record.materialSpecification = item.specification
    record.materialId = item.id
    try {
      const { data } = await getStandardMaterialLedgerDetail(item.id)
      if (data) {
        record.unitPrice = data.unitPrice
        record.unit = data.unit
        record.custodian = data.custodian
        if (record.quantity && record.unitPrice) {
          record.amount = record.quantity * record.unitPrice
        }
      }
    }
    catch (e) {
      console.error('获取标准物质详情失败', e)
    }
  }
}

function handleMaterialNameBlur(record: PurchaseApplyDetailFormEntity) {
  if (!record.materialName) {
    record.isCustomMaterial = false
    record.isCustomSpecification = false
    record.materialId = undefined
    record.materialSpecification = undefined
    record.unitPrice = undefined
    record.unit = undefined
    record.custodian = undefined
    filteredSpecificationOptions.value = allSpecificationOptions.value
    filteredMaterialNameOptions.value = allMaterialNameOptions.value
    return
  }

  if (record.materialId) {
    filteredMaterialNameOptions.value = allMaterialNameOptions.value
    return
  }

  if (record.isCustomMaterial) {
    filteredMaterialNameOptions.value = allMaterialNameOptions.value
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
    filteredMaterialNameOptions.value = allMaterialNameOptions.value
  }
}

async function handleSpecificationSelect(specification: string, record: PurchaseApplyDetailFormEntity) {
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
        record.unitPrice = data.unitPrice
        record.unit = data.unit
        record.custodian = data.custodian
        if (record.quantity && record.unitPrice) {
          record.amount = record.quantity * record.unitPrice
        }
      }
    }
    catch (e) {
      console.error('获取标准物质详情失败', e)
    }
  }
}

async function handleSpecificationBlur(record: PurchaseApplyDetailFormEntity) {
  if (!record.materialSpecification) {
    record.isCustomSpecification = record.isCustomMaterial
    record.materialId = undefined
    record.unitPrice = undefined
    record.unit = undefined
    record.custodian = undefined
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
      record.isCustomSpecification = false
      return
    }
    await handleSpecificationSelect(record.materialSpecification, record)
  }
  else {
    record.isCustomSpecification = true
    record.materialId = undefined
  }
}

// 阻止回车默认行为
function handleEnter(e: KeyboardEvent) {
  e.preventDefault()
  e.stopPropagation()
}

// ===================== 禁用逻辑 =====================

const isDisabled = computed(() => {
  return (record: PurchaseApplyDetailFormEntity, field: keyof PurchaseApplyDetailFormEntity) => {
    // 未填写物质名称时，禁用除物质名称外的所有字段
    if (!record.materialName) {
      if (['materialSpecification', 'quantity', 'unitPrice', 'unit', 'custodian'].includes(field)) {
        return true
      }
    }

    // 单价字段禁用规则
    if (field === 'unitPrice') {
      if (record.isCustomMaterial) // 自定义
        return false
      if (record.isCustomSpecification)
        return false
      return true
    }

    // 单位字段禁用规则
    if (field === 'unit') {
      if (record.isCustomMaterial)
        return false
      return true
    }

    // 保管人字段禁用规则
    if (field === 'custodian') {
      if (record.isCustomMaterial || record.isCustomSpecification)
        return false
      return true
    }

    return false
  }
})

// 数量或单价变化时计算金额
function handleQuantityOrPriceChange(record: PurchaseApplyDetailFormEntity) {
  if (record.quantity && record.unitPrice) {
    record.amount = record.quantity * record.unitPrice
  }
  else {
    record.amount = undefined
  }
}

// ===================== 其他方法 =====================

function formatSubtotal(record: PurchaseApplyDetailFormEntity): string {
  if (record.amount === undefined || record.amount === null)
    return '-'
  return record.amount.toFixed(2)
}

function formatTotalAmount(): string {
  const total = dataSource.value.reduce((sum, item) => sum + (item.amount || 0), 0)
  return total.toFixed(2)
}

function handleAddRow() {
  const newRow = new PurchaseApplyDetailFormEntity().fromJSON({
    isCustomMaterial: false,
    isCustomSpecification: false,
  })
  dataSource.value = [...dataSource.value, newRow]
}

async function handleAddFromWarning() {
  const value = await AnyDialogHelper.showModel(WarningMaterialSelectorModal, {})
  const selectedMaterials = value as any[]
  if (selectedMaterials && selectedMaterials.length > 0) {
    const newRows = await Promise.all(
      selectedMaterials.map(async (material) => {
        let detailData = material
        if (material.materialId) {
          try {
            const { data } = await getStandardMaterialLedgerDetail(material.materialId)
            if (data) {
              detailData = { ...material, ...data }
            }
          }
          catch (e) {
            console.error('获取标准物质详情失败', e)
          }
        }

        const matchedItems = allMaterialRawData.value.filter(
          item => item.name.toLowerCase() === (detailData.materialName || detailData.name || '').toLowerCase(),
        )
        const specs = matchedItems
          .filter(item => item.specification)
          .map(item => ({
            value: item.specification!,
            id: item.id,
          }))

        const entity = new PurchaseApplyDetailFormEntity().fromJSON({
          ...detailData,
          quantity: 1,
          amount: detailData.unitPrice,
        })
        entity._specificationOptions = specs
        entity._originalSpecificationOptions = specs
        return entity
      }),
    )
    dataSource.value = [...dataSource.value, ...newRows]
    message.success(`成功添加 ${selectedMaterials.length} 种标准物质`)
  }
}

function handleRemoveRow(index: number) {
  dataSource.value.splice(index, 1)
}

async function handleOk() {
  if (isDetailMode.value) {
    visible.value = false
    return
  }

  try {
    await mainFormRef.value?.validate()
    await formRef.value?.validate()

    if (dataSource.value.length === 0) {
      message.error('请至少添加一条标准物质记录')
      return
    }

    confirmLoading.value = true

    const submitData = {
      applyItems: dataSource.value.map(item => ({
        materialId: item.isCustomMaterial ? undefined : item.materialId,
        materialName: item.materialName,
        materialSpecification: item.materialSpecification,
        unit: item.unit,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount: item.amount,
        remark: item.remark || '',
        custodian: item.custodian,
      })),
      description: formData.description || '',
    }

    if (mode.value === 'edit' && props.param.id) {
      await updatePurchaseApply({ ...submitData, id: props.param.id })
      message.success('更新成功')
    }
    else {
      await createPurchaseApply(submitData)
      message.success('新增成功')
    }

    props.onConfirm(null)
    visible.value = false
  }
  catch (error) {
    console.error('表单验证失败:', error)
  }
  finally {
    confirmLoading.value = false
  }
}

async function loadDetail() {
  if (!props.param.id || mode.value === 'add')
    return

  try {
    confirmLoading.value = true
    const res = await getPurchaseApplyDetail(props.param.id)
    if (res.data) {
      formData.id = res.data.id
      formData.description = res.data.description || ''
      if (res.data.applyItems) {
        dataSource.value = res.data.applyItems.map((item: any) =>
          new PurchaseApplyDetailFormEntity().fromJSON({
            ...item, // 当前缺少保管人和备注信息
            isCustomMaterial: !item.materialId,
            isCustomSpecification: !item.materialId,
          }),
        )
      }
    }
  }
  catch (error) {
    console.error('加载详情失败:', error)
    message.error('加载详情失败')
  }
  finally {
    confirmLoading.value = false
  }
}

onMounted(async () => {
  await loadMaterialData()
  await loadDictData()
  if (mode.value === 'edit') {
    loadDetail()
  }
})
</script>

<style scoped>
:deep(.table-form) .ant-form-item {
  margin-bottom: 0 !important;
}

.required-title::before {
  content: '*';
  color: red;
  display: inline-block;
  line-height: 1;
  margin-inline-end: 4px;
}
</style>
