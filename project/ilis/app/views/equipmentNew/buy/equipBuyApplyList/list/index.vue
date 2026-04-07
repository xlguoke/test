<template>
  <div>
    <a-spin :spinning="spinning">
      <div class="spin-content">
        <a-space>
          <a-input
            v-model:value="quickQryParam"
            placeholder="请输入设备名称、申请人回车即可查询"
            style="width: 280px;"
            @press-enter="handleSearch()"
          />
          <a-button type="primary" @click="handleSearch">
            查询
          </a-button>
          <a-button @click="handleReset">
            重置
          </a-button>
        </a-space>
        <div v-if="!isSync" style="padding: 10px 0">
          <a-space>
            <a-button type="primary" @click="addEditRow">
              新增购置申请
            </a-button>
            <a-button @click="openImportModal">
              导入
            </a-button>
            <a-button @click="printFun">
              打印
            </a-button>
            <a-button

              @click="() => (propertyProfileVisible = true)"
            >
              申请内容项配置
            </a-button>
            <a-button @click="onExportForList">
              导出
            </a-button>
          </a-space>
        </div>
        <a-table
          id="tableBox"
          :columns="columns"
          :pagination="data.length > 0 ? pagination : false"
          :data-source="data"
          bordered
          :custom-row="customRow"
          row-key="id"
          :row-class-name="rowClassName"
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
                  v-if="record.status !== '20'"
                  @click="(e) => deleteRow(e, record)"
                >删除</a>
                <span
                  v-if="
                    record.status === '10'
                      || record.status === '30'
                      || record.status === '50'
                  "
                  class="table-handle"
                >
                  <a @click="(e) => addEditRow(e, record.id)">编辑</a>
                  <a @click="(e) => submitRow(e, record)">提交</a>
                </span>
                <a @click="(e) => addEditRow(e, record.id, true)">详情</a>
                <a @click="(e) => viewLog(e, record)">日志</a>
              </div>
            </template>
          </template>
        </a-table>
        <div
          v-if="data.length > 0 ? true : false"
          class="more-header"
          @click="
            () => {
              moreInfo = !moreInfo
            }
          "
        >
          购置申请明细信息
        </div>
        <div v-show="moreInfo">
          <a-table
            :columns="detailColumns"
            :pagination="false"
            :data-source="detailData"
            bordered
            row-key="id"
            :row-selection="isSync ? rowSelection : null"
            :custom-row="isSync ? syncCustomRow : null"
            :row-class-name="rowClassName"
          >
            <template #bodyCell="{ column, record, text }">
              <template v-if="column.dataIndex === 'amount'">
                <span> {{ text }} {{ record.amountUnit }} </span>
              </template>
            </template>
          </a-table>
        </div>
      </div>
    </a-spin>
    <ht-modal
      :title="addEditTitle"
      centered
      :open="visible"
      :mask-closable="false"
      width="80%"
      class="hitek-add-modal"
      @cancel="handleCancel"
    >
      <AddEditComponent ref="AddEditComponent" :callback="getAddOutData" />
      <template #footer>
        <div>
          <a-button v-if="!isDetail" @click="handleCancel">
            取消
          </a-button>
          <a-button v-if="!isDetail" type="primary" @click="handleOk">
            确定
          </a-button>
          <a-button v-if="isDetail" type="primary" @click="handleCancel">
            关闭
          </a-button>
          <a-button v-if="isDetail" type="primary" @click="onExport">
            导出申请详情
          </a-button>
          <div style="clear: both"></div>
        </div>
      </template>
    </ht-modal>
    <ht-modal
      v-model:open="propertyProfileVisible"
      title="自定义信息项配置"
      :mask-closable="false"
      @ok="handleProfile"
    >
      <CustomProperty customize-type="equipBuyApplyEdit" />
    </ht-modal>
    <SubmitPage ref="SubmitPage" :callback="getSubmit" />
    <Logs ref="Logs" />
    <ImportModalComponent ref="ImportModalComponent" @callback="getData(true)" />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import qs from 'qs'
import { checkProcessModel } from '~/providers/common/preSubmit.js'
import CustomProperty from '~/providers/components/CustomProperty.vue'
import SubmitPage from '~/providers/components/equip/submitPage.vue'
import Logs from '~/providers/components/logs.vue'
import { rootUrl } from '~/providers/configs/rootUrl'
import AddEditComponent from './components/addEdit.vue'
import ImportModalComponent from './components/importModal.vue'

