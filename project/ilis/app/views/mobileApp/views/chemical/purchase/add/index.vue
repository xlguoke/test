<template>
  <div class="min-h-screen bg-[#f5f5f5] pb-20">
    <van-sticky>
      <MobileTitleBar :title="pageTitle" left-arrow @click-left="router.go(-1)" />
    </van-sticky>

    <van-form ref="formRef">
      <!-- 登记信息 -->
      <div class="bg-white mb-2">
        <SubTitle bordered>
          登记信息
        </SubTitle>

        <van-cell-group :border="false">
          <FormItemPerson
            v-model:value="registrantPersonList"
            required
            label="登记人"
            placeholder="请选择登记人"
            :rules="[{ required: true, message: '请选择登记人' }]"
            @select="onRegistrantSelect"
          />

          <FormItemDate
            v-model:value="formData.registerTime"
            required
            label="登记时间"
            placeholder="请选择登记时间"
            enable-time
            :rules="[{ required: true, message: '请选择登记时间' }]"
          />

          <FormItemPerson
            v-model:value="verifierPersonList"
            required
            label="验收人"
            placeholder="请选择验收人"
            :rules="[{ required: true, message: '请选择验收人' }]"
            @select="onVerifierSelect"
          />

          <FormItemPerson
            v-model:value="keeperPersonList"
            enable-multiple
            required
            label="保管人"
            placeholder="请选择保管人"
            :rules="[{ required: true, message: '请选择保管人' }]"
            @select="onKeeperSelect"
          />
        </van-cell-group>
      </div>

      <!-- 化学品信息 -->
      <SubTitle bordered>
        化学品信息

        <template #right>
          <span class="text-[--van-primary-color]" @click="openSelector">
            <van-icon name="plus" />
            新增
          </span>
        </template>
      </SubTitle>

      <!-- 化学品列表 -->
      <div v-if="formData.items.length > 0" class="p-3">
        <ListCard
          v-for="(item, index) in formData.items"
          :key="index"
          :body-style="{ padding: '8px 0' }"
        >
          <template #title>
            <div class="flex items-center justify-between">
              <span>{{ item.chemicalName }}（{{ item.chemicalCode }}）</span>
              <van-icon name="clear" class="text-[red] !text-lg" @click.stop="removeChemical(index)" />
            </div>
          </template>
          <template #default>
            <FormItemInput
              v-model:value="item.productName"
              label="品名"
              required
              placeholder="请输入品名"
              tip="通用名称、俗名、商品名或法规名录中的名称"
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
              v-model:value="item.supplier"
              label="供应商"
              required
              placeholder="请输入供应商"
              :rules="[{ required: true, message: '请输入供应商' }]"
            />

            <FormItemInput
              v-model:value="item.specification"
              label="规格"
              required
              placeholder="请输入规格"
              :rules="[{ required: true, message: '请输入规格' }]"
            />

            <FormItemInput
              v-model:value="item.purchaseQuantity"
              label="数量"
              required
              placeholder="请输入数量"
              type="number"
              :min="0"
              :rules="[
                { required: true, message: '请输入数量' },
                { validator: (val: number) => val > 0, message: '数量不能小于0' },
              ]"
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
              v-model:value="item.remark"
              label="备注"
              placeholder="请输入备注"
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
      <van-button type="primary" block class="!rounded" :loading="saveLoading" @click="onSave">
        保存
      </van-button>
    </div>

    <!-- 化学品/采购申请选择器 -->
    <ChemicalApplySelector
      v-model:show="showSelector"
      chemical-mode="checkbox"
      apply-mode="checkbox"
      @confirm="onSelectorConfirm"
      @cancel="showSelector = false"
    />

    <!-- 隐藏的附件上传组件 - 用于初始化 qrKey -->
    <div v-show="false">
      <UploadWithQrKey
        v-show="false"
        :value="formData.attachmentQr"
        business-id=""
        business-type="CHEMICAL"
        @update:value="formData.attachmentQr = $event"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PurchaseForm, PurchaseItemForm } from '~/views/mobileApp/types/chemical/purchase'
