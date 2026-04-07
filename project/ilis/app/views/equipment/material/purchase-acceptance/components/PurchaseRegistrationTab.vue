<template>
  <div class="flex flex-col overflow-hidden">
    <div class="mb-3 flex justify-between items-center flex-shrink-0">
      <a-space v-if="!isDetailMode">
        <a-button type="primary" size="small" @click="handleAddRow">
          <PlusOutlined />
          新增登记
        </a-button>
        <a-button size="small" @click="handleAddFromPurchaseApply">
          <ImportOutlined />
          从采购申请中新增
        </a-button>
      </a-space>
      <a-form ref="accepterFormRef" layout="inline" :model="accepter">
        <a-form-item label="验收人" name="name" :rules="[{ required: true, message: '请选择验收人' }]">
          <a-input-group compact>
            <a-input
              v-model:value="accepter.name"
              readonly
              placeholder="请选择验收人"
              style="width: 160px"
            />
            <a-button type="primary" @click="personVisible = true">
              选择
            </a-button>
          </a-input-group>
        </a-form-item>
      </a-form>
    </div>

    <div class="flex-1 overflow-auto">
      <a-form
        ref="formRef"
        class="table-form"
        :model="dataSource"
        :rules="rules"
      >
        <IlisTable
          row-key="id"
          bordered
          size="small"
          resizable
          :entity="PurchaseAcceptanceDetailEntity"
          :data-source="dataSource"
          :pagination="false"
          :scroll="{ x: 1500 }"
        >
          <template #headerCell="{ column, title }">
            <template v-if="['materialName', 'materialSpecification', 'manufacturer', 'productionDate', 'quantity', 'unit', 'custodian', 'purchaseDate'].includes(column.dataIndex as string)">
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
                  @select="(value: any) => handleMaterialNameSelect(value, record as PurchaseAcceptanceDetailFormEntity)"
                  @blur="() => handleMaterialNameBlur(record as PurchaseAcceptanceDetailFormEntity)"
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
                  :disabled="isDisabled(record as PurchaseAcceptanceDetailFormEntity, 'materialSpecification')"
                  @search="(val: string) => handleSpecificationSearch(val, record as PurchaseAcceptanceDetailFormEntity)"
                  @select="(value: any) => handleSpecificationSelect(value, record as PurchaseAcceptanceDetailFormEntity)"
                  @blur="() => handleSpecificationBlur(record as PurchaseAcceptanceDetailFormEntity)"
                  @keydown.enter="handleEnter"
                />
              </a-form-item>
            </template>
            <!-- 生产厂家 -->
            <template v-else-if="column.dataIndex === 'manufacturer'">
              <a-form-item :name="[index, 'manufacturer']">
                <a-input
                  v-model:value="record.manufacturer"
                  placeholder="请输入生产厂家"
                  :disabled="isDisabled(record as PurchaseAcceptanceDetailFormEntity, 'manufacturer')"
                />
              </a-form-item>
            </template>
            <!-- 生产日期 -->
            <template v-else-if="column.dataIndex === 'productionDate'">
              <a-form-item :name="[index, 'productionDate']">
                <a-date-picker
                  v-model:value="record.productionDate"
                  value-format="YYYY-MM-DD"
                  placeholder="请选择生产日期"
                  :disabled="isDisabled(record as PurchaseAcceptanceDetailFormEntity, 'productionDate')"
                  style="width: 100%"
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
                  :disabled="isDisabled(record as PurchaseAcceptanceDetailFormEntity, 'quantity')"
                  style="width: 100%"
                  @change="() => handleQuantityOrPriceChange(record as PurchaseAcceptanceDetailFormEntity)"
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
                  :disabled="isDisabled(record as PurchaseAcceptanceDetailFormEntity, 'unitPrice')"
                  style="width: 100%"
                  @change="() => handleQuantityOrPriceChange(record as PurchaseAcceptanceDetailFormEntity)"
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
                  :disabled="isDisabled(record as PurchaseAcceptanceDetailFormEntity, 'unit')"
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
                  :disabled="isDisabled(record as PurchaseAcceptanceDetailFormEntity, 'custodian')"
                  @keydown.enter="handleEnter"
                />
              </a-form-item>
            </template>
            <!-- 购置日期 -->
            <template v-else-if="column.dataIndex === 'purchaseDate'">
              <a-form-item :name="[index, 'purchaseDate']">
                <a-date-picker
                  v-model:value="record.purchaseDate"
                  value-format="YYYY-MM-DD"
                  placeholder="请选择购置日期"
                  :disabled="isDetailMode"
                  style="width: 100%"
                />
              </a-form-item>
            </template>
            <!-- 备注 -->
            <template v-else-if="column.dataIndex === 'remark'">
              <a-input
                v-model:value="record.remark"
                :disabled="isDetailMode"
                placeholder="请输入备注"
                allow-clear
              />
            </template>
            <!-- 金额 -->
            <template v-if="column.dataIndex === 'amount'">
              <span>{{ formatAmount(record.amount) }}</span>
            </template>
            <!-- 操作 -->
            <template v-if="column.dataIndex === 'operation'">
              <a-button type="link" danger size="small" @click="handleRemoveRow(index)">
                移除
              </a-button>
            </template>
          </template>
          <template v-else #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'amount'">
              <span>{{ formatAmount(record.amount) }}</span>
            </template>
          </template>
        </IlisTable>
      </a-form>
    </div>

    <div class="mt-3 flex justify-end gap-6 text-gray-600 flex-shrink-0">
      <span>标准物质种数：{{ dataSource.length }}</span>
      <span>总金额：{{ formatAmount(calculateTotalAmount()) }} 元</span>
    </div>

    <PersonSelector v-model:show="personVisible" @confirm="getPerson" />
  </div>
