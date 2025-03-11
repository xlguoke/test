<template>
  <a-modal
    v-model:open="open"
    title="处理"
    width="720px"
    :mask-closable="false"
    destroy-on-close
    :confirm-loading="submitLoading"
    centered
    @cancel="cancel"
  >
    <a-form
      class="mt-6"
      :label-col="{ span: 10 }"
      :wrapper-col="{ span: 14 }"
      style="max-height: 420px;overflow-y: auto;overflow-x: hidden"
    >
      <RecordInfo :data-source="props.dataSource" />

      <ProcessForm
        ref="processFormRef"
        class="mt-4"
        :process-type="ProcessType.TEM_HUM_EXECEPTION"
        :label-col="{ style: { width: '100px' } }"
      />

      <a-form-item label="处理内容" :label-col="{ style: { width: '100px' } }" :wrapper-col="{ style: { flex: 1 } }">
        <a-textarea
          v-model:value="formState.handleContent"
          placeholder="请输入"
          :auto-size="{ minRows: 4, maxRows: 6 }"
        />
      </a-form-item>

      <a-form-item label="附件" :label-col="{ style: { width: '100px' } }" :wrapper-col="{ style: { flex: 1 } }">
        <HtUploadFile
          business-type="EQ"
          force-init
          :business-id="formState.id"
        >
          <template #footer="{ handleCancel: closeFn }">
            <a-space>
              <a-button
                type="primary"
                @click="closeFn"
              >
                确定
              </a-button>
              <a-button @click="closeFn">
                取消
              </a-button>
            </a-space>
          </template>
        </HtUploadFile>
      </a-form-item>
    </a-form>

    <template #footer>
      <a-button @click="cancel">
        取消
      </a-button>
      <a-button type="primary" :loading="submitLoading" @click="onSubmit">
        确定
      </a-button>
    </template>
  </a-modal>
</template>

<script setup lang='ts'>
import type { PropType } from 'vue'
import { message } from 'ant-design-vue'
import RecordInfo from './RecordInfo.vue'
import type { HumitureRecordDataItem } from '~/views/common/humiture/record/api/getHumitureRecordList.ts'
import {
  SubmitAbnormalRecordEntity,
  submitAbnormalRecord,
} from '~/views/common/humiture/recordAbnormal/api/submitAbnormalRecord.ts'
import HtUploadFile from '~/components/htUploadFile/Index.vue'
import { ProcessType } from '~/components/commonProcess'
import ProcessForm from '~/components/commonProcess/ProcessForm.vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  dataSource: {
    type: Object as PropType<HumitureRecordDataItem>,
    default: () => {},
  },
})

const emits = defineEmits(['update:open', 'onSave'])

const open = computed(() => props.open)

const submitLoading = ref(false)

const formState = ref(new SubmitAbnormalRecordEntity())

const processFormRef = ref()

watch(open, (val) => {
  if (!val) {
    cancel()
  }
  else {
    const data = props.dataSource
    if (data) {
      const formData = new SubmitAbnormalRecordEntity()
      formData.id = data.id

      formState.value = formData
    }
  }
})

async function onSubmit() {
  const data = await processFormRef.value.getProcessFormData()
  formState.value.presetAuditers = JSON.stringify(data.presetAuditers)
  formState.value.formPropertyJson = JSON.stringify(data.formPropertyJson)

  submitLoading.value = true
  await submitAbnormalRecord(formState.value).finally(() => {
    submitLoading.value = false
  })

  message.success('保存成功')
  emits('onSave')
  cancel()
}

// 关闭弹窗
function cancel() {
  emits('update:open', false)
  formState.value = new SubmitAbnormalRecordEntity()
}
</script>
