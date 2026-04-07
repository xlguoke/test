<template>
  <ht-modal
    v-model:open="open"
    :title="title"
    width="80%"
    :hide-confirm="isDetail"
    :confirm-loading="submitLoading"
    @cancel="cancel"
    @ok="onSubmit"
  >
    <div class="pt-2 min-h-[50vh]">
      <!-- 登记信息 -->
      <BaseTitle>
        登记信息
      </BaseTitle>
      <a-form
        ref="formRef"
        layout="inline"
        :model="formState"
        :rules="formRules"
        :disabled="isDetail"
        :label-col="{ style: { width: '100px' } }"
      >
        <a-form-item label="登记人" name="registrant">
          <a-input-group compact>
            <a-input v-model:value="formState.registrant" class="w-[120px]" readonly placeholder="请选择" />
            <a-button v-if="!isDetail" type="primary" @click="onSelectRegistrant">
              选择
            </a-button>
          </a-input-group>
        </a-form-item>
        <a-form-item label="登记时间" name="registerTime">
          <a-date-picker
            v-model:value="formState.registerTime"
            class="w-full"
            show-time
            :value-format="EDateFormatType.YYYY_MM_DD_HH_MM_SS"
            placeholder="请选择登记时间"
          />
        </a-form-item>
        <a-form-item label="验收人" name="verifier">
          <a-input-group compact>
            <a-input v-model:value="formState.verifier" class="w-[120px]" readonly placeholder="请选择" />
            <a-button v-if="!isDetail" type="primary" @click="onSelectVerifier">
              选择
            </a-button>
          </a-input-group>
        </a-form-item>
        <a-form-item label="保管人" name="keepers">
          <a-input-group compact>
            <a-input v-model:value="formState.keepers" class="w-[120px]" readonly placeholder="请选择" />
            <a-button v-if="!isDetail" type="primary" @click="onSelectKeepers">
              选择
            </a-button>
          </a-input-group>
        </a-form-item>
        <a-form-item v-show="false" label="附件" name="attachmentQr">
          <UploadFile
            :business-type="BUSINES_TYPE.CHEMICAL"
            :business-id="formState.id"
            @init-complete="data => {
              formState.attachmentQr = data.qrCodeKey
            }"
          />
        </a-form-item>
      </a-form>

      <!-- 化学品信息 -->
      <BaseTitle class="mt-6">
        化学品信息
      </BaseTitle>
      <a-space v-if="!isDetail" class="mb-4">
        <a-button v-permission="'purchase::register::add-chemical'" type="primary" @click="onSelectChemical">
          选择化学品新增
        </a-button>
        <a-button v-permission="'purchase::register::add-order'" @click="onSelectFromApply">
          从采购申请单新增
        </a-button>
        <a-button danger :disabled="!selectedItemKeys.length" @click="onBatchDeleteItems">
          删除
        </a-button>
      </a-space>

      <IlisTable
        row-key="id"
        :entity="ChemicalPurchaseRegisterItemFormEntity"
        :data-source="formState.items"
        :pagination="false"
        :resizable="false"
        :table-width="isDetail ? undefined : 1200"
        :field-list="fieldList"
        :row-selection="isDetail ? undefined : { selectedRowKeys: selectedItemKeys, onChange: onItemSelectChange }"
      >
        <template #headerCell="{ column }">
          <template v-if="requiredFields.includes(column.dataIndex as string)">
            <span class="text-red-500">*</span>{{ column.title }}
          </template>
          <template v-else>
            {{ column.title }}
          </template>
        </template>
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'chemicalName'">
            <span v-if="isDetail">{{ record.chemicalName }}</span>
            <span v-else class="text-gray-500">{{ record.chemicalName || '选择化学品后自动填充' }}</span>
          </template>
          <template v-else-if="column.dataIndex === 'unit'">
            <span v-if="isDetail">{{ record.unit }}</span>
            <span v-else class="text-gray-500">{{ record.unit || '选择化学品后自动填充' }}</span>
          </template>
          <template v-else-if="column.dataIndex === 'purchaseQuantity'">
            <a-input-number
              v-if="!isDetail" v-model:value="record.purchaseQuantity"
              :min="0" :controls="false" style="width: 100%;"
              placeholder="请输入"
            />
            <span v-else>{{ record.purchaseQuantity }}</span>
          </template>
          <template v-else-if="['purchaseDate', 'productionDate', 'invalidDate'].includes(column.dataIndex as string)">
            <a-date-picker v-if="!isDetail" v-model:value="record[column.dataIndex as string]" class="w-full" :value-format="EDateFormatType.YYYY_MM_DD" placeholder="请选择" />
            <span v-else>{{ record[column.dataIndex as string] }}</span>
          </template>
          <template v-else-if="column.dataIndex === 'action'">
            <a-button v-if="!isDetail" type="link" danger @click="onDeleteItem(record as ChemicalPurchaseRegisterItemFormEntity)">
              删除
            </a-button>
          </template>
          <template v-else>
            <a-input v-if="!isDetail" v-model:value="record[column.dataIndex as string]" placeholder="请输入" />
            <span v-else>{{ record[column.dataIndex as string] }}</span>
          </template>
        </template>
      </IlisTable>
    </div>

    <!-- 人员选择器 -->
    <PersonSelector
      v-model:show="showPersonSelector"
      :checked-ids="currentCheckedIds"
      :multiple="personSelectorType === 'keepers'"
      :title="personSelectorType === 'registrant' ? '选择登记人' : personSelectorType === 'verifier' ? '选择验收人' : '选择保管人'"
      @confirm="handlePersonSelect"
    />
  </ht-modal>
