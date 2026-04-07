<template>
  <ht-modal
    v-model:open="open"
    :title="title"
    width="85%"
    :hide-footer="isDetail"
    :loading="loading"
    :confirm-loading="submitLoading"
    :hide-confirm="isDetail"
    @cancel="cancel"
  >
    <div class="pt-2 min-h-[50vh]">
      <!-- 登记信息 - 只有验收人（验收模式隐藏） -->
      <div v-if="!isVerify" class="mb-6">
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
          <a-form-item label="验收人" name="verifier" required>
            <a-input-group compact>
              <a-input v-model:value="formState.verifier" class="w-[150px]" readonly placeholder="请选择验收人" />
              <a-button v-if="!isDetail" type="primary" :disabled="isDetail" @click="onSelectVerifier">
                选择
              </a-button>
            </a-input-group>
          </a-form-item>
          <a-form-item label="保管人" name="keepers">
            <a-input-group compact>
              <a-input v-model:value="formState.keepers" class="w-[150px]" readonly placeholder="请选择保管人" />
              <a-button v-if="!isDetail" type="primary" :disabled="isDetail" @click="onSelectKeepers">
                选择
              </a-button>
            </a-input-group>
          </a-form-item>
        </a-form>
      </div>

      <!-- 化学品信息 -->
      <BaseTitle>
        化学品信息
      </BaseTitle>
      <a-space v-if="!isDetail && !isVerify" class="mb-4">
        <a-button type="primary" @click="onSelectChemical">
          选择化学品新增
        </a-button>
        <a-button @click="onSelectFromApply">
          从采购申请单新增
        </a-button>
        <a-button danger :disabled="!selectedItemKeys.length" @click="onBatchDeleteItems">
          删除
        </a-button>
      </a-space>

      <IlisTable
        row-key="id"
        :entity="AcceptRegisterItemFormEntity"
        :data-source="formState.items"
        :pagination="false"
        :resizable="false"
        :table-width="isDetail || isVerify ? undefined : 1400"
        :field-list="fieldList"
        :row-selection="isDetail ? undefined : { selectedRowKeys: selectedItemKeys, onChange: onItemSelectChange }"
      >
        <template #headerCell="{ column }">
          <template v-if="isVerify && verifyRequiredFields.includes(column.dataIndex as string)">
            <span class="text-red-500">*</span>{{ column.title }}
          </template>
          <template v-else-if="!isVerify && requiredFields.includes(column.dataIndex as string)">
            <span class="text-red-500">*</span>{{ column.title }}
          </template>
          <template v-else>
            {{ column.title }}
          </template>
        </template>
        <template #bodyCell="{ column, record }">
          <!-- 新增/编辑模式可编辑的文本字段 -->
          <template v-if="['productName', 'productCode', 'supplier', 'specification', 'purchaseQuantity', 'unit', 'purity', 'concentration'].includes(column.dataIndex as string)">
            <a-input v-if="!isDetail && !isVerify" v-model:value="record[column.dataIndex as string]" placeholder="请输入" />
            <span v-else>{{ record[column.dataIndex as string] || '-' }}</span>
          </template>
          <!-- 新增/编辑模式可编辑的日期字段 -->
          <template v-else-if="['purchaseDate', 'productionDate', 'invalidDate'].includes(column.dataIndex as string)">
            <a-date-picker v-if="!isDetail && !isVerify" v-model:value="record[column.dataIndex as string]" class="w-full" :value-format="EDateFormatType.YYYY_MM_DD" placeholder="请选择" />
            <span v-else>{{ record[column.dataIndex as string] || '-' }}</span>
          </template>
          <!-- 采购数量 - 新增/编辑可编辑 -->
          <template v-else-if="column.dataIndex === 'purchaseQuantity'">
            <a-input-number v-if="!isDetail && !isVerify" v-model:value="record.purchaseQuantity" :min="0" :controls="false" style="width: 80px;" placeholder="请输入" />
            <span v-else>{{ record.purchaseQuantity || '-' }}</span>
          </template>
          <!-- 验收数量 - 验收模式可编辑 -->
          <template v-else-if="column.dataIndex === 'verifyQuantity'">
            <a-input-number v-if="!isDetail" v-model:value="record.verifyQuantity" :min="0" :controls="false" style="width: 80px;" placeholder="请输入" />
            <span v-else>{{ record.verifyQuantity || '-' }}</span>
          </template>
          <!-- 验收情况 - 验收模式可编辑 -->
          <template v-else-if="['verifyQuality', 'verifyExtra'].includes(column.dataIndex as string)">
            <a-input v-if="!isDetail" v-model:value="record[column.dataIndex as string]" style="width: 120px;" placeholder="请输入" />
            <span v-else>{{ record[column.dataIndex as string] || '-' }}</span>
          </template>
          <!-- 操作列 - 仅新增/编辑显示 -->
          <template v-else-if="column.dataIndex === 'action'">
            <a-button v-if="!isDetail && !isVerify" type="link" danger @click="onDeleteItem(record as AcceptRegisterItemFormEntity)">
              删除
            </a-button>
          </template>
          <!-- 其他字段默认显示 -->
          <template v-else>
            <span>{{ record[column.dataIndex as string] || '-' }}</span>
          </template>
        </template>
      </IlisTable>

      <!-- 验收结果 -->
      <div class="mt-6">
        <BaseTitle>
          验收结果
        </BaseTitle>
        <a-form
          ref="verifyFormRef"
          :model="formState"
          :disabled="isDetail"
          :rules="isVerify ? verifyFormRules : undefined"
          :label-col="{ style: { width: '100px' } }"
        >
          <a-form-item label="验收结论" name="verifyConclusion">
            <a-textarea v-model:value="formState.verifyConclusion" :rows="3" placeholder="请输入验收结论" />
          </a-form-item>
          <a-form-item label="验收时间" name="verifyTime">
            <a-date-picker
              v-model:value="formState.verifyTime"
              :value-format="EDateFormatType.YYYY_MM_DD_HH_MM_SS"
              show-time
              placeholder="请选择验收时间"
            />
          </a-form-item>
          <a-form-item label="附件">
            <UploadFile
              :business-type="BUSINES_TYPE.CHEMICAL"
              :business-id="formState.id"
              :is-reandonly="isDetail"
              @init-complete="data => {
                formState.attachmentQr = data.qrCodeKey
              }"
            />
          </a-form-item>
        </a-form>
      </div>
    </div>

    <!-- 底部按钮 -->
    <template v-if="!isDetail" #footer>
      <a-space>
        <a-button @click="cancel">
          取消
        </a-button>
        <a-button type="primary" :loading="submitLoading" @click="onSave">
          保存
        </a-button>
        <a-button v-if="formState.status === EPurchaseApplyStatus.PENDING_SUBMIT || formState.status === EPurchaseApplyStatus.NOT_APPROVED" type="primary" :loading="submitLoading" @click="onSubmitAudit">
          提交审核
        </a-button>
      </a-space>
    </template>

    <PersonSelector
      v-model:show="showPersonSelector"
      :checked-ids="currentCheckedIds"
      :multiple="personSelectorType === 'keepers'"
      :title="personSelectorType === 'verifier' ? '选择验收人' : '选择保管人'"
      @confirm="handlePersonSelect"
    />
  </ht-modal>
