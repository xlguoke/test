<template>
  <div>
    <div>
      <a-form ref="formRef" style="width: 520px" :model="formState">
        <a-form-item
          label="查询内容"
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
        >
          <a-input
            v-model:value="formState.quickQryParam"
            placeholder="请输入设备编号、设备名称"
          />
        </a-form-item>
        <a-form-item
          label="启停类型"
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
        >
          <a-select v-model:value="formState.type" placeholder="请选择">
            <a-select-option value="1">
              启用
            </a-select-option>
            <a-select-option value="0">
              停用
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item
          label="启停时间"
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
        >
          <a-range-picker v-model:value="formState.commonDate" value-format="YYYY-MM-DD" style="width: 100%" />
        </a-form-item>
        <a-form-item
          label="申请人员"
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
        >
          <a-input v-model:value="formState.userName" placeholder="请输入" />
        </a-form-item>
        <a-form-item :wrapper-col="{ span: 18, offset: 5 }">
          <a-button @click="searchFun">
            查询
          </a-button>
          <a-button style="margin-left: 10px" @click="resetForm">
            重置
          </a-button>
        </a-form-item>
      </a-form>
      <div style="padding: 10px 0">
        <a-button type="primary" @click="addEditRow">
          新增启用/停用记录
        </a-button>
        <a-button @click="printFun">
          打印
        </a-button>
        <a-button @click="onExport">
          导出
        </a-button>
      </div>
      <!-- :rowSelection="rowSelection" -->
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
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'applyStatus'">
            <span>
              {{ applyStatusObj[record.applyStatus] }}
            </span>
          </template>

          <template v-if="column.dataIndex === 'operation'">
            <span class="table-handle">
              <a
                v-if="record.applyStatus !== '20'"
                @click="(e) => deleteRow(e, record)"
              >删除</a>
              <template
                v-if="
                  record.applyStatus === '10'
                    || record.applyStatus === '30'
                    || record.applyStatus === '50'
                "
              >
                <a @click="(e) => addEditRow(e, record.id)">编辑</a>
                <a @click="(e) => submitRow(e, record)">提交</a>
              </template>
              <a @click="(e) => addEditRow(e, record.id, true)">详情</a>
              <a @click="(e) => viewLog(e, record)">日志</a>
            </span>
          </template>
        </template>
      </a-table>
    </div>
    <ht-modal
      :title="addEditTitle"
      centered
      :open="visible"
      :mask-closable="false"
      width="600px"
      @cancel="handleCancel"
    >
      <Add ref="Add" :callback="getData" />
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
import Add from './components/addEdit.vue'

