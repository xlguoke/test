<template>
  <div class="min-h-screen bg-[#f5f5f5] pb-20">
    <van-sticky>
      <MobileTitleBar
        title="采购新增"
        left-arrow
        @click-left="router.go(-1)"
      />
    </van-sticky>

    <!-- 仅显示必填信息 -->
    <div class="bg-white px-3 py-2 flex items-center">
      <van-checkbox v-model="onlyRequired" shape="square">
        仅显示必填信息
      </van-checkbox>
    </div>

    <!-- 表单内容 -->
    <van-form ref="formRef" label-width="7em" @submit="onSubmit">
      <!-- 基础信息 -->
      <div class="bg-white mt-2">
        <SubTitle bordered>
          基础信息
        </SubTitle>

        <van-cell-group :border="false">
          <!-- 化学名称 -->
          <FormItemInput
            v-model:value="form.chemicalVO.categoryName"
            label="化学名称"
            required
            readonly
            is-link
            placeholder="请选择"
            :rules="[{ required: true, message: '请选择化学名称' }]"
            @click="goToChemicalSelector"
          />

          <!-- 品名 -->
          <FormItemInput
            v-model:value="form.chemicalVO.name"
            label="品名"
            required
            placeholder="请输入"
            tip="通用名称、俗名、商品名或法规名录中的名称"
            :rules="[{ required: true, message: '请输入品名' }]"
          />

          <!-- 化学品编号 -->
          <FormItemInput
            v-model:value="form.chemicalVO.sn"
            label="化学品编号"
            required
            placeholder="选择化学名称后自动关联"
            :rules="[{ required: true, message: '请输入化学品编号' }]"
          />

          <!-- 管理级别 -->
          <FormItemInput
            v-model:value="form.chemicalVO.manageLevel"
            required
            label="管理级别"
            placeholder="选择化学名称后自动关联"
          />

          <!-- 计量单位 -->
          <FormItemInput
            v-show="!onlyRequired"
            v-model:value="form.chemicalVO.unit"
            label="计量单位"
            disabled
            placeholder="选择化学名称后自动关联"
          />

          <!-- 纯度 -->
          <FormItemInput
            v-show="!onlyRequired"
            v-model:value="form.chemicalVO.purity"
            label="纯度"
            placeholder="请输入"
          />

          <!-- 浓度 -->
          <FormItemInput
            v-show="!onlyRequired"
            v-model:value="form.chemicalVO.concentration"
            label="浓度"
            placeholder="请输入"
          />

          <!-- 规格型号 -->
          <FormItemInput
            v-show="!onlyRequired"
            v-model:value="form.chemicalVO.specification"
            label="规格型号"
            placeholder="请输入"
          />

          <!-- 用途 -->
          <FormItemInput
            v-show="!onlyRequired"
            v-model:value="form.chemicalVO.effect"
            label="用途"
            placeholder="请输入"
          />

          <!-- 包装方式 -->
          <FormItemInput
            v-show="!onlyRequired"
            v-model:value="form.chemicalVO.packing"
            label="包装方式"
            placeholder="请输入"
          />

          <!-- 化学品来源 -->
          <FormItemInput
            v-show="!onlyRequired"
            v-model:value="form.chemicalVO.sourceFrom"
            label="化学品来源"
            disabled
            placeholder="请选择"
          />

          <!-- 状态描述 -->
          <FormItemInput
            v-show="!onlyRequired"
            v-model:value="form.chemicalVO.status"
            label="状态描述"
            placeholder="请输入"
          />

          <!-- 缩写标识 -->
          <FormItemInput
            v-show="!onlyRequired"
            v-model:value="form.chemicalVO.acronym"
            label="缩写标识"
            placeholder="请输入"
          />

          <!-- 生产日期 -->
          <FormItemDate
            v-model:value="form.chemicalVO.productionDate"
            label="生产日期"
            required
            placeholder="请选择"
            :rules="[{ required: true, message: '请选择生产日期' }]"
          />

          <!-- 配置日期 - 仅当化学品来源为自配时显示 -->
          <FormItemDate
            v-if="form.chemicalVO.sourceFrom === '自配'"
            v-model:value="form.chemicalVO.confectDate"
            label="配置日期"
            required
            disabled
            placeholder="请选择"
            :rules="[{ required: true, message: '请选择配置日期' }]"
          />

          <!-- 失效日期 -->
          <FormItemDate
            v-model:value="form.chemicalVO.invalidDate"
            label="失效日期"
            required
            placeholder="请选择"
            :rules="[{ required: true, message: '请选择失效日期' }]"
          />

          <!-- 备注 -->
          <FormItemInput
            v-show="!onlyRequired"
            v-model:value="form.chemicalVO.remark"
            label="备注"
            placeholder="请输入"
          />

          <!-- 保管人 -->
          <FormItemPerson
            v-model:value="keeperPersonList"
            label="保管人"
            required
            placeholder="请选择"
            enable-multiple
            :rules="[{ required: true, message: '请选择保管人' }]"
            @select="onKeeperSelect"
          />

          <!-- 验收人 -->
          <FormItemPerson
            v-show="!onlyRequired"
            v-model:value="acceptorPersonList"
            label="验收人"
            placeholder="请选择"
            enable-multiple
            @select="onAcceptorSelect"
          />
        </van-cell-group>
      </div>

      <!-- 采购信息 -->
      <div class="bg-white mt-2">
        <SubTitle bordered>
          采购信息
        </SubTitle>

        <!-- 模块无必填项提示 -->
        <div v-if="onlyRequired" class="py-4 text-center text-gray-400 text-sm">
          暂无必填信息
        </div>

        <van-cell-group v-show="!onlyRequired" :border="false">
          <!-- 生产厂家 -->
          <FormItemInput
            v-model:value="form.purchaseVO.manufacturer"
            label="生产厂家"
            placeholder="请输入"
          />

          <!-- 生产批号 -->
          <FormItemInput
            v-model:value="form.purchaseVO.batchSn"
            label="生产批号"
            placeholder="请输入"
          />

          <!-- 证书编号 -->
          <FormItemInput
            v-model:value="form.purchaseVO.certificateSn"
            label="证书编号"
            placeholder="请输入"
          />

          <!-- 供应商 -->
          <FormItemInput
            v-model:value="form.purchaseVO.supplier"
            label="供应商"
            placeholder="请输入"
          />

          <!-- 采购日期 -->
          <FormItemDate
            v-model:value="form.purchaseVO.purchaseDate"
            label="采购日期"
            placeholder="请选择"
          />

          <!-- 采购批号 -->
          <FormItemInput
            v-model:value="form.purchaseVO.purchaseSn"
            label="采购批号"
            placeholder="请输入"
          />

          <!-- 采购数量 -->
          <van-field
            v-model="form.purchaseVO.purchaseAmount"
            input-align="right"
            label="采购数量"
            placeholder="请输入"
            type="number"
          />
        </van-cell-group>
      </div>

      <!-- 入库信息 -->
      <div class="bg-white mt-2">
        <SubTitle bordered>
          入库信息
        </SubTitle>

        <van-cell-group :border="false">
          <!-- 入库批号 -->
          <FormItemInput
            v-show="!onlyRequired"
            v-model:value="form.inventoryInVO.batchSn"
            label="入库批号"
            placeholder="请输入"
          />

          <!-- 入库批次 -->
          <FormItemInput
            v-show="!onlyRequired"
            v-model:value="form.inventoryInVO.batch"
            label="入库批次"
            placeholder="请输入"
          />

          <!-- 入库类型 -->
          <FormItemInput
            v-model:value="form.inventoryInVO.type"
            label="入库类型"
            required
            disabled
            placeholder="请选择"
            :rules="[{ required: true, message: '请选择入库类型' }]"
          />

          <!-- 入库数量 -->
          <van-field
            v-model="form.inventoryInVO.amount"
            input-align="right"
            label="入库数量"
            placeholder="请输入"
            required
            type="number"
            :rules="[{ required: true, message: '请输入入库数量' }]"
          />

          <!-- 配置数量 - 仅当化学品来源为自配时显示 -->
          <van-field
            v-if="form.chemicalVO.sourceFrom === '自配'"
            v-model="form.inventoryInVO.amount"
            input-align="right"
            label="配置数量"
            placeholder="请输入"
            required
            disabled
            type="number"
            :rules="[{ required: true, message: '请输入配置数量' }]"
          />

          <!-- 入库日期 -->
          <FormItemDate
            v-model:value="form.inventoryInVO.putawayDate"
            label="入库日期"
            required
            placeholder="请选择"
            :rules="[{ required: true, message: '请选择入库日期' }]"
          />

          <!-- 存放位置 -->
          <FormItemInput
            v-show="!onlyRequired"
            v-model:value="form.inventoryInVO.storageLocation"
            label="存放位置"
            placeholder="请输入"
          />

          <!-- 监管人 -->
          <FormItemPerson
            v-show="!onlyRequired"
            v-model:value="managerPersonList"
            label="监管人"
            placeholder="请选择"
            enable-multiple
            @select="onManagerSelect"
          />

          <!-- 更换容器存储 -->
          <FormItemRadio
            v-model:value="form.inventoryInVO.allowChangeContainer"
            label="更换容器存储"
            required
            :options="[
              { label: '是', value: 'true' },
              { label: '否', value: 'false' },
            ]"
          />
        </van-cell-group>
      </div>

      <!-- 自定义字段 -->
      <div class="bg-white mt-2">
        <SubTitle bordered>
          自定义字段
        </SubTitle>

        <!-- 模块无必填项提示 -->
        <div v-if="onlyRequired" class="py-4 text-center text-gray-400 text-sm">
          暂无必填信息
        </div>

        <van-cell-group v-show="!onlyRequired" :border="false">
          <FormItemCustom
            ref="customFieldsRef"
            v-model="form.customValues"
            customize-type="chemicalInventoryIn"
            :initial-value="initialCustomValues"
            :show-empty="true"
          />
        </van-cell-group>
      </div>

      <!-- 附件信息 -->
      <div class="bg-white mt-2">
        <SubTitle bordered>
          附件信息
        </SubTitle>

        <div class="p-4">
          <van-uploader
            v-model="fileList"
            multiple
            :max-count="9"
            :after-read="afterRead"
            :before-delete="beforeDelete"
            @click-preview="handlePreview"
          />
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
          确认入库
        </van-button>
      </div>
    </div>

    <!-- 化学品选择器 Popup -->
    <ChemicalSelector
      v-model:show="showChemicalSelector"
      mode="radio"
      :initial-selected="selectedChemical"
      @confirm="onChemicalSelected"
    />
  </div>
