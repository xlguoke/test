<template>
  <div class="min-h-screen bg-[#f5f5f5] pb-20">
    <van-sticky>
      <MobileTitleBar
        title="新增出库"
        left-arrow
        @click-left="router.go(-1)"
      />
    </van-sticky>

    <!-- 表单内容 -->
    <van-form ref="formRef" label-width="7em" @submit="onSubmit">
      <!-- 基础信息 -->
      <div class="bg-white mt-2">
        <SubTitle bordered>
          基础信息
        </SubTitle>

        <van-cell-group :border="false">
          <!-- 出库批号 -->
          <FormItemInput
            v-model:value="form.batchSn"
            readonly
            label="出库批号"
            placeholder="暂存后自动生成出库批号"
          />

          <!-- 出库类型 -->
          <FormItemSelect
            v-model:value="form.type"
            required
            label="出库类型"
            placeholder="请选择"
            :rules="[{ required: true, message: '请选择出库类型' }]"
            :options="outTypeOptions"
          />

          <!-- 预计出库日期 -->
          <FormItemDate
            v-model:value="form.planOutboundDate"
            required
            label="预计出库日期"
            placeholder="请选择"
            :rules="[{ required: true, message: '请选择预计出库日期' }]"
          />

          <!-- 预计归还日期 -->
          <FormItemDate
            v-model:value="form.planReturnDate"
            label="预计归还日期"
            placeholder="请选择"
          />

          <!-- 领取部门 -->
          <FormItemDepartment
            v-model:value="selectedDepartment"
            required
            label="领取部门"
            placeholder="请选择"
            :rules="[{ required: true, message: '请选择领取部门' }]"
            @select="onDepartmentSelect"
          />

          <!-- 领取人 -->
          <FormItemPerson
            v-model:value="recipientPersonList"
            required
            enable-multiple
            label="领取人"
            placeholder="请选择"
            :rules="[{ required: true, message: '请选择领取人' }]"
            @select="onRecipientSelect"
          />

          <!-- 出库人 -->
          <FormItemPerson
            v-model:value="outPersonList"
            required
            enable-multiple
            label="出库人"
            placeholder="请选择"
            :rules="[{ required: true, message: '请选择出库人' }]"
            @select="onOutPersonSelect"
          />

          <!-- 实际出库日期 -->
          <FormItemDate
            v-model:value="form.outboundDate"
            required
            label="实际出库日期"
            placeholder="请选择"
            :rules="[{ required: true, message: '请选择实际出库日期' }]"
          />

          <!-- 关联任务 -->
          <FormItemInput
            v-model:value="form.testTaskCodes"
            readonly
            is-link
            autosize
            :rows="1"
            type="textarea"
            label="关联任务"
            placeholder="请选择"
            @click="showTaskSelector = true"
          />

          <!-- 备注 -->
          <FormItemInput
            v-model:value="form.remark"
            label="备注"
            placeholder="请输入"
            type="textarea"
            :rows="2"
          />
        </van-cell-group>
      </div>

      <!-- 配置化学用品 -->
      <div class="mt-2">
        <SubTitle bordered>
          配置化学用品
        </SubTitle>
        <div class="p-3">
          <van-button type="primary" size="small" plain block @click="openChemicalSelector">
            <van-icon name="plus" />
            添加
          </van-button>
        </div>
        <!-- 化学品列表 -->
        <div v-if="selectedChemicals.length > 0" class="p-3">
          <ListCard
            v-for="item in selectedChemicals"
            :key="item.id"
          >
            <template #title>
              <div class="flex items-center justify-between">
                <span>{{ item.name }}</span>
                <van-icon name="clear" class="text-[red] text-lg" @click.stop="removeChemical(item.id)" />
              </div>
            </template>
            <template #default>
              <div class="space-y-1">
                <div
                  v-for="(row, index) in [
                    { label: '用途', value: item.effect },
                    { label: '纯度', value: item.purity },
                    { label: '浓度', value: item.concentration },
                    { label: '计量单位', value: item.unit },
                    { label: '可用余量', value: item.amount },
                  ]" :key="index" class="flex text-xs"
                >
                  <div class="text-[#666]">
                    {{ row.label }}：
                  </div>
                  <div class="flex-1 text-right text-[#151515]">
                    {{ row.value || '--' }}
                  </div>
                </div>
                <!-- 出库数量输入 -->
                <div class="flex items-center text-xs pt-1">
                  <div class="text-[#666]">
                    出库数量：
                  </div>
                  <div class="flex-1 flex justify-end">
                    <van-stepper
                      v-model="item.outQuantity"
                      :min="1"
                      :max="Number(item.amount) || 1"
                      :default-value="Number(item.amount) || 1"
                      input-width="60px"
                      button-size="24px"
                      integer
                    />
                  </div>
                </div>
              </div>
            </template>
          </ListCard>
        </div>
      </div>
    </van-form>

    <!-- 底部按钮 -->
    <div class="fixed bottom-0 left-0 right-0 p-3 px-4 bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.05)]">
      <div class="flex gap-3">
        <van-button type="primary" plain block class="!rounded" @click="onSave">
          暂存
        </van-button>
        <van-button type="primary" block class="!rounded" @click="onSubmit">
          领用出库
        </van-button>
      </div>
    </div>

    <!-- 任务选择器 -->
    <MobileTestTaskSelector
      v-model:open="showTaskSelector"
      enable-multiple
      @select="onTaskConfirm"
      @cancel="showTaskSelector = false"
    />

    <!-- 化学品选择器 -->
    <ChemicalSelector
      v-model:show="showChemicalSelector"
      mode="checkbox"
      :initial-selected="chemicalSelectorData"
      :api="getInventoryList"
      @confirm="onChemicalConfirm"
    />
  </div>
