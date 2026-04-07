<template>
  <div>
    <ht-modal
      v-model:open="visible"
      title="报告发放"
      width="1000px"
      fixed-height
      destroy-on-close
      :loading="loading"
      :after-close="onClosed"
      @cancel="onCancel"
    >
      <a-alert>
        <template #message>
          <div>1. 若贵单位未配置手写板现场签字，需提前通知领取人完成报告线上领取签字，否则报告发放台账中将无签字信息；</div>
          <div>2. 当发放方式选择“自取”和“电子报告”时，若使用现场手写板签字领取时，将覆盖线上签字信息；</div>
        </template>
      </a-alert>

      <BaseTitle class="mt-4">
        报告信息
      </BaseTitle>
      <ReportInfo
        :issue-id="param.issueId"
        :reports="reports"
        :tab-type="param.tabType"
        :disabled="param.isReadOnly"
        :report-manage="REPORT_MANAGE"
        @remove="removeReport"
        @add="addReport"
      />

      <BaseTitle class="mt-4">
        发放信息
      </BaseTitle>
      <IssueInfo
        ref="issueInfoRef"
        :disabled="param.isReadOnly"
        :paper-issue-way="paperIssueWay"
        :default-form="formData"
        :report-id="reportId"
        @change-issue-way="changeIssueWay"
      />

      <template #footer>
        <a-button :disabled="loading" @click="onCancel">
          {{ param.isReadOnly ? '关闭' : '取消' }}
        </a-button>
        <template v-if="!param.isReadOnly">
          <a-button v-if="!REPORT_MANAGE && issueWay === IssueWay.POST" type="primary" :disabled="loading" @click="confirmIssue('print')">
            打印邮寄单发放
          </a-button>
          <a-button v-else type="primary" :disabled="loading" @click="signAndConfirmIssue">
            签字并确认发放
          </a-button>
          <a-button type="primary" :disabled="loading" @click="confirmIssue()">
            确认发放
          </a-button>
        </template>
      </template>
    </ht-modal>

    <ht-modal
      v-model:open="showPrintTip"
      title="提示"
    >
      <p class="text-sm text-center leading-[90px] mb-0">
        正在获取签名结果，请勿关闭弹窗！
      </p>
      <template #footer>
        <a-button @click="cancelSignature">
          取消
        </a-button>
      </template>
    </ht-modal>

    <OnlineSginatureModal ref="onlineSginatureRef" @confirm="handleOnlineSignConfirm" @cancel="cancelSignature" />
  </div>
</template>

<script setup lang='ts'>
import type { ConfirmIssueData } from '../api'
import type { IAddEditProps, ReportData } from '../listEntity'
import type { IssueForm } from './addEditEntity'
import type { PaperIssueWay } from './IssueInfo.vue'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { message, Modal } from 'ant-design-vue'
import dayjs from 'dayjs'
import { OnlineSginatureModal, REPORT_SIGN_TYPE, SIGN_TYPE, SIGNATURE_SOURCE, SPECIAL_SIGN_TYPE } from '~/components/onlineSignature'
import openHitekUdrTool from '~/utils/UDR'
import { issueDetail, issueSave, issueSignResult, paperApplyInfo, reportDetail } from '../api'
import { IssueWay } from '../listEntity'
import { SmsPush } from './addEditEntity'
import IssueInfo from './IssueInfo.vue'
import ReportInfo from './ReportInfo.vue'

const props = defineProps<IDialogPropsParam<{ saveData: ConfirmIssueData, type?: 'sign' | 'print' | 'signByOnline' }, IAddEditProps>>()
/** 控制参数：报告发放签字采用在线签字 */
const REPORT_MANAGE = ref(false)
const visible = ref(true)
const loading = ref(false)
const reports = ref<ReportData[]>([])
const formData = ref<IssueForm>({
  issueWay: IssueWay.SELF_PICK,
  operatorName: '',
  issueDate: '',
})
const issueInfoRef = ref()
const paperIssueWay = ref<PaperIssueWay>()
const issueWay = ref(IssueWay.SELF_PICK)
const detailData = ref<any>({})
const reportId = ref()
const nowDate = dayjs().format('YYYY-MM-DD')
const onlineSginatureRef = ref()
const showPrintTip = ref(false)