</template>

<script setup lang="ts">
import type { Key } from 'ant-design-vue/es/table/interface'
import type {
  AcceptRegisterFormModel,
  AcceptRegisterItemOnCreate,
  AcceptRegisterItemOnUpdate,
  AcceptRegisterItemOnVerify,
  CreateAcceptRegisterRequest,
  UpdateAcceptRegisterRequest,
  VerifyAcceptRegisterRequest,
} from '../types'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import type { IProcessForm } from '~/components/commonProcess'
import type { PurchaseApplyItemEntity } from '~/components/selectorViaMethodCall/entity/PurchaseApplySelectorEntity'
import { message, Modal } from 'ant-design-vue'
import dayjs from 'dayjs'
import { computed, ref, watch } from 'vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { ProcessModal, ProcessType } from '~/components/commonProcess'
import UploadFile, { BUSINES_TYPE } from '~/components/htUploadFile'
import PersonSelector from '~/components/PersonSelector.vue'
import ChemicalSelector from '~/components/selectorViaMethodCall/ChemicalSelector.vue'
import { ChemicalSelectorEntity } from '~/components/selectorViaMethodCall/entity/ChemicalSelectorEntity'
import { EPurchaseApplyStatus } from '~/components/selectorViaMethodCall/entity/PurchaseApplySelectorEntity'
import PurchaseApplySelector from '~/components/selectorViaMethodCall/PurchaseApplySelector.vue'
import { EDateFormatType } from '~/utils/EDateFormatType'
import { AcceptRegisterItemFormEntity } from '../AcceptRegisterEntity'
import {
  createAcceptRegister,
  getAcceptRegisterDetail,
  submitAcceptRegister,
  updateAcceptRegister,
  verifyAcceptRegister,
} from '../api'

