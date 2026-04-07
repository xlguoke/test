<template>
  <div class="equipmentOutgo">
    <a-spin :spinning="spinning">
      <div class="spin-content">
        <a-space>
          <a-input
            v-model:value="quickQryParam"
            placeholder="请输入设备名称、编号、规格型号"
            style="width: 300px"
            @press-enter="handleSearch()"
          />
          <a-button type="primary" @click="handleSearch">
            查询
          </a-button>
          <a-button @click="handleReset">
            重置
          </a-button>
        </a-space>
        <div style="padding: 10px 0">
          <a-button type="primary" @click="addEditRow">
            新购设备
          </a-button>
          <a-button @click="setBuyApply">
            同步购置申请
          </a-button>
          <a-dropdown>
            <template #overlay>
              <a-menu @click="printFun">
                <a-menu-item :key="1">
                  打印设备固定资产验收单
                </a-menu-item>
                <a-menu-item :key="2">
                  打印标准物质（设备型）购置登记表
                </a-menu-item>
              </a-menu>
            </template>
            <a-button>
              打印
            </a-button>
          </a-dropdown>
        </div>
        <a-table
          id="tableBox"
          :columns="columns"
          :pagination="data.length > 0 ? pagination : false"
          :data-source="data"
          bordered
          :row-selection="rowSelection"
          row-key="id"
        >
          <template #bodyCell="{ column, record, text }">
            <template v-if="column.dataIndex === 'amount'">
              <span> {{ text }} {{ record.amountUnit }} </span>
            </template>

            <template v-if="column.dataIndex === 'status'">
              <span>
                {{ applyStatusObj[text] }}
              </span>
            </template>

            <template v-if="column.dataIndex === 'operation'">
              <div class="table-handle">
                <a
                  v-if="record.status !== '40' && record.status !== '70'"
                  @click="(e) => cancelRow(e, record)"
                >删除</a>
                <a
                  v-if="
                    record.status !== '20'
                      && record.status !== '40'
                      && record.status !== '50'
                      && record.status !== '70'
                      && record.status !== '80'
                  "
                  @click="(e) => addEditRow(e, record)"
                >编辑</a>
                <a
                  v-if="record.status === '30' || record.status === '60'"
                  @click="(e) => submitRow(e, record)"
                >提交</a>
                <a
                  v-if="record.status === '50'"
                  @click="(e) => addEditRow(e, record, '', 'acceptance')"
                >验收完成</a>
                <a
                  v-if="record.status === '20'"
                  @click="(e) => addEditRow(e, record, '', 'register')"
                >购置完成</a>
                <a @click="(e) => addEditRow(e, record, true)">详情</a>
                <a @click="(e) => viewLog(e, record)">日志</a>
              </div>
            </template>
          </template>
        </a-table>
      </div>
    </a-spin>
    <ht-modal
      :title="addEditTitle"
      centered
      :open="visible"
      :mask-closable="false"
      width="800px"
      class="hitek-add-modal"
      @cancel="handleCancel"
    >
      <!-- class="addModalBox" -->
      <AddEditComponent ref="AddEditComponent" :callback="getData" />
      <template #footer>
        <div>
          <a-button v-if="!isDetail" @click="handleCancel">
            取消
          </a-button>
          <a-button v-if="!isDetail" type="primary" :loading="loading" @click="handleOk">
            确定
          </a-button>
          <a-button v-if="isDetail" type="primary" @click="handleCancel">
            关闭
          </a-button>
          <div style="clear: both"></div>
        </div>
      </template>
    </ht-modal>
    <!-- 同步购置申请 -->
    <ht-modal
      title="同步购置申请"
      centered
      :open="syncVisible"
      :mask-closable="false"
      class="hitek-add-modal"
      width="80%"
      @cancel="syncCancel"
      @ok="syncOk"
    >
      <BuyApply ref="BuyApply" :callback="getBuyApply" />
    </ht-modal>
    <SubmitPage ref="SubmitPage" :callback="getSubmit" />
    <Logs ref="Logs" />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import qs from 'qs'
import { checkProcessModel } from '~/providers/common/preSubmit.js'
import SubmitPage from '~/providers/components/equip/submitPage.vue'
import Logs from '~/providers/components/logs.vue'
import { PrintUdrTempleteType } from '~/utils/IlisPrintUdr.js'
// 同步购置申请
import BuyApply from '~/views/equipmentNew/buy/equipBuyApplyList/list/index.vue'
import AddEditComponent from './components/addModal.vue'

