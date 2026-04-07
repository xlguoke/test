<template>
  <div class="min-h-screen bg-[#f5f5f5] pb-20">
    <van-sticky>
      <!-- 标题栏 -->
      <MobileTitleBar title="购置验收登记" left-arrow @click-left="router.go(-1)" />

      <!-- 状态标签：仅未通过时显示 -->
      <div v-if="currentStatus === EPurchaseAcceptanceStatus.Rejected" class="bg-white px-3 py-2 flex items-center justify-start">
        <van-tag :color="getStatusColor(currentStatus)" class="shrink-0">
          {{ getStatusLabel(currentStatus) }}
        </van-tag>
        <div class="text-sm text-[#333] bg-[#f5f5f5] px-2">
          <span v-if="currentStatus === EPurchaseAcceptanceStatus.Rejected">{{ noPassReason || '--' }}</span>
        </div>
      </div>

      <!-- Tab 切换 -->
      <van-tabs v-model:active="activeTab">
        <van-tab title="购置登记" name="purchase" />
        <van-tab title="验收登记" name="acceptance" :disabled="isAcceptanceDisabled" />
      </van-tabs>
    </van-sticky>

    <!-- ==================== 购置登记区域 ==================== -->
    <div v-show="activeTab === 'purchase'" class="bg-white">
      <SubTitle bordered>
        购置登记
        <template v-if="isEditable" #right>
          <div class="text-[#0066EC] text-sm" @click="openPurchaseApplySelector">
            <van-icon name="plus" /> 从采购申请中新增
          </div>
        </template>
      </SubTitle>

      <!-- 空状态 -->
      <div v-if="items.length === 0" class="px-3 py-6 text-center text-[#999] text-sm">
        暂无购置登记数据{{ isEditable ? '，请点击下方按钮新增' : '' }}
      </div>

      <!-- 购置登记列表 -->
      <div v-else class="px-3 pb-3">
        <div
          v-for="(item, index) in items"
          :key="item.id || index"
          class="bg-[#f5f5f5] rounded-lg my-3 p-3 cursor-pointer"

          @click="handleItemClick(item, index)"
        >
          <div class="flex items-center justify-between">
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-[#154BD0] break-all">
                {{ item.materialName }} - {{ item.quantity }}{{ item.unit || '' }}
              </div>
              <div class="text-xs text-[#999] mt-1 break-all">
                {{ item.materialSpecification ? `(${item.materialSpecification})` : '' }}
              </div>
            </div>
            <van-icon
              v-if="isEditable"
              name="clear"
              color="#ee0a24"
              size="20"
              class="ml-2 shrink-0"
              @click.stop="confirmRemoveItem(index)"
            />
            <van-icon
              v-else
              name="arrow"
              color="#999"
              size="16"
              class="ml-2 shrink-0"
            />
          </div>
        </div>
      </div>

      <!-- 新增按钮 -->
      <div
        v-if="isEditable"
        class="mx-3 mb-3 border-2 border-dashed border-[#0066EC] rounded-lg p-1 text-center cursor-pointer"
        @click="handleAdd"
      >
        <van-icon name="plus" color="#0066EC" size="20" />
        <span class="text-[#0066EC] text-sm ml-1">新增</span>
      </div>

      <!-- 验收设置 -->
      <div class="bg-white mt-3">
        <SubTitle bordered>
          验收设置
        </SubTitle>
        <FormItemPerson
          v-model:value="accepterPersonList"
          label="验收人员"
          required
          placeholder="请选择验收人员"
          :readonly="!isEditable"
        />
      </div>
    </div>

    <!-- ==================== 验收登记区域 ==================== -->
    <div v-show="activeTab === 'acceptance'" class="bg-white">
      <SubTitle bordered>
        验收登记
      </SubTitle>

      <!-- 验收登记列表 -->
      <div class="px-3 pb-3">
        <div
          v-for="(item, index) in acceptanceItems"
          :key="item.id || index"
          class="bg-[#f5f5f5] rounded-lg my-3 p-3 cursor-pointer"

          @click="handleAcceptanceItemClick(item, index)"
        >
          <div class="flex items-center justify-between">
            <div class="flex-1 min-w-0">
              <div class="flex items-center">
                <div class="text-sm font-medium text-[#154BD0] break-all">
                  {{ item.materialName }}
                </div>
                <van-tag
                  :color="originalAcceptanceData.get(item.id || '')?.actualQuantity && originalAcceptanceData.get(item.id || '')?.acceptResult ? '#4B7902' : '#D9001B'"
                  class="ml-2 shrink-0"
                >
                  {{ originalAcceptanceData.get(item.id || '')?.actualQuantity && originalAcceptanceData.get(item.id || '')?.acceptResult ? '已验收' : '未验收' }}
                </van-tag>
              </div>
              <div class="text-xs text-[#999] mt-1 break-all">
                {{ item.materialSpecification ? `(${item.materialSpecification})` : '' }}
              </div>
            </div>
            <van-icon
              name="arrow"
              color="#999"
              size="16"
              class="ml-2 shrink-0"
            />
          </div>
        </div>
      </div>

      <!-- 验收结果 -->
      <SubTitle bordered>
        验收结果
      </SubTitle>
      <van-cell-group :border="false">
        <van-field
          v-model="acceptanceForm.conclusion"
          label="验收结论"
          type="textarea"
          required
          placeholder="请输入验收结论"
          :rows="3"
          :maxlength="500"
          show-count
          :readonly="!isEditable"
        />

        <FormItemDate
          v-model:value="acceptanceForm.acceptDate"
          label="验收日期"
          required
          input-align="left"
          placeholder="请选择验收日期"
          :readonly="!isEditable"
        />

        <van-field label="自动入库" required :readonly="true">
          <template #input>
            <van-checkbox v-model="acceptanceForm.isAutoStockIn" icon-size="16px" :disabled="!isEditable">
              验收通过后自动入库
            </van-checkbox>
          </template>
        </van-field>

        <van-field label="附件" :readonly="true">
          <template #input>
            <UploadWithQrKey
              v-model:value="acceptanceForm.attachmentQrKey"
              business-type="REF_PURCHASE_ACCEPT_REGISTER"
              :business-id="editId"
              :deletable="isEditable"
              :show-upload="isEditable"
              @update:value="acceptanceForm.attachmentQrKey = $event"
            />
          </template>
        </van-field>
      </van-cell-group>
    </div>

    <!-- 购置登记 - 保存按钮（仅可编辑状态显示） -->
    <div v-if="isEditable && activeTab === 'purchase'" class="fixed bottom-0 left-0 right-0 p-3 bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.05)]">
      <van-button type="primary" block class="!rounded" :loading="submitLoading" @click="handleSave">
        保存
      </van-button>
    </div>

    <!-- 验收登记 - 审核中状态显示撤回按钮（审核中状态始终显示） -->
    <div v-if="activeTab === 'acceptance' && currentStatus === EPurchaseAcceptanceStatus.Auditing" class="fixed bottom-0 left-0 right-0 p-3 bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.05)]">
      <van-button class="bg-[#f59a23] text-white !rounded" block :loading="submitLoading" @click="handleRevoke">
        撤回
      </van-button>
    </div>

    <!-- 验收登记 - 非审核中状态显示保存/提交按钮（仅可编辑状态显示） -->
    <div v-if="isEditable && activeTab === 'acceptance' && currentStatus !== EPurchaseAcceptanceStatus.Auditing" class="fixed bottom-0 left-0 right-0 p-3 bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.05)]">
      <div class="flex justify-between gap-3">
        <van-button type="default" block class="!rounded" :loading="submitLoading" @click="handleSaveAcceptance">
          保存
        </van-button>
        <van-button type="primary" block class="!rounded" :loading="submitLoading" @click="handleSubmit">
          提交
        </van-button>
      </div>
    </div>

    <!-- 审核弹窗 -->
    <CommonAudit v-model:value="auditVisible" audit-type-id="410" @on-submit="onAuditSubmit" />

    <!-- 标准物质新增/编辑弹窗 -->
    <ItemAddModal
      v-model:show="itemAddModalVisible"
      :mode="itemAddModalMode"
      :initial-data="itemAddModalData as any"
      @save="onItemAddSave"
    />

    <!-- 验收登记编辑弹窗 -->
    <AcceptanceEditModal
      v-model:show="acceptanceEditModalVisible"
      :mode="acceptanceEditModalMode"
      :initial-data="acceptanceEditModalData"
      @save="onAcceptanceEditSave"
    />

    <!-- 采购申请列表弹窗 -->
    <PurchaseApplyListModal
      v-model:show="purchaseApplyListVisible"
      @select="onPurchaseApplySelect"
    />

    <!-- 采购申请明细选择弹窗 -->
    <PurchaseApplyDetailModal
      v-model:show="purchaseApplyDetailVisible"
      :apply-id="selectedApplyId"
      @confirm="onPurchaseApplyDetailConfirm"
      @back="onPurchaseApplyDetailBack"
    />
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { showConfirmDialog, showLoadingToast, showToast } from 'vant'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CommonAudit from '~/views/mobileApp/components/commonAudit.vue'
import UploadWithQrKey from '~/views/mobileApp/components/form/UploadWithQrKey.vue'
import FormItemDate from '~/views/mobileApp/components/MobileFormItem/FormItemDate.vue'
import FormItemPerson from '~/views/mobileApp/components/MobileFormItem/FormItemPerson.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import SubTitle from '~/views/mobileApp/components/MobileUI/SubTitle.vue'
import {
  createAcceptanceRecord,
  createPurchaseAcceptance,
  EPurchaseAcceptanceStatus,
  getNoPassReason,
  getPurchaseAcceptanceDetail,
  getStatusColor,
  getStatusLabel,
  revokePurchaseAcceptance,
  submitPurchaseAcceptance,
  updatePurchaseAcceptance,
} from '../api'
import AcceptanceEditModal from '../components/AcceptanceEditModal.vue'
import ItemAddModal from '../components/ItemAddModal.vue'
import PurchaseApplyDetailModal from '../components/PurchaseApplyDetailModal.vue'
import PurchaseApplyListModal from '../components/PurchaseApplyListModal.vue'

defineOptions({ name: 'standardMaterialAcceptAdd' })

// ==================== 类型定义 ====================
interface PurchaseItem {
  id?: string
  applyItemId?: string
  materialId?: string
  materialName: string
  materialSpecification: string
  quantity: number
  unit: string
  manufacturer?: string
  productionDate?: string
  unitPrice?: number
  purchaseDate?: string
  remark?: string
  amount: number
  custodian?: string
  actualQuantity?: number
  acceptResult?: string
  isCustomMaterial?: boolean
  isCustomSpecification?: boolean
}

// ==================== 路由相关 ====================
const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.query.id)
const editId = computed(() => route.query.id as string)
const currentStatus = ref<EPurchaseAcceptanceStatus>(EPurchaseAcceptanceStatus.Writing)

