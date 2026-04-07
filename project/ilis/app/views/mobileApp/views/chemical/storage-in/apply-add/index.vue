<template>
  <div class="min-h-screen bg-[#f5f5f5] pb-20">
    <van-sticky>
      <MobileTitleBar
        title="按采购申请新增"
        left-arrow
        @click-left="router.go(-1)"
      />
    </van-sticky>

    <!-- 表单内容 -->
    <van-form ref="formRef" label-width="7em" @submit="onSubmit">
      <!-- 采购申请单 -->
      <div class="bg-white mt-2">
        <SubTitle bordered>
          采购申请单
        </SubTitle>

        <van-cell-group :border="false">
          <!-- 申请单 -->
          <FormItemInput
            v-model:value="requestCodeText"
            required
            readonly
            is-link
            label="申请单号"
            placeholder="请选择"
            :rules="[{ required: true, message: '请选择申请单' }]"
            @click="goToApplySelector"
          />

          <!-- 申请部门 -->
          <FormItemInput
            v-model:value="requestDepartmentText"
            readonly
            label="申请部门"
            placeholder="选择申请单后自动关联"
          />

          <!-- 申请人 -->
          <FormItemInput
            v-model:value="requestApplicantText"
            readonly
            label="申请人"
            placeholder="选择申请单后自动关联"
          />
        </van-cell-group>
      </div>

      <!-- 入库人员信息 -->
      <div class="bg-white mt-2">
        <SubTitle bordered>
          入库人员信息
        </SubTitle>

        <van-cell-group :border="false">
          <!-- 保管人 -->
          <FormItemPerson
            v-model:value="keeperPersonList"
            label="保管人"
            placeholder="请选择"
            required
            enable-multiple
            :rules="[{ required: true, message: '请选择保管人' }]"
            @select="onKeeperSelect"
          />

          <!-- 监管人 -->
          <FormItemPerson
            v-model:value="managerPersonList"
            label="监管人"
            placeholder="请选择"
            enable-multiple
            @select="onManagerSelect"
          />
        </van-cell-group>
      </div>

      <!-- 入库明细 -->
      <SubTitle bordered class="mt-2">
        入库明细
      </SubTitle>

      <!-- 化学品列表 -->
      <div v-if="itemList.length > 0" class="p-3">
        <ListCard
          v-for="(item, index) in itemList"
          :key="item._id"
          :body-style="{ padding: '8px 0' }"
        >
          <template #title>
            <div class="flex items-center justify-between">
              <span>{{ item.categoryName }}（{{ item.sn }}）</span>
              <van-icon
                v-if="itemList.length > 1"
                name="clear"
                class="text-[red] !text-lg"
                @click.stop="removeChemical(index)"
              />
            </div>
          </template>
          <template #default>
            <!-- 化学名称 -->
            <FormItemInput
              v-model:value="item.categoryName"
              label="化学名称"
              required
              disabled
              placeholder="自动关联"
              :rules="[{ required: true, message: '请输入化学名称' }]"
            />

            <!-- 品名 -->
            <FormItemInput
              v-model:value="item.name"
              label="品名"
              required
              placeholder="请输入"
              tip="通用名称、俗名、商品名或法规名录中的名称"
              :rules="[{ required: true, message: '请输入品名' }]"
            />

            <!-- 化学品编号 -->
            <FormItemInput
              v-model:value="item.sn"
              label="化学品编号"
              required
              placeholder="请输入"
              :rules="[{ required: true, message: '请输入化学品编号' }]"
            />

            <!-- 规格 -->
            <FormItemInput
              v-model:value="item.specification"
              label="规格"
              placeholder="请输入"
            />

            <!-- 入库数量 -->
            <FormItemInput
              v-model:value="item.amount"
              required
              label="入库数量"
              type="number"
              placeholder="请输入"
              :rules="[{ required: true, message: '请输入入库数量' }]"
            />

            <!-- 单位 -->
            <FormItemInput
              v-model:value="item.unit"
              label="单位"
              placeholder="请输入"
            />

            <!-- 入库日期 -->
            <FormItemDate
              v-model:value="item.putawayDate"
              label="入库日期"
              required
              placeholder="请选择"
              :rules="[{ required: true, message: '请选择入库日期' }]"
            />

            <!-- 生产日期 -->
            <FormItemDate
              v-model:value="item.productionDate"
              label="生产日期"
              required
              placeholder="请选择"
              :rules="[{ required: true, message: '请选择生产日期' }]"
            />

            <!-- 失效日期 -->
            <FormItemDate
              v-model:value="item.invalidDate"
              label="失效日期"
              required
              placeholder="请选择"
              :rules="[{ required: true, message: '请选择失效日期' }]"
            />

            <!-- 存放位置 -->
            <FormItemInput
              v-model:value="item.storageLocation"
              label="存放位置"
              placeholder="请输入"
            />
          </template>
        </ListCard>
      </div>
      <div v-else>
        <div class="text-center text-gray-300 py-8 bg-white">
          请选择申请单
        </div>
      </div>
    </van-form>

    <!-- 底部按钮 -->
    <div class="fixed bottom-0 left-0 right-0 p-3 px-4 bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.05)]">
      <div class="flex gap-3">
        <van-button type="primary" plain block class="!rounded" @click="onSave()">
          暂存
        </van-button>
        <van-button type="primary" block class="!rounded" @click="onSubmit">
          确认
        </van-button>
      </div>
    </div>

    <!-- 采购申请单选择器 Popup -->
    <PurchaseApplySelector
      v-model:show="showApplySelector"
      mode="radio"
      :initial-selected="selectedApply ? [selectedApply] : []"
      @confirm="onApplySelected"
    />
  </div>