const columns = [
  {
    title: '设备编号',
    dataIndex: 'equipmentSn',
  },
  {
    title: '设备名称',
    dataIndex: 'equipmentName',
  },
  {
    title: '规格型号',
    dataIndex: 'standard',
  },
  {
    title: '出厂编号',
    dataIndex: 'factorySn',
  },
  {
    title: '启停类型',
    dataIndex: 'ssType',
    customRender: ({ text }) => (text === '0' ? '停用' : '启用'),
  },
  {
    title: '启停时间',
    dataIndex: 'ssTime',
    customRender: ({ text }) => (text ? dayjs(text).format('YYYY-MM-DD') : ''),
  },
  {
    title: '申请说明',
    dataIndex: 'applyExplain',
  },
  {
    title: '申请时间',
    dataIndex: 'createDate',
    customRender: ({ text }) => (text ? dayjs(text).format('YYYY-MM-DD') : ''),
  },
  {
    title: '申请人',
    dataIndex: 'createName',
  },
  {
    title: '状态',
    dataIndex: 'applyStatus',
    scopedSlots: { customRender: 'applyStatus' },
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
    Add,
    SubmitPage,
    Logs,
  },
  data() {
    return {
      dayjs,
      visible: false,
      isDetail: false,
      data: [],
      columns,
      loading: false,
      formState: {},
      labelCol: { span: 5 },
      wrapperCol: { span: 16 },
      queryParam: null,
      page: 1,
      size: 10,
      addEditTitle: '新增启用/停用记录',
      applyStatusObj: {
        10: '填写中',
        20: '审批中',
        30: '审批拒绝',
        40: '审批通过',
        50: '申请被驳回',
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
              this.selectedRows = this.selectedRows.filter(
                item => item.id !== record.id,
              )
            }
            else {
              $(`#tableBox tr[data-row-key="${record.id}"]`)
                .addClass('hitek-tableRow-active')
                .siblings()
                .removeClass('hitek-tableRow-active')
              this.selectedRowKeys = [record.id]
              this.selectedRows = [record]
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
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    searchFun() {
      this.$refs.formRef.validateFields().then(() => {
        const fieldsValue = { ...this.formState }
        const commonDate = fieldsValue.commonDate
        if (commonDate && commonDate.length > 0) {
          fieldsValue.commonDateBegin = `${commonDate[0]} 00:00:00`
          fieldsValue.commonDateEnd = `${commonDate[1]} 23:59:59`
          delete fieldsValue.commonDate
        }
        this.queryParam = {
          ...fieldsValue,
        }
        this.getData(true)
      })
    },
    resetForm() {
      this.formState = {}
      this.queryParam = null
      this.getData(true)
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
    getData(flag) {
      this.visible = false
      if (flag) {
        this.page = 1
      }
      const { page, size } = this
      const params = {
        page,
        rows: size,
        ...this.queryParam,
      }
      this.loading = true
      window.$oAjax({
        url: window.$oApi.equipStartStop.list,
        method: 'POST',
        data: qs.stringify(params),
      }).then((res) => {
        if (res && res.total > 0) {
          this.data = res.rows
          this.pagination.total = res.total || 0
          this.pagination.current = page
          this.pagination.pageSize = size
        }
        else {
          this.pagination.total = 0
          this.data = []
        }
        this.clearSelRowClass()
        this.loading = false
      })
    },
    async onExport() {
      if (this.pagination.total == 0) {
        window.$oAntdMessage.warning('未找到满足条件数据，暂不支持导出!')
        return
      }
      const a = document.createElement('a')
      const params = {
        ...this.queryParam,
      }
      let href = `${rootUrl}/eqStartstopController.do?export`

      Object.keys(params)
        .filter(key => !!params[key])
        .map(key => (href += `&${key}=${params[key]}`))

      a.href = href
      a.click()
    },
    // 查看日志
    viewLog(e, data) {
      this.$refs.Logs.showModal(data.id, '20')
    },
    submitRow(e, record) {
      checkProcessModel(150, record.id, (res) => {
        if (res) {
          this.$refs.SubmitPage.showModal(record, '150')
        }
        else {
          this.searchFun()
        }
      })
    },
    getSubmit(data) {
      window.$oAjax({
        method: 'POST',
        url: window.$oApi.equipStartStop.submitUrl,
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
    deleteRow(e, record) {
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
            url: window.$oApi.equipStartStop.delById,
            params: { id: record.id },
          }).then((res) => {
            if (res.success) {
              this.page = 1
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
    addEditRow(e, recordId, isDetail) {
      this.visible = true
      // eslint-disable-next-line ts/no-this-alias
      const self = this
      recordId = recordId || ''
      this.isDetail = !!isDetail
      if (recordId) {
        this.addEditTitle = '编辑启用/停用记录'
      }
      else {
        this.addEditTitle = '新增启用/停用记录'
      }
      if (this.isDetail) {
        this.addEditTitle = '查看启用/停用记录'
      }

      if (this.$refs.Add) {
        this.$refs.Add.showModal(recordId, this.isDetail)
      }
      else {
        let timer = setInterval(() => {
          if (self.$refs.Add) {
            clearInterval(timer)
            timer = null
            self.$refs.Add.showModal(recordId, self.isDetail)
          }
        }, 100)
      }
    },
    handleOk() {
      this.$refs.Add.handleOk()
    },
    handleCancel() {
      this.visible = false
      this.$refs.Add.handleCancel()
    },
    // 打印
    printFun() {
      if (this.selectedRowKeys.length === 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请先选择一条数据'))
        return
      }

      const UDRPrint = new IlisPrintUdr()
      UDRPrint.commonPrint(this.selectedRowKeys, 'EquipmentStartStop', { jsonParam: '' })
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
@import './index.less';
</style>