onMounted(async () => {
  loading.value = true
  REPORT_MANAGE.value = await getBusinessParam('REPORT_MANAGE_51')
  await getReports()
  if (props.param.issueId) {
    await getDetailData()
  }
  else {
    await initDatas()
  }
  loading.value = false
})

/** 获取用户信息 */
function getUserInfo() {
  return JSON.parse(localStorage.getItem('userInfo') || '{}')
}

/** 获取详情数据 */
async function getDetailData() {
  if (!props.param.issueId)
    return
  const { data } = await issueDetail(props.param.issueId)
  detailData.value = data.obj
  const obj = {
    ...data.obj,
    issueWay: Number(data.obj.issueWay || 1),
  }
  if (obj.issueWay === IssueWay.POST) {
    obj.receiverthree = obj.receiver
  }
  else {
    obj.receiverone = obj.receiver
  }
  obj.issueDate = obj.issueDate ? dayjs(obj.issueDate) : ''
  obj.listFile = obj.listFile.map((f: any) => ({
    id: f.id,
    name: f.title,
    url: f.url,
  }))
  formData.value = obj
}

/** 获取报告 */
async function getReports() {
  try {
    if (!props.param.reports.length)
      return
    const ids = props.param.reports.map(d => d.reportId)
    const { data } = await reportDetail(ids)
    reports.value = data
    if (ids.length === 1) {
      reportId.value = ids[0]
    }
  }
  catch (err) {
    console.error(err)
  }
}

/** 移除报告 */
function removeReport(reportId: string) {
  reports.value = reports.value.filter(d => d.reportId !== reportId)
}

/** 扫码添加报告 */
function addReport(datas: ReportData[] = []) {
  reports.value.unshift(...datas)
}

/** 修改发放方式 */
function changeIssueWay(val: IssueWay) {
  issueWay.value = val
}

/** 新增时，初始化数据 */
async function initDatas() {
  const { issueWayLen, isPaper } = props.param
  const { realName } = getUserInfo()

  formData.value.operatorName = realName
  formData.value.issueDate = nowDate
  paperIssueWay.value = 0

  // 未选择报告时不做处理
  if (reports.value.length === 0)
    return

  // 批量发放时，初始化发放方式
  if (reports.value.length > 1) {
    // 若为申请字纸报告，则默认为自取
    if (isPaper) {
      paperIssueWay.value = 2
    }
    else {
      // 全部一致时，回显发放方式，不一致时默认自取
      const firstIssueWay = reports.value[0]?.reportHandOverType
      const isSame = reports.value.every(item => item.reportHandOverType === firstIssueWay)
      formData.value.issueWay = isSame ? firstIssueWay : IssueWay.SELF_PICK
    }

    handleDefaultValue()
    return
  }

  // 只有一份报告时，初始化默认值
  const row = reports.value[0]
  if (isPaper) {
    paperIssueWay.value = 1
    await getPaperApplyInfo()
  }
  else {
    if (typeof issueWayLen !== 'number') {
      console.error('issueWayLen参数类型错误，需要数字类型')
      message.error('issueWayLen参数类型错误，需要数字类型')
    }
    if (issueWayLen !== 1) {
      formData.value.issueWay = issueWayLen as any
    }
    else {
      formData.value.issueWay = row.reportHandOverType
      formData.value.operatorName = realName || ''
    }

    handleDefaultValue()
  }

  // 若在委托收样时填写了邮寄信息，则通过邮寄项目id获取详细信息回显
  if (issueWayLen === 3 || row.reportHandOverType === 3) {
    const postFormId = props.param.reports[0].postFormId
    // 获取邮寄信息
    const res = await issueInfoRef.value.getMailPostInfo(postFormId)
    formData.value = {
      ...formData.value,
      ...res,
    }
  }
}