// eslint-disable-next-line unused-imports/no-unused-vars
const columns = [
  {
    title: '填写时间',
    dataIndex: 'createDate',
    width: '20%',
    customRender: ({ text }) => (text ? dayjs(text).format('YYYY-MM-DD') : ''),
  },
  {
    title: '申请人',
    dataIndex: 'applicant',
    width: '20%',
  },
  {
    title: '预算(总金额)',
    dataIndex: 'budget',
    width: '20%',
    customRender: ({ text }) => {
      // eslint-disable-next-line regexp/no-unused-capturing-group
      return text ? `￥ ${text}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''
    },
  },
  {
    title: '申请说明',
    dataIndex: 'applyExplain',
    width: '10%',
  },
  {
    title: '计划状态',
    dataIndex: 'status',
    width: '10%',
    scopedSlots: { customRender: 'status' },
  },
]
const oprColumns = [
  {
    title: '操作',
    dataIndex: 'operation',
    width: 125,
    scopedSlots: { customRender: 'operation' },
  },
]

const detailColumns = [
  {
    title: '设备名称',
    dataIndex: 'name',
    width: '13%',
  },
  {
    title: '规格型号',
    dataIndex: 'standard',
    width: '10%',
  },
  {
    title: '生产厂家',
    dataIndex: 'manufacturer',
    width: '11%',
  },
  {
    title: '申请处室',
    dataIndex: 'depart',
    width: '10%',
  },
  {
    title: '设备单价',
    dataIndex: 'price',
    width: '10%',
  },
  {
    title: '申购数量',
    dataIndex: 'amount',
    width: '10%',
  },
  {
    title: '总价',
    dataIndex: 'totalPrice',
    width: '10%',
  },
  {
    title: '购置原因及用途',
    dataIndex: 'reason',
    width: '13%',
  },
  {
    title: '设备使用规范',
    dataIndex: 'useRule',
    width: '13%',
  },
]

export default {
  components: {
    AddEditComponent,
    SubmitPage,
    Logs,
    CustomProperty,
    ImportModalComponent,
  },
  props: ['callback'],
  data() {
    return {
      recordId: '',
      dayjs,
      visible: false,
      isDetail: false,
      addEditTitle: '新增购置申请',
      data: [],
      detailData: [],
      columns: [],
      detailColumns,
      propertyProfileVisible: false,
      customFields: [],
      fields: [
        { title: '填写时间', dataIndex: 'createDate' },
        { title: '申请人', dataIndex: 'applicant' },
        { title: '预算(总金额)', dataIndex: 'budget' },
        { title: '申请说明', dataIndex: 'applyExplain' },
        {
          title: '计划状态',
          dataIndex: 'status',
          scopedSlots: { customRender: 'status' },
        },
      ],
      quickQryParam: '',
      confirmVisible: false,
      moreInfo: false,
      spinning: false,
      page: 1,
      size: 10,
      applyStatusObj: {
        10: '填写中',
        20: '审批中',
        30: '审批拒绝',
        40: '审批通过',
        50: '申请被驳回',
      },
      isActive: { 'background-color': '#e6f7ff' },
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
      customRow: (record) => {
        return {
          onClick: () => {
            if (this.selectedRowKeys.includes(record.id)) {
              $(`#tableBox tr[data-row-key="${record.id}"]`).removeClass(
                'hitek-tableRow-active',
              )
              const arr = this.selectedRowKeys
              arr.splice(
                arr.findIndex(item => item === record.id),
                1,
              )
              this.detailDatagrid(record, false)
            }
            else {
              this.detailDatagrid(record, true)
              $(`#tableBox tr[data-row-key="${record.id}"]`)
                .addClass('hitek-tableRow-active')
                .siblings()
                .removeClass('hitek-tableRow-active')
              this.selectedRowKeys = [record.id]
            }
          },
        }
      },
      syncCustomRow: (record) => {
        return {
          on: {
            click: () => {
              if (this.syncRowKeys.includes(record.id)) {
                const arr = this.syncRowKeys
                arr.splice(
                  arr.findIndex(item => item === record.id),
                  1,
                )
              }
              else {
                this.syncRowKeys.push(record.id)
              }
            },
          },
        }
      },
      isSync: false, // 是否同步购置
      syncRowKeys: [],
      importVisible: false, // 导入弹窗
    }
  },
  computed: {
    rowSelection() {
      const { syncRowKeys } = this
      return {
        selectedRowKeys: syncRowKeys,
        onChange: (syncRowKeys) => {
          this.syncRowKeys = syncRowKeys
        },
        getCheckboxProps: record => ({
          props: {
            disabled: !!record.disabled,
          },
        }),
      }
    },
  },
  created() {
    // this.getData();
    this.getData()
    // antd组件的使用
    // ilis公共组件的使用
    // ilis公共业务的实现：打印，导出
    // 版本任务的处理：目前情况，目前会衍生出上面的内容，正常，实践中发现问题
  },
  methods: {
    openImportModal() {
      this.$refs.ImportModalComponent.showModal()
    },
    async onExport() {
      const a = document.createElement('a')

      const params = {
        buyApplyId: this.recordId,
      }
      let href = `${rootUrl}/buyApplyController.do?detailExport`
      Object.keys(params)
        .filter(key => !!params[key])
        .map(key => (href += `&${key}=${params[key]}`))

      a.href = href
      a.click()
    },

    async onExportForList() {
      if (this.pagination.total == 0) {
        window.$oAntdMessage.warning('未找到满足条件数据，暂不支持导出!')
        return
      }
      const a = document.createElement('a')
      const params = {
        quickQryParam: this.quickQryParam,
      }
      let href = `${rootUrl}/buyApplyController.do?export`

      Object.keys(params)
        .filter(key => !!params[key])
        .map(key => (href += `&${key}=${params[key]}`))

      a.href = href
      a.click()
    },

    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    clearSelRowClass() {
      if (this.selectedRowKeys.length > 0) {
        $(
          `#tableBox tr[data-row-key="${this.selectedRowKeys[0]}"]`,
        ).removeClass('hitek-tableRow-active')
        this.selectedRowKeys = []
        this.selectedRows = []
      }
    },
    getCustomFields(flag) {
      this.visible = false
      this.spinning = true
      window.$oAjax
        .get(window.$oApi.common.customProperties, {
          params: {
            customizeType: 'equipBuyApplyEdit',
          },
        })
        .then((res) => {
          this.customFields = res.data || []
          this.getData(flag)
        })
    },
    getData(flag) {
      this.visible = false
      this.spinning = true
      if (flag) {
        this.page = 1
      }
      const { page, size } = this
      const params = {
        page,
        rows: size,
        quickQryParam: this.quickQryParam || '',
      }
      this.spinning = true
      //  equipBuyApplyList
      window.$oAjax
        .get(`${window.$oApi.equipBuyApplyList.list}`, {
          params,
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
        })
        .then((res) => {
          if (res && res.rows && res.rows.length > 0) {
            this.columns = this.fields.map((item) => {
              const _item = {
                title: item.title,
                dataIndex: item.dataIndex,
                scopedSlots: item.scopedSlots,
              }
              if (item.dataIndex == 'createDate') {
                _item.customRender = ({ text }) =>
                  text ? dayjs(text).format('YYYY-MM-DD') : ''
              }
              if (item.dataIndex == 'budget') {
                _item.customRender = ({ text }) => {
                  return text
                    // eslint-disable-next-line regexp/no-unused-capturing-group
                    ? `￥ ${text}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    : ''
                }
              }
              return _item
            })
            // eslint-disable-next-line array-callback-return
            this.customFields.map((item) => {
              this.columns.push({
                title: item.columnName,
                dataIndex: item.id,
              })
            })
            // eslint-disable-next-line ts/no-unused-expressions
            this.isSync ? '' : (this.columns = this.columns.concat(oprColumns))
            const width = `${100 / this.columns.length}%`
            this.columns = this.columns.map(item => ({
              ...item,
              width,
            }))
            this.data = res.rows
            // eslint-disable-next-line array-callback-return
            this.data.map((data) => {
              if (
                data.biddingCustomizeValueEntities
                && data.biddingCustomizeValueEntities.length > 0
              ) {
                // eslint-disable-next-line array-callback-return
                data.biddingCustomizeValueEntities.map((item) => {
                  data[item.columnId] = item.columnValue
                })
              }
            })
            this.pagination.total = res.total || 0
            this.pagination.current = page
            this.pagination.pageSize = size
          }
          else {
            this.pagination.total = 0
            this.data = []
          }
          this.clearSelRowClass()
          this.spinning = false
        })
    },
    addEditRow(e, recordId, isDetail) {
      e.stopPropagation()
      e.preventDefault()
      this.visible = true
      // eslint-disable-next-line ts/no-this-alias
      const self = this
      this.recordId = recordId
      recordId = recordId || ''
      this.isDetail = !!isDetail
      if (recordId) {
        this.addEditTitle = '编辑购置申请'
      }
      else {
        this.addEditTitle = '新增购置申请'
      }
      if (this.isDetail) {
        this.addEditTitle = '查看购置申请'
      }
      if (this.$refs.AddEditComponent) {
        this.$refs.AddEditComponent.showModal(recordId, this.isDetail)
      }
      else {
        let timer = setInterval(() => {
          if (self.$refs.AddEditComponent) {
            clearInterval(timer)
            timer = null
            self.$refs.AddEditComponent.showModal(recordId, self.isDetail)
          }
        }, 100)
      }
    },
    handleOk() {
      this.$refs.AddEditComponent.handleOk()
    },
    handleCancel() {
      this.visible = false
      this.$refs.AddEditComponent.handleCancel()
    },
    deleteRow(e, record) {
      e.stopPropagation()
      e.preventDefault()
      // eslint-disable-next-line ts/no-this-alias
      const self = this
      window.$oAntdConfirm({
        title: '提示',
        content: '确定要删除吗?',
        onOk() {
          window.$oAjax
            .get(window.$oApi.equipBuyApplyList.delApply, {
              params: {
                id: record.id,
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
        this.getData(true)
      }
      else {
        window.$oAntdModal.warning(window.$oMsgTips.info(res.message || res.msg))
      }
    },
    // 出入库明细
    detailDatagrid(record, isShow) {
      this.moreInfo = isShow
      if (isShow) {
        this.spinning = true
        window.$oAjax
          .get(`${window.$oApi.equipBuyApplyList.detailDatagrid}`, {
            params: { buyApplyId: record.id },
            headers: {
              'X-Requested-With': 'XMLHttpRequest',
            },
          })
          .then((res) => {
            if (res.rows && res.total >= 0) {
              this.detailData = res.rows
            }
            else {
              window.$oAntdModal.warning(window.$oMsgTips.info(res.message || res.msg))
              this.detailData = []
            }
            this.spinning = false
          })
      }
    },
    handleReset() {
      this.quickQryParam = ''
      this.handleSearch()
    },
    handleSearch() {
      this.moreInfo = false
      this.detailData = []
      this.getData(true)
    },
    // 查看日志
    viewLog(e, data) {
      this.$refs.Logs.showModal(data.id, '12')
    },
    submitRow(e, record) {
      checkProcessModel(70, record.id, (res) => {
        if (res) {
          this.$refs.SubmitPage.showModal(record, '70')
        }
        else {
          this.handleSearch()
        }
      })
    },
    getSubmit(data) {
      window.$oAjax({
        method: 'POST',
        url: window.$oApi.equipBuyApplyList.submitUrl,
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
          window.$oAntdModal.warning(window.$oMsgTips.info(res.message || res.msg))
        }
      })
    },
    syncShowModal() {
      this.isSync = true
      // this.columns = columns.pop();
      this.getData()
    },
    syncOk() {
      this.callback(this.syncRowKeys)
    },
    syncCancel() {
      this.syncRowKeys = []
      this.isSync = false
    },
    getAddOutData() {
      this.getData(true)
    },
    // 打印
    printFun() {
      if (this.selectedRowKeys.length === 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请先选择一条数据'))
        return
      }

      const UDRPrint = new IlisPrintUdr()
      UDRPrint.commonPrint(this.selectedRowKeys, 'EquipmentBuyApply')
    },
    handleProfile() {
      this.propertyProfileVisible = false
      this.getData(true)
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
.hitek-add-modal {
  .ant-modal-body {
    min-height: 420px !important;
  }
}
</style>
