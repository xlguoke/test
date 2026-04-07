<template>
  <div>
    <div>
      <div>
        所属部门：
        <a-tree-select
          v-model:value="eqDepartId"
          style="width: 200px"
          :dropdown-style="{ maxHeight: '405px', overflow: 'auto' }"
          placeholder="请选择部门"
          allow-clear
          :tree-data="departmentData"
          tree-default-expand-all
          show-search
        />
        <a-input
          v-model:value="quickQryParam"
          placeholder="请输入耗材名称、耗材类别、型号后回车即可查询"
          class="container-search-all ml-2"
          style="width: 280px;"
          @keypress.enter="handleSearch()"
        />
        <a-button type="primary" @click="handleSearch()">
          查询
        </a-button>
        <a-button @click="handleReset">
          重置
        </a-button>
      </div>
      <div style="padding: 10px 0">
        <a-button type="primary" @click="add">
          入库
        </a-button>
        <a-button type="primary" @click="addByRequest">
          按采购申请新增
        </a-button>
        <a-button type="primary" @click="outbound">
          出库
        </a-button>
      </div>
      <a-table
        id="tableBox"
        :columns="columns"
        :pagination="data.length > 0 ? pagination : false"
        :data-source="data"
        :loading="loading"
        bordered
        :custom-row="customRow"
        row-key="id"
        :row-class-name="rowClassName"
      >
        <template #bodyCell="{ column, record, text }">
          <template v-if="column.dataIndex === 'amount'">
            <span>{{ text }} {{ record.amountUnit }}</span>
          </template>
          <template v-if="column.dataIndex === 'operation'">
            <span class="table-handle">
              <a @click="(e) => deleteRow(e, record)">删除</a>
              <a @click="(e) => add(e, record)">入库</a>
              <a @click="(e) => outbound(e, record)">出库</a>
              <a @click="(e) => setAlarmAmount(e, record)">告警数量</a>
              <a @click="(e) => folderManage(e, record)">附件管理</a>
            </span>
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
        出入库明细信息
      </div>
      <div v-show="moreInfo">
        <a-button v-if="recordId" style="margin-bottom: 8px;" @click="printReceivingLedger">
          打印领用台账
        </a-button>

        <a-table
          :columns="detailColumns"
          :pagination="false"
          :data-source="detailData"
          :loading="detailloading"
          bordered
          row-key="id"
          :row-class-name="rowClassName"
        >
          <template #bodyCell="{ column, record, text }">
            <template v-if="column.dataIndex === 'amount'">
              <span>{{ text }} {{ record.amountUnit }}</span>
            </template>
            <template v-if="column.dataIndex === 'outTypes'">
              <span>
                {{ outTypeFun(record) }}
              </span>
            </template>
            <template v-if="column.dataIndex === 'operation'">
              <span class="table-handle">
                <a @click="(e) => viewDetail(e, record)">出入库明细</a>
                <a @click="(e) => printFun(e, record)">打印</a>
                <a v-if="record.recordType === '1'" @click="printAcceptance(record)">打印验收表</a>
              </span>
            </template>
          </template>
        </a-table>
      </div>
    </div>
    <Add ref="Add" :callback="getAddOutData" />
    <AddByRequest ref="AddByRequestRef" @on-save="getAddOutData" />
    <Outbound ref="Outbound" :callback="getAddOutData" />
    <ht-modal
      title="设置库存告警数量"
      :mask-closable="maskClosable"
      :open="visible"
      :confirm-loading="confirmLoading"
      @ok="typeOk"
      @cancel="typeCancel"
    >
      <!-- <a-form-item  :label-col="{ span:8 }" :wrapper-col="{ span: 15 }" label="库存告警数量：" > -->
      <!-- <a-input placeholder="请输入"  v-model="alarmAmount"/> -->
      <!-- </a-form-item> -->
      <div class="hitek-form-layout">
        <div class="hitek-form-layout-label">
          库存告警数量
        </div>
        <div class="hitek-form-layout-con">
          <a-form-item>
            <a-input-number
              v-model:value="alarmAmount"
              style="width: 70%"
              placeholder="请输入"
            />
            <span style="margin-left: 10px">
              {{
                setAlarmObj && setAlarmObj.amountUnit
                  ? setAlarmObj.amountUnit
                  : ''
              }}
            </span>
          </a-form-item>
        </div>
      </div>
    </ht-modal>
    <ht-modal
      v-model:open="attachmentVisible"
      title="附件管理"
      :mask-closable="false"
      width="80%"
      :centered="true"
      class="biddingPerformance-folder"
      @cancel="cancelModal"
    >
      <template #footer>
        <a-button style="display: none" @click="cancelModal"></a-button>
        <a-button @click="cancelModal">
          取消
        </a-button>
      </template>
      <FolderManage ref="FolderManage" />
    </ht-modal>
  </div>
