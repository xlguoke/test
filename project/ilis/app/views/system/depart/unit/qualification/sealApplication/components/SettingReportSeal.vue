<template>
  <ht-modal
    v-model:open="_value"
    title="选择印章"
    :mask-closable="false"
    :width="640"
  >
    <a-alert
      type="info"
      show-icon
    >
      <template #message>
        <p>
          1.签章方式为“图片签章”的印章，请在生成PDF文件之前（提交报告或批准通过）设置，否则PDF文件上将无法添加图片印章
          <a v-if="!tipExpand" @click="tipExpand = true">
            展开
            <DownOutlined />
          </a>
        </p>
        <template v-if="tipExpand">
          <p>
            2.生成PDF之前添加的签章方式为“图片签章”的印章，在生成PDF之后若进行取消，需重新转换PDF文件来更新签章
          </p>
          <p>
            3.当开启系统控制参数“自动添加参数超资信息到报告附加声明中”，且已转换成PDF时，若修改后的“资质”类型印章与附加声明中的内容不匹配，需重新转换PDF文件来更新报告附加声明
          </p>
          <p>
            4.若无“资质”类型印章，则是因为系统控制“报告设置资质章时，资质对应报告参数全覆盖”，请检查选择的报告参数资质是否相同！
            <a @click="tipExpand = false">
              收起
              <UpOutlined />
            </a>
          </p>
        </template>
      </template>
    </a-alert>
    <a-table
      :columns="columns"
      :data-source="data"
      :loading="loading"
      row-key="sealId"
      bordered
      :pagination="false"
      :scroll="{ y: 280 }"
      :row-selection="rowSelection"
    >
      <template #headerCell="{ column }">
        <template v-if="column.dataIndex === 'autoSign'">
          打印即标记已签章
          <a-tooltip placement="top">
            <template #title>
              <span>开启后，在打印报告时，有该印章的报告，将自动标记为已签章</span>
            </template>
            <QuestionCircleOutlined style="color: #1890ff" />
          </a-tooltip>
        </template>
      </template>

      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'sealName'">
          {{ record.sealName }}
          <a-tag
            v-if="record.sealType == 'QUALIFY'"
            color="#f59a23"
            :title="record.qualificationName"
          >
            资质
          </a-tag>
          <a-tag v-else color="#97c21c" :title="record.qualificationName">
            其他
          </a-tag>
        </template>
      </template>
    </a-table>

    <template #footer>
      <a-button @click="cancel">
        关闭
      </a-button>
      <a-button type="primary" :loading="submitLoading" @click="submit">
        确定
      </a-button>
    </template>
  </ht-modal>
</template>

<script>
import { DownOutlined, InfoCircleOutlined, QuestionCircleOutlined, UpOutlined } from '@ant-design/icons-vue'
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import { SealService } from '~/providers/providers/services/common-body-seal'
import { CommonBodyReportService } from '~/providers/providers/services/common-body-report'
import { StampAuditService } from '~/providers/providers/services/stamp-audit'
import { ReportFileControllerService } from '~/providers/providers/services/reportFileController'
import { $emit, $off, $on, $once } from '~/providers/transformUtils/gogocodeTransfer'

const sealService = new SealService()
const commonBodyReportService = new CommonBodyReportService()
const stampAuditService = new StampAuditService()
const reportFileControllerService = new ReportFileControllerService()

