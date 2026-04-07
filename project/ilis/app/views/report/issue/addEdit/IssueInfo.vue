<template>
  <div>
    <a-form ref="formRef" :model="form" :rules="rules" :disabled="disabled" class="w-full" :label-col="{ style: { width: '100px' } }">
      <a-row>
        <a-col :span="12">
          <a-form-item label="发放方式" name="issueWay">
            <a-select
              v-model:value="form.issueWay"
              placeholder="请选择发放方式"
              :disabled="paperIssueWay === 1 || disabled"
              @change="(v) => changeIssueWay(v as IssueWay, true)"
            >
              <a-select-option v-for="item in issueWayOptions" :key="item.key">
                {{ item.label }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="经办人" name="operatorName">
            <a-input v-model:value="form.operatorName" placeholder="请输入经办人" allow-clear />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="发放数量" name="issueCount">
            <a-input-number v-model:value="form.issueCount" placeholder="请输入发放数量" :min="1" :precision="0" allow-clear :controls="false" class="w-full" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="发放日期" name="issueDate">
            <a-date-picker v-model:value="form.issueDate" placeholder="请选择发放日期" value-format="YYYY-MM-DD" class="w-full" />
          </a-form-item>
        </a-col>
        <a-col v-if="[IssueWay.SELF_PICK, IssueWay.ELECTRONIC].includes(form.issueWay)" :span="12">
          <a-form-item label="领取人" name="receiverone">
            <a-input v-model:value="form.receiverone" placeholder="请输入领取人" allow-clear />
          </a-form-item>
        </a-col>
        <template v-if="form.issueWay === IssueWay.POST">
          <a-col :span="12">
            <a-form-item label="邮寄信息" name="mainPostName">
              <div class="flex gap-2">
                <a-input v-model:value="form.mainPostName" readonly placeholder="请输入邮寄信息" />
                <a-button v-if="!disabled" type="primary" @click="postVisible = true">
                  选择
                </a-button>
              </div>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="收件人" name="receiverthree">
              <a-input v-model:value="form.receiverthree" placeholder="请输入收件人" allow-clear />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="收件人电话" name="receiverPhone">
              <a-input v-model:value="form.receiverPhone" placeholder="请输入收件人电话" allow-clear />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="邮寄地址" name="mailAddress">
              <a-input v-model:value="form.mailAddress" placeholder="请输入邮寄地址" allow-clear />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="邮寄公司" name="mailCompany">
              <DataDict
                v-model:value="form.mailCompany"
                code="expressCompany"
                value-key="typeName"
                placeholder="请选择邮寄公司"
                :disabled="disabled"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="邮寄单号" name="mailNumber">
              <a-input v-model:value="form.mailNumber" placeholder="请输入邮寄单号" allow-clear />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="邮编" name="postCode">
              <a-input v-model:value="form.postCode" placeholder="请输邮编" allow-clear />
            </a-form-item>
          </a-col>
        </template>
        <!-- <a-col v-if="IssueWay.FAX === form.issueWay" :span="12">
          <a-form-item label="传真号" name="faxNumber">
            <a-input v-model:value="form.faxNumber" placeholder="" />
          </a-form-item>
        </a-col> -->
        <template v-if="IssueWay.ELECTRONIC === form.issueWay">
          <a-col :span="12">
            <a-form-item label="领取时限(天)" name="deadline">
              <a-input v-model:value="form.deadline" placeholder="请输入领取时限(天)" allow-clear />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="短信推送" name="smsPush">
              <a-radio-group v-model:value="form.smsPush" :options="smsPushOptions" />
            </a-form-item>
          </a-col>
          <a-col v-if="form.smsPush === '1'" :span="12">
            <a-form-item label="手机号" name="receiverPhone2">
              <a-input v-model:value="form.receiverPhone2" placeholder="请输入手机号" allow-clear />
            </a-form-item>
          </a-col>
        </template>
        <a-col :span="12">
          <a-form-item label="备注" name="remark">
            <a-input v-model:value="form.remark" placeholder="请输入备注" allow-clear />
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="附件" name="attachments">
            <div class="flex gap-4">
              <HtUploadFile
                v-if="!disabled"
                :business-type="BUSINES_TYPE.GENERAL"
                force-init
                hide-file-list
                @get-data="getFileData"
                @cancel="cancelUpload"
              />
              <AttachmentList :datas="attachmentDatas" :col="2" class="flex-1 w-0" :show-del="!disabled" @delete="deleteFile" />
            </div>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>

    <ht-modal
      v-model:open="postVisible"
      title="邮寄项目"
      width="900px"
      @ok="choosePost"
    >
      <iframe
        ref="mailListConfigRef"
        src="reportController.do?goPostInfo&selectPage=1"
        frameborder="0"
        style="width: 100%;height: 70vh;"
      ></iframe>
    </ht-modal>
  </div>
</template>

<script setup lang='ts'>
import type { IssueForm } from './addEditEntity'
import type { Attachment } from '~/components/attachmentList'
import type { AnyDictionaryModel } from '~/model/DictionaryModel'
import { message } from 'ant-design-vue'
import AttachmentList from '~/components/attachmentList/AttachmentList.vue'
import DataDict from '~/components/dataDict/DataDict.vue'
import { BUSINES_TYPE, HtUploadFile } from '~/components/htUploadFile'
import { mailPostInfo, mailPostInfoByReportId } from '../api'
import { IssueWay, IssueWayDict } from '../listEntity'
import { SmsPush, SmsPushDict } from './addEditEntity'

/**
 * ## 字纸报告申请进行报告发放时，若只有一个报告，则禁用发放方式，且不显示电子报告（预委托数据，电子报告申请发放，只有自取和邮寄两种方式）
 * 0-非字纸报告申请 1-字纸报告申请且只有一个报告 2-字纸报告申请且多个报告
 */
export type PaperIssueWay = 0 | 1 | 2

const props = defineProps({
  defaultForm: {
    type: Object as PropType<IssueForm>,
    default: () => ({
      reports: [],
      issueWayLen: '0',
      isPaper: false,
      tabType: '0',
    }),
  },
  paperIssueWay: {
    type: Number as PropType<PaperIssueWay>,
    default: 0,
  },
  reportId: {
    type: String,
    default: '',
  },
  disabled: Boolean,
})
const emit = defineEmits(['changeIssueWay'])

const rules = {
  issueWay: [
    { required: true, message: '请选择发放方式' },
  ],
  operatorName: [
    { required: true, message: '请输入经办人' },
  ],
  issueDate: [
    { required: true, message: '请选择发放日期' },
  ],
  receiverone: [
    { required: true, message: '请输入领取人' },
  ],
  receiverthree: [
    { required: true, message: '请输入收件人' },
  ],
  receiverPhone: [
    { required: true, message: '请输入收件人电话' },
    { pattern: /^(1\d{10})|(0\d{2,3}-?\d{7,8})$/, message: '收件人电话格式错误' },
  ],
  mailAddress: [
    { required: true, message: '请输入邮寄地址' },
  ],
  mailCompany: [
    { required: true, message: '请选择邮寄公司' },
  ],
}
const smsPushOptions = SmsPushDict.map(item => ({
  label: item.label,
  value: item.key,
}))
const fileDatas = ref<Attachment[]>([])
const form = ref<IssueForm>({
  issueWay: IssueWay.SELF_PICK,
  operatorName: '',
  issueDate: '',
})
const attachmentDatas = computed(() => {
  const files = form.value.listFile || []
  return files.concat(fileDatas.value)
})
const issueWayOptions = ref<AnyDictionaryModel[]>(IssueWayDict)

/** 初始化发放方式 */
watch(() => props.paperIssueWay, (val) => {
  if (!val)
    return
  issueWayOptions.value = IssueWayDict.filter(d => d.key !== IssueWay.ELECTRONIC)
})

// 表单默认值
watch(() => props.defaultForm, (obj) => {
  if (!obj.issueWay) {
    obj.issueWay = IssueWay.SELF_PICK
  }
  form.value = { ...obj }
  changeIssueWay(obj.issueWay)
}, {
  deep: true,
  immediate: true,
})

/** 获取系统控制参数：发放期限、发放数量 */
async function getSysConfigParams() {
  try {
    const { issueWay, issueCount, deadline } = form.value
    // 发放期限
    if (issueWay === IssueWay.ELECTRONIC && !deadline) {
      const res = await getBusinessParamValue('REPORT_MANAGE_50')
      form.value.deadline = res || ''
    }

    // 发放数量
    if (!issueCount) {
      const num = await getBusinessParamValue('REPORT_MANAGE_49')
      form.value.issueCount = num || 0
    }
  }
  catch (err) {
    console.error(err)
  }
}

/** 修改发放方式，初始化短信推送 */
function changeIssueWay(val: IssueWay, formChange?: boolean) {
  if (props.disabled)
    return

  if (val === IssueWay.ELECTRONIC && !form.value.smsPush) {
    form.value.smsPush = SmsPush.NO
  }
  emit('changeIssueWay', val)
  getSysConfigParams()
  if (formChange && val === IssueWay.POST) {
    getMailPostInfoReport()
  }
}

/** 获取附件 */
function getFileData(fileObj: any) {
  fileDatas.value = fileObj.fileDatas.map((d: any) => ({
    id: d.attachmentId,
    name: d.name,
    url: d.url,
  }))
}
/** 关闭弹窗 */
function cancelUpload() {
  form.value.listFile = [...attachmentDatas.value]
  fileDatas.value = []
}
/** 删除附件 */
function deleteFile(ind: number) {
  attachmentDatas.value.splice(ind, 1)
  if (form.value.listFile)
    form.value.listFile.splice(ind, 1)
}

/** 选择邮寄项目 */
const postVisible = ref(false)
const mailListConfigRef = ref()
async function choosePost() {
  const $iframe = mailListConfigRef.value
  const rows = $iframe.contentWindow.getSelectData()
  if (rows.length === 0) {
    message.warning('请选择邮寄信息！')
    return
  }
  const postInfo = await getMailPostInfo(rows[0].id)
  form.value = {
    ...form.value,
    ...postInfo,
  }
  postVisible.value = false
}

/** 根据邮寄项目id获取邮寄信息 */
async function getMailPostInfo(id: string) {
  if (!id)
    return {}
  try {
    const { data } = await mailPostInfo(id)
    const obj: any = {
      mailPostId: data.id,
      mainPostName: data.infoSubject,
      receiverthree: data.receiver,
      receiverPhone: data.phone,
      mailCompany: data.expressCompany,
      mailAddress: data.address,
      mailNumber: data.mailNumber,
    }

    return obj
  }
  catch (err) {
    console.error(err)
    return {}
  }
}

/** 根据报告id获取邮寄信息 */
let isLoad = false
async function getMailPostInfoReport() {
  if (!props.reportId || isLoad)
    return

  isLoad = true
  try {
    const { data } = await mailPostInfoByReportId(props.reportId)
    if (!data)
      return
    form.value.receiverthree = data.receiver || ''
    form.value.receiverPhone = data.phone || ''
    form.value.mailAddress = data.address || ''
    form.value.mailCompany = data.expressCompany || ''
  }
  catch (err) {
    console.error(err)
  }
}

/** 保存数据 */
const formRef = ref()
async function saveData() {
  try {
    await formRef.value.validate()
    return form.value
  }
  catch (err) {
    console.error('验证失败', err)
    return ''
  }
}

defineExpose({
  saveData,
  fileDatas: attachmentDatas,
  getMailPostInfo,
})
</script>

<style>

</style>
