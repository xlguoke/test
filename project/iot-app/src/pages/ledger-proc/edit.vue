<template>
  <div px16 py12>
    <van-cell-group inset>
      <AuditProcess ref="auditProcessRef" :audit-type-id="AuditTypeEnum.温湿度巡查异常处理" />
      <van-field
        v-model="handleContent"
        rows="1"
        autosize
        label="留言"
        type="textarea"
        placeholder="请输入留言"
      />
      <van-field name="uploader" label="文件上传">
        <template #input>
          <CustomBusinessUploader :business-id="query.id"></CustomBusinessUploader>
        </template>
      </van-field>
    </van-cell-group>

    <div class="fixed-box">
      <van-button size="small" type="primary" w-full @click="onSubmit">
        确认
      </van-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { AuditTypeEnum } from '@/api/common'
import AuditProcess from '@/components/UI/AuditProcess.vue'
import { type ILedger, submitHumRecord } from '.'
import CustomBusinessUploader from '@/components/UI/CustomBusinessUploader.vue'

const route = useRoute()

const router = useRouter()

const query = route.query as unknown as ILedger

const auditProcessRef = ref()

const handleContent = ref('')

async function onSubmit() {
  showLoadingToast({
    duration: 0,
    forbidClick: true,
  })

  const { processUserTaskList, formPropertyJson } = auditProcessRef.value.getSubmitData()

  await submitHumRecord({
    formPropertyJson: JSON.stringify(formPropertyJson),
    handleContent: handleContent.value,
    id: query.id,
    presetAuditers: JSON.stringify(processUserTaskList),
  }).finally(closeToast)

  showSuccessToast('操作成功！')
  router.back()
}
</script>

<route lang="json">
  {
    "name": "ledger-proc-edit",
    "meta": {
      "title": "台账处理"
    }
  }
</route>