</template>

<script setup lang="ts">
import type { PurchaseApplyDetailSubItem, PurchaseApplyListItem, StorageInItem } from '~/views/mobileApp/types/chemical/storage-in'
import { showLoadingToast, showToast } from 'vant'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import FormItemDate from '~/views/mobileApp/components/MobileFormItem/FormItemDate.vue'
import FormItemInput from '~/views/mobileApp/components/MobileFormItem/FormItemInput.vue'
import FormItemPerson from '~/views/mobileApp/components/MobileFormItem/FormItemPerson.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import ListCard from '~/views/mobileApp/components/MobileUI/ListCard.vue'
import SubTitle from '~/views/mobileApp/components/MobileUI/SubTitle.vue'
import { batchConfirmByApply, batchSaveByApply } from '~/views/mobileApp/provides/api/chemical.api'

import PurchaseApplySelector from '~/views/mobileApp/views/chemical/commonSelector/purchase-apply-selector.vue'

interface PersonItem {
  id: string
  name: string
  account: string
}

const router = useRouter()
const formRef = ref()

// 选择器显示状态
const showApplySelector = ref(false)
// 已选中的申请单
const selectedApply = ref<PurchaseApplyListItem>()
// 入库明细列表
const itemList = ref<StorageInItem[]>([])

// 人员选择数据
const keeperPersonList = ref<PersonItem[]>([])
const managerPersonList = ref<PersonItem[]>([])

const requestCodeText = computed(() => selectedApply.value?.requestCode || '')
const requestDepartmentText = computed(() => selectedApply.value?.requestDepartment || '')
const requestApplicantText = computed(() => selectedApply.value?.applicant || '')

// 打开采购申请单选择器
function goToApplySelector() {
  showApplySelector.value = true
}

// 处理采购申请单选择确认
function onApplySelected(items: PurchaseApplyListItem[]) {
  if (items && items.length > 0) {
    const apply = items[0]
    selectedApply.value = apply
    // 填充入库明细列表
    fillItemListFromApply(apply)
  }
}

