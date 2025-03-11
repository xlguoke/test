<template>
  <a-spin tip="加载中..." :spinning="loading">
    <a-form class="mt-6" :label-col="{ style: { width: '120px' } }" :wrapper-col="{ style: { flex: 1 } }">
      <RecordInfo :data-source="dataSource" />

      <a-card v-if="![LedgerStatusType.待提交, LedgerStatusType.审核不通过].includes(dataSource.status)" class="mt-4">
        <p class="mb-2">
          处理记录
        </p>
        <a-row :gutter="16">
          <a-col span="12">
            <a-form-item label="处理人" :label-col="{ style: { width: '120px' } }" :wrapper-col="{ style: { flex: 1 } }">
              {{ dataSource.handleUser }}
            </a-form-item>
          </a-col>
          <a-col span="12">
            <a-form-item label="处理时间" :label-col="{ style: { width: '120px' } }" :wrapper-col="{ style: { flex: 1 } }">
              {{ dataSource.handleDate ? dayjs(dataSource.handleDate).format("YYYY-MM-DD HH:mm:ss") : "" }}
            </a-form-item>
          </a-col>
          <a-col span="24">
            <a-form-item label="处理内容" :label-col="{ style: { width: '120px' } }" :wrapper-col="{ style: { flex: 1 } }">
              {{ dataSource.handleContent }}
            </a-form-item>
          </a-col>
          <a-col span="24">
            <a-form-item label="附件" :label-col="{ style: { width: '120px' } }" :wrapper-col="{ style: { flex: 1 } }">
              <HtUploadFile
                v-if="dataSource.id"
                business-type="EQ"
                force-init
                is-reandonly
                :business-id="dataSource.id"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-card>
    </a-form>
  </a-spin>
</template>

<script setup lang='ts'>
import dayjs from 'dayjs'
import RecordInfo from './RecordInfo.vue'
import HtUploadFile from '~/components/htUploadFile/Index.vue'
import { getHumitureRecordDetail } from '~/views/common/humiture/record/api/getHumitureRecordDetail.ts'
import { LedgerStatusType } from '~/views/common/humiture/ledger'

const props = defineProps({
  checkId: {
    type: String,
    default: null,
  },
})

const loading = ref(false)

const dataSource = ref({})

watch(() => props.checkId, (id) => {
  dataSource.value = {}

  if (id) {
    onLoadDetail(id)
  }
}, { immediate: true })

async function onLoadDetail(id: string) {
  loading.value = true
  const res = await getHumitureRecordDetail(id).finally(() => {
    loading.value = false
  })
  dataSource.value = res.data
}
</script>