</template>

<script setup lang="ts">
import type { Key } from 'ant-design-vue/es/table/interface'
import type {
  ChemicalPurchaseRegisterForm,
} from '../api'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import type { PurchaseApplyItemEntity } from '~/components/selectorViaMethodCall/entity/PurchaseApplySelectorEntity'
import { cloneDeep } from '@unovis/ts'
import { message, Modal } from 'ant-design-vue'
import dayjs from 'dayjs'
import { computed, ref, watch } from 'vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import UploadFile, { BUSINES_TYPE } from '~/components/htUploadFile'
import PersonSelector from '~/components/PersonSelector.vue'
import ChemicalSelector from '~/components/selectorViaMethodCall/ChemicalSelector.vue'
import { ChemicalSelectorEntity } from '~/components/selectorViaMethodCall/entity/ChemicalSelectorEntity'
import PurchaseApplySelector from '~/components/selectorViaMethodCall/PurchaseApplySelector.vue'
import { EDateFormatType } from '~/utils/EDateFormatType'
import {
  createPurchaseRegister,
  getPurchaseRegisterDetail,
  updatePurchaseRegister,
} from '../api'
import { ChemicalPurchaseRegisterItemFormEntity } from '../ChemicalPurchaseRegisterEntity'

interface IParam {
  id?: string
  mode: 'create' | 'edit' | 'detail'
}

const props = defineProps<IDialogPropsParam<null, IParam>>()

const open = ref(true)
const submitLoading = ref(false)
// 采购申请单选择器改为通过 AnyDialogHelper.showModel 打开
const selectedItemKeys = ref<Key[]>([])
const formRef = ref()
const showPersonSelector = ref(false)
const personSelectorType = ref<'registrant' | 'verifier' | 'keepers'>('registrant')

const isDetail = computed(() => props.param.mode === 'detail')
const isEdit = computed(() => props.param.mode === 'edit')

// 必填字段列表
const requiredFields = ['chemicalName', 'productName', 'productCode', 'supplier', 'specification', 'purchaseQuantity', 'unit', 'purchaseDate', 'productionDate', 'invalidDate']

// 显示字段
const fieldList = computed(() => {
  const fields = ChemicalPurchaseRegisterItemFormEntity.getTableFieldList()
  return isDetail.value ? fields.filter(d => d !== 'action') : fields
})

// 表单验证规则
const formRules: any = {
  registrant: [{ required: true, message: '请选择登记人', trigger: 'change' }],
  registerTime: [{ required: true, message: '请选择登记时间', trigger: 'change' }],
  verifier: [{ required: true, message: '请选择验收人', trigger: 'change' }],
  keepers: [{ required: true, message: '请选择保管人', trigger: 'change' }],
}

const title = computed(() => {
  if (isDetail.value)
    return '采购登记详情'
  if (isEdit.value)
    return '编辑采购登记'
  return '新增采购登记'
})