// 是否可编辑：填写中、未通过状态可编辑；审核中、已通过状态只读
const isEditable = computed(() => {
  return currentStatus.value === EPurchaseAcceptanceStatus.Writing
    || currentStatus.value === EPurchaseAcceptanceStatus.Rejected
})

// ==================== 状态数据 ====================
const activeTab = ref('purchase')
const submitLoading = ref(false)
const auditVisible = ref(false)
const noPassReason = ref('')

// 购置登记数据
const items = ref<PurchaseItem[]>([])
const accepterPersonList = ref<{ id: string, name: string, account: string }[]>([])

// 原始验收数据（用于判断初始验收状态）
const originalAcceptanceData = ref<Map<string, { actualQuantity?: number, acceptResult?: string }>>(new Map())

// 验收登记数据
const acceptanceForm = reactive({
  conclusion: '',
  acceptDate: dayjs().format('YYYY-MM-DD'),
  isAutoStockIn: true,
  attachmentQrKey: '',
})

// 弹窗相关状态
const itemAddModalVisible = ref(false)
const itemAddModalMode = ref<'add' | 'edit' | 'detail'>('add')
const itemAddModalData = ref<PurchaseItem | undefined>(undefined)
const itemAddEditIndex = ref(-1)

const acceptanceEditModalVisible = ref(false)
const acceptanceEditModalMode = ref<'edit' | 'detail'>('edit')
const acceptanceEditModalData = ref<any>(undefined)
const acceptanceEditIndex = ref(-1)

