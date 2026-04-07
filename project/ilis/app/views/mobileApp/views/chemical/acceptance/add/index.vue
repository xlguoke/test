<template>
  <div class="min-h-screen bg-[#f5f5f5] pb-20">
    <van-sticky>
      <MobileTitleBar :title="isEdit ? '编辑验收登记' : '新增验收登记'" left-arrow @click-left="router.go(-1)" />
    </van-sticky>

    <van-form ref="formRef">
      <!-- 验收结果 -->
      <div class="bg-white mb-3">
        <SubTitle bordered>
          验收结果
        </SubTitle>

        <van-cell-group :border="false">
          <FormItemPerson
            v-model:value="verifierPersonList"
            required
            label="验收人"
            placeholder="请选择验收人"
            :rules="[{ required: true, message: '请选择验收人' }]"
            @select="onVerifierSelect"
          />

          <FormItemPerson
            v-if="!isVerifyStatus"
            v-model:value="keeperPersonList"
            required
            enable-multiple
            label="保管人"
            placeholder="请选择保管人"
            :rules="[{ required: true, message: '请选择保管人' }]"
            @select="onKeeperSelect"
          />

          <FormItemDate
            v-model:value="formData.verifyTime"
            label="验收时间"
            placeholder="请选择验收时间"
            enable-time
          />

          <FormItemInput
            v-model:value="formData.verifyConclusion"
            label="验收结论"
            placeholder="请输入验收结论"
            type="textarea"
            :rows="2"
            autosize
          />
          <!-- 附件 -->
          <van-field label="附件">
            <template #input>
              <UploadWithQrKey
                v-model:value="formData.attachmentQr"
                :business-id="formData.id"
                business-type="CHEMICAL"
                @update:value="formData.attachmentQr = $event"
              />
            </template>
          </van-field>
        </van-cell-group>
      </div>

      <!-- 验收登记 -->
      <SubTitle bordered>
        验收登记
      </SubTitle>

      <!-- 操作栏 -->
      <div class="px-3 py-2 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <van-checkbox v-model="selectAll" @click="toggleSelectAll">
            全选
          </van-checkbox>
          <span
            v-if="selectedItems.length > 0"
            class="text-[red]"
            @click="onBatchDelete"
          >
            删除
          </span>
        </div>
        <span class="text-[--van-primary-color]" @click="openSelector">
          <van-icon name="plus" />
          新增
        </span>
      </div>

      <!-- 化学品列表 -->
      <div v-if="formData.items.length > 0" class="p-3 pt-0">
        <ListCard
          v-for="(item, index) in formData.items"
          :key="index"
          class="mt-3"
          :body-style="{ padding: '8px 0' }"
        >
          <template #title>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <van-checkbox v-model="item.selected" />
                <span>{{ item.chemicalName }}（{{ item.chemicalCode }}）</span>
              </div>
              <van-icon name="clear" class="text-[red] !text-lg" @click.stop="removeChemical(index)" />
            </div>
          </template>
          <template #default>
            <FormItemInput
              v-model:value="item.chemicalName"
              label="化学名称"
              required
              placeholder="请输入化学名称"
              :rules="[{ required: true, message: '请输入化学名称' }]"
            />

            <FormItemInput
              v-model:value="item.productName"
              label="品名"
              required
              tip="通用名称、俗名、商品名或法规名录中的名称"
              placeholder="请输入品名"
              :rules="[{ required: true, message: '请输入品名' }]"
            />

            <FormItemInput
              v-model:value="item.productCode"
              label="品名编号"
              required
              placeholder="请输入品名编号"
              :rules="[{ required: true, message: '请输入品名编号' }]"
            />

            <FormItemInput
              v-model:value="item.specification"
              label="规格"
              required
              placeholder="请输入规格"
              :rules="[{ required: true, message: '请输入规格' }]"
            />

            <FormItemInput
              v-model:value="item.supplier"
              label="供应商"
              required
              placeholder="请输入供应商"
              :rules="[{ required: true, message: '请输入供应商' }]"
            />

            <FormItemInput
              v-model:value="item.purchaseQuantity"
              label="采购数量"
              required
              placeholder="请输入采购数量"
              type="number"
              :min="0"
              :rules="[
                { required: true, message: '请输入采购数量' },
                { validator: (val: number) => val > 0, message: '采购数量不能小于0' },
              ]"
            />

            <FormItemInput
              v-model:value="item.verifyQuantity"
              label="验收数量"
              placeholder="请输入验收数量"
              type="number"
              :min="0"
            />

            <FormItemInput
              v-model:value="item.unit"
              label="单位"
              required
              placeholder="请输入单位"
              :rules="[{ required: true, message: '请输入单位' }]"
            />

            <FormItemDate
              v-model:value="item.purchaseDate"
              label="购置日期"
              required
              placeholder="请选择购置日期"
              :rules="[{ required: true, message: '请选择购置日期' }]"
            />

            <FormItemDate
              v-model:value="item.productionDate"
              label="生产日期"
              required
              placeholder="请选择生产日期"
              :rules="[{ required: true, message: '请选择生产日期' }]"
            />

            <FormItemDate
              v-model:value="item.invalidDate"
              label="失效日期"
              required
              placeholder="请选择失效日期"
              :rules="[{ required: true, message: '请选择失效日期' }]"
            />

            <FormItemInput
              v-model:value="item.purity"
              label="纯度"
              placeholder="请输入纯度"
            />

            <FormItemInput
              v-model:value="item.concentration"
              label="浓度"
              placeholder="请输入浓度"
            />

            <FormItemInput
              v-model:value="item.verifyQuality"
              label="验收情况"
              placeholder="请输入验收情况"
              type="textarea"
              :rows="1"
              autosize
            />

            <FormItemInput
              v-model:value="item.verifyExtra"
              label="其他"
              placeholder="请输入其他信息"
              type="textarea"
              :rows="1"
              autosize
            />
          </template>
        </ListCard>
      </div>
    </van-form>

    <!-- 底部按钮 -->
    <div class="fixed bottom-0 left-0 right-0 p-3 px-4 bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.05)]">
      <div class="flex gap-3">
        <van-button type="primary" plain block @click="onSave()">
          保存
        </van-button>
        <van-button v-if="formData.status === EPurchaseApplyStatus.PENDING_SUBMIT || formData.status === EPurchaseApplyStatus.NOT_APPROVED" type="primary" block @click="onSubmit">
          提交审核
        </van-button>
      </div>
    </div>

    <!-- 化学品/采购申请选择器 -->
    <ChemicalApplySelector
      v-model:show="showSelector"
      chemical-mode="checkbox"
      apply-mode="checkbox"
      @confirm="onSelectorConfirm"
      @cancel="showSelector = false"
    />

    <!-- 审核流程弹窗 -->
    <CommonAudit
      v-model:value="auditVisible"
      audit-type-id="371"
      @on-submit="onAuditSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import type { PurchaseForm, PurchaseItemForm } from '~/views/mobileApp/types/chemical/purchase'
