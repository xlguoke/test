<template>
  <div>
    <ht-modal
      title="选择模板"
      centered
      :mask-closable="false"
      :open="visible"
      width="80%"
      class="hitek-add-modal"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <a-spin :spinning="spinning">
        <div class="spin-content">
          <div style="padding: 10px 0">
            <a-button type="primary" @click="addEditRow">
              添加
            </a-button>
          </div>
          <div>
            <a-table
              id="tableBox"
              :columns="columns"
              :pagination="false"
              :data-source="data"
              :row-class-name="rowClassName"
              bordered
              :custom-row="customRow"
              :row-selection="rowSelection"
              row-key="id"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'operation'">
                  <div class="table-handle">
                    <a class="text-blue-500" @click="addEditRow(record)">编辑</a>
                    <a class="text-blue-500" @click="showDelete(record.id)">删除</a>
                  </div>
                </template>
              </template>
            </a-table>
          </div>
        </div>
        <ht-modal
          :title="editId ? '编辑模板名称' : '添加模板名称'"
          :mask-closable="false"
          :open="addEditvisible"
          centered
          @ok="addEditOk"
          @cancel="addEditCancel"
        >
          <a-form-item
            :label-col="{ span: 6 }"
            :wrapper-col="{ span: 17 }"
            label="请输入模板名称："
          >
            <a-input v-model:value="addEditName" placeholder="请输入" />
          </a-form-item>
        </ht-modal>
      </a-spin>
    </ht-modal>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import qs from 'qs'

const columns = [
  {
    title: '模板名称',
    dataIndex: 'name',
  },
  {
    title: '创建人',
    dataIndex: 'createName',
  },
  {
    title: '创建时间',
    dataIndex: 'createDate',
    customRender: ({ text }) => (text ? dayjs(text).format('YYYY-MM-DD') : ''),
  },
  {
    title: '操作',
    dataIndex: 'operation',
    minWidth: 80,
    scopedSlots: { customRender: 'operation' },
  },
]

export default {
  components: {},
  props: ['callback'],
  data() {
    return {
      dayjs,
      data: [],
      visible: false,
      addEditvisible: false,
      confirmLoading: false,
      columns,
      spinning: false,
      selectPage: 'radio', // 单选或者多选
      editId: false,
      addEditName: '',
      selectedRowKeys: [],
      selectedRows: [],
      customRow: (record) => {
        return {
          onClick: () => {
            if (this.selectPage === 'radio') {
              this.selectedRowKeys = [record.id]
              this.selectedRows = [record]
            }
            else {
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
    handleOk() {
      if (this.selectedRows.length === 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择模板'))
        return
      }
      this.callback(this.selectedRows)
      this.handleCancel()
    },
    handleCancel() {
      this.selectedRows = []
      this.selectedRowKeys = []
      this.rowSelection.selectedRowKeys = []
      this.visible = false
    },
    showModal() {
      this.visible = true
      this.getData()
    },
    getData() {
      this.spinning = true
      window.$oAjax({
        method: 'GET',
        url: window.$oApi.archiving.listTemplate,
      }).then((res) => {
        if (res.code === 20000) {
          this.data = res.data
        }
        else {
          this.data = []
          // eslint-disable-next-line ts/no-unused-expressions
          res.success === false
            ? window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
            : ''
        }
        this.spinning = false
      })
    },
    addEditRow(record) {
      this.editId = record ? record.id : ''
      this.addEditName = record ? record.name : ''
      this.addEditvisible = true
    },
    addEditOk() {
      // 设计级配类型新增编辑
      this.confirmLoading = true
      const data = {
        name: this.addEditName,
      }
      // eslint-disable-next-line ts/no-unused-expressions
      this.editId ? (data.id = this.editId) : ''

      window.$oAjax({
        method: 'POST',
        url: window.$oApi.archiving.saveTemplate,
        data: qs.stringify(data),
      }).then((res) => {
        this.addEditvisible = false
        this.confirmLoading = false
        if (res.code === 20000) {
          this.getData()
        }
        else {
          // eslint-disable-next-line ts/no-unused-expressions
          res.success === false
            ? window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
            : ''
        }
      })
    },
    addEditCancel() {
      this.addEditName = ''
      this.editId = ''
      this.addEditvisible = false
    },
    showDelete(recordId) {
      // eslint-disable-next-line ts/no-this-alias
      const self = this
      window.$oAntdConfirm({
        title: '提示',
        content: '确定要删除吗?',
        onOk() {
          window.$oAjax({
            url: window.$oApi.archiving.delTemplate,
            params: {
              id: recordId,
            },
          })
            .then((res) => {
              if (res.code === 20000) {
                self.getData()
              }
              else {
                // eslint-disable-next-line ts/no-unused-expressions
                res.success === false
                  ? window.$oAntdMessage.error(res.msg || res.message)
                  : ''
              }
            })
        },
      })
    },
  },
}
</script>

<style lang="less">
/*.container-search-all {*/
/*width: 400px;*/
/*margin-right: 5px;*/
/*.ant-table-thead {*/
/*.ant-checkbox {*/
/*display: none;*/
/*}*/
/*}*/
/*}*/
/*.content-table {*/
/*height: 400px;*/
/*overflow-y: auto;*/
/*}*/
</style>
