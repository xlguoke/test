<template>
  <a-modal
    :title="modalTitle"
    :width="modalWidth"
    :open="_value"
    :closable="false"
    :mask-closable="false"
    :destroy-on-close="true"
    :class="{
      'seal-apply-detail': isDetail,
    }"
  >
    <div class="seal-apply">
      <ComHeader>报告印章信息</ComHeader>
      <div class="seal-apply-twrap">
        <table class="seal-apply-table">
          <thead>
            <tr>
              <th width="5%">
                序号
              </th>
              <th width="15%">
                报告编号
              </th>
              <th width="15%">
                样品名称
              </th>
              <th width="20%">
                检测参数
              </th>
              <th width="20%">
                报告印章
              </th>
              <th width="25%">
                资质及参数覆盖情况
              </th>
            </tr>
          </thead>
        </table>
      </div>
      <div class="seal-apply-twrap">
        <table class="seal-apply-table" style="border-top: 0">
          <tbody>
            <tr v-for="item in reportList" :key="item.reportId">
              <td width="5%" align="center">
                1
              </td>
              <td width="15%">
                <span
                  style="color: #40a9ff; cursor: pointer"
                  @click="onCheckReport(item)"
                >{{ item.reportNum }}</span>
              </td>
              <td width="15%">
                {{ item.sampleName }}
              </td>
              <td width="20%">
                {{ item.params }}
              </td>
              <td width="20%">
                {{ item.qualifications }}
              </td>
              <td width="25%" class="seal-apply-params">
                <div
                  v-for="item2 in item.qualificationDetail"
                  :key="item2.qualificationId"
                >
                  <span v-if="item2.omitType == 10" style="color: #d9001b">
                    {{ item2.qualificationName }}：无参数
                  </span>
                  <span v-if="item2.omitType == 20" style="color: #f59a23">
                    {{ item2.qualificationName }}：未覆盖【{{
                      item2.omissiveParams
                    }}】
                  </span>
                  <span v-if="item2.omitType == 30" style="color: #70b603">
                    {{ item2.qualificationName }}：全覆盖
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <ComHeader v-if="haveProcess" class="mt-4">
        审核信息
      </ComHeader>
      <a-form v-if="haveProcess" ref="formRef" :model="formState">
        <template v-if="isDetail">
          <AuditorProcess
            ref="AuditorProcess"
            :label-col="2"
            :readonly="isDetail"
          />
          <FormLayout
            v-show="formLayoutData.length > 0"
            class="mt-2"
            :data-source="formLayoutData"
            :form-layout="{ labelCol: 2, wrapperCol: 8 }"
            :readonly="isDetail"
            :form-state="formState"
          ></FormLayout>
        </template>
        <ProcessForm
          v-else
          ref="processFormRef"
          :hide-remark="true"
          :show-copy-to="true"
          :process-type="processType"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 17 }"
        />
      </a-form>
    </div>

    <template #footer>
      <a-button @click="cancel">
        取消
      </a-button>
      <a-button type="primary" :loading="confirmLoading" @click="submit">
        确定
      </a-button>
    </template>
  </a-modal>
</template>

<script>
import { preSubmitProcess } from '~/components/commonProcess/api'
import { getQueryVariable } from '~/providers/common/utils'
import AuditorProcess from '~/providers/components/auditorProcess.vue'
import ComHeader from '~/providers/components/comHeader/index.vue'
import FormLayout from '~/providers/components/formLayout.vue'
import { rootUrl } from '~/providers/configs/rootUrl'
import { AuditProcessService } from '~/providers/providers/services/auditProcess'
import { StampAuditService } from '~/providers/providers/services/stamp-audit'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'

const auditProcessService = new AuditProcessService()
const stampAuditService = new StampAuditService()