import type { PurchaseApplyListItem } from '~/views/mobileApp/types/chemical/storage-in'
import type { ChemicalItem } from '~/views/mobileApp/views/chemical/components/ChemicalList.vue'
import dayjs from 'dayjs'
import { showConfirmDialog, showDialog, showLoadingToast, showSuccessToast, showToast } from 'vant'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import UploadWithQrKey from '~/views/mobileApp/components/form/UploadWithQrKey.vue'
import FormItemDate from '~/views/mobileApp/components/MobileFormItem/FormItemDate.vue'
import FormItemInput from '~/views/mobileApp/components/MobileFormItem/FormItemInput.vue'
import FormItemPerson from '~/views/mobileApp/components/MobileFormItem/FormItemPerson.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import ListCard from '~/views/mobileApp/components/MobileUI/ListCard.vue'
import SubTitle from '~/views/mobileApp/components/MobileUI/SubTitle.vue'
import { createPurchaseRegister, getPurchaseRegisterDetail, updatePurchaseRegister } from '~/views/mobileApp/provides/api/chemical.api'
import { useAppUserStore } from '~/views/mobileApp/store/useUserStore'
import ChemicalApplySelector from '../../commonSelector/chemical-apply-selector.vue'

const router = useRouter()
const route = useRoute()
const formRef = ref<any>(null)
const userStore = useAppUserStore()

// 判断是否为编辑模式
const isEdit = computed(() => !!route.query.id)
const editId = computed(() => route.query.id as string)

// 页面标题
const pageTitle = computed(() => isEdit.value ? '编辑采购登记' : '新增采购登记')

// 弹窗显示状态
const showSelector = ref(false)
const saveLoading = ref(false)

// 人员选择列表
const registrantPersonList = ref<{ id: string, name: string, account: string }[]>([])
const verifierPersonList = ref<{ id: string, name: string, account: string }[]>([])
const keeperPersonList = ref<{ id: string, name: string, account: string }[]>([])

// 表单数据
const formData = ref<PurchaseForm & { items: PurchaseItemForm[] }>({
  registrantId: '',
  registrant: '',
  registerTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
  verifierId: '',
  verifier: '',
  keepers: '',
  keeperIds: '',
  items: [],
  attachmentQr: '',
})

// 登记人选择回调
function onRegistrantSelect(persons: { id: string, name: string, account: string }[]) {
  if (persons && persons.length > 0) {
    formData.value.registrant = persons[0].name
    formData.value.registrantId = persons[0].id
  }
}

// 验收人选择回调
function onVerifierSelect(persons: { id: string, name: string, account: string }[]) {
  if (persons && persons.length > 0) {
    formData.value.verifier = persons[0].name
    formData.value.verifierId = persons[0].id
  }
}

// 保管人选择回调
function onKeeperSelect(persons: { id: string, name: string, account: string }[]) {
  if (persons && persons.length > 0) {
    formData.value.keepers = persons.map(p => p.name).join(',')
    formData.value.keeperIds = persons.map(p => p.id).join(',')
  }
}

// 初始化
onMounted(async () => {
  if (isEdit.value) {
    // 编辑模式：加载详情数据
    await loadDetail()
  }
  else {
    // 新增模式：设置默认登记人为当前用户
    await initDefaultRegistrant()
  }
})

