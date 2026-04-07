<!-- eslint-disable vue/no-unused-refs -->
<template>
  <div ref="bodyBox">
    <a-spin :spinning="spinning">
      <div class="spin-content">
        <div ref="headerBox">
          <div>
            <a-row type="flex" justify="start">
              <a-col>
                <a-input
                  v-model:value.trim="quickQry"
                  :placeholder="term('输入样品名称/委托编号/样品编号后回车即可查询')"
                  style="width: 300px; vertical-align: middle"
                  class="mr-2"
                  @press-enter="quickSearch"
                />
              </a-col>
              <a-col>
                <a-button
                  type="primary"
                  class="toolBtn-bar"
                  @click="quickSearch"
                >
                  查询
                </a-button>
                <a-button
                  @click="seniorQueryFun"
                >
                  切换到高级查询
                </a-button>
              </a-col>
            </a-row>
          </div>
          <SeniorShowSpan
            v-if="isShow"
            ref="SeniorShowSpan"
            :callback="closeCondition"
            :show-data="showData"
          />
          <div
            style="
              padding: 10px 0;
              margin-top: 10px;
            "
          >
            <a-button

              type="primary"
              style="vertical-align: middle"
              @click="addEditRow"
            >
              新增分包
            </a-button>
            <a-button

              style="vertical-align: middle; margin-left: 5px"
              @click="rollback"
            >
              退回
            </a-button>
            <a-button

              style="vertical-align: middle; margin-left: 5px"
              @click="setSelStatus"
            >
              批量设置流程状态
            </a-button>
            <a-button

              style="vertical-align: middle; margin-left: 5px"
              @click="printFun"
            >
              打印分包任务单
            </a-button>
          </div>
        </div>
        <a-table
          :row-selection="rowSelection"
          :custom-row="customRow"
          :columns="columns"
          :data-source="dataSource"
          bordered
          :pagination="dataSource.length > 0 ? pagination : false"
          row-key="id"
          :row-class-name="rowClassName"
        >
          <template #bodyCell="{ column, record, text }">
            <template v-if="column.dataIndex === 'samplePrice'">
              <span v-if="text"> {{ filters.formatMoney(text) }}</span>
            </template>

            <template v-if="column.dataIndex === 'operation'">
              <span class="table-handle">
                <a
                  href="javascript:;"
                  title="查看"
                  style="margin-right: 5px"
                  @click="viewDetail(record)"
                >
                  查看
                </a>
              </span>
            </template>
          </template>
        </a-table>
      </div>
    </a-spin>
    <DetailModal ref="DetailModal" :callback="getData" />

    <SeniorQuery
      ref="SeniorQuery"
      :callback="seniorQueryCall"
      :reset-call="resetCall"
    />

    <ht-modal
      title="退回"
      centered
      :open="rollBackvisible"
      :mask-closable="false"
      width="460px"
      @cancel="rollBackCancel"
    >
      <a-spin :spinning="rollbackSpinning">
        <a-flex>
          <label class="w-[85px] text-right">退回至：</label>
          <div class="flex-1">
            <a-select v-model:value="rollBackData.target" class="w-full">
              <a-select-option value="consign">
                委托收样
              </a-select-option>
              <a-select-option value="taskAssign">
                任务分配
              </a-select-option>
            </a-select>
          </div>
        </a-flex>
        <a-flex class="mt-4">
          <label class="w-[85px] text-right">退回原因：</label>
          <div class="flex-1">
            <a-textarea
              v-model:value="rollBackData.reason"
              :rows="4"
            ></a-textarea>
          </div>
        </a-flex>
      </a-spin>
      <template #footer>
        <div>
          <a-button @click="rollBackCancel">
            取消
          </a-button>
          <a-button type="primary" @click="rollBackOk">
            确定
          </a-button>
          <div style="clear: both"></div>
        </div>
      </template>
    </ht-modal>

    <ht-modal
      :title="addEditTitle"
      centered
      :open="visible"
      :mask-closable="false"
      width="600px"
      @cancel="handleCancel"
    >
      <AddRecord ref="AddRecord" :callback="getData" />
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
          <div style="clear: both"></div>
        </div>
      </template>
    </ht-modal>
    <SelStatus ref="SelStatus" :callback="getData" />
    <SeniorShowSpan ref="SeniorShowSpan" :callback="closeCondition" />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import qs from 'qs'
