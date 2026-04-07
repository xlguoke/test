<template>
  <div class="reportDetail">
    <van-sticky>
      <MobileTitleBar v-if="isDingTalk" />
      <MobileTitleBar v-else left-arrow @click-left="$router.go(-1)" />
    </van-sticky>

    <div v-if="!pageRequestError">
      <van-collapse v-model="activeNames">
        <van-collapse-item title="基础信息" name="0" icon="label-o">
          <div class="reportDetail-baseInfo">
            <van-field
              v-for="(item, index) in baseInfo"
              :key="index"
              v-model="reportBaseData[item.field]"
              label-width="5.4em"
              readonly
              center
              rows="1"
              autosize
              :label="item.name"
              type="textarea"
            />
          </div>
        </van-collapse-item>
        <van-collapse-item title="报告相关文件" name="1" icon="description">
          <div v-if="reportFiles.length > 0" class="reportDetail-file">
            <div
              v-for="item in reportFiles"
              :key="item.id"
              class="reportDetail-file-row"
            >
              <div
                class="reportDetail-file-icon"
                :style="`background: ${fileIconBgColor[item._fileType]}`"
                @click="handleFile(item)"
              >
                {{ item._fileType }}
              </div>
              <div class="reportDetail-file-info" @click="handleFile(item)">
                <div class="textOverflow2" style="font-size: 14px">
                  {{ item.name }}
                </div>
                <div style="font-size: 12px">
                  <span>{{ udrFileType[item.useType] }}</span>
                </div>
              </div>
              <div class="reportDetail-file-btn">
                <span v-if="udrPdfObj"></span>
                <van-loading
                  v-if="udrPdfObj[item.id] && udrPdfObj[item.id].loading"
                  type="spinner"
                  color="#1989fa"
                  size="24"
                />
                <van-button
                  v-if="
                    udrPdfObj[item.id]
                      && udrPdfObj[item.id].url
                      && !udrPdfObj[item.id].loading
                  "
                  size="small"
                  @click="convertUdr(item)"
                >
                  刷新UDR
                </van-button>
              </div>
            </div>
          </div>
          <div v-else>
            <van-empty description="无数据" />
          </div>
        </van-collapse-item>
        <van-collapse-item title="复核审批意见" name="2" icon="records">
          <ReviewApprovalOpinionsList
            :key="updateComponentKey"
            :report-id="id"
            :source-module="sourceModule"
            :report-state="reportBaseData.reportStatus"
            :readonly="isUnitCodeAuth"
          />
        </van-collapse-item>
      </van-collapse>

      <div v-if="!isUnitCodeAuth" class="reportDetail-btns">
        <van-button
          v-if="sourceModule === 4"
          block
          type="primary"
          @click="sginerStampSign"
        >
          签章
        </van-button>
        <van-button v-if="sourceModule === 4" block @click="toQualificationStamp">
          设置资质章
        </van-button>
        <van-button
          v-if="sourceModule === 4"
          block
          @click="toQualificationStampPage"
        >
          设置资质章页码
        </van-button>

        <van-button
          v-if="auditPermission"
          block
          type="primary"
          @click="toApprovalPage"
        >
          通过
        </van-button>
        <van-button
          v-if="approvalPermission"
          block
          type="primary"
          @click="toApprovalPage"
        >
          批准
        </van-button>
        <van-button v-if="rebackPermission" block @click="toReturnPage">
          退回
        </van-button>
        <van-button
          v-if="viewConsignPermission"
          loading-type="spinner"
          :loading-text="loadingConsignText"
          :loading="loadingConsign"
          block
          @click="viewConsign(false)"
        >
          查看委托单
        </van-button>

        <van-button
          v-if="viewConsignPermission && consignPdfUrl"
          loading-type="spinner"
          :loading="convertLoading"
          loading-text="刷新委托单"
          block
          @click="convertConsign"
        >
          刷新委托单
        </van-button>

        <van-button
          v-if="noticeModifyPermission"
          block
          @click="toNoticeModifyPage"
        >
          通知修改委托
        </van-button>
      </div>
    </div>
    <div v-else>
      <van-empty :description="pageRequestError" />
    </div>

    <SendCodePopup v-model:value="showSendCode" />

    <!-- 查看PDF -->
    <MobileCheckPDF ref="mobileCheckPDFRef" />
  </div>