// 采购申请弹窗状态
const purchaseApplyListVisible = ref(false)
const purchaseApplyDetailVisible = ref(false)
const selectedApplyId = ref('')

// 验收项列表（过滤出已有ID的项，即已保存到服务器的项）
const acceptanceItems = computed(() => items.value.filter(item => item.id))

// 验收tab是否禁用
const isAcceptanceDisabled = computed(() => {
  const appUser = JSON.parse(localStorage.getItem('appUser') || '{}')

  const accepterId = accepterPersonList.value[0]?.id
  // 使用字符串比较，避免数字和字符串类型不匹配
  return !editId.value || String(appUser.userInfo?.id) !== String(accepterId)
})

// ==================== 购置登记操作 ====================

/** 打开采购申请选择弹窗 */
function openPurchaseApplySelector() {
  purchaseApplyListVisible.value = true
}

/** 选择采购申请 */
function onPurchaseApplySelect(item: any) {
  selectedApplyId.value = item.id
  purchaseApplyListVisible.value = false
  purchaseApplyDetailVisible.value = true
}

/** 采购申请明细确认 */
function onPurchaseApplyDetailConfirm(selectedItems: any[]) {
  if (selectedItems?.length > 0) {
    items.value.push(...selectedItems)
    showToast(`成功添加 ${selectedItems.length} 条采购申请记录`)
  }
  purchaseApplyDetailVisible.value = false
}