interface IParam {
  id?: string
  mode: 'create' | 'edit' | 'detail' | 'verify'
}

const props = defineProps<IDialogPropsParam<null, IParam>>()

const open = ref(true)
const submitLoading = ref(false)
const selectedItemKeys = ref<Key[]>([])
const formRef = ref()
const verifyFormRef = ref()
const showPersonSelector = ref(false)
const loading = ref(false)

const isDetail = computed(() => props.param.mode === 'detail')
const isEdit = computed(() => props.param.mode === 'edit')
const isVerify = props.param.mode === 'verify'

// 必填字段（显示红色*号）- 新增/编辑模式
const requiredFields = ['productName', 'productCode', 'supplier', 'specification', 'purchaseQuantity', 'purchaseDate', 'productionDate', 'invalidDate', 'unit']
// 验收模式必填字段
const verifyRequiredFields = ['verifyQuantity', 'verifyQuality']

const fieldList = computed(() => {
  const fields = AcceptRegisterItemFormEntity.getTableFieldList()
  let list = fields.filter(d => d !== 'chemicalCode' && d !== 'remark')
  if (isDetail.value || isVerify)
    list = list.filter(d => d !== 'action')
  return list
})

const formRules: any = {
  verifier: [{ required: true, message: '请选择验收人', trigger: 'change' }],
  keepers: [{ required: true, message: '请选择保管人', trigger: 'change' }],
}

const verifyFormRules: any = {
  verifyConclusion: [{ required: true, message: '请输入验收结论', trigger: 'blur' }],
  verifyTime: [{ required: true, message: '请选择验收时间', trigger: 'change' }],
}

const title = computed(() => {
  if (isDetail.value)
    return '验收登记详情'
  if (isVerify)
    return '验收登记'
  if (isEdit.value)
    return '编辑验收登记'
  return '新增验收登记'
})

const formState = ref<AcceptRegisterFormModel>({
  verifyTime: dayjs().format(EDateFormatType.YYYY_MM_DD_HH_MM_SS),
  items: [],
})

const keeperDatas = ref<{ name: string, id: string }[]>([])

const personSelectorType = ref<'verifier' | 'keepers'>('verifier')

const currentCheckedIds = computed(() => {
  if (personSelectorType.value === 'verifier') {
    return formState.value.verifierId ? formState.value.verifierId.split(',').filter(Boolean) : []
  }
  else {
    // keepers
    return keeperDatas.value.map(k => k.id)
  }
})

watch(() => props.param.id, (id) => {
  if (id) {
    loadDetail(id)
  }
  else {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    // 新增时清空表单
    formState.value = {
      items: [],
      verifyTime: dayjs().format(EDateFormatType.YYYY_MM_DD_HH_MM_SS),
      verifier: userInfo.realName || '',
      verifierId: userInfo.userId || '',
      keepers: '',
    }
  }
}, { immediate: true })

async function loadDetail(id: string) {
  loading.value = true
  try {
    const res = await getAcceptRegisterDetail(id)
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
  finally {
    loading.value = false
  }
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
  if (personSelectorType.value === 'verifier') {
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
  const keepers = keeperDatas.value.map(k => ({ id: k.id, name: k.name }))
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
      purchaseQuantity: undefined as any,
      unit: chem.unit,
      productionDate: '',
      purchaseDate: '',
      invalidDate: '',
      purity: chem.purity || '',
      concentration: chem.concentration || '',
      verifyQuantity: undefined as any,
      verifyQuality: '',
      verifyExtra: '',
      keepers,
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
  const keepers = keeperDatas.value.map(k => ({ id: k.id, name: k.name }))
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
      verifyQuantity: undefined as any,
      verifyQuality: '',
      verifyExtra: '',
      keepers,
      remark: chem.description || '',
    }
  })
  formState.value.items.push(...newItems)
}

function onItemSelectChange(selectedRowKeys: Key[]) {
  selectedItemKeys.value = selectedRowKeys
}