</template>

<script>
import md5 from 'js-md5'
import { mapState } from 'pinia'
import qs from 'qs'
import {
  showDialog,
  showImagePreview,
  showLoadingToast,
} from 'vant'
import { usePermissionStore } from '~/store/permissionStore'
import MobileCheckPDF from '~/views/mobileApp/components/MobileCheckPDF.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { useAppIndustryHooks } from '~/views/mobileApp/hooks/useAppIndustryHooks'
import SignerObj from '~/views/mobileApp/libs/electronicSignature'
import { api } from '~/views/mobileApp/provides/api/api'
import { appConfig } from '~/views/mobileApp/provides/config/appConfig'
import { downloadFile } from '~/views/mobileApp/provides/utils/downloadFile'
import { formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { URLHelper } from '~/views/mobileApp/provides/utils/URLHelper'
import { useAppPageStateStore } from '~/views/mobileApp/store/useAppPageStateStore'
import { useReportStore } from '~/views/mobileApp/store/useReportStore'
import { useAppUserStore } from '~/views/mobileApp/store/useUserStore'
import ReviewApprovalOpinionsList from '../components/reviewApprovalOpinionsList/index.vue'
import SendCodePopup from '../components/sendCodePopup/index.vue'

export default {
  name: 'reportDetail',
  components: {
    ReviewApprovalOpinionsList,
    SendCodePopup,
    MobileTitleBar,
    MobileCheckPDF,
  },
  beforeRouteEnter(to, from, next) {
    if (
      from.name === 'reportAudit'
      || from.name === 'reportApproval'
      || from.name === 'electronicSignatureSeal'
    ) {
      const pageState = useAppPageStateStore().getPage('reportDetail')
      pageState.scrollTop = 0
      pageState.resetPage = true
      pageState.isSubmit = false
    }

    next()
  },
  beforeRouteLeave(to, from, next) {
    const fromPageState = useAppPageStateStore().getPage(from.name)

    if (from.name === 'reportDetail') {
      fromPageState.scrollTop = document.documentElement.scrollTop || 0
    }

    if (
      to.name === 'reportAudit'
      || to.name === 'reportApproval'
      || to.name === 'electronicSignatureSeal'
    ) {
      const toPageState = useAppPageStateStore().getPage(to.name)
      this.activeNames = ['0']
      if (fromPageState.isSubmit === true) {
        toPageState.resetPage = true
      }
    }

    this.pageRequestError = null
    next()
  },
  setup() {
    const { getIndustryField } = useAppIndustryHooks()

    return { getIndustryField }
  },
  data() {
    return {
      isDingTalk: false,
      id: undefined,
      sourceModule: undefined,
      consignId: undefined,
      reportBaseData: {},
      reportFiles: [],
      moreBtnVisible: false,
      otherBtn: [{ name: '打回本次修正' }, { name: '删除', color: 'red' }],
      activeNames: ['0'],
      baseInfo: [
        { name: '报告编号', field: 'reportNumber' },
        { name: '委托单位', field: 'consignUnitName' },
        { name: '工程项目', field: 'consignProjectName' },
        { name: '检测人员', field: '_testPerson' },
        { name: '报告编写', field: '_reportEdit' },
        { name: '复核', field: '_reAuditPerson' },
        { name: '审核', field: '_auditPerson' },
        { name: '批准', field: '_approvalPerson' },
        { name: '检测时间', field: '_testTime' },
        { name: '是否合格', field: '_isQualified' },
        { name: '检验结论', field: 'verdict' },
        { name: '备注', field: 'verdictRemark' },
        { name: '报告资质', field: '_qualificationNames' },
      ],
      udrFileType: {
        0: 'UDR录入模板',
        1: '报告文件',
        2: '记录文件',
        3: '附件',
        4: '首件报告',
        5: '历史报告文件',
      },
      noticeModifyPermission: false,
      viewConsignPermission: false,
      // 审核权限
      auditPermission: false,
      // 批准权限
      approvalPermission: false,
      // 退回权限
      rebackPermission: false,
      pageRequestError: null,
      updateComponentKey: 0,
      loadingConsign: false,
      convertLoading: false,
      loadingConsignText: '查看委托单',
      consignPdfUrl: '',
      udrPdfObj: {},
      pdfSrc: '',
      filename: '',
      showSendCode: false,
      // 单位编码，免登录访问时需要
      unitCode: null,
      // 第三方登录的系统类型
      systemType: null,
    }
  },
  computed: {
    fileIconBgColor() {
      return appConfig.fileIconBgColor
    },
    ...mapState(useReportStore, {
      opinions: 'approvalOpinions',
    }),
    ...mapState(useAppUserStore, ['userInfo']),
    // 通过单位编码访问（免登录）
    isUnitCodeAuth() {
      if (!['DingTalk'].includes(this.systemType) && this.unitCode && !this.userBaseInfo) {
        return true
      }
      return false
    },
    enableProject() {
      const item = this.getIndustryField('project')
      return item ? item.selected : false
    },
    enableIsQualified() {
      const item = this.getIndustryField('isQualified')
      return item ? item.selected : false
    },
  },
  created() {
    this.systemType = URLHelper.getUrlParam('systemType')
    this.unitCode = URLHelper.getUrlParam('unitCode')

    if (!this.enableProject) {
      this.baseInfo = this.baseInfo.filter(i => i.field !== 'consignProjectName')
    }

    if (!this.enableIsQualified) {
      this.baseInfo = this.baseInfo.filter(i => i.field !== '_isQualified')
    }
  },
  async activated() {
    const pageState = useAppPageStateStore().getPage('reportDetail')
    const { scrollTop, resetPage } = pageState

    window.scrollTo(0, scrollTop || 0)

    if (resetPage === true || resetPage === undefined || resetPage === null) {
      this.resetPage()
      pageState.resetPage = false
    }
  },
  methods: {
    async DingTalkAuth() {
      const systemType = URLHelper.getUrlParam('systemType')
      const userId = URLHelper.getUrlParam('userId')
      const unitCode = URLHelper.getUrlParam('unitCode')

      if (systemType === 'DingTalk') {
        // 是从钉钉跳转
        this.isDingTalk = true
        const res = await mRequest.post(
          `/ilis2/rest/auth/getUserToken`,
          {
            userId,
            unitCode,
            secretKey: md5(`ILIS_DingTalk_C421AAEE0D114E9C${userId}`),
            loginSystemType: systemType,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        )

        if (res.code === 20000) {
          sessionStorage.setItem('userTokenAuth', res.data)

          mRequest
            .post(`/ilis2/rest/loginController.do?GetCurUserInfo`)
            .then((res) => {
              if (res.success) {
                localStorage.setItem('userInfo', JSON.stringify(res.attributes))
              }
            })
        }
      }
    },
    viewPDF() {
      this.$refs.mobileCheckPDFRef.open(this.pdfSrc, this.filename)
    },
    handleFile(row) {
      if (
        row._fileType === 'JPG'
        || row._fileType === 'JPEG'
        || row._fileType === 'PNG'
      ) {
        showImagePreview([row.fileUrl])
      }
      else if (row._fileType === 'UDR') {
        this.getUdrPdf(row)
      }
      else if (row._fileType === 'PDF') {
        this.pdfSrc = row.fileUrl
        this.filename = row.name
        this.viewPDF()
      }
      else {
        downloadFile(row.fileUrl, row.name)
      }
    },
    async getUdrPdf(row, reconvert) {
      let fileType
      if (row.useType === '1') {
        fileType = 'report'
      }
      else if (row.useType === '2') {
        fileType = 'record'
      }
      else {
        return
      }

      if (this.udrPdfObj[row.id]) {
        if (reconvert !== true) {
          if (this.udrPdfObj[row.id].url) {
            this.pdfSrc = this.udrPdfObj[row.id].url
            this.viewPDF()
            return
          }
        }
        this.udrPdfObj[row.id].loading = true
      }
      else {
        this.udrPdfObj[row.id] = {
          loading: true,
        }
      }
      this.$forceUpdate()

      const res = await mRequest.get(
        this.isUnitCodeAuth ? '/api/app/udr/review' : '/rest/app/udr/review',
        {
          params: {
            reportId: this.id,
            fileType,
          },
          headers: this.isUnitCodeAuth
            ? { unitCode: this.unitCode }
            : undefined,
        },
      )

      if (res) {
        if (res.code === 20000) {
          if (res.data) {
            this.udrPdfObj[row.id].url = res.data
            this.udrPdfObj[row.id].loading = false
            this.$forceUpdate()
            this.pdfSrc = res.data
            this.viewPDF()
          }
          else if (res.message) {
            setTimeout(() => {
              this.getUdrPdf(row, reconvert)
            }, 2000)
          }
        }
        else if (res.code === 20010) {
          this.udrPdfObj[row.id].loading = false
          showDialog({ message: res.message || res.msg || '转换失败' })
        }
      }
    },
    async convertUdr(row) {
      let fileType
      if (row.useType === '1') {
        fileType = 'report'
      }
      else if (row.useType === '2') {
        fileType = 'record'
      }
      else {
        return
      }

      this.udrPdfObj[row.id].loading = true
      this.$forceUpdate()

      const res = await mRequest.get(api.common.udrConvert, {
        params: {
          reportId: this.id,
          fileType,
        },
      })

      if (res) {
        if (res.code === 20000) {
          if (res.data) {
            this.udrPdfObj[row.id].url = res.data
            this.udrPdfObj[row.id].loading = false
            this.$forceUpdate()
            this.pdfSrc = res.data
            this.viewPDF()
          }
          else if (res.message) {
            setTimeout(() => {
              this.getUdrPdf(row, true)
            }, 2000)
          }
        }
        else if (res.code === 20010) {
          this.udrPdfObj[row.id].loading = false
          this.$forceUpdate()
          showDialog({ message: res.message || res.msg || '转换失败' })
        }
      }
    },
    async resetPage() {
      const { id, sourceModule, consignId } = this.$route.params
      this.id = id
      this.sourceModule = Number(sourceModule)
      this.consignId = consignId

      this.convertLoading = false
      this.loadingConsign = false
      this.loadingConsignText = '查看委托单'
      this.consignPdfUrl = ''
      this.udrPdfObj = {}

      await this.DingTalkAuth()

      await this.getDetail()
      this.getReportQuestion()
      this.getReportFile()
      this.updateComponentKey = new Date().getTime()
    },
    // 获取报告复核审批意见
    async getReportQuestion() {
      const reportStore = useReportStore()
      reportStore.getOpinions({
        reportId: this.id,
        sourceModule: this.sourceModule,
      })
    },
    // 获取基本信息
    async getDetail() {
      const toast = showLoadingToast({
        duration: 0,
        forbidClick: true,
      })
      const res = await mRequest.post(
        this.isUnitCodeAuth
          ? '/api/app/reportAppController/getReport'
          : '/rest/app/reportAppController/getReport',
        qs.stringify({
          reportId: this.id,
        }),
        this.isUnitCodeAuth
          ? { headers: { unitCode: this.unitCode } }
          : undefined,
      ).finally(() => {
        toast.close()
      })

      if (res && res.code === 20000) {
        const reportBaseData = res.data
        if (
          reportBaseData.reportPersonVos
          && reportBaseData.reportPersonVos.length > 0
        ) {
          reportBaseData._testPerson = reportBaseData.reportPersonVos
            .filter(i => i.type === '6')
            .map(i => i.userRealName)
            .toString()
          reportBaseData._reportEdit = reportBaseData.reportPersonVos
            .filter(i => i.type === '2')
            .map(i => i.userRealName)
            .toString()
          reportBaseData._auditPerson = reportBaseData.reportPersonVos
            .filter(i => i.type === '4')
            .map(i => i.userRealName)
            .toString()
          reportBaseData._approvalPerson = reportBaseData.reportPersonVos
            .filter(i => i.type === '5')
            .map(i => i.userRealName)
            .toString()
          reportBaseData._reAuditPerson = reportBaseData.reportPersonVos
            .filter(i => i.type === '3')
            .map(i => i.userRealName)
            .toString()
        }

        if (reportBaseData.testTimeBegin && reportBaseData.testTimeEnd) {
          reportBaseData._testTime = `${formatDate(
            reportBaseData.testTimeBegin,
            'YYYY-MM-DD',
          )} ~ ${formatDate(reportBaseData.testTimeEnd, 'YYYY-MM-DD')}`
        }

        const reportSummaryRes = await mRequest.get(
          this.isUnitCodeAuth
            ? `/api/reportController/reportSummary/${this.id}`
            : `/rest/reportController/reportSummary/${this.id}`,
          this.isUnitCodeAuth
            ? { headers: { unitCode: this.unitCode } }
            : undefined,
        )

        if (reportSummaryRes.code && reportSummaryRes.code === 20000) {
          reportBaseData._qualificationNames
            = reportSummaryRes.data.qualificationNames
        }

        /** 是否合格 0:不合格  1:合格  2:不做判定 */
        if (reportBaseData.isQualified === '0') {
          reportBaseData._isQualified = '否'
        }
        else if (reportBaseData.isQualified === '1') {
          reportBaseData._isQualified = '是'
        }
        else {
          reportBaseData._isQualified = '不判定'
        }
        const reg = /\n+/g
        if (reportBaseData.verdict) {
          reportBaseData.verdict = reportBaseData.verdict
            .replace(/@+/g, '\n')
            .replace(reg, '\n')
        }
        if (reportBaseData.verdictRemark) {
          reportBaseData.verdictRemark = reportBaseData.verdictRemark
            .replace(/@+/g, '\n')
            .replace(reg, '\n')
        }

        this.reportBaseData = reportBaseData

        if (!this.isUnitCodeAuth) {
          this.checkBtnPermission(reportBaseData)
        }
      }
      else {
        this.pageRequestError = res.msg || res.message || '数据异常'
      }
    },
    // 获取报告相关文件
    async getReportFile() {
      const res = await mRequest.post(
        this.isUnitCodeAuth
          ? '/api/wordReportController.do?getReportFileTree'
          : '/wordReportController.do?getReportFileTree',
        qs.stringify({
          reportId: this.id,
        }),
        this.isUnitCodeAuth
          ? { headers: { unitCode: this.unitCode } }
          : undefined,
      )

      if (res.rows) {
        this.reportFiles = res.rows
          .filter(item => item.type === 'file' && item.useType !== '0')
          .map(item => ({
            ...item,
            _fileType: item.fileType
              ? item.fileType.toLocaleUpperCase()
              : this.getFileType(item.fileUrl),
          }))
      }
    },
    // 获取附件的后缀名
    getFileType(name) {
      if (name) {
        const arr = name.split('.')
        const type = arr[arr.length - 1].toLocaleUpperCase()
        return type
      }
      else {
        return ''
      }
    },
    // 按钮权限
    checkBtnPermission(data) {
      const { hasPermission } = usePermissionStore()

      // 审核按钮
      this.auditPermission
        = data.reportStatus === '15'
          && this.sourceModule === 2
          && hasPermission('mobile_reportAuditSubmit')

      // 批准按钮
      this.approvalPermission
        = data.reportStatus === '20'
          && this.sourceModule === 3
          && hasPermission('mobile_reportApprovalSubmit')

      // 退回权限
      this.rebackPermission
        = (data.reportStatus === '15'
          && this.sourceModule === 2
          && hasPermission('mobile_reportAuditBack'))
        || (data.reportStatus === '20'
          && this.sourceModule === 3
          && hasPermission('mobile_reportApprovalBack'))
        || (this.sourceModule === 4
          && hasPermission('mobile_electronicSignatureSealBack'))

      // 通知修改委托
      if (
        ((this.sourceModule === 2
          && hasPermission('mobile_reportAuditNoticeModify'))
        || (this.sourceModule === 3
          && hasPermission('mobile_reportApprovalNoticeModify'))
        || (this.sourceModule === 4
          && hasPermission('mobile_electronicSignatureSealModify')))
        && (data.reportStatus === '15'
          || data.reportStatus === '20'
          || (this.sourceModule === 4 && data.reportStatus === '30'))
        && data.reportType !== 'synthesis'
        && data.reportType !== 'synthesis_Temp'
      ) {
        this.noticeModifyPermission = true
      }
      else {
        this.noticeModifyPermission = false
      }

      // 查看委托
      if (
        data.reportType !== 'synthesis'
        && data.reportType !== 'synthesis_Temp'
      ) {
        this.viewConsignPermission = true
      }
      else {
        this.viewConsignPermission = false
      }
    },
    // 通过
    toApprovalPage() {
      if (
        this.opinions.filter(item => item.status === '0' || item.status === '2')
          .length > 0
      ) {
        showDialog({
          message: '复核审批意见表中，存在未关闭的问题，请处理后再操作',
        })
        return
      }

      this.$router.push({
        name: 'reportSubmitForm',
        params: {
          id: this.id,
          reportState: this.reportBaseData.reportStatus,
          reportCode: this.reportBaseData.reportNumber,
          sourceModule: this.sourceModule,
        },
      })
    },
    // 退回
    toReturnPage() {
      this.$router.push({
        name: 'reportReturnForm',
        params: {
          id: this.id,
          reportState: this.reportBaseData.reportStatus,
          reportType: this.reportBaseData.reportType,
          reportCode: this.reportBaseData.reportNumber,
        },
      })
    },
    // 通知修改委托
    toNoticeModifyPage() {
      this.$router.push({
        name: 'reportNoticeModifyForm',
        params: {
          id: this.id,
          reportState: this.reportBaseData.reportStatus,
          reportCode: this.reportBaseData.reportNumber,
        },
      })
    },
    // 查看委托
    async viewConsign(reconvert) {
      if (this.consignPdfUrl && !reconvert) {
        this.pdfSrc = this.consignPdfUrl
        this.viewPDF()
        return
      }

      !reconvert && (this.loadingConsign = true)
      const res = await mRequest({
        method: 'post',
        url: api.common.getConsignPdf,
        data: qs.stringify({
          consignId: this.consignId,
        }),
        timeout: 35 * 1000,
      })

      if (res && res.code === 20010) {
        !reconvert && (this.loadingConsign = false)

        !reconvert && (this.loadingConsignText = '查看委托单')
        showDialog({ message: res.message || res.msg || '转换异常' })
      }
      else if (res && res.code === 20000) {
        !reconvert && (this.loadingConsign = false)

        !reconvert && (this.loadingConsignText = '查看委托单')
        this.consignPdfUrl = res.data
        this.pdfSrc = this.consignPdfUrl
        this.viewPDF()
      }
      else if (res && res.code === 20020) {
        !reconvert && (this.loadingConsignText = res.message || res.msg || '委托单转换中')
        this.$forceUpdate()
        setTimeout(() => {
          this.viewConsign(reconvert)
        }, 2000)
      }
    },
    // 重新转换委托
    async convertConsign() {
      this.convertLoading = true
      const res = await mRequest({
        method: 'post',
        url: api.common.convertConsign2PDF,
        data: qs.stringify({
          consignId: this.consignId,
        }),
        timeout: 35 * 1000,
      })

      this.convertLoading = false
      if (res && res.code === 20000) {
        this.viewConsign(true)
      }
      else {
        showDialog({ message: res.message || res.msg || '转换失败' })
      }
    },
    // 签章
    sginerStampSign() {
      this.reportBaseData.reportId = this.reportBaseData.id
      SignerObj.signConfirm({
        context: this,
        signerServerType: 'stamp',
        reportData: this.reportBaseData,
      })
    },
    // electronicSignature.js 调用
    reloadPageData() {
      const pageState = useAppPageStateStore().getPage('reportDetail')
      pageState.isSubmit = true
      this.$router.go(-1)
    },
    // 设置资质章
    toQualificationStamp() {
      this.$router.push({
        name: 'qualificationStamp',
        params: {
          reportId: this.reportBaseData.id,
        },
      })
    },
    // 设置资质章页码
    toQualificationStampPage() {
      this.$router.push({
        name: 'qualificationStampPage',
        params: {
          reportId: this.reportBaseData.id,
        },
      })
    },
  },
}
</script>

<style lang="less" scoped>
@import url('./index.less');
</style>
