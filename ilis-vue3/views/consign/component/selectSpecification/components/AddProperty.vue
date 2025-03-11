<template>
  <ht-modal
    v-model:open="visible"
    title="设置样品辅助信息"
    width="700px"
    :confirm-loading="loading"
    @cancel="onCancel"
    @ok="submit"
  >
    <a-alert type="warning" message="系统已有通用辅助信息：样品描述，样品数量，代表数量。" />
    <a-form
      ref="formRef"
      :model="form"
      :rules="rules"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 14 }"
      class="mt-6"
    >
      <a-form-item label="辅助信息名称" name="name">
        <a-input v-model:value="form.name" :maxlength="30" placeholder="请输入辅助信息名称" />
      </a-form-item>
      <a-form-item label="数据类型" name="dataType">
        <a-select v-model:value="form.dataType" placeholder="请选择数据类型">
          <a-select-option v-for="d in PROPERTY_DATATYPE" :key="d.value" :value="d.value">
            {{ d.label }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="列表值" name="listValue">
        <a-input v-model:value="form.listValue" :disabled="computeDisabled" placeholder="多个列表值用“;”分隔（仅数据类型是文本和列表的才能编辑列表值）" />
      </a-form-item>
      <a-form-item label="顺序号" name="orderNo">
        <a-input-number v-model:value="form.orderNo" placeholder="请输入顺序号" />
      </a-form-item>
      <a-form-item label="系统字段" name="systemFieldName">
        <a-select v-model:value="form.systemFieldName" placeholder="请选择系统字段">
          <a-select-option v-for="item in systemFields" :key="item.typecode" :value="item.typename">
            {{ item.typename }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="是否盲样" name="isShowTest">
        <a-radio-group v-model:value="form.isShowTest">
          <a-radio value="false">
            是
          </a-radio>
          <a-radio value="true">
            否
          </a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="默认值" name="value">
        <a-input v-model:value="form.value" placeholder="请输入默认值" />
      </a-form-item>
    </a-form>
  </ht-modal>
</template>

<script setup lang='ts'>
import { Modal, message } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/es/form'
import { getListByTypeGroupId } from '~/api/common'

interface FormData {
  name: string
  dataType?: string
  systemFieldName?: string
  listValue?: string
  orderNo?: number
  isShowTest?: string
  value?: string
  sampleId?: string
}

interface SysFields {
  id: string
  typename: string
  typecode: string
  sourceFrom: string
  orderNumber: string
}

const props = defineProps({
  sampleId: {
    type: String,
    default: '',
  },
})

const emits = defineEmits<{
  (e: 'update:open', d: boolean): void
  (e: 'cancel'): void
  (e: 'ok'): void
}>()

const PROPERTY_DATATYPE = [
  {
    label: '文本',
    value: '1',
  },
  {
    label: '日期',
    value: '2',
  },
  {
    label: '整数',
    value: '3',
  },
  {
    label: '实数',
    value: '4',
  },
  {
    label: '列表',
    value: '5',
  },
]

const rules: Record<string, Rule[]> = {
  name: [
    { required: true, message: '名称为必填项', trigger: 'blur' },
  ],
  dataType: [
    { required: true, message: '必须选择类型', trigger: 'change' },
  ],
  systemFieldName: [
    { required: true, message: '必须选择系统字段', trigger: 'change' },
  ],
}

const visible = ref(false)
const loading = ref(false)
const formRef = ref()
const form = reactive<FormData>({
  name: '',
  dataType: '1',
  listValue: '',
  isShowTest: 'true',
  value: '',
  sampleId: '',
})
const computeDisabled = computed(() => {
  return form.dataType !== '1' && form.dataType !== '5'
})

function onCancel() {
  visible.value = false
  loading.value = false
  formRef.value.resetFields()
  emits('update:open', false)
  emits('cancel')
}

onMounted(() => {
  getSysFields()
})

const systemFields = ref<SysFields[]>([])
async function getSysFields() {
  const { data } = await getListByTypeGroupId('99064352841138306')
  systemFields.value = data.rows || []
}

async function submit() {
  formRef.value.validateFields().then(() => {
    loading.value = true
    form.sampleId = props.sampleId
    ilisAxios.post('/rest/sample/other-info', {
      ...form,
      displayName: form.name,
    }).then(() => {
      message.success('保存成功')
      onCancel()
      emits('ok')
    }).catch((err) => {
      loading.value = false
      Modal.error({
        title: '保存失败',
        content: err.message || '系统异常，请稍后重试或联系系统管理员',
        centered: true,
        okText: '确定',
      })
    })
  })
}
</script>

<style>

</style>
