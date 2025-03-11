<template>
  <a-modal
    v-model:open="visible"
    title="审核"
    :keyboard="false"
    :mask-closable="false"
    centered
    width="600px"
    :confirm-loading="loading"
    @cancel="cancelModal"
    @ok="submit"
  >
    <a-form
      ref="formRef"
      :model="form"
      v-bind="formItemLayout"
      class="h-[200px]"
    >
      <a-form-item label="审核结果" name="videoStatus" :rules="[{ required: true }]">
        <a-radio-group v-model:value="form.videoStatus">
          <a-radio v-for="(d, i) in AUDIT_STATUS_OPTIONS" :key="i" :value="d.key">
            {{ d.label }}
          </a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="审核说明" name="opinion" :rules="[{ required: true, message: '请输入审核说明' }]">
        <a-textarea
          v-model:value="form.opinion"
          :rows="4"
          :maxlength="200"
          placeholder="请输入审核说明"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang='ts'>
import type { PropType } from 'vue'
import { message } from 'ant-design-vue'
import { ref } from 'vue'
import { AUDIT_STATUS, AUDIT_STATUS_DICT } from '../'
import { approvalApi } from '../api'
import type { ApprovalParams } from '../api'

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  ids: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
})
const emits = defineEmits<{
  (e: 'update:show', val: boolean): void
  (e: 'ok'): void
}>()

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 19 },
}

const AUDIT_STATUS_OPTIONS = AUDIT_STATUS_DICT.exclude([AUDIT_STATUS.CREATE])
const loading = ref(false)
const visible = ref(props.show)
watch(() => props.show, (val) => {
  loading.value = false
  visible.value = val
})
watch(visible, (val) => {
  emits('update:show', val)
})

const formRef = ref()
const form = ref<ApprovalParams>({
  ids: '',
  videoStatus: 'PASS',
  opinion: '',
})

function cancelModal() {
  visible.value = false
  loading.value = false
  formRef.value.resetFields()
}

async function submit() {
  try {
    await formRef.value.validateFields()
    loading.value = true
    form.value.ids = props.ids.join(',')
    await approvalApi(form.value)
    message.success('操作成功!')
    emits('ok')
    cancelModal()
  }
  catch (err) {
    console.error(err)
    loading.value = false
  }
}
</script>

<style scoped>

</style>