// 从申请单填充入库明细列表（参考PC端getPurchaseDetails逻辑）
function fillItemListFromApply(apply: PurchaseApplyListItem) {
  const details = apply.items || []
  const list: StorageInItem[] = []

  details.forEach((detail: PurchaseApplyDetailSubItem) => {
    const obj: StorageInItem = {
      _id: detail.id,
      categoryId: detail.sourceId,
      categoryName: detail.name,
      name: detail.name,
      sn: detail.code,
      specification: detail.standard,
      amount: detail.amount,
      unit: detail.unit,
      // 以下字段需要用户手动填写
      productionDate: '',
      invalidDate: '',
      putawayDate: '',
      storageLocation: '',
      // 人员信息
      keepers: '',
      keeperIds: '',
      managers: '',
      managerIds: '',
    }
    list.push(obj)
  })

  itemList.value = list
}

// 删除化学品
function removeChemical(index: number) {
  itemList.value.splice(index, 1)
}

// 保管人选择回调
function onKeeperSelect(persons: PersonItem[]) {
  const keepers = persons.map(p => p.name).join(',')
  const keeperIds = persons.map(p => p.id).join(',')
  // 同步到所有明细项
  itemList.value.forEach((item) => {
    item.keepers = keepers
    item.keeperIds = keeperIds
  })
}

// 监管人选择回调
function onManagerSelect(persons: PersonItem[]) {
  const managers = persons.map(p => p.name).join(',')
  const managerIds = persons.map(p => p.id).join(',')
  // 同步到所有明细项
  itemList.value.forEach((item) => {
    item.managers = managers
    item.managerIds = managerIds
  })
}

// 准备保存数据（参考PC端getFormDataChemical逻辑）
function prepareSaveData(): any[] {
  return itemList.value.map((item) => {
    return {
      attachments: [],
      chemicalVO: {
        categoryName: item.categoryName,
        categoryId: item.categoryId,
        name: item.name,
        sn: item.sn,
        manageLevel: '',
        manageLevelId: '',
        unit: item.unit,
        purity: '',
        concentration: '',
        specification: item.specification,
        effect: '',
        packing: '',
        sourceFrom: '',
        status: '',
        acronym: '',
        productionDate: item.productionDate,
        invalidDate: item.invalidDate,
        remark: '',
        keepers: item.keepers,
        keeperIds: item.keeperIds,
        managers: item.managers,
        managerIds: item.managerIds,
        allowChangeContainer: '',
        storageLocation: item.storageLocation,
      },
      customValues: [],
      inventoryInVO: {
        batchSn: '',
        batch: '',
        type: '',
        amount: item.amount,
        putawayDate: item.putawayDate,
        id: '',
      },
      purchaseVO: {
        manufacturer: '',
        batchSn: '',
        certificateSn: '',
        supplier: '',
        purchaseDate: '',
        purchaseSn: '',
        purchaseAmount: '',
      },
    }
  })
}

// 暂存
// 提交时调用时，返回保存的ID列表
async function onSave(isSubmit?: boolean) {
  // 表单验证
  try {
    await formRef.value?.validate()
  }
  catch (err: any) {
    const msg = err[0]?.message || err?.message || '请填写必填项'
    showToast(msg)
    return
  }

  const loadingToast = showLoadingToast({
    message: '保存中...',
    forbidClick: true,
    duration: 0,
  })

  try {
    const saveData = prepareSaveData()
    const res = await batchSaveByApply(saveData)

    if (res.code === 20010) {
      throw new Error(res?.message || '保存失败')
    }

    if (isSubmit)
      return res.data

    showSuccessToast({
      message: '暂存成功',
      forbidClick: true,
    })
    await new Promise(resolve => setTimeout(resolve, 1000))
    router.back()
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

// 提交
async function onSubmit() {
  try {
    // 先保存，获取保存的ID列表
    const savedIds = await onSave(true)

    if (!savedIds)
      return

    // 再提交确认
    const confirmRes = await batchConfirmByApply({ ids: savedIds })

    if (confirmRes?.code !== 20010) {
      showSuccessToast({
        message: '提交成功',
        forbidClick: true,
      })
      await new Promise(resolve => setTimeout(resolve, 1000))
      router.back()
    }
    else {
      throw new Error(confirmRes?.message || '提交失败')
    }
  }
  catch (error: any) {
    console.error('提交失败:', error)
    showDialog({
      message: error?.message || '提交失败',
    })
  }
}
</script>