/** 处理报告发放数量和领取人默认值 */
function handleDefaultValue() {
  // 当所选报告，有线上签名时，且都一致时，默认该人员姓名
  const firstReceiver = reports.value[0]?.preReceiver || ''
  const isSameReceiver = reports.value.every(item => item.preReceiver === firstReceiver)
  if (formData.value.issueWay === IssueWay.POST) {
    formData.value.receiverthree = isSameReceiver ? firstReceiver : ''
  }
  else {
    formData.value.receiverone = isSameReceiver ? firstReceiver : ''
  }

  // 批量操作时，默认所选报告对应委托中，填写了报告份数的最大值，均未填写默认系统控制参数设置的值
  const reportNums = reports.value.map(d => Number(d.reportNum || 0))
  const maxNum = Math.max(...reportNums)
  formData.value.issueCount = maxNum || ''
}

/** 获取预委托申请纸质报告填入的申请信息 */
async function getPaperApplyInfo() {
  const { realName } = getUserInfo()
  try {
    const row = reports.value[0]
    const { data } = await paperApplyInfo(row.reportId)
    const obj: IssueForm = {
      issueWay: data.preIssueWay ? Number(data.preIssueWay) : IssueWay.SELF_PICK,
      issueCount: data.preIssueCount || 0,
      receiverone: data.preReceiver,
      operatorName: realName || '',
      issueDate: nowDate,
    }
    if (obj.issueWay === 3) {
      obj.receiverthree = data.preAddressee
      obj.receiverPhone = data.preAddresseePhone
      obj.mailAddress = data.preAddresseeAddr
      obj.mailCompany = data.preAddresseeCompany
    }
    formData.value = obj
  }
  catch (err) {
    console.error(err)
  }
}

/** 验证报告 */
async function validateReport() {
  return new Promise((resolve) => {
    if (reports.value.length === 0) {
      message.warn('请添加需要发放的报告')
      return resolve(false)
    }
    const first = reports.value[0].consignUnitName
    const isSame = reports.value.every(d => d.consignUnitName === first)
    if (!isSame) {
      Modal.confirm({
        title: '委托单位不一致！',
        content: '委托单位不相同，是否继续发放？',
        type: 'warning',
        centered: true,
        onOk: async () => {
          resolve(true)
        },
        onCancel: () => {
          resolve(false)
        },
      })
      return
    }
    resolve(true)
  })
}

/** 验证领取人 */
async function validateReceiver(data: IssueForm) {
  return new Promise((resolve) => {
    const receiver = data.issueWay === IssueWay.POST ? data.receiverthree : data.receiverone
    const unSame: string[] = []
    reports.value.forEach((d) => {
      if (d.preReceiver && d.preReceiver !== receiver) {
        unSame.push(d.preReceiver)
      }
    })

    if (unSame.length) {
      Modal.confirm({
        title: '领取人与线上领取签字人不一致！',
        content: `您填写的领取人【${receiver}】与已选报告线上领取签字人【${unSame.join(',')}】不一致，是否继续发放？`,
        type: 'warning',
        centered: true,
        onOk: async () => {
          resolve(true)
        },
        onCancel: () => {
          resolve(false)
        },
      })
      return
    }

    resolve(true)
  })
}

/** 保存数据 */
async function initSaveData() {
  const data = await issueInfoRef.value.saveData()
  if (!data)
    return

  if (!await validateReport())
    return

  if (!await validateReceiver(data))
    return

  const { SELF_PICK, POST, ELECTRONIC } = IssueWay
  const { userId, realName } = getUserInfo()
  const reportIds = reports.value.map(d => d.reportId)
  const files = issueInfoRef.value.fileDatas
  const formData: any = {
    issueWay: data.issueWay,
    operatorName: data.operatorName,
    operatorId: '',
    issueCount: data.issueCount,
    issueDate: data.issueDate,
    remark: data.remark,
    receiverSignature: '',
  }

  if (realName === data.operatorName)
    formData.operatorId = userId

  if (data.issueWay === SELF_PICK || data.issueWay === ELECTRONIC) {
    formData.receiver = data.receiverone
    if (formData.issueWay === ELECTRONIC) {
      formData.smsPush = data.smsPush
      if (data.smsPush === SmsPush.YES) {
        formData.receiverPhone = data.receiverPhone2
      }
      else {
        formData.receiverPhone = ''
      }
      formData.deadline = data.deadline
    }
  }
  else if (data.issueWay === POST) {
    formData.mailInfoSubject = data.mailInfoSubject
    formData.mailPostId = data.mailPostId
    formData.receiver = data.receiverthree
    formData.receiverPhone = data.receiverPhone
    formData.mailCompany = data.mailCompany
    formData.mailAddress = data.mailAddress
    formData.mailNumber = data.mailNumber
    formData.postCode = data.postCode
  }

  if (props.param.issueId)
    formData.id = props.param.issueId

  return {
    reportIds,
    attachmentIds: files.map((d: any) => d.id),
    reportIssueEntity: formData,
  }
}