</template>

<script>
import { Modal } from 'ant-design-vue'
import dayjs from 'dayjs'
import qs from 'qs'
import getDepartmentData from '~/providers/api/getDepartment'
import FolderManage from '~/providers/components/folderManage/folderList.vue'
import Add from './components/add.vue'
import AddByRequest from './components/addByRequest.vue'
import Outbound from './components/outbound.vue'

const columns = [
  {
    title: '管理编号',
    dataIndex: 'sn',
  },
  {
    title: '所属部门',
    dataIndex: 'depart',
  },
  {
    title: '耗材名称',
    dataIndex: 'name',
    width: '14%',
  },
  {
    title: '型号',
    dataIndex: 'standard',
    // customRender:({ text })=>(  egressStatusData.find(item=>item.value==text)?egressStatusData.find(item=>item.value==text).name:"" )
  },
  {
    title: '耗材类别',
    dataIndex: 'type',
  },
  {
    title: '存放地点',
    dataIndex: 'site',
    width: '15%',
  },
  {
    title: '保管人',
    dataIndex: 'managerName',
  },
  {
    title: '核查人',
    dataIndex: 'auditPersonName',
  },
  {
    title: '库存数量',
    dataIndex: 'amount',
    width: '9%',
    scopedSlots: { customRender: 'amount' },
  },
  {
    title: '库存告警数量',
    dataIndex: 'inventoryAlarmAmount',
    width: '9%',
    customRender: ({ text, record }) =>
      isDefined(text) ? `${text}  ${record.amountUnit}` : '',
  },
  {
    title: '操作',
    dataIndex: 'operation',
    width: '14%',
    scopedSlots: { customRender: 'operation' },
  },
]
const detailColumns = [
  {
    title: '管理编号',
    dataIndex: 'sn',
  },
  {
    title: '所属部门',
    dataIndex: 'depart',
  },
  {
    title: '出入库时间',
    dataIndex: 'createDate',
    width: '20%',
    customRender: ({ text }) => (text ? dayjs(text).format('YYYY-MM-DD') : ''),
  },
  {
    title: '出入库数量',
    dataIndex: 'recordCount',
    // customRender:({ text })=>(  egressStatusData.find(item=>item.value==text)?egressStatusData.find(item=>item.value==text).name:"" )
  },
  {
    title: '经手人',
    dataIndex: 'operatorName',
    width: '20%',
  },
  {
    title: '剩余数量',
    dataIndex: 'amount',
    width: '10%',
    customRender: ({ text, record }) => {
      // 出入库明细列表 - 剩余数量错误(应该是库存+入库数量 或 库存-出库数量,
      // 库存:amount, 出入库数量:recordCount)
      let nums
      if (record.recordType === '1') {
        nums = text + record.recordCount
      }
      else {
        nums = text - record.recordCount
      }
      return nums
    },
  },
  {
    title: '出入库类型',
    dataIndex: 'outTypes',
    width: '10%',
    scopedSlots: { customRender: 'outTypes' },
  },
  {
    title: '操作',
    dataIndex: 'operation',
    width: '185px',
    scopedSlots: { customRender: 'operation' },
  },
]