</template>

<script setup lang="ts">
import type { AttachmentInfo, StorageInDetail, StorageInSaveForm } from '~/views/mobileApp/types/chemical/storage-in'
import type { ChemicalItem } from '~/views/mobileApp/views/chemical/components/ChemicalList.vue'
import { cloneDeep } from '@unovis/ts'
import { showImagePreview, showLoadingToast, showToast } from 'vant'
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FormItemCustom from '~/views/mobileApp/components/MobileFormItem/FormItemCustom.vue'
import FormItemDate from '~/views/mobileApp/components/MobileFormItem/FormItemDate.vue'
import FormItemInput from '~/views/mobileApp/components/MobileFormItem/FormItemInput.vue'
import FormItemPerson from '~/views/mobileApp/components/MobileFormItem/FormItemPerson.vue'
import FormItemRadio from '~/views/mobileApp/components/MobileFormItem/FormItemRadio.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import SubTitle from '~/views/mobileApp/components/MobileUI/SubTitle.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { addStorageIn, confirmStorageIn, getStorageInDetail } from '~/views/mobileApp/provides/api/chemical.api'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import ChemicalSelector from '~/views/mobileApp/views/chemical/commonSelector/chemical-selector.vue'

interface PersonItem {
  id: string
  name: string
  account: string
}