import type { PurchaseApplyListItem } from '~/views/mobileApp/types/chemical/storage-in'
import type { ChemicalItem } from '~/views/mobileApp/views/chemical/components/ChemicalList.vue'
import dayjs from 'dayjs'
import { showConfirmDialog, showDialog, showLoadingToast, showSuccessToast, showToast } from 'vant'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { EPurchaseApplyStatus } from '~/components/selectorViaMethodCall/entity/PurchaseApplySelectorEntity'
import CommonAudit from '~/views/mobileApp/components/commonAudit.vue'
import UploadWithQrKey from '~/views/mobileApp/components/form/UploadWithQrKey.vue'
import FormItemDate from '~/views/mobileApp/components/MobileFormItem/FormItemDate.vue'
import FormItemInput from '~/views/mobileApp/components/MobileFormItem/FormItemInput.vue'
import FormItemPerson from '~/views/mobileApp/components/MobileFormItem/FormItemPerson.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import ListCard from '~/views/mobileApp/components/MobileUI/ListCard.vue'
import SubTitle from '~/views/mobileApp/components/MobileUI/SubTitle.vue'
import { createPurchaseRegister, getPurchaseRegisterDetail, submitPurchaseRegister, updatePurchaseRegister } from '~/views/mobileApp/provides/api/chemical.api'
import { useAppUserStore } from '~/views/mobileApp/store/useUserStore'
import ChemicalApplySelector from '../../commonSelector/chemical-apply-selector.vue'