export default {
  components: {
    ComHeader,
    FormLayout,
    AuditorProcess,
  },
  props: ['value', 'reportIds', 'tabValue'],
  emits: ['update:value', 'on-success'],
  data() {
    return {
      confirmLoading: false,
      reportList: [],
      formLayoutData: [],
      formType: {
        date: 'date',
        long: 'inputNumber',
        boolean: 'radio',
        select: 'select',
        string: 'input',
        default: 'input',
      },
      isDetail: false,
      formState: {},
      detailData: null,
      detailVisible: false,
      processType: '88',
      haveProcess: false,
    }
  },
  computed: {
    modalTitle() {
      return this.isDetail ? null : '提交用印申请'
    },
    modalWidth() {
      return this.isDetail ? '100%' : '60%'
    },
    _value() {
      return this.value || this.detailVisible
    },
  },
  watch: {
    _value(val) {
      if (val) {
        this.getReportList()
        this.getStartFormData()
        this.getProcessUserTaskList()
      }
    },
  },
  async created() {
    const { data } = await preSubmitProcess(this.processType)
    this.haveProcess = data?.haveProcess || false
    // 跳转查看的详情页
    if (getQueryVariable('detail')) {
      const load = window.$oAntdMessage.loading('数据加载中...', 0)
      await this.getReportListInDetail(getQueryVariable('businessKey'))
      await this.getDetail(getQueryVariable('processInstanceId'))
      load()
      this.detailVisible = true
      this.isDetail = true

      this.getReportList()
      this.getStartFormData()
      this.getProcessUserTaskList()
    }
  },
  methods: {
    async onCheckReport(item) {
      const res = await stampAuditService.reoortDetail(item.reportId)

      if (res.code !== 20010) {
        const { reportId, consignId, taskId, reportType } = res.data

        let isSynthesis = false
        if (reportType === 'synthesis' || reportType === 'synthesis_Temp') {
          isSynthesis = true
        }

        let url
          = `${rootUrl
          }/reportPrintController.do?goReportPrintDetail&reportId=${
            reportId}`
        url += `&consignIds=${consignId}`
        url += `&testTaskIds=${taskId}`
        url += `&reportType=${reportType}`
        url += `&isSynthesis=${isSynthesis}`
        url += '&moduleName=pdfStampSignPage'

        window.open(url, '报告打印详情')
      }
    },
    async getReportListInDetail(businessKey) {
      const res = await stampAuditService.getReportInfo(businessKey)
      this.reportList = res.data
    },
    async getProcessUserTaskList() {
      const { detailData } = this
      const res = await auditProcessService.getProcessUserTaskList(88)
      const personData = res.data

      if (detailData && detailData.presetAuditers) {
        for (let i = 0; i < personData.length; i++) {
          const item = personData[i]
          const detailItem = detailData.presetAuditers.filter(
            j => j.activitiNodeId == item.activitiNodeId,
          )

          if (detailItem?.length === 1) {
            item.presetUserId = detailItem[0].presetUserId
            item.presetUserRealName = detailItem[0].presetUserRealName
            item.presetUsername = detailItem[0].presetUsername
          }
          else if (detailItem?.length > 1) {
            personData[i] = detailItem?.map((i) => {
              return {
                presetUserId: i.presetUserId,
                presetUserRealName: i.presetUserRealName,
                presetUsername: i.presetUsername,
              }
            })
          }
        }

        this.$refs.AuditorProcess.personData = personData
        return
      }
      if (this.haveProcess) {
        this.$refs.AuditorProcess.personData = personData
      }
    },
    async getStartFormData() {
      const { detailData } = this
      const formProperties = detailData ? detailData.formProperties || {} : {}
      this.formState = formProperties

      const res = await auditProcessService.getStartFormData(88)
      this.formLayoutData = res.data.map(item => ({
        type: this.formType[item.type.name]
          ? this.formType[item.type.name]
          : this.formType.default,
        field: item.id,
        name: item.name,
        default: formProperties[item.id],
        data:
          this.formType[item.type.name] === 'radio'
            ? [
                { name: '是', value: '1' },
                { name: '否', value: '0' },
              ]
            : '',
        rules: item.required ? [] : '',
      }))
    },
    async getDetail(processInstanceId) {
      if (!processInstanceId) {
        return
      }

      const res = await auditProcessService.getProcessVariables(
        processInstanceId,
      )
      const data = res.data
      data.presetAuditers = data.presetAuditers
        ? JSON.parse(data.presetAuditers)
        : []
      data.formProperties = data.formProperties
        ? JSON.parse(data.formProperties)
        : {}
      this.detailData = res.data
    },
    async getReportList() {
      if (this.isDetail) {
        return
      }

      const res = await stampAuditService.paramDetail(this.reportIds.join(','))
      this.reportList = res.data
    },
    submit() {
      if (!this.haveProcess) {
        const values = { ...this.formState }
        this.onConfirm(async () => {
          this.confirmLoading = true
          await this.submitApi(values).finally(() => {
            this.confirmLoading = false
          })

          window.$oAntdMessage.success('操作成功！')
          $emit(this, 'on-success')
          $emit(this, 'update:value', false)
        })
        return
      }
      this.$refs.formRef.validateFields().then(() => {
        const values = { ...this.formState }
        this.onConfirm(async () => {
          this.confirmLoading = true
          await this.submitApi(values).finally(() => {
            this.confirmLoading = false
          })

          window.$oAntdMessage.success('操作成功！')
          $emit(this, 'on-success')
          $emit(this, 'update:value', false)
        })
      })
    },
    async submitApi() {
      const { reportIds } = this
      let data = {}
      if (this.haveProcess) {
        data = await this.$refs.processFormRef.getProcessFormData()
      }

      for (let i = 0; i < reportIds.length; i++) {
        // eslint-disable-next-line unused-imports/no-unused-vars
        const res = await stampAuditService.submit({
          id: reportIds[i],
          formPropertyJson: data?.formPropertyJson ? JSON.stringify(data.formPropertyJson) : '',
          presetAuditors: data?.presetAuditers ? JSON.stringify(data.presetAuditers) : '',
        })
      }
    },
    onConfirm(cb) {
      if (this.tabValue == '40') {
        window.$oAntdConfirm({
          title: '确定要重新提交用印申请吗？',
          content:
            '系统将重新提交审核，请确认是否继续提交。确认提交后，请前往“审核中”查看审核进度。',
          onOk: () => {
            cb()
          },
        })
        return
      }

      cb()
    },
    cancel() {
      if (this.tabValue == '40') {
        window.$oAntdConfirm({
          title: '提示',
          content:
            '报告印章信息已设置/更换成功，取消后请前往【用印申请-待提交】查看，您确定要取消吗？',
          onOk: () => {
            $emit(this, 'update:value', false)
            $emit(this, 'on-success')
          },
        })
        return
      }

      $emit(this, 'update:value', false)
    },
  },
}
</script>