// import SelectBigCate from "~/providers/components/bigCategory.vue";
import filters from '~/providers/common/filters'
import SeniorQuery from '~/providers/components/seniorQuery/list.vue'
import SeniorShowSpan from '~/providers/components/seniorQuery/showSpan.vue'
import { useIndustryStore } from '~/store/industryStore'
import AddRecord from './components/addRecord.vue'
import DetailModal from './components/detailModal.vue'
import SelStatus from './components/selStatus.vue'

export default {
  components: {
    DetailModal,
    SelStatus,
    SeniorQuery,
    SeniorShowSpan,
    AddRecord,
  },
  setup() {
    const { term } = useIndustryStore()

    const columns = [
      {
        title: term('样品名称'),
        dataIndex: 'sampleName',
        width: '10%',
      },
      {
        title: '委托单位',
        dataIndex: 'consignUnit',
        width: '10%',
      },
      {
        title: '工程项目',
        dataIndex: 'consignProject',
        width: '10%',
      },
      {
        title: '委托编号',
        dataIndex: 'consignSn',
        width: '10%',
      },
      {
        title: '样品编号',
        dataIndex: 'sampleSn',
        width: '10%',
      },
      {
        title: '委托日期',
        dataIndex: 'consignDate',
        width: '10%',
      },
      {
        title: '分包日期',
        dataIndex: 'subcontractDate',
        width: '10%',
      },
      {
        title: '分包单位',
        dataIndex: 'subcontractUnit',
        width: '10%',
      },
      {
        title: '分包费用',
        dataIndex: 'fee',
        scopedSlots: { customRender: 'samplePrice' },
        width: '10%',
      },
      {
        title: '流程状态',
        dataIndex: 'status',
        key: 'status',
        width: '5%',
      },
      {
        title: '操作',
        dataIndex: 'operation',
        scopedSlots: { customRender: 'operation' },
        width: '5%',
      },
    ]

    const queryDataC = [
      {
        type: 'input',
        field: 'sampleName',
        title: term('样品名称'),
        options: [],
        default: '',
        col: '24',
        expend: {},
      },
      {
        type: 'input',
        field: 'consignUnit',
        title: '委托单位',
        options: [],
        default: '',
        col: '24',
        expend: {},
      },
      {
        type: 'input',
        field: 'consignProject',
        title: '工程项目',
        options: [],
        default: '',
        col: '24',
        expend: {},
      },
      {
        type: 'input',
        field: 'consignSn',
        title: '委托编号',
        options: [],
        default: '',
        col: '24',
        expend: {},
      },
      {
        type: 'input',
        field: 'sampleSn',
        title: '样品编号',
        options: [],
        default: '',
        col: '24',
        expend: {},
      },
      {
        type: 'rangePicker',
        field: 'consignDate',
        title: '委托日期',
        options: [],
        default: '',
        col: '24',
        expend: {},
      },
      {
        type: 'rangePicker',
        field: 'subcontractDate',
        title: '分包日期',
        options: [],
        default: '',
        col: '24',
        expend: {},
      },
      {
        type: 'input',
        field: 'subcontractUnit',
        title: '分包单位',
        options: [],
        default: '',
        col: '24',
        expend: {},
      },
      {
        type: 'select',
        field: 'status',
        title: '流程状态',
        options: [],
        default: '',
        col: '24',
        expend: {},
      },
    ]

    return {
      term,
      columns,
      queryData: queryDataC,
    }
  },
  data() {
    return {
      dayjs,
      filters,
      spinning: false,
      rollbackSpinning: false,
      visible: false,
      rollBackvisible: false,
      rollBackData: {},
      isDetail: false,
      addEditTitle: '新增分包登记',
      queryParams: {},
      submitParams: {},
      isShow: false,
      showData: [],
      selectedRowKeys: [],
      selectedRows: [],
      statusData: [], // 流程状态
      dataSource: [],
      quickQry: '',
      page: 1,
      size: 10,
      pagination: {
        current: 1,
        total: 0,
        ...window.pageConfig,
        onChange: (page) => {
          this.page = page
          this.getData()
        },
        onShowSizeChange: (page, size) => {
          this.page = 1
          this.size = size
          this.getData()
        },
      },
      customRow: (record) => {
        return {
          onClick: () => {
            if (this.selectedRowKeys.includes(record.id)) {
              const arr = this.selectedRowKeys
              arr.splice(
                arr.findIndex(item => item === record.id),
                1,
              )
              this.selectedRows = this.selectedRows.filter(
                item => item.id !== record.id,
              )
            }
            else {
              if (!record.children) {
                this.selectedRowKeys.push(record.id)
                this.selectedRows.push(record)
              }
            }
          },
        }
      },
    }
  },
  computed: {
    rowSelection() {
      return {
        hideDefaultSelections: false,
        selectedRowKeys: this.selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
          this.selectedRows = selectedRows
        },
      }
    },
  },
  async created() {
    await this.getTypeData()
    this.getData()
  },
  mounted() {},
  methods: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    detailGrid(e, text, record) {
      const titleKey = event.target.dataset.id
      const testObjectIds = record[`${titleKey}TestObjectIds`]
      if (testObjectIds) {
        this.$refs.DetailModal.showModal(testObjectIds)
      }
    },
    getData(flag) {
      this.spinning = true
      this.visible = false
      // eslint-disable-next-line ts/no-unused-expressions
      flag ? (this.page = 1) : ''
      const { page, size } = this
      const params = {
        page,
        size,
        quickQry: this.quickQry,
        ...this.queryParams,
      }

      // 委托日期
      if (params.consignDate && params.consignDate.length == 2) {
        const start = `${dayjs(params.consignDate[0]).format(
          'YYYY-MM-DD',
        )} 00:00:00`
        const end = `${dayjs(params.consignDate[1]).format(
          'YYYY-MM-DD',
        )} 23:59:59`
        params.consignDateBegin = start
        params.consignDateEnd = end
      }
      //  分包日期
      if (params.subcontractDate && params.subcontractDate.length == 2) {
        const start = `${dayjs(params.subcontractDate[0]).format(
          'YYYY-MM-DD',
        )} 00:00:00`
        const end = `${dayjs(params.subcontractDate[1]).format(
          'YYYY-MM-DD',
        )} 23:59:59`
        params.subcontractDateBegin = start
        params.subcontractDateEnd = end
      }
      delete params.consignDate
      delete params.subcontractDate

      this.submitParams = params
      window.$oAjax({
        url: window.$oApi.subcontractManage.datagridList,
        params,
        headers: {
          paramsIsTrim: true,
        },
      }).then((res) => {
        this.dataSource = []
        this.selectedRowKeys = []
        this.selectedRows = []
        if (res.code === 20000) {
          if (
            res.data
            && Array.isArray(res.data.rows)
            && res.data.rows.length > 0
          ) {
            this.dataSource = res.data.rows.map(item => ({
              ...item,
              consignDate: item.consignDate
                ? dayjs(item.consignDate).format('YYYY-MM-DD')
                : '',
              subcontractDate: dayjs(item.subcontractDate).format(
                'YYYY-MM-DD',
              ),
            }))
            this.pagination.total = res.data.count || 0
            this.pagination.current = page
            this.pagination.pageSize = size
          }
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
        this.spinning = false
      })
    },
    // 快速查询,清空高级查询(显示数据)
    quickSearch() {
      this.queryParams = {}

      this.showData = []
      this.isShow = false
      this.getData(true)
    },
    // 删除高级查询,删除查询数据
    async closeCondition(field, isShow) {
      if (field) {
        this.queryParams[field] = ''
      }
      if (isShow) {
        this.isShow = false
        this.showData = []
      }
      else {
        this.showData = this.showData.filter(i => i.field !== field)
      }
      this.getData(true)
    },
    // 高级查询 inputArr的默认值更改
    inputDefault(field, arrOpt, defaults) {
      const newData = [...this.queryData]
      const target = newData.filter(item => field === item.field)[0]
      if (target) {
        if (arrOpt && arrOpt.length > 0) {
          target.options = [...target.options, ...arrOpt]
        }
        target.default = defaults
        this.queryData = newData
      }
    },
    // 高级查询 重置
    resetCall() {
      this.quickSearch()
    },
    // 高级查询回调，更改查询数据(显示数据)
    async seniorQueryCall(params, showData) {
      this.quickQry = ''
      this.queryParams = { ...params }
      if (showData.length) {
        this.isShow = true
      }
      else {
        this.isShow = false
      }
      this.showData = [...showData].map(item => ({ ...item }))
      this.getData(true)
    },
    // 高级查询，根据查询数据 回显
    seniorQueryFun() {
      const params = { ...this.queryParams }
      this.$refs.SeniorQuery.showModal(this.queryData, params)
    },
    getTypeData() {
      let arr = []
      window.$oAjax({
        method: 'POST',
        url: window.$oApi.common.getDictionaryData,
        params: {
          dictGroupId: 'f852d85d47ed64a40147ed70894c00x8',
        },
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).then((res) => {
        if (res && res.success) {
          if (res.obj && Array.isArray(res.obj) && res.obj.length > 0) {
            arr = res.obj.map(item => ({
              id: item.typename,
              typecode: item.typename,
              typename: item.typename,
              name: item.typename,
              value: item.typename,
            }))
          }
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }

        this.inputDefault('status', [...arr], '')

        this.statusData = arr
      })
    },
    addEditRow(e, recordId, isDetail) {
      this.visible = true
      recordId = recordId || ''
      this.isDetail = !!isDetail
      if (recordId) {
        this.addEditTitle = '编辑分包登记'
      }
      else {
        this.addEditTitle = '新增分包登记'
      }
      if (this.isDetail) {
        this.addEditTitle = '查看分包登记'
      }
      window.$oNextTick(() => {
        this.$refs.AddRecord.showModal(recordId, this.isDetail)
      })
    },
    rollback() {
      if (this.selectedRows.length === 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择要退回的数据'))
        return
      }

      if (
        this.selectedRows.filter(item => item.sourceType != '1').length > 0
      ) {
        window.$oAntdModal.warning(window.$oMsgTips.info('只有来源于委托的分包可以退回'))
        return
      }

      this.rollBackData = {
        source: 'subcontract',
        target: 'consign',
        reason: '',
        sourceObjId: this.selectedRows.map(item => item.id).join(','),
      }
      window.$oNextTick(() => {
        this.rollBackvisible = true
      })
    },
    // 退回
    async rollBackOk() {
      if (!this.rollBackData.reason) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请输入退回原因'))
        return
      }
      this.rollbackSpinning = true
      const res = await window.$oAjax.post(
        window.$oApi.common.rollback,
        qs.stringify(this.rollBackData),
      )
      this.rollbackSpinning = false
      if (res.success) {
        window.$oAntdMessage.success('操作成功')
        this.getData(true)
        this.rollBackCancel()
      }
      else {
        window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
      }
    },
    rollBackCancel() {
      this.rollBackvisible = false
      window.$oNextTick(() => {
        this.rollBackData = {}
      })
    },
    // 打开tab
    viewDetail(record) {
      top.addTabs
      && top.addTabs({
        id: record.id,
        title: '分包管理详情',
        close: false,
        url: `rest/subcontractController/goSubcontractDetail?id=${record.id}`,
      })

      event.stopPropagation()
      event.preventDefault()
    },
    setSelStatus() {
      if (this.selectedRowKeys.length === 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择要设置的数据'))
        return
      }
      if (this.statusData.length === 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请配置流程状态'))
        return
      }
      this.$refs.SelStatus.showModal(this.selectedRowKeys.join(','))
    },
    printFun() {
      if (this.selectedRowKeys.length === 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择分包数据'))
        return
      }
      // eslint-disable-next-line unused-imports/no-unused-vars
      const obj = {}
      // this.selectedRowKeys.map(item => {
      //   obj[item]= {
      //     businessType: 40,
      //     businessId: item
      //   }
      // });

      const UDRPrint = new IlisPrintUdr()
      UDRPrint.commonPrint(this.selectedRowKeys, 'SubcontractInfo')
    },
    getSelStatus() {},
    handleOk() {
      this.$refs.AddRecord.handleOk()
    },
    handleCancel() {
      this.visible = false
      this.$refs.AddRecord.handleCancel()
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