const formState = ref<ChemicalPurchaseRegisterForm>({
  registerCode: '',
  registrant: '',
  registrantId: '',
  registerTime: '',
  verifier: '',
  verifierId: '',
  attachmentQr: '',
  items: [],
})

const keeperDatas = ref<{ name: string, id: string }[]>([])

const currentCheckedIds = computed(() => {
  if (personSelectorType.value === 'registrant') {
    return formState.value.registrantId ? formState.value.registrantId.split(',').filter(Boolean) : []
  }
  else if (personSelectorType.value === 'verifier') {
    return formState.value.verifierId ? formState.value.verifierId.split(',').filter(Boolean) : []
  }
  else {
    // keepers
    return keeperDatas.value.map(k => k.id)
  }
})

// 加载详情
watch(() => props.param.id, (id) => {
  if (id) {
    loadDetail(id)
  }
  else {
    // 新增时初始化默认值
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    formState.value = {
      items: [],
      registerTime: dayjs().format(EDateFormatType.YYYY_MM_DD_HH_MM_SS),
      registrant: userInfo.realName || '',
      registrantId: userInfo.userId || '',
    }
  }
}, { immediate: true })

async function loadDetail(id: string) {
  const res = await getPurchaseRegisterDetail(id)
  const data = res.data

  // 从明细项中回显保管人信息（取第一个有keepers的项）
  const firstItemWithKeepers = data.items?.find(item => item.keepers && item.keepers.length > 0)
  if (firstItemWithKeepers?.keepers) {
    keeperDatas.value = firstItemWithKeepers.keepers
  }

  formState.value = {
    ...data,
    keepers: keeperDatas.value.map(p => p.name).join(','),
  }
}

function onSelectRegistrant() {
  personSelectorType.value = 'registrant'
  showPersonSelector.value = true
}

function onSelectVerifier() {
  personSelectorType.value = 'verifier'
  showPersonSelector.value = true
}

function onSelectKeepers() {
  personSelectorType.value = 'keepers'
  showPersonSelector.value = true
}

function handlePersonSelect(persons: any[]) {
  showPersonSelector.value = false

  if (!persons || persons.length === 0)
    return

  const names = persons.map(p => p.name).join(',')
  const ids = persons.map(p => p.id).join(',')
  if (personSelectorType.value === 'registrant') {
    formState.value.registrant = names
    formState.value.registrantId = ids
  }
  else if (personSelectorType.value === 'verifier') {
    formState.value.verifier = names
    formState.value.verifierId = ids
  }
  else {
    formState.value.keepers = names
    keeperDatas.value = persons
  }
}

async function onSelectChemical() {
  const selected = await AnyDialogHelper.showSelector(ChemicalSelector, {
    title: '选择化学品',
    multiple: true,
    isCacheSelect: true,
    checkedRows: formState.value.items.map(d => ChemicalSelectorEntity.fromJSON({
      ...d,
      id: d.chemicalCategoryId || '',
      name: d.chemicalName || '',
    })),
  })
  if (selected?.length) {
    handleChemicalSelect(selected)
  }
}

function handleChemicalSelect(chemicals: ChemicalSelectorEntity[]) {
  const selIds = formState.value.items.map(d => d.chemicalCategoryId)
  const toAdd = chemicals.filter((c) => {
    return !selIds.includes(c.id)
  })
  const newItems = toAdd.map((chem) => {
    return {
      id: chem.id,
      chemicalCategoryId: chem.id,
      chemicalName: chem.name,
      chemicalCode: chem.sn,
      productName: chem.name,
      productCode: chem.sn,
      supplier: '',
      specification: chem.specification || '',
      purchaseQuantity: undefined,
      unit: chem.unit,
      productionDate: '',
      purchaseDate: '',
      invalidDate: '',
      purity: chem.purity,
      concentration: chem.concentration || '',
      keepers: [],
      remark: '',
    }
  })
  formState.value.items.push(...newItems)
}

