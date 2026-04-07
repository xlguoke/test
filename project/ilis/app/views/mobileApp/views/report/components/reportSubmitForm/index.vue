<template>
  <div class="reportApproval">
    <van-sticky>
      <MobileTitleBar
        :title="reportState === '15' ? '审核通过' : '批准通过'"
        left-arrow
        @click-left="$router.go(-1)"
      />
    </van-sticky>

    <div>
      <div class="reportApproval-code">
        {{ reportCode }}
      </div>

      <FormItemDate
        v-if="reportState === '20'"
        v-model:value="signDate"
        label-width="100px"
        label="签发日期"
        required
        placeholder="请选择"
      />

      <FormItemDate
        v-if="reportState === '15'"
        v-model:value="operateTime"
        label-width="100px"
        label="报告审核日期"
        placeholder="请选择"
      />

      <FormItemInput
        v-model:value="comment"
        label-width="100px"
        rows="1"
        autosize
        label="审核意见"
        type="textarea"
        placeholder="请输入审核意见"
      />
    </div>

    <div class="reportApproval-btns">
      <van-row>
        <van-col span="12">
          <van-button block type="primary" square @click="ok">
            确定
          </van-button>
        </van-col>
        <van-col span="12">
          <van-button block square @click="onCancel">
            取消
          </van-button>
        </van-col>
      </van-row>
    </div>

    <SendCodePopup v-model:value="showSendCode" />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import qs from 'qs'