const router = useRouter()
const route = useRoute()
const formRef = ref()
const customFieldsRef = ref()

// 编辑时的ID
const editId = ref('')

// 仅显示必填信息
const onlyRequired = ref(false)

// 人员选择数据
const keeperPersonList = ref<PersonItem[]>([])
const acceptorPersonList = ref<PersonItem[]>([])
const managerPersonList = ref<PersonItem[]>([])

// 自定义字段初始值（编辑时使用）
const initialCustomValues = ref<Array<{ columnId: string, columnValue: string }>>([])

// 表单数据 - 与PC端字段结构保持一致
const form = reactive<StorageInSaveForm>({
  chemicalVO: {
    categoryName: '',
    categoryId: '',
    name: '',
    sn: '',
    productionDate: '',
    invalidDate: '',
    keeperIds: '',
    keepers: '',
    manageLevel: '',
    manageLevelId: '',
    unit: '',
    purity: '',
    concentration: '',
    specification: '',
    effect: '',
    packing: '',
    sourceFrom: '采购',
  },
  purchaseVO: {},
  inventoryInVO: {
    type: '采购',
    amount: undefined as any,
    putawayDate: '',
    allowChangeContainer: 'true',
  },
  customValues: [],
  attachments: [],
})

// 文件列表
const fileList = ref<any[]>([])
// 上传后的文件ID列表
const uploadedFileIds = ref<string[]>([])