function onDeleteItem(record: AcceptRegisterItemFormEntity) {
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
 * 验证表单（登记信息和验收结果）
 * @returns 验证是否通过
 */
async function validateForms(): Promise<boolean> {
  // 登记信息表单验证（非验收模式）
  if (!isVerify) {
    try {
      await formRef.value.validate()
    }
    catch (error) {
      console.error(error)
      return false
    }
  }

  // 验收结果表单验证（验收模式）
  if (isVerify) {
    try {
      await verifyFormRef.value.validate()
    }
    catch (error) {
      console.error(error)
      return false
    }
  }

  return true
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
      message.error(`第 ${i + 1} 行：请输入有效的采购数量`)
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
 * 验证验收模式的特殊字段
 * @returns 验证是否通过
 */
function validateVerifyItems(): boolean {
  if (!isVerify)
    return true

  for (let i = 0; i < formState.value.items.length; i++) {
    const item = formState.value.items[i]
    if (!item.verifyQuantity || item.verifyQuantity <= 0) {
      message.error(`第 ${i + 1} 行：请输入有效的验收数量`)
      return false
    }
    if (!item.verifyQuality) {
      message.error(`第 ${i + 1} 行：请输入验收情况`)
      return false
    }
  }

  return true
}

/**
 * 执行保存操作（新增/编辑/验收）
 */
async function doSave(): Promise<void> {
  if (isVerify) {
    const payload = toVerifyPayload(formState.value)
    await verifyAcceptRegister(payload)
    message.success('验收提交成功')
  }
  else if (isEdit.value && formState.value.id) {
    const payload = toUpdatePayload(formState.value)
    await updateAcceptRegister(payload)
    message.success('更新成功')
  }
  else {
    const payload = toCreatePayload(formState.value)
    const { data } = await createAcceptRegister(payload)
    formState.value.id = data
    message.success('新增成功')
  }
}

/**
 * 打开流程审核弹窗
 */
async function openProcessModal(): Promise<void> {
  await AnyDialogHelper.showModel(ProcessModal, {
    processType: ProcessType.PURCHASE_ACCEPTANCE,
    processId: formState.value.id!,
    hideRemark: true,
    submitAuditApi: submitAcceptRegister,
    submitDataTransfer: (data: any) => {
      return {
        ids: [formState.value.id!],
        presetAuditors: JSON.parse(data.presetAuditers),
        processForm: JSON.parse(data.formPropertyJson),
        remark: data.remark,
      }
    },
  } as IProcessForm)
  message.success('提交审核成功')
}

// 保存（不提交审核）
async function onSave() {
  if (!await validateForms())
    return
  if (!validateItems())
    return
  if (!validateVerifyItems())
    return

  submitLoading.value = true
  try {
    await doSave()
    props.onConfirm(null)
    open.value = false
  }
  finally {
    submitLoading.value = false
  }
}

// 提交审核
async function onSubmitAudit() {
  if (!await validateForms())
    return
  if (!validateItems())
    return
  if (!validateVerifyItems())
    return

  submitLoading.value = true
  try {
    await doSave()
    props.onConfirm(null)
    open.value = false

    // 打开流程审核弹窗
    await openProcessModal()
  }
  finally {
    submitLoading.value = false
  }
}

function cancel() {
  open.value = false
}

function toCreatePayload(form: AcceptRegisterFormModel): CreateAcceptRegisterRequest {
  const { id, ...rest } = form
  const items = form.items.map((item) => {
    return {
      ...item,
      keepers: keeperDatas.value.map(k => ({ id: k.id, name: k.name })),
    }
  })
  return {
    ...(rest as Omit<CreateAcceptRegisterRequest, 'items'>),
    items: items as unknown as AcceptRegisterItemOnCreate[],
  }
}

function toUpdatePayload(form: AcceptRegisterFormModel): UpdateAcceptRegisterRequest {
  const { id, ...rest } = form
  const items = form.items.map((item) => {
    return {
      ...item,
      keepers: keeperDatas.value.map(k => ({ id: k.id, name: k.name })),
    }
  })
  return {
    id: form.id!,
    ...(rest as Omit<UpdateAcceptRegisterRequest, 'id' | 'items'>),
    items: items as unknown as AcceptRegisterItemOnUpdate[],
  }
}

function toVerifyPayload(form: AcceptRegisterFormModel): VerifyAcceptRegisterRequest {
  const items: AcceptRegisterItemOnVerify[] | undefined = form.items?.map((it) => {
    return {
      id: it.id!,
      verifyQuantity: it.verifyQuantity as number,
      verifyQuality: it.verifyQuality || '',
      verifyExtra: it.verifyExtra || '',
      keepers: keeperDatas.value.map(k => ({ id: k.id, name: k.name })),
    }
  })
  return {
    id: form.id!,
    verifyConclusion: form.verifyConclusion || '',
    verifyTime: form.verifyTime || '',
    items,
  }
}
</script>