</template>

<script setup lang='ts'>
import type { StorageOutAddForm, StorageOutChemicalItem, StorageOutDetailItem } from '~/views/mobileApp/types/chemical/storage-out'
import { showDialog, showLoadingToast, showSuccessToast, showToast } from 'vant'
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FormItemDate from '~/views/mobileApp/components/MobileFormItem/FormItemDate.vue'
import FormItemDepartment from '~/views/mobileApp/components/MobileFormItem/FormItemDepartment.vue'
import FormItemInput from '~/views/mobileApp/components/MobileFormItem/FormItemInput.vue'
import FormItemPerson from '~/views/mobileApp/components/MobileFormItem/FormItemPerson.vue'
import FormItemSelect from '~/views/mobileApp/components/MobileFormItem/FormItemSelect.vue'
import MobileTestTaskSelector from '~/views/mobileApp/components/MobileSelector/MobileTestTaskSelector.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import ListCard from '~/views/mobileApp/components/MobileUI/ListCard.vue'
import SubTitle from '~/views/mobileApp/components/MobileUI/SubTitle.vue'
import { addStorageOut, confirmStorageOut, getInventoryList, getStorageOutDetail } from '~/views/mobileApp/provides/api/chemical.api'
import ChemicalSelector from '~/views/mobileApp/views/chemical/commonSelector/chemical-selector.vue'

interface PersonItem {
  id: string
  name: string
  account: string
}

const router = useRouter()
const route = useRoute()
const formRef = ref()

// 编辑模式
const isEdit = ref(false)
const editId = ref('')

// 表单数据
const form = reactive<StorageOutAddForm>({
  chemicalId: '',
  batchSn: '',
  type: '',
  planOutboundDate: '',
  planReturnDate: '',
  receiveDepart: '',
  receiveDepartId: '',
  receivers: '',
  receiverIds: '',
  outboundPersons: '',
  outboundPersonIds: '',
  outboundDate: '',
  testTaskIds: '',
  testTaskCodes: '',
  remark: '',
  chemicals: [],
})

// 人员选择数据
const recipientPersonList = ref<PersonItem[]>([])
const outPersonList = ref<PersonItem[]>([])

// 部门选择数据
const selectedDepartment = ref<{ id: string, name: string }>()

// 任务选择数据
const selectedTaskDatas = ref<any[]>([])

// 化学品选择数据
const selectedChemicals = ref<StorageOutChemicalItem[]>([])
const showChemicalSelector = ref(false)
// 传递给选择器的数据（打开时组装）
const chemicalSelectorData = ref<StorageOutChemicalItem[]>([])
// 选择器显示状态
const showTaskSelector = ref(false)