const router = useRouter()
const route = useRoute()
const formRef = ref<any>(null)
const userStore = useAppUserStore()

// 是否为编辑模式
const isEdit = computed(() => !!route.params.id)

// 是否为验收状态（从路由query参数判断）
const isVerifyStatus = computed(() => route.query.mode === 'verify')

// 弹窗显示状态
const showSelector = ref(false)
const auditVisible = ref(false)

// 全选状态
const selectAll = ref(false)

// 人员选择列表
const verifierPersonList = ref<{ id: string, name: string, account: string }[]>([])
const keeperPersonList = ref<{ id: string, name: string, account: string }[]>([])

// 表单数据
const formData = ref<PurchaseForm & { items: PurchaseItemForm[] }>({
  registrantId: '',
  registrant: '',
  registerTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
  verifierId: '',
  verifier: '',
  items: [],
  attachmentQr: '',
})

// 计算选中的项
const selectedItems = computed(() => formData.value.items.filter(item => item.selected))

// 验收人选择回调
function onVerifierSelect(persons: { id: string, name: string, account: string }[]) {
  if (persons && persons.length > 0) {
    formData.value.verifier = persons.map(p => p.name).join(',')
    formData.value.verifierId = persons.map(p => p.id).join(',')
  }
}

// 保管人选择回调
function onKeeperSelect(persons: { id: string, name: string, account: string }[]) {
  if (persons && persons.length > 0) {
    formData.value.keepers = persons.map(p => p.name).join(',')
    formData.value.keeperIds = persons.map(p => p.id).join(',')
  }
}

// 监听数据变化，更新全选状态
watch(() => formData.value.items, (items) => {
  if (items.length === 0) {
    selectAll.value = false
  }
  else {
    selectAll.value = items.every(item => item.selected)
  }
}, { deep: true })

// 编辑模式：加载详情数据
onMounted(async () => {
  if (isEdit.value) {
    loadDetail()
  }
  else {
    // 新增模式：设置默认验收人为当前用户
    await initDefaultVerifier()
  }
})

// 初始化默认验收人
async function initDefaultVerifier() {
  // 确保用户信息已加载
  if (!userStore.userInfo) {
    await userStore.initUserBaseInfo()
  }

  if (userStore.userInfo) {
    const { realName, id } = userStore.userInfo
    if (realName && id) {
      formData.value.verifier = realName
      formData.value.verifierId = id
      verifierPersonList.value = [{
        id,
        name: realName,
        account: '',
      }]
    }
  }
}

