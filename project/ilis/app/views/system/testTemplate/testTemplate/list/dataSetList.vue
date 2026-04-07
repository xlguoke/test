<template>
  <div>
    <a-spin :spinning="loading">
      <div class="spin-content">
        <div class="projectManageList-search">
          <a-input
            v-model:value="recordSetName"
            placeholder="请输入名称回车即可查询"
            class="mr-2"
            @press-enter="searchFun()"
          />
          <a-button @click="searchFun">
            查询
          </a-button>
        </div>
        <div style="padding: 10px 0">
          <a-button type="primary" @click="addEditRow">
            新增
          </a-button>
          <a-button @click="updateRow">
            更新
          </a-button>
          <a-button @click="deleteRow">
            删除数据集
          </a-button>
        </div>
        <a-table
          id="tableBox"
          :columns="columns"
          :pagination="false"
          :data-source="data"
          :scroll="{ y: 300 }"
          bordered
          :custom-row="customRow"
          :row-class-name="rowClassName"
          row-key="index"
          :row-selection="rowSelection"
        >
        </a-table>
      </div>
    </a-spin>
    <AddDataSet ref="AddDataSet" :callback="getData" />
  </div>
</template>

<script>
import { rootUrl } from '~/providers/configs/rootUrl'
import AddDataSet from './components/addDataSet.vue'
// import moment from "moment"

const columns = [
  {
    title: '数据集名称',
    dataIndex: 'recordSetName',
  },
  {
    title: '检测项目名称',
    dataIndex: 'testItemName',
  },
  {
    title: '检测项目ID',
    dataIndex: 'groupKey',
  },
  {
    title: '样品编号',
    dataIndex: 'testObjectCode',
  },
  {
    title: '样品ID',
    dataIndex: 'testObjectId',
  },
]

export default {
  components: {
    AddDataSet,
  },
  data() {
    return {
      // dayjs,
      recordSetName: '', // 查询内容
      testObjectId: '', // 样品id
      useUdrIds: '', // udr ids
      groupKeys: '', // udr ids
      data: [],
      columns,
      rootUrl,
      loading: false,
      // page: 1,
      // size: 10,
      pagination: {
        // current: 1,
        // total: 0,
        //  ...window.pageConfig,
        // onChange: (page) => {
        //   this.page = page;
        //   this.getData();
        // },
        // onShowSizeChange: (page, size) => {
        //   this.size = size;
        //   this.getData();
        // }
      },
      selectedRowKeys: [],
      selectedRows: [],
      customRow: (record) => {
        return {
          onClick: () => {
            if (this.selectedRowKeys.includes(record.index)) {
              const arr = this.selectedRowKeys
              arr.splice(
                arr.findIndex(item => item === record.index),
                1,
              )
              this.selectedRows = this.selectedRows.filter(
                item => item.index !== record.index,
              )
            }
            else {
              this.selectedRowKeys.push(record.index)
              this.selectedRows.push(record)
            }
          },
        }
      },
    }
  },
  computed: {
    rowSelection() {
      const { selectedRowKeys } = this
      return {
        selectedRowKeys,
        // type: this.selectPage,
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
          this.selectedRows = selectedRows
        },
      }
    },
  },
  created() {},
  methods: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    searchFun() {
      // this.recordSetName = "";
      this.getData()
    },
    getData() {
      const params = {
        testObjectIds: this.testObjectId,
        groupKeys: this.groupKeys,
      }
      // eslint-disable-next-line ts/no-unused-expressions
      this.recordSetName ? (params.recordSetName = this.recordSetName) : ''
      this.loading = true
      window.$oAjax({
        url: window.$oApi.testTemplate.getRecordSets,
        method: 'get',
        params,
      }).then((res) => {
        if (res.code === 20000 && Array.isArray(res.data)) {
          this.clearRows()
          const arr = []
          // eslint-disable-next-line array-callback-return
          res.data.map((item, index) => {
            arr.push({
              ...item,
              index,
            })
          })
          this.data = arr
        }
        else {
          this.data = []
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
        this.loading = false
      })
    },
    addEditRow() {
      this.$refs.AddDataSet.showModal(this.testObjectId)
    },
    deleteRow() {
      if (this.selectedRowKeys.length === 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择要删除的数据'))
        return
      }

      // eslint-disable-next-line unused-imports/no-unused-vars
      const a = this.selectedRows.map(item => item.id)
      window.$oAntdConfirm({
        title: '提示',
        content: `确认删除 "${this.selectedRows
          .map(i => i.recordSetName)
          .join(';')}" 数据集?`,
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          window.$oAjax({
            method: 'delete',
            url: window.$oApi.testTemplate.delRecordSet,
            data: JSON.stringify(this.selectedRows.map(item => item.id)),
            headers: {
              'Content-Type': 'application/json',
            },
          }).then((res) => {
            if (res.code === 20000) {
              window.$oAntdMessage.success('删除成功！')
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
    updateRow() {
      if (this.selectedRowKeys.length === 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择数据'))
        return
      }
      const arr = []
      // eslint-disable-next-line array-callback-return
      this.selectedRows.map((item) => {
        arr.push({
          groupKey: item.groupKey,
          recordSetName: item.recordSetName,
          testObjectId: item.testObjectId,
        })
      })
      this.spinning = true
      window.$oAjax({
        method: 'POST',
        url: window.$oApi.testTemplate.synRecordSet,
        data: JSON.stringify(arr),
        headers: {
          'Content-Type': 'application/json',
        },
      }).then((res) => {
        if (res.code === 20000) {
          window.$oAntdMessage.success('更新成功！')
          this.getData()
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
        this.spinning = false
      })
    },
    showModal(testObjectId, groupKeys) {
      if (testObjectId) {
        this.testObjectId = testObjectId
        this.groupKeys = groupKeys
        this.getData()
      }
    },
    clearRows() {
      this.selectedRows = []
      this.selectedRowKeys = []
    },
  },
}
</script>

<style lang="less">
.projectManageList-search {
  input {
    width: 300px;
    vertical-align: middle;
  }

  button {
    vertical-align: middle;
  }
}
</style>
