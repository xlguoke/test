<template>
  <HtModal
    v-model:open="visible"
    title="申请详情"
    width="800px"
    hide-confirm
    :loading="loading"
    :after-close="onClosed"
  >
    <a-tabs
      v-if="detail?.applicationType === APPLICATION_TYPE.VIDEO_VERIFY"
      v-model:active-key="activeKey"
      @change="changeTab"
    >
      <a-tab-pane key="1" tab="申请信息"></a-tab-pane>
      <a-tab-pane key="2" tab="视频列表"></a-tab-pane>
    </a-tabs>
    <a-form v-if="activeKey === '1'" :label-col="{ span: 5 }">
      <BaseTitle v-if="isAudit">
        申请信息
      </BaseTitle>
      <a-form-item label="委托单位">
        {{ detail?.consignUnit }}
      </a-form-item>
      <a-form-item label="委托编号">
        {{ detail?.consignCode }}
      </a-form-item>
      <a-form-item label="报告编号">
        {{ detail?.reportCode }}
      </a-form-item>
      <a-form-item label="申请类型">
        {{ renderApplicationType(detail?.applicationType) }}
      </a-form-item>
      <a-form-item label="创建人">
        {{ detail?.applicant }}
      </a-form-item>
      <a-form-item label="创建时间">
        {{ detail?.applicationTime ? useDateFormat(detail?.applicationTime, 'YYYY-MM-DD HH:mm:ss') : '' }}
      </a-form-item>

      <template v-if="detail?.applicationType === APPLICATION_TYPE.VIDEO_VERIFY">
        <a-form-item label="申请说明">
          {{ detail?.description }}
        </a-form-item>
      </template>
      <template v-if="detail?.applicationType === APPLICATION_TYPE.PAPER_REPORT">
        <a-form-item label="领取方式">
          {{ GET_REPORT_TYPE_DICT.getLabelByKey(detail?.extendInfo?.howToReceiveReport) }}
        </a-form-item>
        <a-form-item label="报告份数">
          {{ detail?.extendInfo?.reportCount }}
        </a-form-item>
        <a-form-item v-if="detail?.extendInfo?.howToReceiveReport === GET_REPORT_TYPE.SELF" label="领取人">
          {{ detail?.extendInfo?.recipient }}
        </a-form-item>
        <template v-else>
          <a-form-item label="收件人">
            {{ detail?.extendInfo?.recPerson }}
          </a-form-item>
          <a-form-item label="收件人电话">
            {{ detail?.extendInfo?.recPersonTel }}
          </a-form-item>
          <a-form-item label="邮寄地址">
            {{ detail?.extendInfo?.recAddr }}
          </a-form-item>
          <a-form-item label="邮寄公司">
            {{ detail?.extendInfo?.expressCompany }}
          </a-form-item>
        </template>
      </template>
      <template v-if="detail?.applicationType === APPLICATION_TYPE.REPORT_AMEND">
        <a-form-item label="更改事项">
          {{ detail?.description }}
        </a-form-item>
        <a-form-item label="申请书/附件">
          <AttachmentList :datas="attachmentList" />
        </a-form-item>
      </template>
      <template v-if="isAudit">
        <BaseTitle class="mt-3">
          审核信息
        </BaseTitle>
        <a-form-item label="审核人">
          {{ detail?.auditor }}
        </a-form-item>
        <a-form-item label="审核结果">
          {{ detail?.auditPass === true ? '通过' : '不通过' }}
        </a-form-item>
        <a-form-item label="审核日期">
          {{ detail?.auditDate }}
        </a-form-item>
        <a-form-item label="处理说明">
          {{ detail?.auditorOpinion }}
        </a-form-item>
      </template>
    </a-form>
    <template v-if="activeKey === '2'">
      <VideoList :videos="videos" @re-download="reDownload" />
    </template>
  </HtModal>
</template>

<script setup lang='ts'>
import type { VideoData } from '../api'
import type { ReportAuditEntity } from '../ReportBusinessEntity'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import type { Attachment } from '~/components/attachmentList'
import { useDateFormat } from '@vueuse/core'
import { ref } from 'vue'
import { AttachmentList } from '~/components/attachmentList'
import { downloadVideo, getReportBusinessDetail, videoDataApi } from '../api'
import { APPLICATION_TYPE, GET_REPORT_TYPE, GET_REPORT_TYPE_DICT } from '../ReportBusinessEntity'
import VideoList from './VideoList.vue'

const props = defineProps<IDialogPropsParam<null, { data: ReportAuditEntity, isAudit: boolean }>>()
const detail = ref()
const visible = ref(true)
const activeKey = ref('1')
const loading = ref(false)
const attachmentList = ref<Attachment[]>([])
const isAudit = ref(props.param.isAudit)
const applicationTypeMap = {
  VIDEO_VERIFY: '视频核查',
  PAPER_REPORT: '纸质报告',
  REPORT_AMEND: '报告更正',
}
const videos = ref<VideoData[]>([])
async function init() {
  if (props.param.data.id) {
    getData(props.param.data)
  }
}
init()
function convertToAttachment(data: any[]): Attachment[] {
  return data.map(item => ({
    name: item.attachmentTitle,
    url: item.realpath,
    id: item.id,
    size: item.size,
    format: item.attachmentTitle.split('.').pop(),
  }))
}

async function getData(row: ReportAuditEntity) {
  try {
    loading.value = true
    const { data } = await getReportBusinessDetail(row)
    detail.value = data
    attachmentList.value = convertToAttachment(detail.value.attachments)
  }
  catch (err) {
    console.error(err)
  }
  loading.value = false
}

function renderApplicationType(type: keyof typeof applicationTypeMap) {
  return applicationTypeMap[type] || '---'
}

function changeTab() {
  if (activeKey.value === '2') {
    getVideoInfo()
  }
}

// 获取视频信息
async function getVideoInfo() {
  if (videos.value.length > 0)
    return
  try {
    loading.value = true
    const { data } = await videoDataApi(detail.value.reportId)
    videos.value = data
    loading.value = false
  }
  catch (err) {
    loading.value = false
    console.error(err)
  }
}

// 重新下载
async function reDownload(index: number, video: VideoData) {
  try {
    loading.value = true
    const { data } = await downloadVideo(video)
    if (data) {
      videos.value[index] = data
    }
    loading.value = false
  }
  catch (err) {
    loading.value = false
    console.error(err)
  }
}
</script>

  <style scoped>
  .ant-form-item{
    margin-bottom: 4px;
  }
  :deep(.ant-form-item .ant-form-item-label >label){
    color: #999;
  }
  </style>