<style lang="less" scoped>
.seal-apply {
  .seal-apply-params {
    padding: 0 !important;

    div {
      padding: 4px 8px;
    }

    div:not(:first-child) {
      border-top: solid 1px var(--colorSplit);
    }
  }

  .seal-apply-twrap {
    max-height: 168px;
    overflow-y: scroll;
  }

  .seal-apply-table {
    width: 100%;
    border-collapse: collapse;
    border-top: solid 1px var(--colorSplit);
    border-left: solid 1px var(--colorSplit);

    th {
      // background: #fafafa;
      text-align: center;
    }

    td,
    th {
      padding: 8px;
      border-right: solid 1px var(--colorSplit);
      border-bottom: solid 1px var(--colorSplit);
    }
  }
}
:deep(.ant-radio-wrapper),
:deep(.ant-form-item) {
  font-size: 12px;
}
</style>

<style lang="less">
.seal-apply-detail {
  max-width: 100%;
  top: 0;
  padding-bottom: 0;
  margin: 0;

  .ant-modal-content {
    border-radius: 0;
    height: 100%;
  }

  .ant-modal-content {
    display: flex;
    flex-direction: column;
    height: calc(100vh);
  }
  .ant-modal-body {
    flex: 1;
  }
  .ant-modal-footer {
    display: none;
  }
}
</style>