// 选择器显示状态
const showChemicalSelector = ref(false)

// 已选中的化学品（用于回显）
const selectedChemical = ref<ChemicalItem[]>([])

// 页面初始化
onMounted(() => {
  initPage()
})

// 页面初始化
function initPage() {
  if (route.params.id) {
    editId.value = route.params.id as string
    loadDetailData()
  }
}

// 加载详情数据
async function loadDetailData() {
  const loadingToast = showLoadingToast({
    message: '加载中...',
    forbidClick: true,
  })
  try {
    const res = await getStorageInDetail(editId.value)
    if (res.code !== 20010 && res.data) {
      fillFormData(res.data)
    }
    else {
      showToast('获取数据失败')
      router.back()
    }
  }
  catch (error) {
    console.error('加载详情数据失败:', error)
    showToast('加载数据失败')
    router.back()
  }
  finally {
    loadingToast.close()
  }
}

// 填充表单数据
function fillFormData(detail: StorageInDetail) {
  const { chemicalVO, purchaseVO, inventoryInVO, customValues } = detail

  // 将 chemicalVO 中的字段同步到 inventoryInVO 用于表单展示
  inventoryInVO.storageLocation = chemicalVO.storageLocation || ''
  inventoryInVO.managers = chemicalVO.managers || ''
  inventoryInVO.managerIds = chemicalVO.managerIds || ''
  inventoryInVO.allowChangeContainer = chemicalVO.allowChangeContainer?.toString() || 'true'

  if (chemicalVO) {
    Object.assign(form.chemicalVO, chemicalVO)
    // 设置保管人选择数据（支持多个人员，逗号分割）
    if (chemicalVO.keepers && chemicalVO.keeperIds) {
      const keeperIds = chemicalVO.keeperIds.split(',')
      const keeperNames = chemicalVO.keepers.split(',')
      keeperPersonList.value = keeperIds.map((id, index) => ({
        id: id.trim(),
        name: keeperNames[index]?.trim() || '',
        account: '',
      }))
    }
    // 设置验收人选择数据（支持多个人员，逗号分割）
    if (chemicalVO.acceptors && chemicalVO.acceptorIds) {
      const acceptorIds = chemicalVO.acceptorIds.split(',')
      const acceptorNames = chemicalVO.acceptors.split(',')
      acceptorPersonList.value = acceptorIds.map((id, index) => ({
        id: id.trim(),
        name: acceptorNames[index]?.trim() || '',
        account: '',
      }))
    }
  }

  if (purchaseVO) {
    form.purchaseVO = { ...purchaseVO }
  }

  if (inventoryInVO) {
    Object.assign(form.inventoryInVO, inventoryInVO)
    // 设置监管人选择数据（支持多个人员，逗号分割）
    if (inventoryInVO.managers && inventoryInVO.managerIds) {
      const managerIds = inventoryInVO.managerIds.split(',')
      const managerNames = inventoryInVO.managers.split(',')
      managerPersonList.value = managerIds.map((id, index) => ({
        id: id.trim(),
        name: managerNames[index]?.trim() || '',
        account: '',
      }))
    }
  }

  if (customValues && customValues.length > 0) {
    // 设置自定义字段初始值，由FormItemCustom组件内部处理合并
    initialCustomValues.value = customValues
  }

  // 处理附件回显
  if (detail.attachments && detail.attachments.length > 0) {
    fileList.value = detail.attachments.map((item: any) => ({
      id: item.id,
      name: item.name || item.attachmenttitle,
      url: item.url || item.realpath,
      status: 'done',
      file: {
        name: item.name || item.attachmenttitle,
      },
    }))
    uploadedFileIds.value = detail.attachments.map((item: any) => item.id)
  }
}

