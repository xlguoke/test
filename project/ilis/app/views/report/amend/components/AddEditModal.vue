<template>
  <ht-modal
    v-model:open="visible"
    title="报告更正申请"
    width="800px"
    :after-close="onClosed"
  >
    <AddEdit :id="param.record?.id" ref="addEditRef" :disabled="disabled" :report-info="param.reportInfo" />
    <template #footer>
      <a-button @click="handleCancel">
        {{ disabled ? '关闭' : '取消' }}
      </a-button>
      <a-button v-if="!param.hideSaveBtn && !disabled" :loading="saveLoading" :disabled="submitLoading" type="primary" @click="handleSave()">
        保存
      </a-button>
      <a-button v-if="!disabled" :loading="submitLoading" :disabled="saveLoading" type="primary" @click="handleSubmit()">
        提交
      </a-button>
    </template>
  </ht-modal>
</template>

<script lang="ts" setup>
import type { ReportAmendEntity } from '../ReportAmendEntity'
import type { ReportInfo } from './AddEdit.vue'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import AddEdit from './AddEdit.vue'

const props = defineProps<IDialogPropsParam<null, {
  type: 'add' | 'edit' | 'detail'
  hideSaveBtn?: boolean
  record?: ReportAmendEntity
  /** 报告发放、上报监管系统页面调用，传入选中的报告信息 */
  reportInfo?: ReportInfo
}>>()

const visible = ref(true)
const saveLoading = ref(false)
const submitLoading = ref(false)
const disabled = ref(props.param.type === 'detail')
const addEditRef = ref()

// 关闭
function handleCancel() {
  visible.value = false
  props.onConfirm(null)
}

// 保存
async function handleSave() {
  try {
    saveLoading.value = true
    await addEditRef.value.save()
    handleCancel()
  }
  catch (err) {
    console.error(err)
  }
  saveLoading.value = false
}

// 提交
async function handleSubmit() {
  try {
    submitLoading.value = true
    const id = await addEditRef.value.save(true)
    submitLoading.value = false

    if (!id)
      return

    await addEditRef.value.submit(id)
    handleCancel()
  }
  catch (err) {
    submitLoading.value = false
    console.error(err)
  }
}
</script>
