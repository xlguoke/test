<template>
  <a-modal
    v-model:open="open"
    :title="isEdit ? '选择制样参数' : '添加制样信息'"
    width="640px"
    :mask-closable="false"
    destroy-on-close
    @cancel="handleCancel"
  >
    <a-form
      ref="formRef"
      class="mt-8"
      :model="formData"
      :rules="rules"
      :label-col="{ span: 4 }"
      :wrapper-col="{ span: 20 }"
    >
      <template v-if="!isEdit">
        <a-form-item label="样品组别编号" name="objectGroupNum" required>
          <a-select v-model:value="formData.objectGroupNum" :options="objectGroupNumOptions" placeholder="请选择" />
        </a-form-item>
      </template>
      <a-form-item label="制样参数" name="testParamId_TEMP" required>
        <a-checkbox-group v-model:value="formData.testParamId_TEMP" name="checkboxgroup" :options="testParamOptions" />
      </a-form-item>
      <template v-if="!isEdit">
        <a-form-item label="试件编号" name="priceUnit">
          <a-input v-model:value="formData.periodCode" placeholder="请输入试件编号" />
        </a-form-item>
        <a-form-item label="制样日期" name="priceUnit">
          <a-date-picker v-model:value="formData.formingDate" style="width: 100%;" placeholder="请选择制样日期" />
        </a-form-item>
        <a-form-item label="龄期(天)" name="price">
          <a-input-number
            v-model:value="formData.days"
            style="width: 100%;"
            :min="0"
            placeholder="请输入龄期"
          />
        </a-form-item>
        <a-form-item label="制样情况描述" name="remark">
          <a-textarea v-model:value="formData.description" :rows="4" placeholder="请输入制样情况描述" />
        </a-form-item>
      </template>
    </a-form>

    <template #footer>
      <a-button @click="handleCancel">
        取消
      </a-button>
      <a-button type="primary" @click="handleOk">
        确定
      </a-button>
    </template>
  </a-modal>
</template>

<script setup lang='ts'>
import type { Rule } from 'ant-design-vue/es/form'
import { PeriodMetaDataItem } from '../modules/UsePeriod.ts'
import type { UseBasicInfo } from '~/views/consign/component/selectSample/modules/UseBasicInfo.ts'
import type { UseTestParams } from '~/views/consign/component/selectSample/modules/UseTestParams.ts'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  editPeriod: {
    default: null,
  },
})

const emits = defineEmits(['update:open', 'onSave', 'onUpdate'])

// 基础信息
const useBasicInfo = inject('useBasicInfo') as UseBasicInfo
// 参数信息
const useTestParams = inject('useTestParams') as UseTestParams

const formRef = ref()
const formData = ref(new PeriodMetaDataItem())

const rules: Record<string, Rule[]> = {
  objectGroupNum: [{ required: true, message: '请选择样品组别编号', trigger: 'change' }],
  testParamId_TEMP: [{ required: true, message: '请选择制样参数', trigger: 'change' }],
}

// 样品组别编号下拉
const objectGroupNumOptions = computed(() => {
  const sampleAmount = useBasicInfo.data.sampleAmount
  const options = []

  for (let num = 1; num <= sampleAmount; num++) {
    options.push({
      label: `样品${num}`,
      value: String(num),
    })
  }

  return options
})

// 检测参数下拉
const testParamOptions = computed(() => {
  return useTestParams.selectedRows.map(item => ({
    label: item.displayName,
    value: item.id,
  }))
})

const isEdit = computed(() => !!props.editPeriod)

const open = computed(() => props.open)

watch(open, (val) => {
  if (val === true) {
    if (isEdit.value) {
      formData.value = { ...props.editPeriod } as PeriodMetaDataItem
    }
  }
  else {
    formData.value = new PeriodMetaDataItem()
  }

  emits('update:open', val)
})

// 取消
const handleCancel = function () {
  emits('update:open', false)
}

// 提交
const handleOk = async function () {
  formRef.value.validate().then(async () => {
    const data = { ...formData.value }
    const testParamId = []
    const testParamName = []

    data.testParamId_TEMP.forEach((id) => {
      const d = testParamOptions.value.find(j => j.value === id)
      if (d) {
        testParamId.push(d.value)
        testParamName.push(d.label)
      }
    })

    data.testParamId = testParamId.join(',')
    data.testParamName = testParamName.join(',')

    if (isEdit.value) {
      emits('onUpdate', data)
    }
    else {
      emits('onSave', data)
    }
    handleCancel()
  })
}
</script>