/** 从明细返回列表 */
function onPurchaseApplyDetailBack() {
  purchaseApplyDetailVisible.value = false
  purchaseApplyListVisible.value = true
}

/** 新增自定义物质 */
function handleAdd() {
  itemAddModalMode.value = 'add'
  itemAddModalData.value = undefined
  itemAddEditIndex.value = -1
  itemAddModalVisible.value = true
}

/** 编辑物质 */
function editItem(item: PurchaseItem, index: number) {
  if (!isEditable.value)
    return
  itemAddModalMode.value = 'edit'
  itemAddModalData.value = { ...item }
  itemAddEditIndex.value = index
  itemAddModalVisible.value = true
}

/** 查看物质详情（查看模式下） */
function viewItemDetail(item: PurchaseItem, index: number) {
  itemAddModalMode.value = 'detail'
  itemAddModalData.value = { ...item }
  itemAddEditIndex.value = index
  itemAddModalVisible.value = true
}

/** 购置登记项点击处理 */
function handleItemClick(item: PurchaseItem, index: number) {
  if (isEditable.value) {
    // 可编辑状态下打开编辑弹窗
    editItem(item, index)
  }
  else {
    // 只读状态下打开详情弹窗
    viewItemDetail(item, index)
  }
}

/** 保存标准物质弹窗数据 */
function onItemAddSave(data: any) {
  const itemData: PurchaseItem = {
    id: data.id,
    applyItemId: data.applyItemId,
    materialId: data.materialId,
    materialName: data.materialName,
    materialSpecification: data.materialSpecification,
    quantity: Number(data.quantity),
    unit: data.unit,
    manufacturer: data.manufacturer,
    productionDate: data.productionDate,
    unitPrice: Number(data.unitPrice),
    purchaseDate: data.purchaseDate,
    remark: data.remark,
    amount: data.amount,
    custodian: data.custodian,
    isCustomMaterial: data.isCustomMaterial,
    isCustomSpecification: data.isCustomSpecification,
  }

  if (itemAddModalMode.value === 'edit' && itemAddEditIndex.value >= 0) {
    // 编辑模式：替换原有数据
    items.value[itemAddEditIndex.value] = itemData
  }
  else {
    // 新增模式：添加到列表
    items.value.push(itemData)
  }
}

/** 确认删除物质 */
function confirmRemoveItem(index: number) {
  showConfirmDialog({
    title: '提示',
    message: '确定删除该标准物质吗？',
  }).then(() => {
    removeItem(index)
  }).catch(() => {})
}

/** 删除物质 */
function removeItem(index: number) {
  items.value.splice(index, 1)
}