// 出库类型选项
const outTypeOptions = [
  { name: '检测申领出库', value: '检测申领' },
  { name: '配置溶液出库', value: '配置溶液' },
  { name: '失效出库', value: '失效' },
  { name: '调拨出库', value: '调拨' },
]

// 领取人选择回调
function onRecipientSelect(persons: PersonItem[]) {
  if (persons && persons.length > 0) {
    form.receivers = persons[0].name
    form.receiverIds = persons[0].id
  }
  else {
    form.receivers = ''
    form.receiverIds = ''
  }
}

// 出库人选择回调
function onOutPersonSelect(persons: PersonItem[]) {
  if (persons && persons.length > 0) {
    form.outboundPersons = persons[0].name
    form.outboundPersonIds = persons[0].id
  }
  else {
    form.outboundPersons = ''
    form.outboundPersonIds = ''
  }
}

// 部门选择回调
function onDepartmentSelect(department: { id: string, name: string }) {
  form.receiveDepart = department.name
  form.receiveDepartId = department.id
}

// 任务选择确认
function onTaskConfirm(selectedOptions: { testTaskCode: string, id: string }[]) {
  form.testTaskCodes = selectedOptions.map(item => item.testTaskCode).join(',')
  form.testTaskIds = selectedOptions.map(item => item.id).join(',')
  // 构建 taskRelations 数组
  form.taskRelations = selectedOptions.map(item => ({
    testTaskId: item.id,
    testTaskCode: item.testTaskCode,
  }))
  selectedTaskDatas.value = selectedOptions
  showTaskSelector.value = false
}

// 打开化学品选择器 - 组装传递给选择器的数据
function openChemicalSelector() {
  // 将 selectedChemicals 转换为选择器需要的格式
  // 库存列表使用 id（入库记录ID）作为唯一标识
  // 需要将 selectedChemicals 中的数据映射为库存列表可识别的格式
  chemicalSelectorData.value = selectedChemicals.value.map((item) => {
    return {
      ...item,
      // 使用 chemicalId 作为 id 传递给选择器
      id: item.chemicalId || item.id,
    }
  })
  showChemicalSelector.value = true
}

// 化学品选择确认 - 库存接口返回的数据已经是 StorageInListItem 格式
function onChemicalConfirm(items: StorageOutChemicalItem[]) {
  // 库存接口返回的数据直接可用，出库数量默认为可用余量（最大值）
  // 新增模式下：item.id 是入库ID，item.chemicalId 是化学品ID
  selectedChemicals.value = items.map((item) => {
    return {
      ...item,
      // 新增模式下，chemicalId 应该是化学品的真实ID
      chemicalId: item.chemicalId || item.id,
      outQuantity: Number(item.amount) || 1, // 默认出库数量为可用余量
    }
  })
  showChemicalSelector.value = false
}

// 删除化学品
function removeChemical(id: string) {
  const index = selectedChemicals.value.findIndex(item => item.id === id)
  if (index > -1) {
    selectedChemicals.value.splice(index, 1)
  }
}

// 回显数据加载
async function loadDetailData(id: string) {
  const loadingToast = showLoadingToast({
    message: '加载中...',
    forbidClick: true,
    duration: 0,
  })

  try {
    const res = await getStorageOutDetail(id)
    if (res.code !== 20010 && res.data && res.data.length > 0) {
      const detailList = res.data as StorageOutDetailItem[]
      const baseData = detailList[0]

      // 回填表单基础数据
      form.batchSn = baseData.batchSn || ''
      form.type = baseData.type || ''
      form.planOutboundDate = baseData.planOutboundDate || ''
      form.planReturnDate = baseData.planReturnDate || ''
      form.receiveDepart = baseData.receiveDepart || ''
      form.receiveDepartId = baseData.receiveDepartId || ''
      form.receivers = baseData.receivers || ''
      form.receiverIds = baseData.receiverIds || ''
      form.outboundPersons = baseData.outboundPersons || ''
      form.outboundPersonIds = baseData.outboundPersonIds || ''
      form.outboundDate = baseData.outboundDate || ''
      form.remark = baseData.remark || ''

      // 回填部门选择
      if (baseData.receiveDepartId) {
        selectedDepartment.value = {
          id: baseData.receiveDepartId,
          name: baseData.receiveDepart || '',
        }
      }

      // 回填领取人
      if (baseData.receiverIds && baseData.receivers) {
        const ids = baseData.receiverIds.split(',')
        const names = baseData.receivers.split(',')
        recipientPersonList.value = ids.map((id, index) => ({
          id,
          name: names[index] || '',
          account: '',
        }))
      }

      // 回填出库人
      if (baseData.outboundPersonIds && baseData.outboundPersons) {
        const ids = baseData.outboundPersonIds.split(',')
        const names = baseData.outboundPersons.split(',')
        outPersonList.value = ids.map((id, index) => ({
          id,
          name: names[index] || '',
          account: '',
        }))
      }

      // 回填任务关联
      if (baseData.taskRelations && baseData.taskRelations.length > 0) {
        form.taskRelations = baseData.taskRelations
        form.testTaskIds = baseData.taskRelations.map(t => t.testTaskId).join(',')
        form.testTaskCodes = baseData.taskRelations.map(t => t.testTaskCode).join(',')
        selectedTaskDatas.value = baseData.taskRelations.map(t => ({
          id: t.testTaskId,
          testTaskCode: t.testTaskCode,
        }))
      }
    }
  }
  catch (error: any) {
    console.error('加载详情失败:', error)
    showToast(error?.message || '加载详情失败')
  }
  finally {
    loadingToast.close()
  }
}

