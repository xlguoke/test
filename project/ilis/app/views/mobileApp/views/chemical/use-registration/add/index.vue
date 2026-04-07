<template>
  <div class="min-h-screen bg-[#f5f5f5] pb-20">
    <van-sticky>
      <MobileTitleBar
        :title="pageTitle"
        left-arrow
        @click-left="router.back()"
      />
    </van-sticky>

    <!-- 化学品信息展示 -->
    <div class="bg-white p-3 text-sm mb-2">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-gray-500">化学品：</span>
        <span class="font-medium">{{ chemicalName }}</span>
        <span class="text-xs text-gray-400">({{ chemicalSn }})</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-gray-500">出库批号：</span>
        <span>{{ batchSn }}</span>
      </div>
      <div class="flex items-center gap-2 mt-1">
        <span class="text-gray-500">可用余量：</span>
        <span class="text-[#4caf50]">{{ remainingAmount }}</span>
      </div>
    </div>

    <!-- 表单内容 -->
    <van-form ref="formRef" label-width="7em" @submit="onSubmit">
      <div class="bg-white">
        <!-- 当次使用量 -->
        <FormItemInput
          v-model:value="form.amount"
          required
          label="当前使用量"
          type="number"
          placeholder="请输入"
          :rules="[
            { required: true, message: '请输入当前使用量' },
            { validator: validateAmount, message: `当前使用量不能大于可用余量${remainingAmount}` },
          ]"
        />

        <!-- 关联任务（检测申领/自配直接使用类型） -->
        <FormItemInput
          v-if="type === 'normal'"
          v-model:value="form.testTaskCodes"
          is-link
          required
          readonly
          autosize
          :rows="1"
          type="textarea"
          label="关联任务"
          placeholder="请选择"
          :rules="[{ required: true, message: '请选择关联任务' }]"
          @click="showTaskSelector = true"
        />

        <!-- 配置溶液（配置溶液类型） -->
        <FormItemInput
          v-if="type === 'liquor'"
          v-model:value="form.solutionSns"
          is-link
          required
          readonly
          autosize
          :rows="1"
          type="textarea"
          label="溶液编号"
          placeholder="请选择"
          :rules="[{ required: true, message: '请选择溶液编号' }]"
          @click="showSolutionSelector = true"
        />

        <FormItemInput
          v-if="type === 'liquor'"
          v-model:value="form.solutionNames"
          label="溶液名称"
          placeholder="选择溶液编号后自动填充"
          type="textarea"
          readonly
          autosize
          :rows="1"
        />

        <!-- 备注 -->
        <FormItemInput
          v-model:value="form.remark"
          label="备注"
          placeholder="请输入"
          type="textarea"
          :rows="2"
        />
      </div>
    </van-form>

    <!-- 底部按钮 -->
    <div class="fixed bottom-0 left-0 right-0 p-3 px-4 bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.05)]">
      <van-button type="primary" block class="!rounded" @click="onSubmit">
        确定
      </van-button>
    </div>

    <!-- 任务选择器 -->
    <MobileTestTaskSelector
      v-model:open="showTaskSelector"
      title="选择关联任务"
      enable-multiple
      :payload="{ testTaskStatus: 20 }"
      :selected-rows="selectedTasks"
      @select="onTaskConfirm"
    />

    <!-- 溶液选择器 -->
    <SolutionSelector
      v-model:show="showSolutionSelector"
      :initial-selected="selectedSolutions"
      @confirm="onSolutionConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import type { SolutionItem } from '~/views/mobileApp/types/chemical/common-selector'
import type { TaskItem, UseRegistrationForm } from '~/views/mobileApp/types/chemical/use-registration'
import { showDialog, showLoadingToast, showSuccessToast, showToast } from 'vant'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FormItemInput from '~/views/mobileApp/components/MobileFormItem/FormItemInput.vue'
import MobileTestTaskSelector from '~/views/mobileApp/components/MobileSelector/MobileTestTaskSelector.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { saveUseRegistration } from '~/views/mobileApp/provides/api/chemical.api'
import SolutionSelector from '~/views/mobileApp/views/chemical/commonSelector/solution-selector.vue'

