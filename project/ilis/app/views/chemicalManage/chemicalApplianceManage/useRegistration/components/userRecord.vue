<template>
  <div>
    <ht-modal
      title="使用记录"
      centered
      :mask-closable="false"
      :open="visible"
      :z-index="9999"
      width="90%"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <a-spin :spinning="spinning">
        <div class="spin-content">
          <div>
            <span>化学品名称：
              {{ pageData.consumeDetail.chemicalName || '' }}</span>
            <span style="margin: 0 30px">出库数量：{{ pageData.consumeDetail.outAmount }}</span>
            <span>返还数量：{{ pageData.consumeDetail.returnAmount }}</span>
            <span style="margin: 0 30px">计量单位：{{ pageData.consumeDetail.chemicalUnit }}</span>
          </div>
          <div style="padding: 10px 0"></div>
          <div class="content-table">
            <a-table
              id="tableBox"
              :columns="columns"
              :data-source="pageData.inventoryOutRecordVOs"
              :row-class-name="rowClassName"
              bordered
              row-key="id"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'operation'">
                  <span class="table-handle">
                    <a @click="(e) => deleteRow(e, record)">移除</a>
                  </span>
                </template>
              </template>
            </a-table>
          </div>
        </div>
      </a-spin>
    </ht-modal>
  </div>
</template>

<script>
import { formatTime } from '~/providers/common/utils'

const columns = [
  {
    title: '类型',
    dataIndex: 'type',
  },
  {
    title: '当次使用量',
    dataIndex: 'amount',
  },
  {
    title: '关联任务',
    dataIndex: 'testTaskCodes',
    // customRender:({ text })=>(  egressStatusData.find(item=>item.value==text)?egressStatusData.find(item=>item.value==text).name:"" )
  },
  {
    title: '溶液名称',
    dataIndex: 'solutionNames',
    // customRender:({ text })=>(  egressStatusData.find(item=>item.value==text)?egressStatusData.find(item=>item.value==text).name:"" )
  },
  {
    title: '备注',
    dataIndex: 'remark',
    // customRender:({ text })=>(  egressStatusData.find(item=>item.value==text)?egressStatusData.find(item=>item.value==text).name:"" )
  },
  {
    title: '操作人',
    dataIndex: 'operationPerson',
  },
  {
    title: '操作时间',
    dataIndex: 'operationTime',
    customRender: ({ text }) => formatTime(text, 'YYYY-MM-DD HH:mm:ss'),
  },
  {
    title: '操作',
    dataIndex: 'operation',
    width: 125,
    scopedSlots: { customRender: 'operation' },
  },
]

export default {
  components: {},
  props: ['callback'],
  data() {
    return {
      id: '',
      pageData: {
        inventoryOutRecordVOs: [],
        consumeDetail: {},
      },
      visible: false,
      columns,
      spinning: false,
    }
  },
  computed: {
    rowSelection() {
      // eslint-disable-next-line ts/no-this-alias
      const that = this
      const { selectedRowKeys } = this
      return {
        selectedRowKeys,
        type: this.selectPage,
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
          this.selectedRows = selectedRows
        },
        getCheckboxProps: record => ({
          props: {
            disabled: !!record.disabled,
          },
        }),
        onSelect(record, selected) {
          if (!selected) {
            that.unSelect(record.id)
          }
        },
      }
    },
  },
  created() {},
  methods: {
    deleteRow(e, record) {
      e.stopPropagation()
      e.preventDefault()
      // eslint-disable-next-line ts/no-this-alias
      const self = this
      window.$oAntdConfirm({
        title: '提示',
        zIndex: 10000,
        content: '确定要移除吗?',
        onOk() {
          self.spinning = true
          window.$oAjax
            .delete(`rest/chemical/inventoryOutRecord/${record.id}`, {})
            .then((res) => {
              self.spinning = false
              if (res.code === 20000) {
                window.$oAntdMessage.success('删除成功')
                self.getData()
              }
              else {
                window.$oAntdMessage.warning(res.message)
              }
            })
        },
        onCancel() {},
      })
    },
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    unSelect(id) {
      this.acceptData = this.acceptData.filter(item => item.id != id)
    },
    handleOk() {
      // this.callback(this.ids, this.selectedRows);
      this.handleCancel()
    },
    handleCancel() {
      this.selectedRows = []
      this.selectedRowKeys = []
      this.visible = false
    },
    showModal(data) {
      // this.ids = ids;
      // this.selectPage = type ? type : "checkbox";
      // this.acceptData = acceptData || [];
      this.id = data.id
      this.getData()
      this.visible = true
    },
    getData() {
      this.spinning = true
      window.$oAjax
        .get(`/rest/chemical/inventoryOutRecord/detail/${this.id}`, {
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
        })
        .then((res) => {
          if (res.code === 20000) {
            this.pageData = res.data
          }
          else {
            this.pageData = {}
          }
          this.spinning = false
        })
    },
    handleReset() {
      this.handleSearch()
    },
    handleSearch() {
      this.page = 1
      this.getData()
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
.content-table {
  height: 400px;
  overflow-y: auto;
}
</style>