// 加载详情数据
async function loadDetail() {
  const loadingToast = showLoadingToast({
    message: '加载中...',
    forbidClick: true,
    duration: 0,
  })

  try {
    const res = await getPurchaseRegisterDetail(editId.value)
    if (res.code !== 20010 && res.data) {
      const data = res.data
      // 回填表单数据
      formData.value = data

      // 回填人员选择列表
      if (data.registrantId && data.registrant) {
        registrantPersonList.value = [{
          id: data.registrantId,
          name: data.registrant,
          account: '',
        }]
      }
      if (data.verifierId && data.verifier) {
        verifierPersonList.value = [{
          id: data.verifierId,
          name: data.verifier,
          account: '',
        }]
      }

      // 回填保管人
      const firstItem = data.items?.[0]
      if (firstItem?.keepers && firstItem.keepers.length > 0) {
        keeperPersonList.value = firstItem.keepers.map(k => ({
          id: k.id,
          name: k.name,
          account: '',
        }))
        formData.value.keepers = firstItem.keepers.map(k => k.name).join(',')
        formData.value.keeperIds = firstItem.keepers.map(k => k.id).join(',')
      }

      // 回填化学品列表
      formData.value.items = data.items || []
    }
    else {
      showToast(res.message || '获取详情失败')
      router.back()
    }
  }
  catch (error) {
    console.error('加载详情失败:', error)
    showToast('加载详情失败')
    router.back()
  }
  finally {
    loadingToast.close()
  }
}

// 初始化默认登记人
async function initDefaultRegistrant() {
  // 确保用户信息已加载
  if (!userStore.userInfo) {
    await userStore.initUserBaseInfo()
  }

  if (userStore.userInfo) {
    const { realName, id } = userStore.userInfo
    if (realName && id) {
      formData.value.registrant = realName
      formData.value.registrantId = id
      registrantPersonList.value = [{
        id,
        name: realName,
        account: '',
      }]
    }
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
        unit: chem.unit || '',
        purchaseDate: '',
        productionDate: '',
        invalidDate: '',
        purity: chem.purity || '',
        concentration: chem.concentration || '',
        remark: chem.remark || '',
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
            unit: detail.unit || '',
            purchaseDate: '',
            productionDate: '',
            invalidDate: '',
            purity: '',
            concentration: '',
            remark: detail.description || '',
          })
        }
      })
    }
  })

  console.warn(`已添加 ${data.chemicals.length} 个化学品，${data.applies.length} 个申请单`)
}

function removeChemical(index: number) {
  showConfirmDialog({
    title: '提示',
    message: '确定删除该化学品信息吗？',
  }).then(() => {
    formData.value.items.splice(index, 1)
  }).catch(() => {})
}

// 构建保存数据
function buildSaveData() {
  // 构建保管人对象数组
  const keepers = keeperPersonList.value.map(p => ({ id: p.id, name: p.name }))

  return {
    ...formData.value,
    items: formData.value.items.map(item => ({
      ...item,
      purchaseQuantity: Number(item.purchaseQuantity),
      keepers,
    })),
  }
}

// 保存
async function onSave() {
  // 1. 表单校验 - 使用 van-form 的 validate 方法
  try {
    await formRef.value?.validate()
  }
  catch (error: any) {
    showToast(error[0]?.message || '请填写必填项')
    return
  }

  // 2. 自定义校验（化学品列表）
  if (formData.value.items.length === 0) {
    showToast('请至少添加一个化学品')
    return
  }

  const loadingToast = showLoadingToast({
    message: '保存中...',
    forbidClick: true,
    duration: 0,
  })

  try {
    const submitData = buildSaveData()

    if (isEdit.value) {
      // 编辑模式：调用更新接口
      const res = await updatePurchaseRegister({
        ...submitData,
        id: editId.value,
      })

      if (res.code !== 20010) {
        showSuccessToast({
          message: '更新成功',
          forbidClick: true,
        })
        await new Promise(resolve => setTimeout(resolve, 1000))
        router.back()
      }
      else {
        showDialog({
          message: res.message || '更新失败',
        })
      }
    }
    else {
      // 新增模式：调用新增接口
      const res = await createPurchaseRegister(submitData)

      if (res.code !== 20010) {
        showSuccessToast({
          message: '保存成功',
          forbidClick: true,
        })
        await new Promise(resolve => setTimeout(resolve, 1000))
        router.back()
      }
      else {
        showDialog({
          message: res.message || '保存失败',
        })
      }
    }
  }
  catch (error: any) {
    console.error('保存失败:', error)
    showDialog({
      message: error?.message || '保存失败',
    })
  }
  finally {
    loadingToast.close()
  }
}
</script>