const router = useRouter()
const route = useRoute()
const formRef = ref()

// 页面参数
const outId = ref('')
const type = ref<'normal' | 'liquor'>('normal')
const remainingAmount = ref(0)
const chemicalName = ref('')
const chemicalSn = ref('')
const batchSn = ref('')

// 页面标题
const pageTitle = computed(() => {
  return type.value === 'liquor' ? '新增（配置溶液）' : '新增'
})

// 表单数据（与后端API格式一致）
const form = reactive<UseRegistrationForm>({
  amount: undefined,
  testTaskIds: '',
  testTaskCodes: '',
  solutionIds: '',
  solutionSns: '',
  solutionNames: '',
  remark: '',
})

// 选中的任务（用于选择器回显）
const selectedTasks = ref<TaskItem[]>([])
const showTaskSelector = ref(false)

// 选中的溶液（用于选择器回显，使用SolutionItem兼容选择器组件）
const selectedSolutions = ref<SolutionItem[]>([])
const showSolutionSelector = ref(false)

// 验证使用量
function validateAmount(value: string | number) {
  const num = Number(value)
  if (Number.isNaN(num) || num <= 0) {
    return false
  }
  if (num > remainingAmount.value) {
    return false
  }
  return true
}

// 任务选择确认
function onTaskConfirm(tasks: TaskItem[]) {
  selectedTasks.value = tasks
  // 同步更新form（与后端API格式一致）
  form.testTaskIds = tasks.map(t => t.id).join(',')
  form.testTaskCodes = tasks.map(t => t.testTaskCode).join(',')
  showTaskSelector.value = false
}

// 溶液选择确认
function onSolutionConfirm(solutions: SolutionItem[]) {
  selectedSolutions.value = solutions
  // 同步更新form（与后端API格式一致）
  form.solutionIds = solutions.map(s => s.id).join(',')
  form.solutionSns = solutions.map(s => s.sn).join(',')
  form.solutionNames = solutions.map(s => s.name).join(',')
  showSolutionSelector.value = false
}

// 提交
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

  // 额外验证
  if (!form.amount || form.amount <= 0) {
    showToast('当前使用量必须大于0')
    return
  }
  if (form.amount > remainingAmount.value) {
    showToast(`当前使用量不能大于可用余量(${remainingAmount.value})`)
    return
  }

  // 根据类型验证必填项
  if (type.value === 'normal' && !form.testTaskIds) {
    showToast('请选择关联任务')
    return
  }
  if (type.value === 'liquor' && !form.solutionIds) {
    showToast('请选择配置溶液')
    return
  }

  const loadingToast = showLoadingToast({
    message: '提交中...',
    forbidClick: true,
    duration: 0,
  })

  try {
    // 组装保存数据（form已经是API格式，直接解构使用）
    const saveData: any = {
      amount: form.amount,
      remark: form.remark,
      chemicalInventoryOutId: outId.value,
    }

    // 根据类型添加对应字段
    if (type.value === 'normal') {
      saveData.testTaskIds = form.testTaskIds
      saveData.testTaskCodes = form.testTaskCodes
    }
    else {
      saveData.solutionIds = form.solutionIds
      saveData.solutionSns = form.solutionSns
      saveData.solutionNames = form.solutionNames
    }

    const res = await saveUseRegistration(saveData)

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

onMounted(() => {
  // 获取页面参数
  const id = route.query.id as string
  const queryType = route.query.type as 'normal' | 'liquor'
  const remaining = route.query.remainingAmount as string
  const name = route.query.name as string
  const cName = route.query.chemicalName as string
  const sn = route.query.sn as string
  const bSn = route.query.batchSn as string

  if (id) {
    outId.value = id
  }
  if (queryType) {
    type.value = queryType
  }
  if (remaining) {
    remainingAmount.value = Number(remaining) || 0
  }
  if (name) {
    chemicalName.value = name
  }
  if (cName) {
    chemicalName.value = cName
  }
  if (sn) {
    chemicalSn.value = sn
  }
  if (bSn) {
    batchSn.value = bSn
  }
})
</script>
