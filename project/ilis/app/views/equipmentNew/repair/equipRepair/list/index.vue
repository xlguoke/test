<template>
  <div class="equipmentOutgo">
    <a-spin :spinning="spinning">
      <div class="spin-content">
        <a-form ref="formRef" layout="inline" :label-col="labelCol" :model="formState">
          <a-form-item label="查询内容">
            <a-input
              v-model:value="formState.quickQryParam"
              style="width: 200px"
              class="!mb-2"
              placeholder="请输入设备编号、设备名称"
            />
          </a-form-item>
          <a-form-item label="维修状态">
            <a-select
              v-model:value="formState.status"
              style="width: 120px"
              placeholder="请选择"
            >
              <a-select-option value="10">
                填写中
              </a-select-option>
              <a-select-option value="20">
                填写完成
              </a-select-option>
              <a-select-option value="30">
                审批中
              </a-select-option>
              <a-select-option value="40">
                维修中
              </a-select-option>
              <a-select-option value="50">
                维修完成
              </a-select-option>
              <a-select-option value="60">
                验证审批中
              </a-select-option>
              <a-select-option value="70">
                完成
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="维修费用">
            <a-input-number
              v-model:value="formState.totalFeeMin"
              :min="0"
              style="width: 120px"
              placeholder="请输入维修费用"
              @change="changeFeeMin"
            />
            ~
            <a-input-number
              v-model:value="formState.totalFeeMax"
              :min="totalFeeMin"
              style="width: 120px"
              placeholder="请输入维修费用"
            />
          </a-form-item>
          <a-form-item label="保修时间">
            <a-range-picker
              v-model:value="formState.repairServiceEndTime"
              style="width: 100%"
              value-format="YYYY-MM-DD"
            />
          </a-form-item>
          <a-form-item label="申请时间">
            <a-range-picker v-model:value="formState.commonDate" value-format="YYYY-MM-DD" style="width: 100%" />
          </a-form-item>
          <a-form-item label="申请人">
            <a-input v-model:value="formState.userName" placeholder="请输入申请人" />
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="handleSearch">
              查询
            </a-button>
            <a-button style="margin-left: 10px" @click="handleReset">
              重置
            </a-button>
          </a-form-item>
        </a-form>
        <div style="padding: 10px 0">
          <a-button type="primary" @click="addEditRow">
            新增维修申请
          </a-button>
          <a-button @click="printFun">
            打印
          </a-button>
          <a-button @click="onExport">
            导出
          </a-button>
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
              <span>{{ text }} {{ record.amountUnit }}</span>
            </template>

            <template v-if="column.dataIndex === 'status'">
              <span>
                {{ applyStatusObj[text] }}
              </span>
            </template>

            <template v-if="column.dataIndex === 'attachmentTitle'">
              <p
                v-for="(item, index) in record.attachment"
                :key="index"
                style="margin: 3px 0"
              >
                <a type="link" @click="downloadEnclosure(item.path)">{{
                  item.title
                }}</a>
              </p>
            </template>

            <template v-if="column.dataIndex === 'operation'">
              <div class="table-handle">
                <template
                  v-if="
                    record.status === '10'
                      || record.status === '20'
                      || record.status === '50'
                  "
                >
                  <a @click="(e) => deleteRow(e, record)">删除</a>
                  <a @click="(e) => addEditRow(e, record)">编辑</a>
                  <a @click="(e) => submitRow(e, record)">提交</a>
                </template>
                <template v-if="record.status === '40'">
                  <a @click="(e) => deleteRow(e, record)">删除</a>
                  <a @click="(e) => addEditRow(e, record)">维修完成</a>
                </template>
                <a @click="(e) => addEditRow(e, record, true)">详情</a>
                <a @click="(e) => viewLog(e, record)">日志</a>
              </div>
            </template>
          </template>
        </a-table>
      </div>
    </a-spin>
    <ht-modal
      v-if="visible"
      :title="addEditTitle"
      centered
      :open="visible"
      :mask-closable="false"
      width="715px"
      class="hitek-add-modal"
      @cancel="handleCancel"
    >
      <AddEditComponent ref="AddEditComponent" :callback="getData" @saveok="handleSaveOk" />
      <template #footer>
        <div>
          <a-button v-if="!isDetail" @click="handleCancel">
            取消
          </a-button>
          <a-button v-if="!isDetail" type="primary" :loading="confirmLoading" @click="handleOk">
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
import { rootUrl } from '~/providers/configs/rootUrl'
import AddEditComponent from './components/addModal.vue'