export default {
  components: {
    Add,
    Outbound,
    FolderManage,
    AddByRequest,
  },
  data() {
    return {
      dayjs,
      data: [],
      detailData: [],
      columns,
      detailColumns,
      eqDepartId: null,
      quickQryParam: '',
      confirmVisible: false,
      moreInfo: false,
      loading: false,
      detailloading: false,
      maskClosable: false,
      visible: false,
      attachmentVisible: false,
      confirmLoading: false,
      alarmAmount: '',
      setAlarmObj: null,
      page: 1,
      size: 10,
      outTypeObj: null,
      consumablesId: '', // 控制多次点击重复请求数据
      departmentData: [],
      userOrgIds: '',
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
      recordId: null,
      selectedRowKeys: [],
      selectedRows: [],
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
              this.selectedRows = this.selectedRows.filter(
                item => item.id !== record.id,
              )
              this.detailDatagrid(record.id, false)
              this.recordId = null
            }
            else {
              this.detailDatagrid(record.id, true)
              $(`#tableBox tr[data-row-key="${record.id}"]`)
                .addClass('hitek-tableRow-active')
                .siblings()
                .removeClass('hitek-tableRow-active')
              this.selectedRowKeys = [record.id]
              this.selectedRows = [record]
              this.recordId = record.id
            }
          },
        }
      },
      // egressStatusData
    }
  },
  computed: {},
  async created() {
    this.departmentData = await getDepartmentData()
    this.getData()
    this.getStatus()
    this.getUserOrgData()
  },
  methods: {
    addByRequest() {
      this.$refs.AddByRequestRef.open()
    },
    async folderManage(e, record) {
      e.stopPropagation()
      e.preventDefault()
      this.attachmentVisible = true
      await window.$oNextTick()

      this.$refs.FolderManage.showModal(record.id)
    },
    // 附件关闭
    cancelModal() {
      this.attachmentVisible = false
      this.$refs.FolderManage.cancelModal()
    },
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    outTypeFun(record) {
      if (record.recordType === '1') {
        return '入库'
      }
      else {
        return record.outType ? record.outType : ''
      }
    },
    getStatus() {
      this.spinning = true
      window.$oAjax({
        method: 'POST',
        url: `${window.$oApi.eqEgressList.status}`,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
        data: qs.stringify({
          dictGroupId: 'f852d85d47ed64a40147ed70894c0005',
        }),
      }).then((res) => {
        if (res && res.success) {
          this.outTypeObj = {}
          for (let i = 0; i < res.obj.length; i++) {
            this.outTypeObj[res.obj[i].typecode] = res.obj[i].typename
          }
        }
        else {
          this.outTypeObj = null
        }
        this.spinning = false
      })
      this.spinning = false
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
    getData() {
      const { page, size } = this
      const params = {
        page,
        size,
        quickQryParam: this.quickQryParam || '',
        eqDepartId: this.eqDepartId || '',
      }
      this.loading = true
      window.$oAjax
        .get(`${window.$oApi.consumablesList.list}`, {
          params,
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
        })
        .then((res) => {
          if (res && res.total >= 0) {
            this.data = res.rows
            this.pagination.total = res.total || 0
            this.pagination.current = page
            this.pagination.pageSize = size
          }
          else {
            this.data = []
            // eslint-disable-next-line ts/no-unused-expressions
            res.success === false
              ? window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
              : ''
          }
          this.clearSelRowClass()
          this.loading = false
        })
    },
    // 获取当前登录用户所属部门信息
    getUserOrgData() {
      window.$oAjax({
        url: window.$oApi.common.getUserOrgIds,
        method: 'get',
      }).then((res) => {
        if (res.success) {
          this.userOrgIds = res.obj
        }
      })
    },
    add(e, record) {
      e.stopPropagation()
      e.preventDefault()
      if (record) {
        this.$refs.Add.showModal([record], false)
      }
      else {
        this.selectedRowKeys.length > 0
          ? this.$refs.Add.showModal(this.selectedRows, false)
          : this.$refs.Add.showModal([], false)
      }
    },
    outbound(e, record) {
      e.stopPropagation()
      e.preventDefault()

      if (record) {
        this.confirmOutbound([record])
      }
      else {
        if (this.selectedRows.length === 0) {
          window.$oAntdModal.warning(window.$oMsgTips.info('请选择一条数据'))
        }
        else {
          this.confirmOutbound(this.selectedRows)
        }
      }
    },
    // 出库时，检查操作人与耗材部门是否一致
    confirmOutbound(list) {
      if (!isDefined(list[0].inventoryAlarmAmount)) {
        Modal.warn({
          title: '提示',
          content: '请先设置告警数量！',
        })
        return
      }

      if (this.userOrgIds.includes(list[0].departId)) {
        this.$refs.Outbound.showModal(list, false)
      }
      else {
        window.$oAntdConfirm({
          title: '出库',
          content: '操作人员在对非本部门耗材进行出库操作',
          mask: false,
          onOk: () => {
            this.$refs.Outbound.showModal(list, false)
          },
        })
      }
    },
    setAlarmAmount(e, record) {
      e.stopPropagation()
      e.preventDefault()
      this.setAlarmObj = record
      this.alarmAmount = record.inventoryAlarmAmount
      this.visible = true
    },
    deleteRow(e, record) {
      e.stopPropagation()
      e.preventDefault()
      if (this.userOrgIds.includes(record.departId)) {
        this.deleConfirm(record)
      }
      else {
        window.$oAntdConfirm({
          title: '删除',
          content: '操作人员在对非本部门耗材进行删除操作',
          mask: false,
          onOk: () => {
            this.deleConfirm(record)
          },
        })
      }
    },
    deleConfirm(record) {
      window.$oAntdConfirm({
        title: '删除',
        content: `确认删除吗？`,
        okText: '确认',
        mask: false,
        cancelText: '取消',
        onOk: () => {
          this.spinning = true
          window.$oAjax({
            method: 'get',
            url: window.$oApi.consumablesList.delUrl,
            params: { consumableId: record.id },
          }).then((res) => {
            if (res.success) {
              this.page = 1
              this.selectedRows = []
              this.selectedRowKeys = []
              this.detailData = []
              this.moreInfo = false
              this.getData()
            }
            else {
              window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
            }
            this.spinning = false
          })
        },
      })
    },
    detailDatagrid(recordId, isShow) {
      this.moreInfo = isShow
      if (isShow) {
        this.detailloading = true
        window.$oAjax
          .get(`${window.$oApi.consumablesList.detailDatagrid}`, {
            params: { consumablesId: recordId },
            headers: {
              'X-Requested-With': 'XMLHttpRequest',
            },
          })
          .then((res) => {
            if (res && res.total >= 0) {
              this.detailData = res.rows
            }
            else {
              this.detailData = []
              // eslint-disable-next-line ts/no-unused-expressions
              res.success === false
                ? window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
                : ''
            }
            this.detailloading = false
          })
      }
    },
    viewDetail(e, record) {
      e.stopPropagation()
      e.preventDefault()
      if (record.recordType === '1') {
        this.$refs.Add.showModal([record], true)
      }
      else {
        this.$refs.Outbound.showModal([record], true)
      }
    },
    handleReset() {
      this.page = 1
      this.quickQryParam = ''
      this.eqDepartId = null
      this.handleSearch()
    },
    handleSearch() {
      this.page = 1
      this.recordId = null
      this.getData()
      this.moreInfo = false
      this.consumablesId = ''
      this.detailData = []
    },
    getAddOutData() {
      this.page = 1
      this.getData()
      // eslint-disable-next-line ts/no-unused-expressions
      this.selectedRowKeys.length > 0
        ? this.detailDatagrid(this.selectedRowKeys[0], true)
        : ''
    },
    printFun(e, record) {
      const UDRPrint = new IlisPrintUdr()
      UDRPrint.commonPrint([record.id], 'EquipmentConsumableDetail')
    },
    printAcceptance(record) {
      const UDRPrint = new IlisPrintUdr()
      UDRPrint.commonPrint([record.id], 'ConsumableInletAcceptance')
    },
    printReceivingLedger() {
      const UDRPrint = new IlisPrintUdr()
      UDRPrint.printLedger('ConsumableReceiveLedger', {
        consumableId: this.recordId,
        inventoryType: '领用',
      })
    },
    typeCancel() {
      this.visible = false
      this.setAlarmObj = null
    },
    typeOk() {
      // 规程类型新增编辑
      // eslint-disable-next-line regexp/no-unused-capturing-group
      const reg = /^\d+(\.\d+)?$/
      if (this.alarmAmount && !reg.test(`${this.alarmAmount}`)) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请输入正数'))
        return
      }
      setTimeout(() => {
        this.confirmLoading = true
        const data = {
          id: this.setAlarmObj.id,
          inventoryAlarmAmount: this.alarmAmount,
        }
        window.$oAjax({
          method: 'POST',
          url: window.$oApi.consumablesList.setAlarmAmount,
          data: qs.stringify(data),
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
        }).then((res) => {
          if (res.success) {
            window.$oAntdMessage.success('操作成功')
            this.getData()
            this.typeCancel()
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
          }
          this.confirmLoading = false
        })
      }, 200)
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
</style>