// 保管人选择回调
function onKeeperSelect(persons: PersonItem[]) {
  if (persons && persons.length > 0) {
    form.chemicalVO.keepers = persons.map(p => p.name).join(',')
    form.chemicalVO.keeperIds = persons.map(p => p.id).join(',')
  }
  else {
    form.chemicalVO.keepers = ''
    form.chemicalVO.keeperIds = ''
  }
}

// 验收人选择回调
function onAcceptorSelect(persons: PersonItem[]) {
  if (persons && persons.length > 0) {
    form.chemicalVO.acceptors = persons.map(p => p.name).join(',')
    form.chemicalVO.acceptorIds = persons.map(p => p.id).join(',')
  }
  else {
    form.chemicalVO.acceptors = ''
    form.chemicalVO.acceptorIds = ''
  }
}

// 监管人选择回调
function onManagerSelect(persons: PersonItem[]) {
  if (persons && persons.length > 0) {
    form.inventoryInVO.managers = persons.map(p => p.name).join(',')
    form.inventoryInVO.managerIds = persons.map(p => p.id).join(',')
  }
  else {
    form.inventoryInVO.managers = ''
    form.inventoryInVO.managerIds = ''
  }
}

// 打开化学品选择器
function goToChemicalSelector() {
  if (form.chemicalVO.categoryId) {
    selectedChemical.value = [{
      id: form.chemicalVO.categoryId,
      name: form.chemicalVO.categoryName,
      sn: form.chemicalVO.sn,
      manageLevel: form.chemicalVO.manageLevel,
      unit: form.chemicalVO.unit,
      purity: form.chemicalVO.purity,
      concentration: form.chemicalVO.concentration,
      specification: form.chemicalVO.specification,
      effect: form.chemicalVO.effect,
      packing: form.chemicalVO.packing,
    } as ChemicalItem]
  }
  showChemicalSelector.value = true
}

// 处理化学品选择确认
function onChemicalSelected(items: ChemicalItem[]) {
  if (items && items.length > 0) {
    const chem = items[0]
    form.chemicalVO.categoryName = chem.name || ''
    form.chemicalVO.categoryId = chem.id || ''
    form.chemicalVO.name = chem.name || ''
    form.chemicalVO.manageLevel = chem.manageLevel || ''
    form.chemicalVO.manageLevelId = chem.manageLevelId || ''
    form.chemicalVO.unit = chem.unit || ''
    form.chemicalVO.purity = chem.purity || ''
    form.chemicalVO.concentration = chem.concentration || ''
    form.chemicalVO.specification = chem.specification || ''
    form.chemicalVO.effect = chem.effect || ''
    form.chemicalVO.packing = chem.packing || ''
    form.chemicalVO.sn = chem.sn || ''
    selectedChemical.value = items
  }
}

// 暂存（保存未入库）
async function onSave(needConfirm = false): Promise<string | null> {
  try {
    await formRef.value?.validate()
  }
  catch (err: any) {
    showToast(err[0]?.message || '必填项不能为空')
    return null
  }
  const loadingToast = showLoadingToast({
    message: '保存中...',
    forbidClick: true,
    duration: 0, // 持续显示直到手动关闭
  })
  try {
    const saveData = prepareSaveData()
    const result = await addStorageIn(saveData)

    if (result.code !== 20010) {
      if (!needConfirm) {
        showSuccessToast({
          message: '暂存成功',
          forbidClick: true,
        })
        // 延迟1秒后返回列表页，期间loading保持显示防止重复提交
        await new Promise(resolve => setTimeout(resolve, 1000))
        router.back()
      }
      return result.data || editId.value
    }
    else {
      showDialog({
        message: result?.message || '操作失败',
      })
      return null
    }
  }
  catch (err: any) {
    const msg = err?.message || '操作失败'
    showDialog({
      message: msg,
    })
    return null
  }
  finally {
    loadingToast.close()
  }
}

// 提交（确认入库）
async function onSubmit() {
  try {
    const savedId = await onSave(true)
    if (!savedId) {
      return
    }

    const res = await confirmStorageIn(savedId)
    if (res.code !== 20010) {
      showSuccessToast({
        message: '入库成功',
        forbidClick: true,
      })
    }
    else {
      showDialog({
        message: res?.message || '入库失败',
      })
    }
    // 延迟1秒后返回列表页，期间loading保持显示防止重复提交
    await new Promise(resolve => setTimeout(resolve, 1000))
    router.back()
  }
  catch (error: any) {
    showDialog({
      message: error?.message || '入库失败',
    })
  }
}

