<template>
  <a-modal
    v-model:open="visible"
    title="新增报告申请"
    width="800px"
  >
    <template #footer>
      <a-button @click="cancel">
        取消
      </a-button>
      <a-button v-if="props.param.type === 'add'" @click="save">
        保存
      </a-button>
      <a-button v-if="props.param.type === 'add'" @click="confirm">
        提交
      </a-button>
    </template>
    <a-button @click="onchange">
      打印表单数据
    </a-button>
    <a-form :label-col="labelCol" :model="formState">
      <!-- 报告业务选择器 -->
      <a-form-item label="报告类型">
        <a-select
          v-model:value="formState.applicationType"
          style="width: 100%"
          placeholder="请选择报告类型"
          :options="options"
        ></a-select>
      </a-form-item>
      <!-- 详情界面展示 -->
      <BaseTitle v-if="isAudit">
        申请信息
      </BaseTitle>
      <a-form-item label="委托单位">
        <a-input v-model:value="formState.consignUnit"></a-input>
      </a-form-item>
      <a-form-item label="委托编号">
        <a-input v-model:value="formState.consignCode"></a-input>
      </a-form-item>
      <a-form-item label="报告编号">
        <a-input v-model:value="formState.reportCode"></a-input>
      </a-form-item>
      <a-form-item label="创建人">
        <a-input v-model:value="formState.applicant"></a-input>
      </a-form-item>
      <a-form-item label="创建日期">
        <a-date-picker
          v-model:value="formState.applicationDate"
          value-format="YYYY-MM-DD" class="w-full"
        />
      </a-form-item>

      <template v-if="formState.applicationType === APPLICATION_TYPE.VIDEO_VERIFY">
        <a-form-item label="申请说明">
          <a-input v-model:value="formState.description"></a-input>
        </a-form-item>
      </template>
      <template v-if="formState.applicationType === APPLICATION_TYPE.PAPER_REPORT">
        <a-form-item label="领取方式">
          <a-input v-model:value="formState.extendInfo.getReportType"></a-input>
        </a-form-item>
        <a-form-item label="报告份数">
          <a-input v-model:value="formState.extendInfo.reportCount"></a-input>
        </a-form-item>
        <a-form-item label="收件人">
          <a-input v-model:value="formState.extendInfo.recPerson"></a-input>
        </a-form-item>
        <a-form-item label="收件人电话">
          <a-input v-model:value="formState.extendInfo.recPersonTel"></a-input>
        </a-form-item>
        <a-form-item label="邮寄地址">
          <a-input v-model:value="formState.extendInfo.recAddr"></a-input>
        </a-form-item>
        <a-form-item label="邮寄公司">
          <a-input v-model:value="formState.extendInfo.expressCompany"></a-input>
        </a-form-item>
      </template>
      <template v-if="formState.applicationType === APPLICATION_TYPE.REPORT_AMEND">
        <a-form-item label="更改事项">
          <a-input v-model:value="formState.description"></a-input>
        </a-form-item>
        <a-form-item label="申请书/附件">
          <AttachmentList :datas="attachmentList" />
        </a-form-item>
      </template>
    </a-form>
  </a-modal>
</template>

<script setup lang='ts'>
import type { ReportAuditEntity } from '../ReportBusinessEntity'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import type { Attachment } from '~/components/attachmentList'
import { ref } from 'vue'
import { AttachmentList } from '~/components/attachmentList'

import { getReportBusinessDetail } from '../api'
import { APPLICATION_TYPE } from '../ReportBusinessEntity'

const props = defineProps<IDialogPropsParam<null, {
  data: ReportAuditEntity
  isAudit: boolean
  type: 'add' | 'edit' | 'detail'
}>>()

// APPLICATION_TYPE_DICT 不能作为options的值
const options = ref([
  {
    value: 'VIDEO_VERIFY',
    label: '视频核查',
  },
  {
    value: 'PAPER_REPORT',
    label: '纸质报告',
  },
  {
    value: 'REPORT_AMEND',
    label: '报告更正',
  },
])

interface SaveData {
  applicationType?: string
  consignUnit?: string
  consignCode?: string
  reportCode?: string
  applicant?: string
  applicationDate?: string
  description?: string
  extendInfo: {
    getReportType?: string
    reportCount?: string
    recPerson?: string
    recPersonTel?: string
    recAddr?: string
    expressCompany?: string
  }
  attachmentList?: string[]
  customs?: {
    customColumnId: string
    customColumnName: string
    customColumnValue: string
  }[]
}
/**
 * 可选属性：创建对象时属性可选
 * 实例对象最终的属性数量取决于初始化赋值的数量而不是接口<T>中属性的数量(小于等于)
 */
const formState = ref<SaveData>({
  extendInfo: {
    getReportType: '',
    reportCount: '',
    recPerson: '',
    recPersonTel: '',
    recAddr: '',
    expressCompany: '',
  },
  applicationType: '',
})
const detail = ref()
const visible = ref(true)
const labelCol = { style: { width: '80px' } }
const loading = ref(false)
const attachmentList = ref<Attachment[]>([])
const isAudit = ref(props.param.isAudit)
function cancel() {
  // 取消的逻辑
  visible.value = false
}
function save() {
  // 保存的逻辑
  visible.value = false
}
function confirm() {
  // 发送api请求
  visible.value = false
}
function onchange() {
  // console.log(formState.value)
}
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
</script>

  <style scoped>
  .ant-form-item{
    margin-bottom: 4px;
  }
  :deep(.ant-form-item .ant-form-item-label >label){
    color: #999;
  }
  </style>