export default {
  components: {
    DownOutlined, InfoCircleOutlined, QuestionCircleOutlined, UpOutlined
  },
  data() {
    return {
      data: [],
      selectedRowKeys: [],
      selectedRows: [],
      columns: [
        {
          title: '印章名称',
          dataIndex: 'sealName',
          width: '40%',
          scopedSlots: { customRender: 'sealName' },
        },
        {
          title: '签章方式',
          dataIndex: 'signType',
          width: '30%',
          customRender: ({ text: val }) => {
            if (val === 'notSign') return '不签章'
            if (val === 'picSign') return '图片签章'
            if (val === 'eleSign') return '电子签章'
            return ''
          },
        },
        {
          dataIndex: 'autoSign',
          slots: { title: 'autoSignTh' },
          customRender: ({ text: val }) => {
            return val ? '是' : '否'
          },
          width: '30%',
        },
      ],
      loading: false,
      submitLoading: false,
      tipExpand: false,
    }
  },
  props: ['value', 'reportIds', 'reports', 'tabValue', 'apiType'],
  watch: {
    value(val) {
      if (val) {
        this.getSelectedData()
        this.getData()
      } else {
        this.cancel()
      }
    },
  },
  computed: {
    rowSelection() {
      return {
        selectedRowKeys: this.selectedRowKeys,
        onChange: (keys, rows) => {
          this.selectedRowKeys = keys
          this.selectedRows = rows
        },
      }
    },
    _value() {
      return this.value
    },
  },
  methods: {
    async getSelectedData() {
      const res = await commonBodyReportService.batch(this.reportIds.join(','))
      this.selectedRowKeys = res.data.map((i) => i.sealId)
      this.selectedRows = res.data
    },
    async getData() {
      this.loading = true
      let res
      if (this.apiType == 2) {
        res = await sealService.seals(this.reportIds.join(',')).finally(() => {
          this.loading = false
        })
      } else {
        res = await sealService.list().finally(() => {
          this.loading = false
        })
      }
      this.data = res.data
    },
    async verify(cb) {
      const { selectedRows, reports, selectedRowKeys } = this
      const content = []
      const notChangeList = []
      const submitList = []
      const convertPdfList = []

      this.submitLoading = true
      for (let i = 0; i < reports.length; i++) {
        const item = reports[i]
        const res = await stampAuditService.verify({
          reportId: item.reportId,
          sealIds: selectedRowKeys.join(','),
        })
        const {
          picStampChange,
          extraStatementChange,
          sealChange,
          qualificationStatementChange,
        } = res.data

        if (qualificationStatementChange) {
          content.push(
            `报告[${item.reportNumber}]已生成PDF文件，需重新转换文件以更新资质声明；`
          )
          convertPdfList.push(item)
        }

        if (!sealChange) {
          if (this.tabValue == '40') {
            content.push(
              `报告[${item.reportNumber}]的印章信息未发生变化，不会重新提交用印申请；`
            )
            notChangeList.push(item.reportId)
          }
          continue
        }

        if (!picStampChange && !extraStatementChange) {
          submitList.push(item)
          continue
        }

        if (extraStatementChange) {
          content.push(
            `报告[${item.reportNumber}]已生成PDF文件，需重新转换文件以更新报告附加声明；`
          )
        }

        if (picStampChange) {
          content.push(
            `报告[${item.reportNumber}]已生成PDF文件，需重新转换文件以更新图片签章；`
          )
        }

        // qualificationStatementChange为true时，前面已经push过了
        if (!qualificationStatementChange) {
          convertPdfList.push(item)
        }
      }
      this.submitLoading = false

      if (this.tabValue == '40' && notChangeList.length == reports.length) {
        window.$oAntdModal.error({
          title: '报告印章未发生变化！',
          content: '报告印章信息未发生变化，无需再次提交用印申请！',
          okText: '确定',
        })
        this.cancel()
        return
      }

      if (content.length == 0) {
        cb(notChangeList, submitList)
        return
      }

      window.$oAntdConfirm({
        title: '确定要修改印章信息吗？',
        content: (h) =>
          h(
            'div',
            content.map((c) => h('div', c))
          ),
        onOk: async () => {
          this.submitLoading = true
          convertPdfList.map(async (item) => {
            await reportFileControllerService.reconvertReport(item.reportId)
          })
          this.submitLoading = false

          setTimeout(() => {
            cb(notChangeList, submitList)
          }, 300)
        },
      })
    },
    async convertPdf(reportList) {
      // Promise.all(reportList.map(i => ))
    },
    async submit() {
      const { selectedRows, reportIds } = this
      const formData = []

      if (!selectedRows.length) {
        window.$oAntdMessage.warn('请选择报告印章！')
        return
      }

      if (!selectedRows.find((i) => i.qualificationId)) {
        window.$oAntdMessage.warn('至少选择一个资质印章！')
        return
      }

      this.verify(async (notChangeList, submitList) => {
        reportIds
          .filter((id) => !notChangeList.includes(id))
          .map((i) => {
            selectedRows.map((j) => {
              formData.push({
                reportId: i,
                qualificationId: j.qualificationId,
                qualificationName: j.qualificationName,
                sealId: j.sealId,
                sealName: j.sealName,
              })
            })
          })

        this.submitLoading = true
        const res = await commonBodyReportService
          .batchSave(formData)
          .finally(() => {
            this.submitLoading = false
          })

        $emit(this, 'on-success')
        this.cancel()

        if (submitList.length > 0 && this.tabValue == '40') {
          $emit(this, 'on-submit', submitList)
        } else {
          window.$oAntdMessage.success('操作成功！')
        }
      })
    },
    cancel() {
      $emit(this, 'update:value', false)
      this.selectedRowKeys = []
      this.selectedRows = []
    },
  },
  emits: ['on-submit', 'update:value', 'on-success'],
}
</script>

<style lang="less" scoped>
.tip {
  padding: 8px 8px 8px 32px;
  background: #e5f3ff;
  position: relative;
  margin-bottom: 16px;
  & > .anticon {
    position: absolute;
    left: 10px;
    top: 10px;
    font-size: 16px;
    color: var(--colorPrimary);
  }
}
</style>