</template>

<script setup lang="ts">
import type { FormInstance } from 'ant-design-vue'
import type { IUserSelectVoEntity } from '~/interface/IUserSelectVoEntity'
import { ImportOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { AnyValidatorHelper } from '~/anyThing/helper/AnyValidatorHelper'
import { getDictByCode } from '~/api/common'
import { getGuardianNameList, getStandardMaterialLedgerDetail, getStandardMaterialLedgerList } from '../../standard-material-ledger/api'
import { createPurchaseAcceptance, getAcceptanceDetail, updatePurchaseAcceptance } from '../api'
import { PurchaseAcceptanceDetailEntity } from '../entity/PurchaseAcceptanceDetailEntity'
import { PurchaseAcceptanceDetailFormEntity } from '../entity/PurchaseAcceptanceDetailFormEntity'
import PurchaseApplySelectorModal from './PurchaseApplySelectorModal.vue'

const props = defineProps<{
  mode: 'add' | 'edit' | 'detail'
  id: string
}>()

const formRef = ref<FormInstance>()
const accepterFormRef = ref<FormInstance>()
const dataSource = ref<PurchaseAcceptanceDetailFormEntity[]>([])
const personVisible = ref(false)

const isDetailMode = computed(() => props.mode === 'detail')

const accepter = reactive({
  name: '',
  id: '',
})

const rules = computed(() => {
  const rule = {} as Record<string, any>
  dataSource.value.forEach((_item, index) => {
    rule[index] = AnyValidatorHelper.getValidateRules(new PurchaseAcceptanceDetailFormEntity())
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

// 单位选项（字典）
const unitOptions = ref<{ value: string }[]>([])

// 保管人选项
const custodianOptions = ref<{ value: string }[]>([])

// 加载标准物质数据
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

// 加载字典数据
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

// 搜索过滤
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

function handleSpecificationSearch(val: string, record: PurchaseAcceptanceDetailFormEntity) {
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

async function handleMaterialNameSelect(materialName: string, record: PurchaseAcceptanceDetailFormEntity) {
  record.materialName = materialName
  record.isCustomMaterial = false
  record.isCustomSpecification = false
  record.materialSpecification = undefined
  record.materialId = undefined
  record.unitPrice = undefined
  record.unit = undefined
  record.custodian = undefined
  record.manufacturer = undefined
  record.productionDate = undefined

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
        record.productionDate = data.productionDate
        record.manufacturer = data.manufacturer
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

function handleMaterialNameBlur(record: PurchaseAcceptanceDetailFormEntity) {
  if (!record.materialName) {
    record.isCustomMaterial = false
    record.isCustomSpecification = false
    record.materialId = undefined
    record.materialSpecification = undefined
    record.unitPrice = undefined
    record.unit = undefined
    record.custodian = undefined
    record.manufacturer = undefined
    record.productionDate = undefined
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

async function handleSpecificationSelect(specification: string, record: PurchaseAcceptanceDetailFormEntity) {
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
        record.productionDate = data.productionDate
        record.manufacturer = data.manufacturer
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

async function handleSpecificationBlur(record: PurchaseAcceptanceDetailFormEntity) {
  if (!record.materialSpecification) {
    record.isCustomSpecification = record.isCustomMaterial
    record.materialId = undefined
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
  return (record: PurchaseAcceptanceDetailFormEntity, field: keyof PurchaseAcceptanceDetailFormEntity) => {
    if (!record.materialName) {
      if (['materialSpecification', 'manufacturer', 'productionDate', 'quantity', 'unitPrice', 'unit', 'custodian', 'purchaseDate'].includes(field)) {
        return true
      }
    }
    if (field === 'manufacturer') {
      if (record.isCustomMaterial)
        return false
      if (record.isCustomSpecification)
        return false
      return true
    }
    if (field === 'unitPrice') {
      if (record.isCustomMaterial)
        return false
      if (record.isCustomSpecification)
        return false
      return true
    }
    if (field === 'unit') {
      if (record.isCustomMaterial)
        return false
      return true
    }
    if (field === 'productionDate') {
      if (record.isCustomMaterial)
        return false
      if (record.isCustomSpecification)
        return false
      return true
    }
    if (field === 'custodian') {
      if (record.isCustomMaterial)
        return false
      if (record.isCustomSpecification)
        return false
      return true
    }
    return false
  }
})

// 数量或单价变化时计算金额
function handleQuantityOrPriceChange(record: PurchaseAcceptanceDetailFormEntity) {
  if (record.quantity && record.unitPrice) {
    record.amount = record.quantity * record.unitPrice
  }
  else {
    record.amount = undefined
  }
}

// ===================== 其他方法 =====================

async function getPerson(datas: IUserSelectVoEntity[]) {
  personVisible.value = false
  if (datas.length === 0)
    return
  accepter.id = datas[0].id
  accepter.name = datas[0].name
  await accepterFormRef?.value?.validate()
}

function calculateTotalAmount(): number {
  return dataSource.value.reduce((sum, item) => sum + (item.amount || 0), 0)
}

function formatAmount(amount?: number): string {
  if (amount === undefined || amount === null)
    return '0.00'
  return amount.toFixed(2)
}

function handleAddRow() {
  const newRow = new PurchaseAcceptanceDetailFormEntity().fromJSON({
    isCustomMaterial: false,
    isCustomSpecification: false,
  })
  dataSource.value = [...dataSource.value, newRow]
}

function handleAddFromPurchaseApply() {
  AnyDialogHelper.showModel(PurchaseApplySelectorModal, {}).then((value: unknown) => {
    const selectedItems = value as any[]
    if (selectedItems && selectedItems.length > 0) {
      const newRows = selectedItems.map((item) => {
        const matchedItems = allMaterialRawData.value.filter(
          mat => mat.name.toLowerCase() === (item.materialName || '').toLowerCase(),
        )
        const specs = matchedItems
          .filter(mat => mat.specification)
          .map(mat => ({
            value: mat.specification!,
            id: mat.id,
          }))

        const entity = new PurchaseAcceptanceDetailFormEntity().fromJSON({
          ...item,
        })
        entity._specificationOptions = specs
        entity._originalSpecificationOptions = specs

        if (!item.materialId) {
          entity.isCustomMaterial = true
          entity.isCustomSpecification = true
        }
        else {
          entity.isCustomMaterial = false
          const matchedSpec = matchedItems.find(
            mat => mat.specification?.toLowerCase() === (item.materialSpecification || '').toLowerCase(),
          )
          if (matchedSpec) {
            entity.isCustomSpecification = false
          }
          else {
            entity.isCustomSpecification = true
          }
        }

        if (entity.quantity && entity.unitPrice) {
          entity.amount = entity.quantity * entity.unitPrice
        }

        return entity
      })
      dataSource.value = [...dataSource.value, ...newRows]
      message.success(`成功添加 ${selectedItems.length} 条采购申请记录`)
    }
  })
}

function handleRemoveRow(index: number) {
  dataSource.value.splice(index, 1)
}

async function validate() {
  if (dataSource.value.length === 0) {
    message.warning('请至少添加一条购置登记记录')
    throw new Error('请至少添加一条购置登记记录')
  }

  await accepterFormRef.value?.validate()
  await formRef.value?.validate()
}

async function handlePurchaseConfirm() {
  const data = {
    id: props?.id || undefined,
    accepter: accepter.name,
    accepterId: accepter.id,
    acceptItems: dataSource.value.map((item: any) => ({
      applyItemId: item.applyItemId,
      materialId: item.materialId,
      materialName: item.materialName,
      materialSpecification: item.materialSpecification,
      manufacturer: item.manufacturer,
      productionDate: item.productionDate,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      unit: item.unit,
      amount: item.amount,
      custodian: item.custodian,
      purchaseDate: item.purchaseDate,
      remark: item.remark,
    })),
  }
  try {
    if (props.mode === 'add') {
      await createPurchaseAcceptance(data)
    }
    else if (props.mode === 'edit') {
      await updatePurchaseAcceptance(data)
    }
  }
  catch (error) {
    console.error(error)
  }
}

async function init() {
  const { data } = await getAcceptanceDetail(props.id)
  if (data) {
    accepter.id = data.accepterId
    accepter.name = data.accepter
    dataSource.value = data.acceptItems.map((item: any) => {
      const entity = new PurchaseAcceptanceDetailFormEntity().fromJSON({
        applyItemId: item.applyItemId,
        materialId: item.materialId,
        materialName: item.materialName,
        materialSpecification: item.materialSpecification,
        manufacturer: item.manufacturer,
        productionDate: item.productionDate,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        unit: item.unit,
        amount: item.amount,
        custodian: item.custodian,
        purchaseDate: item.purchaseDate,
        remark: item.remark,
      })

      if (!item.materialId) {
        entity.isCustomMaterial = true
        entity.isCustomSpecification = true
      }
      else {
        entity.isCustomMaterial = false
        const matchedItems = allMaterialRawData.value.filter(
          mat => mat.name.toLowerCase() === (item.materialName || '').toLowerCase(),
        )
        const specs = matchedItems
          .filter(mat => mat.specification)
          .map(mat => ({
            value: mat.specification!,
            id: mat.id,
          }))
        entity._specificationOptions = specs
        entity._originalSpecificationOptions = specs

        const matchedSpec = matchedItems.find(
          mat => mat.specification?.toLowerCase() === (item.materialSpecification || '').toLowerCase(),
        )
        if (matchedSpec) {
          entity.isCustomSpecification = false
        }
        else {
          entity.isCustomSpecification = true
        }
      }

      return entity
    })
  }
}

onMounted(async () => {
  await loadMaterialData()
  await loadDictData()
  if (props.mode === 'edit') {
    init()
  }
})

defineExpose({
  validate,
  handlePurchaseConfirm,
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