import { showDialog, showLoadingToast, showNotify } from 'vant'
import FormItemDate from '~/views/mobileApp/components/MobileFormItem/FormItemDate.vue'
import FormItemInput from '~/views/mobileApp/components/MobileFormItem/FormItemInput.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import SignerObj from '~/views/mobileApp/libs/electronicSignature'
import { api } from '~/views/mobileApp/provides/api/api'
import { formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { useAppPageStateStore } from '~/views/mobileApp/store/useAppPageStateStore'
import SendCodePopup from '../sendCodePopup/index.vue'

export default {
  components: {
    SendCodePopup,
    MobileTitleBar,
    FormItemDate,
    FormItemInput,
  },
  beforeRouteLeave(to, from, next) {
    if (this.isSubmit === true) {
      if (this.isSetRoute === true) {
        next()
      }
      else {
        const pageState = useAppPageStateStore().getPage(to.name)
        pageState.resetPage = true

        const routerObj = { name: to.name, params: { ...to.params } }
        this.isSetRoute = true

        if (to.name === 'reportDetail') {
          // pageState.isSubmit = true
          useAppPageStateStore().getPage('reportAudit').resetPage = true
          useAppPageStateStore().getPage('reportApproval').resetPage = true
          this.$router.go(-1)
        }
        else {
          this.$router.replace(routerObj)
        }
      }
    }
    else {
      next()
    }
  },
  data() {
    return {
      id: this.$route.params.id,
      reportState: this.$route.params.reportState,
      reportCode: this.$route.params.reportCode,
      sourceModule: this.$route.params.sourceModule,
      comment: '',
      signDate: dayjs().format('YYYY-MM-DD'),
      operateTime: '',
      isSubmit: false,
      isSetRoute: false,
      approvalData: {},
      showSendCode: false,
      reportData: {},
      signTypeObj: {
        2: 'audit', // 报告审核
        3: 'approve', // 报告批准
      },
    }
  },
  created() {
    // 报告批准时，从详情接口获取其他数据
    if (this.sourceModule === '3') {
      this.getDetail()
    }
    else if (this.sourceModule === '2') {
      this.getReportCodeAndDate()
    }
  },
  methods: {
    async getReportCodeAndDate() {
      const toast = showLoadingToast({
        duration: 0,
        forbidClick: true,
      })
      const res = await mRequest
        .post(
          '/reportController.do?getReportCodeAndDate',
          qs.stringify({
            reportIds: this.id,
          }),
        )
        .finally(() => {
          toast.close()
        })

      const obj = res.obj ? res.obj[0] : {}

      this.operateTime = obj.auditDate || dayjs().format('YYYY-MM-DD')
    },
    async getDetail() {
      const toast = showLoadingToast({
        duration: 0,
        forbidClick: true,
      })
      const res = await mRequest.post(
        api.report.reportDetail,
        qs.stringify({
          reportId: this.id,
        }),
      ).finally(() => {
        toast.close()
      })
      const obj = res.data
      this.reportData = obj
      this.approvalData = {
        testObjectId: obj.testObjectId,
        testTaskId: obj.testTaskId,
        attId: obj.reportFileAttachmentId,
        id: obj.id,
      }
      if (obj.signDate) {
        this.signDate = formatDate(obj.signDate, 'YYYY-MM-DD')
      }
    },
    async getTempLoginToken() {
      const res = await mRequest.post(api.common.getTempToken)
      if (res.success) {
        return res.obj
      }
      else {
        showDialog({ message: '请求授权失败' })
      }
    },
    // 批准通过后执行
    async approvalCallback() {
      // 此处使用PC端的逻辑

      // 获取udr文件
      const udrRes = await mRequest.post(
        api.report.getUdrAttachment,
        qs.stringify({
          testTaskId: this.approvalData.testTaskId,
          reportId: this.approvalData.id,
        }),
      )

      // 查询，是否多任务合并出报告
      const businessParam = await mRequest.post(
        api.common.getBusinessParam,
        qs.stringify({
          testTaskId: this.approvalData.testTaskId,
          testObjectId: this.approvalData.testObjectId,
        }),
      )
      const mergeReport = businessParam.obj === 'Y'

      let paramString = `&testObjectId=${this.approvalData.testObjectId}`
      if (mergeReport) {
        // 合并出报告，随便传一个任务ID就可以了
        paramString += `&testTaskId=${
          this.approvalData.testTaskId.split(',')[0]
        }`
      }
      else {
        paramString += `&testTaskId=${this.approvalData.testTaskId}`
      }
      // 报告ID
      paramString += `&reportId=${this.approvalData.id}`
      // 取报告文件ID
      paramString += `&attId=${this.approvalData.attId}`

      // 重新獲取token 怕超时
      const tokenQuestion = await this.getTempLoginToken()
      const printQuestionPdfUrl = `/ilis2/udrController.do?goUdrPrintCommonPdf&udrType=questionPdf${paramString}&token=${tokenQuestion}`
      mRequest.post(
        api.report.udrConvert2Pdf,
        qs.stringify({ url: printQuestionPdfUrl }),
      )

      // 没有含有 UDR报告，则跳过，不做UDR到PDF的文件转换 以pdf 流转的前面已经转过了
      // 修改有 一个udr 记录的时候也要转
      if (
        !udrRes.attributes.haveUdr
        || (udrRes.attributes.roundType
          && udrRes.attributes.roundType.toLowerCase() === 'pdf'.toLowerCase())
      ) {
        return
      }

      const token = await this.getTempLoginToken()
      const printPdfUrl = `/ilis2/udrController.do?goUdrPrintPdf&udrReadOnly=1${paramString}&token=${token}`
      mRequest.post(
        api.report.udrConvert2Pdf,
        qs.stringify({ url: printPdfUrl }),
      )
    },
    async ok() {
      const toast = showLoadingToast({
        duration: 0,
        forbidClick: true,
      })

      let res = {}

      if (this.reportState === '15') {
        res = await mRequest.post(
          api.report.auditPass,
          {
            reportOperateTimeList: [
              { reportId: this.id, operateTime: this.operateTime },
            ],
            comment: this.comment,
          },
          {
            headers: {
              'Content-Type': 'application/json;charset=UTF-8',
            },
          },
        ).finally(toast.close)
      }
      else if (this.reportState === '20') {
        res = await mRequest.post(
          api.report.approvePass,
          qs.stringify({
            reportId: this.id,
            comment: this.comment,
            signDate: this.signDate,
          }),
        ).finally(() => {
          toast.close()
        })
      }

      if (res.success) {
        const _reportId = await this.checkReportSigner()
        if (_reportId) {
          this.reportData.reportId = _reportId
          SignerObj.goSign({
            context: this,
            reportData: this.reportData,
            signType: this.signTypeObj[this.sourceModule],
          })
          return
        }
        this.reloadPageData()
      }
      else {
        showDialog({ message: res.msg || res.message || '操作失败' })
      }
    },
    async reloadPageData() {
      showNotify({ type: 'success', message: '操作成功' })
      if (this.sourceModule === '3') {
        await this.approvalCallback()
      }
      this.isSubmit = true
      this.$router.go(-1)
    },
    // 检查当前报告是否需要签字
    async checkReportSigner() {
      return await mRequest
        .post(
          api.report.getSignProcess,
          {
            reportIds: [this.id],
            signType: this.signTypeObj[this.sourceModule] || '',
          },
          {
            headers: { 'Content-Type': 'application/json' },
          },
        )
        .then((res) => {
          if (res.code === 20000) {
            const _id = res.data && res.data.length > 0 ? res.data[0] : ''
            return Promise.resolve(_id)
          }
          else {
            return Promise.resolve('')
          }
        })
        .catch(() => {
          return Promise.resolve('')
        })
    },
    onCancel() {
      this.$router.go(-1)
    },
  },
}
</script>

<style lang="less" scoped>
@import url('./index.less');
</style>
