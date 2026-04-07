<template>
  <div>
    <div>
      <a-form ref="formRef" style="width: 520px" :model="formState">
        <a-form-item
          label="查询内容"
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
        >
          <a-input v-model:value="formState.queryCode" placeholder="请输入图标名称" />
        </a-form-item>
        <a-form-item
          label="图标类型"
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
        >
          <a-select v-model:value="formState.type" placeholder="请选择">
            <a-select-option value="1">
              系统图标
            </a-select-option>
            <a-select-option value="2">
              菜单图标
            </a-select-option>
            <a-select-option value="3">
              桌面图标
            </a-select-option>
          </a-select>
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
          新增图标
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
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'iconPath'">
            <span v-if="record.url">
              <img :src="record.url" style="max-width: 56px" />
            </span>
          </template>

          <template v-if="column.dataIndex === 'operation'">
            <div class="table-handle">
              <a @click="(e) => deleteRow(e, record)">删除</a>
              <a @click="(e) => addEditRow(e, record)">编辑</a>
              <a @click="(e) => addEditRow(e, record, true)">详情</a>
            </div>
          </template>
        </template>
      </a-table>
    </div>
    <ht-modal
      :title="addEditTitle"
      centered
      :open="visible"
      :mask-closable="false"
      class="hitek-add-modal"
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
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { rootUrl } from '~/providers/configs/rootUrl'
import Add from './components/addEdit.vue'

const columns = [
  {
    title: '图标名称',
    dataIndex: 'iconName',
  },
  {
    title: '图标类型',
    dataIndex: 'iconType',
    customRender: ({ text }) => {
      const obj = { 1: '系统图标', 2: '菜单图标', 3: '桌面图标' }
      return text ? obj[text] : ''
    },
  },
  {
    title: '图标',
    dataIndex: 'iconPath',
    scopedSlots: { customRender: 'iconPath' },
  },
  {
    title: '文件类型',
    dataIndex: 'extend',
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
  },
  data() {
    return {
      dayjs,
      visible: false,
      isDetail: false,
      data: [],
      columns,
      rootUrl,
      loading: false,
      formState: {},
      labelCol: { span: 5 },
      wrapperCol: { span: 16 },
      queryParam: null,
      page: 1,
      size: 10,
      addEditTitle: '新增图标',
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
          this.page = 1
          this.size = size
          this.getData()
        },
      },
      selectedRowKeys: [],
      selectedRows: [],
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
    getData(flag) {
      this.visible = false
      if (flag) {
        this.page = 1
      }
      const { page, size } = this
      this.loading = true
      window.$oAjax({
        url: window.$oApi.iconList.list,
        method: 'get',
        params: {
          page,
          size,
          ...this.queryParam,
        },
      }).then((res) => {
        if (res.code === 20000 && res.data.count >= 0) {
          this.data = res.data.rows
          this.pagination.total = res.data.count || 0
          this.pagination.current = page
          this.pagination.pageSize = size
        }
        else {
          this.data = []
        }
        this.loading = false
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
            method: 'DELETE',
            url: `${window.$oApi.iconList.delUrl}/${record.id}`,
          }).then((res) => {
            if (res.code === 20000) {
              this.page = 1
              this.getData()
            }
            else {
              if (res.success === false) {
                window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
              }
            }
            this.spinning = false
          })
        },
      })
    },
    addEditRow(e, record, isDetail) {
      this.visible = true
      // eslint-disable-next-line ts/no-this-alias
      const self = this
      const recordId = record ? record.id : ''
      this.isDetail = !!isDetail
      if (recordId) {
        this.addEditTitle = '编辑图标'
      }
      else {
        this.addEditTitle = '新增图标'
      }
      if (this.isDetail) {
        this.addEditTitle = '查看图标'
      }

      if (this.$refs.Add) {
        this.$refs.Add.showModal(record, this.isDetail)
      }
      else {
        let timer = setInterval(() => {
          if (self.$refs.Add) {
            clearInterval(timer)
            timer = null
            self.$refs.Add.showModal(record, self.isDetail)
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
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