// 加载详情数据
async function loadDetail() {
  const id = route.params.id as string
  if (!id) {
    showToast('缺少参数')
    return
  }

  const loadingToast = showLoadingToast({
    message: '加载中...',
    forbidClick: true,
    duration: 0,
  })

  try {
    const res = await getPurchaseRegisterDetail(id)
    if (res.code !== 20010 && res.data) {
      const detail = res.data
      // 回填表单数据
      formData.value = detail

      // 回填验收人
      if (detail.verifierId && detail.verifier) {
        const ids = detail.verifierId.split(',')
        const names = detail.verifier.split(',')
        verifierPersonList.value = ids.map((id, index) => ({
          id,
          name: names[index] || '',
          account: '',
        }))
      }

      // 回填保管人（从第一个有keepers的明细项获取）
      const firstItemWithKeepers = detail.items?.find(item => item.keepers && item.keepers.length > 0)
      if (firstItemWithKeepers?.keepers) {
        keeperPersonList.value = firstItemWithKeepers.keepers.map(k => ({
          id: k.id,
          name: k.name,
          account: '',
        }))
        formData.value.keepers = firstItemWithKeepers.keepers.map(k => k.name).join(',')
        formData.value.keeperIds = firstItemWithKeepers.keepers.map(k => k.id).join(',')
      }

      // 回填化学品列表
      if (detail.items && detail.items.length > 0) {
        formData.value.items = detail.items.map(item => ({
          ...item,
          selected: false,
        }))
      }
    }
    else {
      showToast(res.message || '获取详情失败')
    }
  }
  catch (error: any) {
    console.error('获取详情失败:', error)
    showToast(error?.message || '获取详情失败')
  }
  finally {
    loadingToast.close()
  }
}

// 打开选择器
function openSelector() {
  showSelector.value = true
}

// 处理选择器确认数据
function onSelectorConfirm(data: { chemicals: ChemicalItem[], applies: PurchaseApplyListItem[] }) {
  // 添加选中的化学品
  data.chemicals.forEach((chem) => {
    const exists = formData.value.items.some(item => item.chemicalCode === chem.sn)
    if (!exists) {
      formData.value.items.push({
        id: '',
        chemicalCategoryId: chem.id || '',
        chemicalName: chem.name || '',
        chemicalCode: chem.sn || '',
        productName: chem.name || '',
        productCode: chem.sn || '',
        supplier: '',
        specification: chem.specification || '',
        purchaseQuantity: 0,
        verifyQuantity: 0,
        unit: chem.unit || '',
        purchaseDate: '',
        productionDate: '',
        invalidDate: '',
        purity: chem.purity || '',
        concentration: chem.concentration || '',
        verifyQuality: '',
        verifyExtra: '',
        remark: chem.remark || '',
        selected: false,
      })
    }
  })

  // 添加采购申请单中的化学品
  data.applies.forEach((apply) => {
    const details = apply.items || []
    if (Array.isArray(details)) {
      details.forEach((detail) => {
        const exists = formData.value.items.some(item => item.chemicalCode === detail.code)
        if (!exists) {
          formData.value.items.push({
            id: '',
            chemicalCategoryId: detail.sourceId || '',
            chemicalName: detail.name || '',
            chemicalCode: detail.code || '',
            productName: detail.name || '',
            productCode: detail.code || '',
            supplier: '',
            specification: detail.standard || '',
            purchaseQuantity: detail.amount || 0,
            verifyQuantity: 0,
            unit: detail.unit || '',
            purchaseDate: '',
            productionDate: '',
            invalidDate: '',
            purity: '',
            concentration: '',
            verifyQuality: '',
            verifyExtra: '',
            remark: detail.description || '',
            selected: false,
          })
        }
      })
    }
  })

  showToast(`已添加 ${data.chemicals.length + data.applies.length} 个化学品`)
}

// 删除化学品
function removeChemical(index: number) {
  showConfirmDialog({
    title: '提示',
    message: '确定删除该化学品信息吗？',
  }).then(() => {
    formData.value.items.splice(index, 1)
  }).catch(() => {})
}

// 全选/取消全选
function toggleSelectAll() {
  formData.value.items.forEach((item) => {
    item.selected = selectAll.value
  })
}

// 批量删除
function onBatchDelete() {
  showConfirmDialog({
    title: '提示',
    message: `确定删除选中的 ${selectedItems.value.length} 个化学品吗？`,
  }).then(() => {
    formData.value.items = formData.value.items.filter(item => !item.selected)
    selectAll.value = false
  }).catch(() => {})
}