/** 保存购置登记 */
async function handleSave() {
  const accepterId = accepterPersonList.value[0]?.id
  if (!accepterId) {
    showToast('请选择验收人员')
    return
  }
  if (items.value.length === 0) {
    showToast('请至少添加一条购置登记')
    return
  }

  submitLoading.value = true
  try {
    const submitData = {
      id: isEdit.value ? editId.value : undefined,
      accepter: accepterPersonList.value[0]?.name,
      accepterId,
      acceptItems: items.value.map(item => ({
        applyItemId: item.applyItemId,
        materialId: item.materialId,
        materialName: item.materialName,
        materialSpecification: item.materialSpecification,
        quantity: item.quantity,
        unit: item.unit,
        manufacturer: item.manufacturer,
        productionDate: item.productionDate,
        unitPrice: item.unitPrice,
        amount: item.amount || 0,
        purchaseDate: item.purchaseDate,
        custodian: item.custodian,
        remark: item.remark,
      })),
    }

    const res = isEdit.value
      ? await updatePurchaseAcceptance(submitData)
      : await createPurchaseAcceptance(submitData)

    // 新增模式：更新URL为编辑模式，然后加载详情
    if (!isEdit.value && typeof res === 'string') {
      await router.replace({ query: { id: res } })
      await loadDetail()
    }
    else {
      await loadDetail()
    }

    showToast('保存成功')
  }
  catch (error) {
    console.error(error)
    showToast('保存失败')
  }
  finally {
    submitLoading.value = false
  }
}

// ==================== 验收登记操作 ====================

/** 编辑验收项 */
function editAcceptanceItem(item: PurchaseItem, index: number) {
  if (!isEditable.value)
    return
  acceptanceEditModalMode.value = 'edit'
  acceptanceEditModalData.value = { ...item }
  acceptanceEditIndex.value = index
  acceptanceEditModalVisible.value = true
}

/** 查看验收项详情（查看模式下） */
function viewAcceptanceItemDetail(item: PurchaseItem, index: number) {
  acceptanceEditModalMode.value = 'detail'
  acceptanceEditModalData.value = { ...item }
  acceptanceEditIndex.value = index
  acceptanceEditModalVisible.value = true
}

/** 验收登记项点击处理 */
function handleAcceptanceItemClick(item: PurchaseItem, index: number) {
  if (isEditable.value) {
    // 可编辑状态下打开编辑弹窗
    editAcceptanceItem(item, index)
  }
  else {
    // 只读状态下打开详情弹窗
    viewAcceptanceItemDetail(item, index)
  }
}

/** 保存验收登记弹窗数据 */
function onAcceptanceEditSave(data: { actualQuantity: number, acceptResult: string }) {
  if (acceptanceEditIndex.value >= 0) {
    const item = items.value[acceptanceEditIndex.value]
    if (item) {
      item.actualQuantity = data.actualQuantity
      item.acceptResult = data.acceptResult
    }
  }
}

/** 保存验收登记 */
async function handleSaveAcceptance() {
  const hasAcceptanceItem = acceptanceItems.value.some(item => item.actualQuantity && item.acceptResult)
  if (!hasAcceptanceItem) {
    showToast('存在验收记录未登记完成')
    return
  }
  if (!editId.value) {
    showToast('缺少购置验收ID')
    return
  }

  submitLoading.value = true
  try {
    const submitData = {
      id: editId.value,
      acceptDate: acceptanceForm.acceptDate,
      conclusion: acceptanceForm.conclusion,
      attachmentQrKey: acceptanceForm.attachmentQrKey,
      isAutoStockIn: acceptanceForm.isAutoStockIn,
      acceptItems: acceptanceItems.value.map(item => ({
        id: item.id,
        actualQuantity: item.actualQuantity,
        acceptResult: item.acceptResult,
      })),
    }
    await createAcceptanceRecord(submitData)

    // 保持在当前tab并重新加载
    const currentTab = activeTab.value
    await loadDetail()
    activeTab.value = currentTab

    showToast('保存成功')
  }
  catch (error) {
    console.error(error)
    showToast('保存失败')
  }
  finally {
    submitLoading.value = false
  }
}