// 用于监听签字的反馈，处理新增和编辑两种情况
let timer: any = null
async function checkReportIdGrant(signReportId: string, saveData: ConfirmIssueData) {
  if (timer)
    clearTimeout(timer)
  timer = setTimeout(async () => {
    const { data } = await issueSignResult(signReportId)
    if (props.param.issueId) {
      // 重新签字发放，判断签字图片是否与之前一致
      if (detailData.value.signSignature !== data.obj.signature) {
        message.success('操作成功')
        onCancel()
        props.onConfirm({ saveData, type: 'sign' })
      }
      else {
        checkReportIdGrant(signReportId, saveData)
      }
    }
    else if (data.obj.isIssued) {
      message.success('操作成功')
      onCancel()
      props.onConfirm({ saveData, type: 'sign' })
    }
    else {
      checkReportIdGrant(signReportId, saveData)
    }
  }, 2000)
}

/** 线上签名 */
async function handleOnlineSignConfirm(data: any) {
  const form = await initSaveData() as any
  const user = data?.users?.[0] // 目前只会有一个人签字
  if (!form || !user)
    return

  form.reportIssueEntity.signUserType = user.identity === REPORT_SIGN_TYPE.CURRENT ? 'SAMPLE_SENDER' : 'SAME_UNIT_SAMPLE_SENDER'
  form.reportIssueEntity.signType = data.signType === SIGN_TYPE.QR_CODE ? 'QR_CODE' : 'MESSAGE'
  form.reportIssueEntity.issueStatus = 'ING'
  form.reportIssueEntity.signUserName = user.name
  form.reportIssueEntity.signUserPhone = user.phone

  loading.value = true
  await issueSave(form).finally(() => {
    loading.value = false
  })
  message.success('操作成功')
  onCancel()
  props.onConfirm({ saveData: form, type: 'signByOnline' })
}

// 签字并确认发放
async function signAndConfirmIssue() {
  try {
    loading.value = true
    const data = await initSaveData()
    if (!data) {
      loading.value = false
      return
    }

    if (REPORT_MANAGE.value) {
      // 线上签字
      onlineSginatureRef.value.openModal({
        title: '线上签字',
        dataId: data.reportIds.join(','),
        reports: reports.value,
        specialSignType: SPECIAL_SIGN_TYPE.ISSUE,
        source: SIGNATURE_SOURCE.REPORT,
      })
    }
    else {
      // 签字板签字 - 原逻辑
      const key = await setServerCacheData({ saveParam: data })
      await openHitekUdrTool(`${location.origin}/ilis2/reportIssueController.do?goIssueSignPage&cacheId=${key}`, 'max')
      checkReportIdGrant(data.reportIds[0], data)
    }
  }
  catch (err) {
    console.error(err)
    loading.value = false
    if (timer)
      clearTimeout(timer)
  }
}

// 取消签名
function cancelSignature() {
  if (timer)
    clearTimeout(timer)

  showPrintTip.value = false
  loading.value = false
}

// 确认发放、打印邮寄单并发放
async function confirmIssue(type?: 'print' | 'sign') {
  try {
    loading.value = true
    const data = await initSaveData()
    if (!data) {
      loading.value = false
      return
    }
    await issueSave(data)
    message.success('操作成功')
    onCancel()
    props.onConfirm({ saveData: data, type })
  }
  catch (err) {
    loading.value = false
    console.error(err)
  }
}

function onCancel() {
  showPrintTip.value = false
  visible.value = false

  if (timer)
    clearTimeout(timer)
}
</script>

<style>

</style>
