<template>
  <div class="mailListConfig">
    <div class="mailListConfig-search">
      <a-input
        v-model:value="name"
        placeholder="请输入邮寄单名称"
        @press-enter="search"
      />
      <a-button type="primary" class="ml-2" @click="search">
        查询
      </a-button>
    </div>
    <div style="padding-bottom: 10px">
      <a-button
        v-if="detailPage !== '1'"
        type="primary"

        @click="add"
      >
        新增
      </a-button>
      <a-button
        v-if="
          (!selectPage && !detailPage)
            || (selectPage && selectPage !== '1')
            || (detailPage && detailPage !== '1')
        "

        @click="deleteRows"
      >
        批量删除
      </a-button>
    </div>
    <a-table
      :columns="columns"
      :row-selection="rowSelection"
      :pagination="pagination"
      :custom-row="customRow"
      :data-source="data"
      :row-class-name="rowClassName"
      bordered
      :scroll="{ y: height }"
      :loading="loading"
      row-key="id"
      @change="onChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'operation'">
          <span class="table-handle">
            <a
              href="javascript:;"
              title="编辑"
              style="margin-right: 5px"
              @click="editRow(record)"
            >
              编辑
            </a>
            <a
              href="javascript:;"
              title="删除"
              style="margin-right: 5px"
              @click="deleteRow(record)"
            >
              删除
            </a>
          </span>
        </template>
      </template>
    </a-table>
    <AddModal ref="AddModal" :is-add="isAdd" :callback="getData" />
  </div>
</template>

<script>
import { cloneDeep } from '@unovis/ts'
import { getQueryVariable } from '~/providers/common/utils'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'

import AddModal from './components/addModal.vue'

const columns = [
  {
    title: '邮寄单名称',
    dataIndex: 'infoSubject',
    width: '15%',
  },
  {
    title: '收件人',
    dataIndex: 'receiver',
    width: '15%',
  },
  {
    title: '收件人电话',
    dataIndex: 'phone',
    width: '15%',
  },
  {
    title: '邮寄地址',
    dataIndex: 'address',
    width: '25%',
  },
  {
    title: '邮寄公司',
    dataIndex: 'expressCompany',
    width: '20%',
  },
  {
    title: '邮编',
    dataIndex: 'postalCode',
    width: '15%',
  },
  {
    title: '操作',
    dataIndex: 'operation',
    width: '10%',
    scopedSlots: { customRender: 'operation' },
  },
]
if (getQueryVariable('detailPage') === '1') {
  columns.pop()
}

export default {
  components: {
    AddModal,
  },
  // eslint-disable-next-line vue/prop-name-casing
  props: ['_selectPage', 'tableHight'],
  emits: ['on-change'],
  data() {
    return {
      selectPage: getQueryVariable('selectPage'),
      detailPage: getQueryVariable('detailPage'), // 1 为查看页面
      editIds: getQueryVariable('editIds') || '', // 数据回显
      data: [],
      columns,
      isAdd: true,
      name: '',
      pagination: {
        current: 1,
        total: 0,
        pageSize: 5, // 每页中显示10条数据
        showSizeChanger: true,
        pageSizeOptions: ['5', '10', '20', '50', '100'], // 每页中显示的数据
        showTotal: total => `共有 ${total} 条数据`, // 分页中显示总的数据
      },
      loading: false,
      query: '',
      height: document.body.clientHeight - 180,
      selectedRowKeys: [],
      selectedRows: [],
      customRow: (record) => {
        return {
          onClick: () => {
            if (this.selectPage == '1' || this._selectPage == '1') {
              this.selectedRowKeys = [record.id]
              this.selectedRows = [record]
            }
            else {
              if (this.selectedRowKeys.includes(record.id)) {
                this.selectedRowKeys = this.selectedRowKeys.filter(
                  item => item !== record.id,
                )
                this.selectedRows = this.selectedRows.filter(
                  item => item.id !== record.id,
                )
              }
              else {
                this.selectedRowKeys.push(record.id)
                this.selectedRows.push(record)
              }
            }
            $emit(this, 'on-change', this.selectedRows)
          },
        }
      },
    }
  },
  computed: {
    rowSelection() {
      return {
        type: this.selectPage == '1' ? 'radio' : 'checkbox',
        hideDefaultSelections: false,
        selectedRowKeys: this.selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
          if (this.selectPage == '1' || this._selectPage == 1) {
            this.selectedRows = selectedRows.filter(
              item => !this.selectedRowKeys.includes(item.id),
            )
            this.selectedRowKeys = selectedRowKeys.filter(
              item => !this.selectedRowKeys.includes(item),
            )
            $emit(this, 'on-change', this.selectedRows)
          }
          else {
            this.selectedRowKeys = selectedRowKeys
            this.selectedRows = selectedRows
          }
        },
      }
    },
  },
  created() {
    if (this.tableHight) {
      this.height = Number.parseInt(this.tableHight)
    }
    this.getData()

    window.getSelectData = () => {
      return this.selectedRows
    }
  },
  methods: {
    onChange(v) {
      this.pagination.current = v.current
      this.pagination.pageSize = v.pageSize
      this.getData()
    },
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    getData() {
      const { query } = this
      this.loading = true
      window.$oRest
        .get(window.$oApi.mailListConfig.list, {
          params: {
            name: query.trim(),
            page: this.pagination.current,
            size: this.pagination.pageSize,
          },
        })
        .then((res) => {
          if (res.code && res.code === 20000) {
            this.data = res.data.rows
            this.pagination.total = res.data.count

            if (this.editIds) {
              this.selectedRowKeys = this.editIds.split(',')
              // eslint-disable-next-line no-console
              console.log(
                ' this.selectedRowKeys',
                this.selectedRowKeys,
                typeof this.selectedRowKeys,
              )
              // this.selectedRowKeys = ['402882846fa0237e016fa3492a2119d5','402882846fbcf2f6016fbcf908c60091'];
            }
            else {
              this.selectedRowKeys = []
              this.selectedRows = []
            }
          }
          this.loading = false
        })
    },
    // 新增弹窗
    add() {
      this.isAdd = true
      this.$refs.AddModal.showModal()
    },
    search() {
      this.query = this.name
      this.pagination.current = 1
      this.getData()
    },
    // 编辑弹窗
    editRow(data) {
      this.isAdd = false
      this.$refs.AddModal.showModal(cloneDeep(data))
    },
    // 删除
    deleteRow(record) {
      window.$oAntdConfirm({
        title: '删除',
        content: `确认删除配置单 ${record.infoSubject} 吗？`,
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          this.deleteFun(record.id).then(
            () => {
              window.$oAntdMessage.success('删除成功')
              this.getData()
            },
            (res) => {
              window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
            },
          )
        },
      })
    },
    deleteFun(id) {
      return new Promise((resolve, reject) => {
        window.$oAjax
          .delete(`${window.$oApi.mailListConfig.delete}/${id}`)
          .then((res) => {
            if (res.code && res.code === 20000) {
              resolve(res)
            }
            else {
              reject(res)
            }
          })
      })
    },
    deleteRows() {
      if (this.selectedRowKeys.length == 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择要删除的数据'))
        return
      }

      window.$oAntdConfirm({
        title: '删除',
        content: `确认批量删除配置单吗？`,
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          Promise.all(
            this.selectedRowKeys.map(item => this.deleteFun(item)),
          ).then(() => {
            this.getData()
            window.$oAntdMessage.success('批量删除成功！')
          })
        },
      })
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
