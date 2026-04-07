<template>
  <div>
    <a-spin :spinning="spinning">
      <div class="spin-content">
        <div class="paramScriotBox">
          <a-form ref="formRef" class="box-left" :model="formState">
            <a-row :gutter="15" type="flex" align="middle">
              <a-col>
                <a-form-item label="脚本名称">
                  <a-input
                    v-model:value="formState.name"
                    placeholder="请输入脚本名称"
                  />
                </a-form-item>
              </a-col>
              <a-col>
                <a-form-item label="脚本分类">
                  <a-input
                    v-model:value="formState.category"
                    placeholder="请输入脚本分类"
                  />
                </a-form-item>
              </a-col>
              <a-col>
                <a-form-item>
                  <a-button type="primary" @click="searchFun">
                    查询
                  </a-button>
                  <a-button class="toolBtn-bar" @click="resetForm">
                    重置
                  </a-button>
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
          <div v-show="isOpera" class="px-4 mt-2">
            <a-button @click="addEditRow">
              添加价格计算脚本
            </a-button>
            <a-button class="toolBtn-bar" @click="(e) => deleteRow(e)">
              删除
            </a-button>
          </div>
          <div style="text-align: right; color: #090;" class="mb-2 pr-2">
            注：此处设置了参数价格脚本后，需要在参数价格/工时或合同录入中进行引用！
          </div>
          <a-table
            id="tableBox"
            class="box-left"
            :columns="columns"
            :pagination="data.length > 0 ? pagination : false"
            :data-source="data"
            bordered
            :custom-row="customRow"
            row-key="id"
            :row-selection="rowSelection"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'operation'">
                <div class="table-handle">
                  <a @click="(e) => addEditRow(e, record.id, true)">查看</a>
                  <a v-show="isOpera" @click="(e) => addEditRow(e, record.id)">编辑</a>
                  <a v-show="isOpera" @click="(e) => deleteRow(e, record)">删除</a>
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
          width="800px"
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
    </a-spin>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { getQueryVariable } from '~/providers/common/utils'
import Add from './components/addEdit.vue'

const columns = [
  {
    title: '脚本名称',
    dataIndex: 'name',
  },
  {
    title: '脚本分类',
    dataIndex: 'category',
    width: '15%',
  },
  {
    title: '描述',
    dataIndex: 'description',
    width: '20%',
  },
  {
    title: '序号',
    dataIndex: 'sequence',
    width: 85,
    customRender: ({ text }) => (text || text === 0 ? text : ''),
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
      spinning: false,
      formState: {},
      queryParam: null,
      page: 1,
      size: 10,
      selectPage: 'checkbox',
      onlySelect: getQueryVariable('onlySelect'),
      isOpera: true, // 是否允许操作
      addEditTitle: '新增价格计算脚本',
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
            this.rowSelecteds(record)
          },
        }
      },
    }
  },
  computed: {
    rowSelection() {
      const { selectedRowKeys, selectedRows } = this
      return {
        selectedRowKeys,
        selectedRows,
        type: this.selectPage,
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
          this.selectedRows = selectedRows
          this.rowSelecteds()
        },
      }
    },
  },
  mounted() {
    // eslint-disable-next-line ts/no-this-alias
    const self = this
    window.GetParamScript = (index, parentCallName) => {
      const data = self.selectData()
      parentCallName(index, data)
    }
    // window.getSelectData = ()=>{
    //   return this.selectedRows;
    // }
  },
  created() {
    if (this.onlySelect && this.onlySelect == '1') {
      this.selectPage = 'radio'
      this.isOpera = false
    }
    this.getData()
  },
  methods: {
    rowSelecteds(record) {
      if (record) {
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
            this.selectedRowKeys.push(record.id)
            this.selectedRows.push(record)
          }
        }
      }
    },
    searchFun() {
      this.$refs.formRef.validateFields().then(() => {
        this.queryParam = {
          ...this.formState,
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
      const params = {
        page,
        size,
        ...this.queryParam,
      }
      this.spinning = true
      window.$oAjax({
        url: window.$oApi.parameterScript.list,
        method: 'GET',
        params,
        // data: qs.stringify(params),
      }).then((res) => {
        if (res.code === 20000 && res.data.total >= 0) {
          this.data = res.data.rows
          this.pagination.total = res.data.total || 0
          this.pagination.current = page
          this.pagination.pageSize = size
        }
        else {
          this.data = []
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
        if (this.selectedRowKeys.length > 0) {
          this.selectedRowKeys = []
          this.selectedRows = []
        }
        this.spinning = false
      })
    },
    deleteRow(event, record) {
      event.preventDefault()
      event.stopPropagation()
      if (!record && this.selectedRowKeys.length === 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择数据'))
        return
      }
      let ids = ''
      if (record) {
        ids = record.id
      }
      else {
        ids = this.selectedRowKeys.join(',')
      }
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
            url: `${window.$oApi.parameterScript.delById}/${ids}`,
          }).then((res) => {
            if (res.code === 23000) {
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
      recordId = recordId || ''
      this.isDetail = !!isDetail
      if (recordId) {
        this.addEditTitle = '编辑价格计算脚本'
      }
      else {
        this.addEditTitle = '新增价格计算脚本'
      }
      if (this.isDetail) {
        this.addEditTitle = '查看价格计算脚本'
      }
      window.$oNextTick(() => {
        this.$refs.Add.showModal(recordId, this.isDetail)
      })
    },
    handleOk() {
      this.$refs.Add.handleOk()
    },
    handleCancel() {
      this.visible = false
      this.$refs.Add.handleCancel()
    },
    selectData() {
      if (this.selectedRowKeys.length === 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择数据'))
      }
      return this.selectedRows
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
