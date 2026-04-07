<template>
  <div>
    <div>
      <div class="reportQuestionType-search">
        <div v-if="allSearch">
          <a-form ref="formRef" :model="formState">
            <a-form-item
              label="问题分类"
              :label-col="{ span: 2 }"
              :wrapper-col="{ span: 10 }"
            >
              <a-input v-model:value="formState.classification" allow-clear />
            </a-form-item>
            <a-form-item
              label="问题类型"
              :label-col="{ span: 2 }"
              :wrapper-col="{ span: 10 }"
            >
              <a-input v-model:value="formState.type" allow-clear />
            </a-form-item>
            <a-form-item
              label="问题内容"
              :label-col="{ span: 2 }"
              :wrapper-col="{ span: 10 }"
            >
              <a-input v-model:value="formState.content" allow-clear />
            </a-form-item>
            <a-form-item
              label="错误严重程度"
              :label-col="{ span: 2 }"
              :wrapper-col="{ span: 10 }"
            >
              <a-radio-group
                v-model:value="formState.severity"
                :options="severityData"
              />
            </a-form-item>
            <a-form-item
              label="检测内容"
              :label-col="{ span: 2 }"
              :wrapper-col="{ span: 10 }"
            >
              <div
                style="padding-right: 10px; line-height: 28px; font-size: 12px"
              >
                {{ searchParams.displayName }}
              </div>
              <a-button @click="selectParams">
                选择
              </a-button>
              <span style="font-size: 12px; color: #aaa; padding-left: 5px">注：只可选择一条检测参数进行查询</span>
            </a-form-item>
            <a-form-item :wrapper-col="{ span: 10, offset: 2 }">
              <a-button @click="getData">
                查询
              </a-button>
              <a-button
                @click="
                  () => {
                    searchType(false)
                  }
                "
              >
                切换普通查询
              </a-button>
              <a-button @click="resetForm()">
                重置
              </a-button>
            </a-form-item>
          </a-form>
        </div>
        <div v-else>
          <a-input
            v-model:value="quickQry"
            placeholder="可按问题分类,类型,内容查询"
            class="reportQuestionType-search-all"
            allow-clear
            @press-enter="getData"
          />
          <a-button @click="getData">
            查询
          </a-button>
          <a-button
            @click="
              () => {
                searchType(true)
              }
            "
          >
            切换高级查询
          </a-button>
        </div>
      </div>
      <div style="padding-bottom: 10px">
        <a-button @click="add">
          添加
        </a-button>
        <a-upload
          :show-upload-list="false"
          name="file"
          :multiple="true"
          :action="importUrl"
          :before-upload="beforeUpload"
          accept=".xls,.xlsx"
          class="mr-2"
          @change="handleChange"
        >
          <a-button>导入</a-button>
        </a-upload>
        <a-button @click="download">
          下载模板
        </a-button>
        <a-button @click="deleteRow">
          删除
        </a-button>
        <a-button @click="selectParams2">
          批量配置检测参数
        </a-button>
        <a-button @click="exportFile">
          导出
        </a-button>
      </div>
      <a-table
        :custom-row="customRow"
        :columns="columns"
        :row-selection="rowSelection"
        :pagination="pagination"
        :row-class-name="rowClassName"
        :data-source="data"
        :loading="loading"
        bordered
        row-key="id"
      >
        <template #bodyCell="{ column, record, text }">
          <template v-if="column.dataIndex === 'testParamNames'">
            <div
              :title="text"
              style="
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                width: 250px;
              "
            >
              {{ text }}
            </div>
          </template>

          <template v-if="column.dataIndex === 'operation'">
            <span class="table-handle">
              <a @click="() => edit(record)">编辑</a>
            </span>
          </template>
        </template>
      </a-table>
    </div>
    <AddEditModal ref="AddEditModal" :is-add="isAdd" :callback="getData" />
    <ParamsModal ref="ParamsModal" :callback="getParams" />
    <ParamsModal ref="ParamsModal2" :callback="getParams2" />
  </div>
</template>

<script>
import qs from 'qs'
import { rootUrl } from '~/providers/configs/rootUrl'
import AddEditModal from './components/addEditModal.vue'
import ParamsModal from './components/paramsModal.vue'

const columns = [
  {
    title: '问题分类',
    dataIndex: 'classification',
    width: '15%',
  },
  {
    title: '问题类型',
    dataIndex: 'type',
    width: '15%',
  },
  {
    title: '问题内容',
    dataIndex: 'content',
    width: '15%',
  },
  {
    title: '错误严重程度',
    dataIndex: 'severity',
    width: '15%',
  },
  {
    title: '检测参数',
    dataIndex: 'testParamNames',
    width: '15%',
    scopedSlots: { customRender: 'testParamNames' },
  },
  {
    title: '排序号',
    dataIndex: 'orderNumber',
    width: '15%',
  },
  {
    title: '操作',
    dataIndex: 'operation',
    width: '10%',
    scopedSlots: { customRender: 'operation' },
  },
]