// 准备保存数据
function prepareSaveData(): StorageInSaveForm {
  const saveData: StorageInSaveForm = cloneDeep(form)

  // 1. 将 inventoryInVO 中的字段迁移到 chemicalVO
  const { managers, managerIds, allowChangeContainer, storageLocation } = saveData.inventoryInVO
  saveData.chemicalVO.managers = managers
  saveData.chemicalVO.managerIds = managerIds
  saveData.chemicalVO.allowChangeContainer = allowChangeContainer
  saveData.chemicalVO.storageLocation = storageLocation

  // 2. 转换 allowChangeContainer 为布尔值
  if (typeof saveData.chemicalVO.allowChangeContainer === 'string') {
    saveData.chemicalVO.allowChangeContainer = saveData.chemicalVO.allowChangeContainer === 'true'
  }

  // 3. 从 inventoryInVO 中删除已迁移的字段
  delete (saveData.inventoryInVO as any).managers
  delete (saveData.inventoryInVO as any).managerIds
  delete (saveData.inventoryInVO as any).allowChangeContainer
  delete (saveData.inventoryInVO as any).storageLocation

  // 4. 从 purchaseVO 中删除 productionDate 和 invalidDate
  delete (saveData.purchaseVO as any).productionDate
  delete (saveData.purchaseVO as any).invalidDate

  // 5. 设置ID和关联关系
  const chemicalId = saveData.chemicalVO.id
  if (chemicalId) {
    saveData.purchaseVO.id = saveData.purchaseVO.id || ''
    saveData.inventoryInVO.id = saveData.inventoryInVO.id || ''
    saveData.purchaseVO.chemicalId = chemicalId
    saveData.inventoryInVO.chemicalId = chemicalId
  }

  // 6. 处理自定义字段
  if (customFieldsRef.value) {
    saveData.customValues = customFieldsRef.value.getSaveData()
  }

  // 7. 处理附件
  saveData.attachments = fileList.value.map((file) => {
    return {
      id: file.id,
      name: file.name || file.file?.name,
      url: file.url,
      realpath: file.url,
      attachmenttitle: file.name || file.file?.name,
      status: 'done',
    }
  }).filter(file => file.id)

  return saveData
}

// 文件上传后处理
async function afterRead(files: any | any[]) {
  const fileArray = Array.isArray(files) ? files : [files]

  for (const file of fileArray) {
    file.status = 'uploading'
    file.message = '上传中...'

    try {
      const formData = new FormData()
      formData.append('file', file.file)

      const res: any = await mRequest.post<{
        success: boolean
        obj?: Array<AttachmentInfo[]>
        msg?: string
        message?: string
      }>(api.common.upload, formData)

      if (res.success && res.obj && res.obj.length > 0) {
        const uploadedFile = res.obj[0]
        file.status = 'done'
        file.message = '上传成功'
        file.id = uploadedFile.id
        file.name = uploadedFile.attachmenttitle
        file.url = uploadedFile.realpath
        uploadedFileIds.value.push(uploadedFile.id)
      }
      else {
        file.status = 'failed'
        file.message = res.msg || res.message || '上传失败'
        showToast(file.message)
      }
    }
    catch (error) {
      console.error('上传失败:', error)
      file.status = 'failed'
      file.message = '上传失败'
      showToast('上传失败')
    }
  }
}

// 删除文件前处理
function beforeDelete(file: any): boolean {
  // 从已上传文件ID列表中移除
  if (file.id) {
    const index = uploadedFileIds.value.indexOf(file.id)
    if (index > -1) {
      uploadedFileIds.value.splice(index, 1)
    }
  }
  return true
}

// 预览文件
function handlePreview(file: any) {
  if (file.status && file.status !== 'done') {
    return
  }

  const extend = file.file?.name?.split('.').pop()?.toLowerCase()
  const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp']

  if (extend && imageTypes.includes(extend)) {
    // 图片预览
    showImagePreview([file.url || file.content])
  }
  else {
    // 其他文件类型，在新窗口打开
    window.open(file.url || file.realpath)
  }
}
</script>