const columns = [
  {
    title: '维修单号',
    dataIndex: 'repairSn',
  },
  {
    title: '设备信息',
    dataIndex: 'equipmentInfo',
    customRender: ({ record }) => {
      let str = ''
      if (record.equipmentSn) {
        str = `${record.equipmentName}(${record.equipmentSn})`
      }
      else {
        str = `${record.equipmentName}`
      }
      return str
    },
  },
  {
    title: '故障现象',
    dataIndex: 'phenomenon',
  },
  {
    title: '科室',
    dataIndex: 'departname',
  },
  {
    title: '申请人',
    dataIndex: 'createName',
  },
  {
    title: '申请时间',
    dataIndex: 'createDate',
    width: '10%',
    customRender: ({ text }) => (text ? dayjs(text).format('YYYY-MM-DD') : ''),
  },
  {
    title: '附件',
    dataIndex: 'attachmentTitle',
    width: '15%',
  },
  {
    title: '维修状态',
    dataIndex: 'status',
    width: '10%',
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
    Logs,
  },
  data() {
    return {
      dayjs,
      visible: false,
      formState: {},
      queryParam: null,
      labelCol: { width: '100px' },
      wrapperCol: { width: '200px' },
      isDetail: false,
      totalFeeMin: 0,
      data: [],
      columns,
      spinning: false,
      addEditTitle: '新增维修申请',
      auditTypeId: '',
      page: 1,
      size: 10,
      confirmLoading: false,
      applyStatusObj: {
        10: '填写中',
        20: '填写完成',
        30: '审批中',
        40: '维修中',
        50: '维修完成',
        60: '验证审批中',
        70: '完成',
      },
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
            }
            else {
              $(`#tableBox tr[data-row-key="${record.id}"]`)
                .addClass('hitek-tableRow-active')
                .siblings()
                .removeClass('hitek-tableRow-active')
              this.selectedRowKeys = [record.id]
            }
          },
        }
      },
    }
  },
  computed: {},
  created() {
    this.getData()
  },
  methods: {
    async onExport() {
      if (this.pagination.total == 0) {
        window.$oAntdMessage.warning('未找到满足条件数据，暂不支持导出!')
        return
      }
      const a = document.createElement('a')
      const params = {
        ...this.queryParam,
      }
      let href = `${rootUrl}/eqRepairController.do?export`

      Object.keys(params)
        .filter(key => !!params[key])
        .map(key => (href += `&${key}=${params[key]}`))

      a.href = href
      a.click()
    },
    changeFeeMin(e) {
      this.totalFeeMin = e
    },
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    handleSaveOk(isOk) {
      this.confirmLoading = !isOk // isOk为false，需要开启loading
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
    downloadEnclosure(path) {
      window.open(path)
    },
    getData() {
      this.visible = false
      const { page, size } = this
      const params = {
        page,
        rows: size,
        ...this.queryParam,
      }
      this.spinning = true
      window.$oAjax({
        method: 'GET',
        url: window.$oApi.equipRepair.list,
        params,
      }).then((res) => {
        if (res && res.rows && res.rows.length > 0) {
          this.data = res.rows.map((item) => {
            item.attachmentPath = item.attachmentPath
              ? item.attachmentPath.split('@@@')
              : []
            item.attachmentTitle = item.attachmentTitle
              ? item.attachmentTitle.split('@@@')
              : []
            item.attachment = item.attachmentTitle.map((element, index) => {
              return {
                title: item.attachmentTitle[index],
                path: item.attachmentPath[index],
              }
            })
            return item
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
    addEditRow(e, record, isDetail) {
      this.visible = true
      // eslint-disable-next-line ts/no-this-alias
      const self = this
      const recordId = record ? record.id : ''
      const status = record ? record.status : ''
      this.isDetail = !!isDetail
      if (recordId) {
        this.addEditTitle = '编辑维修申请'
      }
      else {
        this.addEditTitle = '新增维修申请'
      }
      if (this.isDetail) {
        this.addEditTitle = '查看维修申请'
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
    handleOk() {
      this.$refs.AddEditComponent.handleOk()
    },
    handleCancel() {
      this.visible = false
      this.$refs.AddEditComponent.handleCancel()
    },
    deleteRow(e, record) {
      // e.stopPropagation();
      // e.preventDefault();
      // eslint-disable-next-line ts/no-this-alias
      const self = this
      window.$oAntdConfirm({
        title: '提示',
        content: '确定要删除吗?',
        onOk() {
          window.$oAjax
            .get(window.$oApi.equipRepair.delRepair, {
              params: {
                repairId: record.id,
              },
            })
            .then((res) => {
              self.cancelTableCall(res)
            })
        },
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
      this.formState = {}
      this.queryParam = null
      this.getData()
    },
    handleSearch() {
      this.page = 1

      this.$refs.formRef.validateFields().then(() => {
        const fieldsValue = { ...this.formState }
        const commonDate = fieldsValue.commonDate
        const repairServiceEndTime = fieldsValue.repairServiceEndTime
        if (commonDate && commonDate.length > 0) {
          fieldsValue.commonDateBegin = `${commonDate[0]} 00:00:00`
          fieldsValue.commonDateEnd = `${commonDate[1]} 23:59:59`
          delete fieldsValue.commonDate
        }
        if (repairServiceEndTime && repairServiceEndTime.length > 0) {
          fieldsValue.repairServiceEndTimeStart = `${repairServiceEndTime[0]} 00:00:00`
          fieldsValue.repairServiceEndTimeEnd = `${repairServiceEndTime[1]} 23:59:59`
          delete fieldsValue.repairServiceEndTime
        }
        this.queryParam = {
          ...fieldsValue,
        }
        this.getData(true)
      })
    },
    viewLog(e, record) {
      this.$refs.Logs.showModal(record.id, '16')
    },
    submitRow(e, record) {
      this.auditTypeId = ''
      // 设备维修信息审批 110 设备维修结果验收审批 120
      if (record.status === '10' || record.status === '20') {
        this.auditTypeId = '110'
      }
      if (record.status === '40' || record.status === '50') {
        this.auditTypeId = '120'
      }
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
      let url = window.$oApi.equipRepair.submitRepairVerify
      if (this.auditTypeId === '110') {
        url = window.$oApi.equipRepair.submitRepair
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
    // 打印
    printFun() {
      if (this.selectedRowKeys.length === 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请先选择一条数据'))
        return
      }

      const UDRPrint = new IlisPrintUdr()
      UDRPrint.commonPrint(this.selectedRowKeys, 'EquipmentRepair')
    },
  },
}
</script>

<style lang="less">
.equipmentOutgo {
  padding: 15px;
  .ant-form-item {
    margin-bottom: 8px;
  }
}
.hitek-add-modal {
  .ant-modal-body {
    min-height: 450px !important;
  }
}
</style>
