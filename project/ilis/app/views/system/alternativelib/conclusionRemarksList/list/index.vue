<template>
  <div class="mailListConfig">
    <div
      v-if="pageType === '1'"
      style="color: #009933; font-size: 12px; line-height: 18px; padding: 10px"
    >
      <p>说明：</p>
      <p>{{ term('1.此处为按样品层级维护对应的检验结论与备注；') }}</p>
      <p>
        {{ term('2.上级层级维护后，下级样品在试验检测中会自动获取上级维护的检验结论与备注；') }}
      </p>
      <p>
        3.若需维护所有试验统一的检验结论与备注，请在通用结论与备注功能中设置；
      </p>
    </div>
    <div
      v-else
      style="color: #009933; font-size: 12px; line-height: 18px; padding: 10px"
    >
      <p>说明：</p>
      <p>1.此处为维护所有试验通用的检验结论与备注；</p>
      <p>
        {{ term('2.若不同的样品需要设置不同的检验结论与备注，请在样品层级管理功能中设置；') }}
      </p>
    </div>
    <a-tabs v-model:active-key="tabValue" @change="selectCallback">
      <a-tab-pane key="conclusion" tab="检验结论"></a-tab-pane>
      <a-tab-pane key="remark" tab="检验备注" force-render></a-tab-pane>
    </a-tabs>

    <div style="padding-bottom: 10px">
      <a-button type="primary" @click="add">
        新增
      </a-button>
      <a-button @click="deleteRows">
        删除
      </a-button>
    </div>
    <a-table
      :columns="columns"
      :row-selection="rowSelection"
      :custom-row="customRow"
      :data-source="data"
      :pagination="pagination"
      :row-class-name="rowClassName"
      bordered
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
    <AddModal
      ref="AddModal"
      :is-add="isAdd"
      :callback="getData"
      :sample-id="sampleId"
      :form-type="tabValue"
    />
  </div>
</template>

<script>
import { getQueryVariable } from '~/providers/common/utils'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'
import { useIndustryStore } from '~/store/industryStore'
import AddModal from './components/addModal.vue'

export default {
  components: {
    AddModal,
  },
  emits: ['on-change'],
  data() {
    return {
      term: null,
      tabValue: 'conclusion',
      pageType: '', // 1 样品层级管理使用
      sampleId: '', // 样品id
      data: [],
      pagination: {
        current: 1,
        total: 0,
        pageSize: 10, // 每页中显示10条数据
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50', '100'], // 每页中显示的数据
        showTotal: total => `共有 ${total} 条数据`, // 分页中显示总的数据
      },
      columns: [
        {
          title: '序号',
          dataIndex: 'sort',
          width: '5%',
        },
        {
          title: '候选值',
          dataIndex: 'value',
        },
        {
          title: '说明',
          dataIndex: 'description',
          width: '30%',
        },
        {
          title: '操作',
          dataIndex: 'operation',
          width: '10%',
        },
      ],
      isAdd: true,
      name: '',
      loading: false,
      selectedRowKeys: [],
      selectedRows: [],
      customRow: (record) => {
        return {
          onClick: () => {
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
            $emit(this, 'on-change', this.selectedRows)
          },
        }
      },
    }
  },
  computed: {
    rowSelection() {
      return {
        type: 'checkbox',
        hideDefaultSelections: false,
        selectedRowKeys: this.selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
          this.selectedRows = selectedRows
        },
      }
    },
  },
  created() {
    this.pageType = String(getQueryVariable('pageType'))
    this.getData()
    window.refreshConclusionTable = (sampleId) => {
      // return this.selectedRows;
      this.sampleId = sampleId
      this.getData()
    }
    const { term } = useIndustryStore()
    this.term = term
  },
  methods: {
    onChange(v) {
      this.pagination.current = v.current
      this.pagination.pageSize = v.pageSize
      this.getData()
    },
    onShowSizeChange: (page, size) => {
      this.pagination.current = page
      this.pagination.size = size
      this.getData()
    },
    selectCallback() {
      this.getData()
    },
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    getData() {
      this.loading = true
      window.$oAjax({
        method: 'get',
        url: `/rest/alternative/lib/list/${this.tabValue}`,
        params: {
          page: this.pagination.current,
          rows: this.pagination.pageSize,
          sampleId: this.sampleId,
        },
        headers: {
          'content-type': 'application/json',
        },
      }).then((res) => {
        if (res.code && res.code === 20000) {
          this.data = res.data.rows
          this.pagination.total = res.data.total
          this.selectedRowKeys = []
          this.selectedRows = []
        }
        this.loading = false
      })
    },
    // 新增弹窗
    add() {
      this.isAdd = true
      this.$refs.AddModal.showModal()
    },
    // 编辑弹窗
    editRow(data) {
      this.isAdd = false
      this.$refs.AddModal.showModal(data)
    },
    // 删除
    deleteRow(record) {
      window.$oAntdConfirm({
        title: '删除',
        content: `确认删除？`,
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
        window.$oAjax.delete(`/rest/alternative/lib?ids=${id}`).then((res) => {
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
      if (this.selectedRowKeys.length === 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择要删除的数据'))
        return
      }

      window.$oAntdConfirm({
        title: '删除',
        content: `确认批量删除吗？`,
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          const ids = this.selectedRowKeys.join(',')
          this.deleteFun(ids).then(() => {
            window.$oAntdMessage.success('删除成功')
            this.getData()
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