/** 打开审核弹窗 */
function handleSubmit() {
  const hasAcceptanceItem = acceptanceItems.value.some(item => item.actualQuantity && item.acceptResult)
  if (!hasAcceptanceItem) {
    showToast('存在验收记录未登记完成')
    return
  }
  if (!editId.value) {
    showToast('缺少购置验收ID')
    return
  }
  auditVisible.value = true
}

/** 提交审核 */
async function onAuditSubmit(processUserTaskList: any[], formPropertyJson: any) {
  submitLoading.value = true
  try {
    const submitData = {
      id: editId.value,
      formPropertyJson: JSON.stringify(formPropertyJson),
      presetAuditers: JSON.stringify(processUserTaskList),
    }

    const res = await submitPurchaseAcceptance(submitData)

    if (res.code !== 20000) {
      showToast(`提交失败：${res.message}`)
      return
    }
    // 重新加载详情
    await loadDetail()
    showToast('提交成功')
  }
  catch (error) {
    console.error(error)
    showToast('提交失败')
  }
  finally {
    auditVisible.value = false
    submitLoading.value = false
  }
}

/** 撤回审核 */
async function handleRevoke() {
  if (!editId.value) {
    showToast('缺少购置验收ID')
    return
  }

  submitLoading.value = true
  try {
    await revokePurchaseAcceptance(editId.value)
    await loadDetail()
    showToast('撤回成功')
  }
  catch (error) {
    console.error(error)
    showToast('撤回失败')
  }
  finally {
    submitLoading.value = false
  }
}

// ==================== 数据加载 ====================

/** 加载详情数据 */
async function loadDetail() {
  if (!editId.value)
    return

  const loadingToast = showLoadingToast({ message: '加载中...', forbidClick: true, duration: 0 })

  try {
    const res = await getPurchaseAcceptanceDetail(editId.value)
    if (!res.data) {
      showToast('获取详情失败')
      return
    }

    const data = res.data
    currentStatus.value = data.status as EPurchaseAcceptanceStatus

    // 更新验收人员
    if (data.accepterId && data.accepter) {
      accepterPersonList.value = [{ id: data.accepterId, name: data.accepter, account: '' }]
    }

    // 更新验收结果表单
    acceptanceForm.conclusion = data.conclusion || ''
    acceptanceForm.acceptDate = data.acceptDate || dayjs().format('YYYY-MM-DD')
    acceptanceForm.isAutoStockIn = data.isAutoStockIn ?? true

    // 更新购置登记列表
    items.value = (data.acceptItems || []).map((item: any) => ({
      id: item.id,
      applyItemId: item.applyItemId,
      materialId: item.materialId,
      materialName: item.materialName || '',
      materialSpecification: item.materialSpecification || '',
      quantity: item.quantity || 0,
      unit: item.unit || '',
      manufacturer: item.manufacturer || '',
      productionDate: item.productionDate || '',
      unitPrice: item.unitPrice || 0,
      amount: item.amount || 0,
      purchaseDate: item.purchaseDate || '',
      remark: item.remark || '',
      custodian: item.custodian || '',
      actualQuantity: item.actualQuantity || 0,
      acceptResult: item.acceptResult || '',
      isCustomMaterial: !item.materialId,
      isCustomSpecification: item.isCustomSpecification || false,
    }))

    // 保存原始验收数据用于状态判断
    originalAcceptanceData.value.clear()
    items.value.forEach((item) => {
      if (item.id) {
        originalAcceptanceData.value.set(item.id, {
          actualQuantity: item.actualQuantity,
          acceptResult: item.acceptResult,
        })
      }
    })

    // 加载未通过原因
    if (currentStatus.value === EPurchaseAcceptanceStatus.Rejected) {
      const reasonRes = await getNoPassReason(editId.value)
      if (reasonRes.code === 20000 && reasonRes.data.isPass === false) {
        noPassReason.value = `[${reasonRes.data.userRealName}]审核不通过：${reasonRes.data.comment || ''}`
      }
    }
  }
  catch (error) {
    console.error(error)
    showToast('获取详情失败')
  }
  finally {
    loadingToast.close()
  }
}

// ==================== 生命周期 ====================

onMounted(async () => {
  if (isEdit.value) {
    await loadDetail()
  }
})
</script>