const columns = [
  {
    title: '设备名称',
    dataIndex: 'equipmentName',
  },
  {
    title: '规格型号',
    dataIndex: 'standard',
  },
  {
    title: '设备类别',
    dataIndex: 'type',
  },
  {
    title: '生产厂家',
    dataIndex: 'factory',
  },
  {
    title: '价格',
    dataIndex: 'totalFee',
    customRender: ({ text }) => {
      // eslint-disable-next-line regexp/no-unused-capturing-group
      return text ? `￥ ${text}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''
    },
  },
  {
    title: '申请人',
    dataIndex: 'applicant',
  },
  {
    title: '档案编号',
    dataIndex: 'archiveSn',
  },
  {
    title: '资产编号',
    dataIndex: 'assetSn',
  },
  {
    title: '购置原因及用途',
    dataIndex: 'reason',
    width: '10%',
  },
  {
    title: '计划状态',
    dataIndex: 'status',
    scopedSlots: { customRender: 'status' },
  },
  {
    title: '操作',
    dataIndex: 'operation',
    width: 125,
    scopedSlots: { customRender: 'operation' },
  },
]

export default {
  components: {
    AddEditComponent,
    SubmitPage,
    BuyApply,
    Logs,
  },
  data() {
    return {
      dayjs,
      visible: false,
      syncVisible: false,
      isDetail: false,
      data: [],
      columns,
      quickQryParam: '',
      auditTypeId: '',
      spinning: false,
      loading: false,
      page: 1,
      size: 10,
      applyStatusObj: {
        10: '填写中',
        20: '购置中',
        30: '购置待审批',
        40: '购置审批中',
        50: '验收中',
        60: '验收待审批',
        70: '验收审批中',
        80: '已验收',
      },
      isActive: { 'background-color': '#e6f7ff' },
      addEditTitle: '新购设备',
      pagination: {
        current: 1,
        total: 0,
        ...window.pageConfig,
        onChange: (page) => {
          this.page = page
          this.getData()
        },
        onShowSizeChange: (page, size) => {
          this.size = size
          this.page = 1
          this.getData()
        },
      },
      selectedRowKeys: [],
    }
  },
  computed: {
    rowSelection() {
      return {
        selectedRowKeys: this.selectedRowKeys,
        type: 'radio',
        onChange: (selectedRowKeys) => {
          this.selectedRowKeys = selectedRowKeys
        },
      }
    },
  },
  created() {
    this.getData()
  },
  methods: {
    clearSelRowClass() {
      if (this.selectedRowKeys.length > 0) {
        $(
          `#tableBox tr[data-row-key="${this.selectedRowKeys[0]}"]`,
        ).removeClass('hitek-tableRow-active')
        this.selectedRowKeys = []
        this.selectedRows = []
      }
    },
    getData() {
      this.visible = false
      const { page, size } = this
      const params = {
        page,
        rows: size,
        quickQryParam: this.quickQryParam || '',
      }
      this.spinning = true
      window.$oAjax({
        method: 'GET',
        url: window.$oApi.equipBuyList.list,
        params,
      }).then((res) => {
        if (res && res.total >= 0) {
          this.data = res.rows
          this.pagination.total = res.total || 0
          this.pagination.current = page
          this.pagination.pageSize = size
        }
        else {
          // eslint-disable-next-line ts/no-unused-expressions
          res.success === false
            ? window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
            : ''
          this.data = []
        }
        this.clearSelRowClass()
        this.spinning = false
      })
    },
    addEditRow(e, record, isDetail) {
      // e.stopPropagation();
      // e.preventDefault();
      this.visible = true
      // eslint-disable-next-line ts/no-this-alias
      const self = this
      let recordId
      let status = ''
      if (record) {
        this.addEditTitle = '编辑设备'
        recordId = record ? record.id : ''
        status = record ? record.status : ''
      }
      else {
        this.addEditTitle = '新增设备'
      }
      this.isDetail = !!isDetail
      if (this.isDetail) {
        this.addEditTitle = '查看详情'
      }
      if (this.$refs.AddEditComponent) {
        this.$refs.AddEditComponent.showModal(recordId, status, this.isDetail)
      }
      else {
        let timer = setInterval(() => {
          if (self.$refs.AddEditComponent) {
            clearInterval(timer)
            timer = null
            self.$refs.AddEditComponent.showModal(recordId, status, self.isDetail)
          }
        }, 100)
      }
    },
    // 同步购置申请
    setBuyApply() {
      this.syncVisible = true
      // eslint-disable-next-line ts/no-this-alias
      const self = this
      if (this.$refs.BuyApply) {
        this.$refs.BuyApply.syncShowModal()
      }
      else {
        let timer = setInterval(() => {
          if (self.$refs.BuyApply) {
            clearInterval(timer)
            timer = null
            self.$refs.BuyApply.syncShowModal()
          }
        }, 100)
      }
    },
    getBuyApply(syncRowKeys) {
      if (syncRowKeys.length === 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择购置明细信息'))
        return
      }
      this.spinning = true
      window.$oAjax({
        method: 'GET',
        url: window.$oApi.equipBuyList.syncBuyApply,
        params: { buyApplyDetailIds: syncRowKeys.join(',') },
      }).then((res) => {
        if (res.success) {
          this.getData()
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
        this.spinning = false
      })
      this.syncCancel()
    },
    syncOk() {
      this.$refs.BuyApply.syncOk()
    },
    syncCancel() {
      this.$refs.BuyApply.syncCancel()
      this.syncVisible = false
    },
    async handleOk() {
      this.loading = true
      this.$refs.AddEditComponent.handleOk().finally(() => {
        this.loading = false
      })
    },
    handleCancel() {
      this.visible = false
      this.$refs.AddEditComponent.handleCancel()
    },
    cancelRow(e, record) {
      e.stopPropagation()
      e.preventDefault()
      // eslint-disable-next-line ts/no-this-alias
      const self = this
      window.$oAntdConfirm({
        title: '提示',
        content: '确定要删除吗?',
        onOk() {
          window.$oAjax({
            url: window.$oApi.equipBuyList.delBuyInfo,
            params: {
              buyId: record.id,
            },
          })
            .then((res) => {
              self.cancelTableCall(res)
            })
        },
        onCancel() {},
      })
    },
    cancelTableCall(res) {
      if (res.success) {
        this.getData()
      }
      else {
        window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
      }
    },
    handleReset() {
      this.page = 1
      this.quickQryParam = ''
      this.handleSearch()
    },
    handleSearch() {
      this.page = 1
      this.getData()
    },
    // 查看日志
    viewLog(e, data) {
      this.$refs.Logs.showModal(data.id, '13')
    },
    submitRow(e, record) {
      this.auditTypeId = ''
      if (record.status === '20' || record.status === '30') {
        this.auditTypeId = '80'
      }
      if (record.status === '50' || record.status === '60') {
        this.auditTypeId = '90'
      }
      // 80 设备购置信息审批 90 设备购置信息验收结果审批
      checkProcessModel(this.auditTypeId, record.id, (res) => {
        if (res) {
          this.$refs.SubmitPage.showModal(record, this.auditTypeId)
        }
        else {
          this.getData()
        }
      })
    },
    getSubmit(data) {
      let url = window.$oApi.equipBuyList.submitBuy
      if (this.auditTypeId === '90') {
        url = window.$oApi.equipBuyList.submitBuyAcceptance
      }
      window.$oAjax({
        method: 'POST',
        url,
        data: qs.stringify(data),
      }).then((res) => {
        if (res.success) {
          window.$oAntdMessage.success('操作成功')
          this.$refs.SubmitPage.handleCancel()
          this.getData()
        }
        else {
          this.$refs.SubmitPage.spinning = false
          this.$refs.SubmitPage.confirmLoading = false
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
      })
    },
    // 打印标准物质（设备型）购置登记表
    printEquipmentBuyRegistration() {
      const UDRPrint = new IlisPrintUdr()
      UDRPrint.printLedger(PrintUdrTempleteType['标准物质购置登记表'], {
        page: this.page,
        rows: this.size,
        quickQryParam: this.quickQryParam || '',
        eqType: '标准物质',
      })
    },
    // 打印
    printFun({ key }) {
      if (key === 2) {
        this.printEquipmentBuyRegistration()
        return
      }

      if (this.selectedRowKeys.length === 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请先选择一条数据'))
        return
      }

      const UDRPrint = new IlisPrintUdr()
      UDRPrint.commonPrint(this.selectedRowKeys, 'EquipmentBuyAcceptance')
    },
  },
}
</script>

<style lang="less">
.container-search-all {
  width: 400px;
  margin-right: 5px;
  .ant-table-thead {
    .ant-checkbox {
      display: none;
    }
  }
}
.more-header {
  padding: 8px;
  border-bottom: 1px dashed;
  margin-bottom: 10px;
  color: var(--colorPrimary);
}
.equipmentOutgo {
  padding: 15px;
}
</style>