export default {
  components: {
    AddEditModal,
    ParamsModal,
  },
  data() {
    return {
      data: [],
      columns,
      importUrl: `${rootUrl}${window.$oApi.reportQuestionType.import}`,
      quickQry: '',
      formLayout: 'horizontal',
      formState: {},
      allSearch: false,
      loading: false,
      page: 1,
      size: 10,
      isAdd: false,
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
      severityData: [
        // "严重错误",
        // "一般错误",
        // "欠缺"
      ],
      searchParams: {},
      customRow: (record) => {
        return {
          onClick: () => {
            if (this.selectedRowKeys.find(item => item == record.id)) {
              this.selectedRowKeys = this.selectedRowKeys.filter(
                item => item != record.id,
              )
              this.selectedRows = this.selectedRowKeys.filter(
                item => item.id != record.id,
              )
            }
            else {
              this.selectedRowKeys = [...this.selectedRowKeys, record.id]
              this.selectedRows = [...this.selectedRows, record]
            }
          },
        }
      },
    }
  },
  computed: {
    rowSelection() {
      return {
        hideDefaultSelections: false,
        selectedRowKeys: this.selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
          this.selectedRows = selectedRows
        },
      }
    },
  },
  async created() {
    await this.getStatus()
    this.getData()
  },
  methods: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    // 上传文件之前
    beforeUpload(file) {
      if (file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) {
        return true
      }
      window.$oAntdMessage.warning('只能上传类型为.xls或.xlsx的文件')
      return false
    },
    getStatus() {
      window.$oAjax({
        method: 'POST',
        url: `${window.$oApi.common.getDictionaryData}`,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
        data: qs.stringify({
          dictGroupId: '8a8ab0b246dc81120146dc8181cdxx5g',
        }),
      }).then((res) => {
        if (res && res.success) {
          this.severityData = res.obj.map(item => item.typename)
        }
        else {
          this.severityData = []
        }
      })
    },
    async getData() {
      let data = {}
      if (this.allSearch) {
        await this.$refs.formRef.validateFields().then(() => {
          const values = { ...this.formState }
          data = {
            ...values,
            testParamId: this.searchParams.id,
          }
        })
      }
      else {
        data.quickQry = this.quickQry
      }

      const { page, size } = this
      const params = {
        page,
        size,
        ...data,
      }

      this.loading = true
      window.$oAjax
        .get(`${window.$oApi.reportQuestionType.list}`, {
          params,
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
        })
        .then((res) => {
          if (res && res.data) {
            this.data = res.data.rows
            this.pagination.total = res.data.count || 0
            this.pagination.current = page
            this.pagination.pageSize = size
            this.loading = false
          }
        })
    },
    searchType(bool) {
      this.allSearch = bool
    },
    edit(record) {
      this.isAdd = false
      this.$refs.AddEditModal.showModal(record.id)
    },
    add() {
      this.isAdd = true
      this.$refs.AddEditModal.showModal()
    },
    selectParams() {
      this.$refs.ParamsModal.showModal()
    },
    selectParams2() {
      if (this.selectedRowKeys.length == 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请先选择问题之后再进行配置检测参数!'))
        return
      }
      this.$refs.ParamsModal2.showModal()
    },
    getParams(data) {
      if (data.length > 0) {
        this.searchParams = data[0]
      }
      else {
        this.searchParams = {}
      }
    },
    getParams2(params) {
      this.loading = true
      const data = {
        testParamIds: params.map(item => item.id).toString(),
        ids: this.selectedRowKeys.toString(),
      }

      window.$oAjax(`${window.$oApi.reportQuestionType.batchSetParams}`, {
        method: 'POST',
        params: data,
        timeout: 120000,
      })
        .then((res) => {
          if (res.code && res.code !== 20010) {
            window.$oAntdMessage.success('操作成功')
            this.getData()
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.message || res.msg))
            this.loading = false
          }
        })
        .catch(() => {
          this.loading = false
        })
    },
    deleteFun(id) {
      return new Promise((resolve, reject) => {
        window.$oAjax
          .delete(`${window.$oApi.reportQuestionType.operation}/${id}`, {
            headers: {
              'X-Requested-With': 'XMLHttpRequest',
            },
          })
          .then((res) => {
            if (res.code && res.code !== 20010) {
              resolve()
            }
            else {
              // eslint-disable-next-line prefer-promise-reject-errors
              reject()
            }
          })
      })
    },
    deleteRow() {
      if (this.selectedRowKeys.length == 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择需要删除的数据'))
        return
      }

      window.$oAntdConfirm({
        title: '删除',
        content: `确认删除选中的数据吗？`,
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          this.loading = true
          Promise.all(
            this.selectedRowKeys.map(item => this.deleteFun(item)),
          ).then(() => {
            window.$oAntdMessage.success('操作成功')
            this.getData()
            this.selectedRowKeys = []
            this.selectedRows = []
          })
        },
      })
    },
    exportFile() {
      let data = {
        page: this.page,
        size: this.size,
      }

      if (this.allSearch) {
        data = {
          ...data,
          ...this.formState,
        }
      }
      else {
        data = {
          ...data,
          quickQry: this.quickQry,
        }
      }

      let params = ''
      // eslint-disable-next-line array-callback-return
      Object.keys(data).map((key) => {
        if (data[key]) {
          params += `&${key}=${data[key]}`
        }
      })
      // 存在 则拼接
      // if (this.searchParams.id) {
      //   params += `&testParamId=${this.searchParams.id}`
      // }
      window.open(`${rootUrl}${window.$oApi.reportQuestionType.export}${params}`)
    },
    download() {
      window.open(`${rootUrl}${window.$oApi.reportQuestionType.download}`)
    },
    handleChange(info) {
      if (info.file.status !== 'uploading') { /* empty */ }
      if (info.file.status === 'done') {
        if (info.file.response.code == 20000) {
          // window.$oAntdMessage.success(`${info.file.name} ${info.file.response.msg}`);
          window.$oAntdMessage.success(info.file.response.msg)
          this.getData()
        }
        else {
          // ${info.file.name}
          window.$oAntdMessage.warning(info.file.response.msg)
        }
      }
      else if (info.file.status === 'error') {
        window.$oAntdModal.warning(window.$oMsgTips.info(`${info.file.name} 文件上传失败`))
      }
    },
    resetForm() {
      this.formState = {}
      this.searchParams = {}
      this.getData()
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