async function onSelectFromApply() {
  const items = await AnyDialogHelper.showModel<PurchaseApplyItemEntity[]>(PurchaseApplySelector)
  if (!items || !items.length)
    return
  const selIds = formState.value.items.map(d => d.chemicalCategoryId)
  const toAdd = items.filter((c) => {
    return !selIds.includes(c.id)
  })
  const newItems = toAdd.map((chem) => {
    return {
      id: chem.id,
      chemicalCategoryId: chem.id,
      chemicalName: chem.name,
      chemicalCode: chem.code,
      productName: chem.name,
      productCode: chem.code,
      supplier: '',
      specification: chem.standard || '',
      purchaseQuantity: chem.amount,
      unit: chem.unit,
      productionDate: '',
      purchaseDate: '',
      invalidDate: '',
      purity: '',
      concentration: '',
      keepers: [],
      remark: chem.description || '',
    }
  })
  formState.value.items.push(...newItems)
}

function onItemSelectChange(selectedRowKeys: Key[]) {
  selectedItemKeys.value = selectedRowKeys
}

function onDeleteItem(record: ChemicalPurchaseRegisterItemFormEntity) {
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除该化学品信息吗？',
    onOk: () => {
      const index = formState.value.items.findIndex(item => item.id === record.id)
      if (index > -1) {
        formState.value.items.splice(index, 1)
      }
    },
  })
}

function onBatchDeleteItems() {
  if (!selectedItemKeys.value.length) {
    message.warning('请选择要删除的化学品')
    return
  }
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除选中的 ${selectedItemKeys.value.length} 条化学品信息吗？`,
    onOk: () => {
      formState.value.items = formState.value.items.filter(
        item => !selectedItemKeys.value.includes(item.id as string),
      )
      selectedItemKeys.value = []
    },
  })
}

/**
 * 验证表单
 * @returns 验证是否通过
 */
async function validateForm(): Promise<boolean> {
  try {
    await formRef.value.validate()
    return true
  }
  catch (error) {
    console.error(error)
    return false
  }
}

/**
 * 验证化学品列表
 * @returns 验证是否通过
 */
function validateItems(): boolean {
  if (!formState.value.items.length) {
    message.error('请至少添加一条化学品信息')
    return false
  }

  for (let i = 0; i < formState.value.items.length; i++) {
    const item = formState.value.items[i]
    if (!item.productName) {
      message.error(`第 ${i + 1} 行：请输入品名`)
      return false
    }
    if (!item.productCode) {
      message.error(`第 ${i + 1} 行：请输入品名编号`)
      return false
    }
    if (!item.supplier) {
      message.error(`第 ${i + 1} 行：请输入供应商`)
      return false
    }
    if (!item.specification) {
      message.error(`第 ${i + 1} 行：请输入规格`)
      return false
    }
    if (!item.purchaseQuantity || item.purchaseQuantity <= 0) {
      message.error(`第 ${i + 1} 行：请输入有效的数量`)
      return false
    }
    if (!item.purchaseDate) {
      message.error(`第 ${i + 1} 行：请选择购置日期`)
      return false
    }
    if (!item.productionDate) {
      message.error(`第 ${i + 1} 行：请选择生产日期`)
      return false
    }
    if (!item.invalidDate) {
      message.error(`第 ${i + 1} 行：请选择失效日期`)
      return false
    }
  }

  return true
}

/**
 * 构建保存数据 - 拷贝数据并添加保管人到每个明细项
 */
function buildSaveData(): ChemicalPurchaseRegisterForm {
  // 深拷贝表单数据
  const data: ChemicalPurchaseRegisterForm = cloneDeep(formState.value)

  // 将保管人添加到每个明细项的keepers字段
  if (keeperDatas.value.length > 0) {
    const keepers = keeperDatas.value.map(k => ({ id: k.id, name: k.name }))
    data.items.forEach((item) => {
      item.keepers = keepers
    })
  }

  return data
}

/**
 * 执行保存操作
 */
async function doSave(data: ChemicalPurchaseRegisterForm): Promise<void> {
  if (isEdit.value && data.id) {
    await updatePurchaseRegister(data)
    message.success('更新成功')
  }
  else {
    await createPurchaseRegister(data)
    message.success('新增成功')
  }
}

async function onSubmit() {
  // 表单验证
  if (!await validateForm())
    return
  if (!validateItems())
    return

  submitLoading.value = true
  try {
    const data = buildSaveData()
    await doSave(data)
    props.onConfirm(null)
    open.value = false
  }
  finally {
    submitLoading.value = false
  }
}

function cancel() {
  open.value = false
}
</script>

<style scoped>
:deep(.ant-form-inline .ant-form-item){
  margin-bottom: 8px;
}
</style>