// 构建保存数据
function buildSaveData(): PurchaseForm {
  // 构建保管人对象数组
  const keepers = keeperPersonList.value.map(p => ({ id: p.id, name: p.name }))

  return {
    ...formData.value,
    items: formData.value.items.map(item => ({
      ...item,
      purchaseQuantity: Number(item.purchaseQuantity),
      verifyQuantity: Number(item.verifyQuantity) || 0,
      keepers,
    })),
  }
}

// 表单校验
async function validateForm() {
  try {
    await formRef.value?.validate()
  }
  catch (error: any) {
    showToast(error[0]?.message || '请填写必填项')
    return false
  }

  // 自定义校验（化学品列表）
  if (formData.value.items.length === 0) {
    showToast('请至少添加一个化学品')
    return false
  }

  // 校验验收人
  if (!formData.value.verifier) {
    showToast('请选择验收人')
    return false
  }

  // 校验保管人（非验收状态下必填）
  if (!isVerifyStatus.value && !formData.value.keepers) {
    showToast('请选择保管人')
    return false
  }

  return true
}

// 保存（返回保存的ID）
async function onSave(needConfirm = false): Promise<string | undefined> {
  const isValid = await validateForm()
  if (!isValid)
    return

  const loading = showLoadingToast({
    message: '保存中...',
    forbidClick: true,
    duration: 0,
  })

  try {
    const submitData = buildSaveData()

    for (const item of submitData.items || []) {
      if (!item.purchaseQuantity || item.purchaseQuantity <= 0) {
        showToast(`化学品 ${item.chemicalName} 的采购数量不能小于0`)
        return
      }
    }
    let res: any
    let savedId: string

    if (isEdit.value) {
      // 编辑模式：调用更新接口
      res = await updatePurchaseRegister({
        ...submitData,
        id: route.params.id! as string,
      })
      savedId = route.params.id as string
    }
    else {
      // 新增模式：调用创建接口
      res = await createPurchaseRegister(submitData)
      savedId = res
    }

    if (res.code !== 20010) {
      loading.close()
      if (needConfirm)
        return savedId

      showSuccessToast({
        message: isEdit.value ? '修改成功' : '保存成功',
        forbidClick: true,
      })
      await new Promise(resolve => setTimeout(resolve, 1000))
      router.back()
    }
    else {
      throw new Error(res.message)
    }
  }
  catch (error: any) {
    console.error('保存失败:', error)
    showDialog({
      message: error?.message || (isEdit.value ? '修改失败' : '保存失败'),
    })
  }
}

// 保存后用于审核的ID
const savedRegisterId = ref<string>('')

// 提交审核
async function onSubmit() {
  const savedId = await onSave(true)
  if (!savedId) {
    return
  }

  // 保存ID用于后续审核提交
  savedRegisterId.value = savedId
  // 显示审核弹窗
  auditVisible.value = true
}

// 审核提交回调
async function onAuditSubmit(processUserTaskList: any[], formPropertyJson: any) {
  const loadingToast = showLoadingToast({
    message: '提交中...',
    forbidClick: true,
    duration: 0,
  })

  try {
    // 提交审核
    const submitRes = await submitPurchaseRegister({
      ids: [savedRegisterId.value],
      presetAuditors: processUserTaskList,
      processForm: formPropertyJson,
    })

    if (submitRes.code !== 20010) {
      showSuccessToast({
        message: '提交成功',
        forbidClick: true,
      })
      auditVisible.value = false
      // 延迟1秒后返回列表页
      await new Promise(resolve => setTimeout(resolve, 1000))
      router.back()
    }
    else {
      showDialog({
        message: submitRes.message || '提交失败',
      })
    }
  }
  catch (error: any) {
    console.error('提交失败:', error)
    showDialog({
      message: error?.message || '提交失败',
    })
  }
  finally {
    loadingToast.close()
  }
}
</script>

<style scoped>
:deep(.van-checkbox__label) {
  font-size: 14px;
  color: #333;
}
</style>