// 初始化
onMounted(() => {
  const id = route.params.id as string
  if (id) {
    isEdit.value = true
    editId.value = id
    loadDetailData(id)
  }
})

// 验证表单
function validateForm(): boolean {
  if (!form.type) {
    showToast('请选择出库类型')
    return false
  }
  if (!form.planOutboundDate) {
    showToast('请选择预计出库日期')
    return false
  }
  if (!form.receiveDepart) {
    showToast('请选择领取部门')
    return false
  }
  if (!form.receivers) {
    showToast('请选择领取人')
    return false
  }
  if (!form.outboundPersons) {
    showToast('请选择出库人')
    return false
  }
  if (!form.outboundDate) {
    showToast('请选择实际出库日期')
    return false
  }
  if (selectedChemicals.value.length === 0) {
    showToast('请添加化学用品')
    return false
  }
  return true
}

// 构建保存请求数据 - 与PC端保持一致
function buildSaveData(): StorageOutAddForm[] {
  const baseData = { ...form }
  // 删除 chemicals，因为后端期望的是平铺结构
  delete (baseData as any).chemicals

  return selectedChemicals.value.map((item) => {
    return {
      ...baseData,
      chemicalId: item.chemicalId,
      id: '', // 新增时为空，编辑时需要从详情接口获取
      amount: item.outQuantity || 1,
    }
  })
}

// 暂存
async function onSave() {
  if (!validateForm())
    return

  const loadingToast = showLoadingToast({
    message: '保存中...',
    forbidClick: true,
    duration: 0,
  })

  try {
    const data = buildSaveData()
    const res = await addStorageOut(data as any)

    if (res.code !== 20010) {
      showSuccessToast({
        message: '暂存成功',
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

// 提交出库
async function onSubmit() {
  // 表单验证
  try {
    await formRef.value?.validate()
  }
  catch (err: any) {
    const msg = err[0]?.message || err?.message || '请填写必填项'
    showToast(msg)
    return
  }

  if (!validateForm())
    return

  const loadingToast = showLoadingToast({
    message: '提交中...',
    forbidClick: true,
    duration: 0,
  })

  try {
    // 先保存
    const data = buildSaveData()
    const saveRes = await addStorageOut(data as any)

    if (saveRes.code !== 20000) {
      showDialog({
        message: saveRes.message || '保存失败',
      })
      return
    }

    const outIds = saveRes.data

    // 再确认出库（传入ID数组）
    const confirmRes = await confirmStorageOut(outIds)

    if (confirmRes.code !== 20010) {
      showSuccessToast({
        message: '领用出库成功',
        forbidClick: true,
      })
      await new Promise(resolve => setTimeout(resolve, 1000))
      router.back()
    }
    else {
      showDialog({
        message: confirmRes.message || '出库失败',
      })
    }
  }
  catch (error: any) {
    console.error('出库失败:', error)
    showDialog({
      message: error?.message || '出库失败',
    })
  }
  finally {
    loadingToast.close()
  }
}
</script>
