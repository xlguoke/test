<!-- eslint-disable vue/no-unused-refs -->
<template>
  <div class="electronicLabel">
    <a-tabs
      v-if="enablePresetSetSample"
      v-model:active-key="tabIndex"
      @change="tabChange"
    >
      <a-tab-pane :key="1" tab="电子标签"></a-tab-pane>
      <a-tab-pane :key="2" tab="预设样品"></a-tab-pane>
    </a-tabs>

    <template v-if="tabIndex === 1">
      <div>
        <a-input
          v-model:value="search"
          placeholder="请输入二维码编号/样品编号/RFID编号/标签编号后回车即可查询"
          style="width: 420px"
          class="mr-2"
          @press-enter="handleSearch"
        />
        <a-button type="primary" @click="handleSearch()">
          查询
        </a-button>
        <a-button @click="handleReset">
          重置
        </a-button>
        <a-button @click="seniorQueryFun">
          高级查询
        </a-button>
      </div>
      <SeniorShowSpan
        v-if="conditionData.length > 0"
        ref="SeniorShowSpan"
        :show-data="conditionData"
        :callback="closeCondition"
      />
    </template>
    <template v-if="tabIndex === 2">
      <div>
        <a-input
          v-model:value="search"
          placeholder="请输入大类名称/样品名称后回车即可查询"
          style="width: 420px"
          class="mr-2"
          @press-enter="handleSearch"
        />
        <a-button type="primary" @click="handleSearch()">
          查询
        </a-button>
        <a-button @click="handleReset">
          重置
        </a-button>
      </div>
    </template>

    <div v-if="tabIndex === 1" style="margin-top: 15px">
      <a-upload
        class="mr-2"
        :show-upload-list="false"
        name="file"
        :multiple="false"
        :action="importUrl"
        @change="handleChange"
      >
        <a-button>导入</a-button>
      </a-upload>
      <a-button @click="downloadTemplate">
        下载导入模板
      </a-button>
      <a-button @click="handleUnbind">
        电子标签重置
      </a-button>
      <a-button @click="handleDelete">
        删除标签
      </a-button>
    </div>

    <div v-if="tabIndex == 2" style="margin-top: 15px">
      <a-button @click="onAddPreset">
        新增设置
      </a-button>
      <a-button @click="delPresetSample()">
        批量删除
      </a-button>
    </div>

    <a-table
      :row-selection="{
        selectedRowKeys,
        onChange: onSelectChange,
      }"
      :columns="columns"
      :pagination="data.length > 0 ? pagination : false"
      :data-source="data"
      :loading="loading"
      bordered
      row-key="id"
      :row-class-name="rowClassName"
      :scroll="{ y: enablePresetSetSample ? 460 : 500 }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'action'">
          <span>
            <template v-if="tabIndex === 1">
              <a-button type="link" @click="handleLog(record)"> 日志 </a-button>
            </template>
            <template v-if="tabIndex === 2">
              <a-button
                type="link"
                style="color: var(--colorError)"
                @click="delPresetSample(record)"
              >
                删除
              </a-button>
            </template>
          </span>
        </template>
      </template>
    </a-table>

    <SeniorQuery
      ref="SeniorQuery"
      :callback="seniorQueryCall"
      :reset-call="resetCall"
      :auto-close="false"
    />
    <Log ref="log" :columns="LOG_COLUMNS" :data="logs" />
    <SelectSampleLevel
      v-model:value="selectSampleLevelVisible"
      @on-save="handleReset"
    />
  </div>
</template>

<script>
import { formatTime } from '~/providers/common/utils'
import SeniorQuery from '~/providers/components/seniorQuery/list.vue'
import SeniorShowSpan from '~/providers/components/seniorQuery/showSpan.vue'
import { rootUrl } from '~/providers/configs/rootUrl'
import Log from '../components/Log.vue'
import SelectSampleLevel from '../components/SelectSampleLevel.vue'

const columns = [
  {
    title: '样品标签',
    dataIndex: 'id',
    width: 200,
  },
  {
    title: '二维码编号',
    dataIndex: 'barcodeId',
    width: 200,
  },
  {
    title: 'RFID编号',
    dataIndex: 'rfid',
    width: 200,
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 120,
  },
  {
    title: '使用日期',
    dataIndex: 'dateStr',
    width: 120,
  },
  {
    title: '样品编号',
    dataIndex: 'code',
    width: 200,
  },
  {
    title: '备注',
    dataIndex: 'remark',
  },
  {
    title: '操作',
    key: 'action',
    dataIndex: 'action',
    width: 85,
  },
]

const presetColumns = [
  {
    title: '大类名称',
    dataIndex: 'bigCategoryName',
  },
  {
    title: '样品名称',
    dataIndex: 'sampleName',
  },
  {
    title: '操作',
    key: 'action',
    width: 80,
    scopedSlots: { customRender: 'action' },
  },
]

const queryConfig = [
  {
    type: 'select',
    field: 'deprecated',
    title: '标签状态',
    options: [
      { id: '0', name: '未用' },
      { id: '1', name: '弃用' },
      { id: '2', name: '在用' },
    ],
    default: '',
    col: '24',
    expend: {},
  },
  {
    type: 'rangePicker',
    field: 'stamp',
    title: '使用时间',
    options: [],
    default: '',
    col: '24',
    expend: {},
  },
  {
    type: 'input',
    field: 'testObjectCode',
    title: '样品编号',
    options: [],
    default: '',
    col: '24',
    expend: {},
  },
]

const LOG_COLUMNS = [
  {
    title: '标签编号',
    dataIndex: 'labelId',
  },
  {
    title: '二维码编号',
    dataIndex: 'barcodeId',
  },
  {
    title: 'RFID编号',
    dataIndex: 'rfid',
  },
  {
    title: '时间',
    dataIndex: 'createDate',
  },
  {
    title: '操作人',
    dataIndex: 'createName',
  },
  {
    title: '操作类型',
    dataIndex: 'type',
    customRender: ({ text }) => {
      switch (text) {
        case -2:
          return '删除'
        case -1:
          return '废弃'
        case 0:
          return '重置'
        case 1:
          return '绑定样品'
        case 2:
          return '绑定账户'
        case 3:
          return '绑定设备'
        case 4:
          return '绑定流转样品'
        default:
          return '未定义'
      }
    },
  },
]

export default {
  components: {
    SeniorShowSpan,
    SeniorQuery,
    Log,
    SelectSampleLevel,
  },
  data() {
    return {
      tabIndex: 1,
      data: [],
      LOG_COLUMNS,
      page: 1,
      size: 10,
      loading: false,
      search: '',
      queryConfig,
      queryParams: {},
      conditionData: [],
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
      importUrl: `${rootUrl}${window.$oApi.electronicLabel.import}`,
      selectedRowKeys: [],
      selectedRows: [],
      logs: [],
      selectSampleLevelVisible: false,
      enablePresetSetSample: false,
    }
  },
  computed: {
    columns() {
      return this.tabIndex === 1 ? columns : presetColumns
    },
  },
  created() {
    this.checkPresetTab()
    this.getData()
  },
  methods: {
    async checkPresetTab() {
      const res = await window.$oAjax.get(
        'tSBusinessParamController.do?getBusinessParam',
        {
          params: { key: 'SAMPLE_BINDING_RFID' },
        },
      )

      res.success && res.obj === 'Y' && (this.enablePresetSetSample = true)
    },
    onAddPreset() {
      this.selectSampleLevelVisible = true
    },
    tabChange() {
      this.selectedRowKeys = []
      this.selectedRows = []
      this.handleReset()
    },
    handleChange(info) {
      if (info.file.status !== 'uploading') { /* empty */ }
      if (info.file.status === 'done') {
        const res = info.file.response
        if (res.code === 20000) {
          window.$oAntdMessage.success('导入成功')
          this.getData()
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info('导入失败'))
        }
      }
      else if (info.file.status === 'error') {
        window.$oAntdModal.warning(window.$oMsgTips.info(`${info.file.name} 文件上传失败`))
      }
    },
    // 高级查询，根据查询数据 回显
    seniorQueryFun() {
      const params = { ...this.queryParams }
      this.$refs.SeniorQuery.showModal(this.queryConfig, params)
    },
    // 高级查询回调，更改查询数据(显示数据)
    async seniorQueryCall(params, showData) {
      const _params = { ...params }
      if (_params.stamp && _params.stamp.length > 0) {
        let startDate = new Date(_params.stamp[0])
        let endDate = new Date(_params.stamp[1])
        startDate = startDate.setHours(0, 0, 0, 0) / 1000
        endDate = endDate.setHours(23, 59, 59, 999) / 1000

        _params._stamp = `${Math.floor(startDate)},${Math.floor(endDate)}`
      }

      this.search = ''
      this.queryParams = {
        ..._params,
      }
      if (showData.length) {
        this.isShow = true
      }
      else {
        this.isShow = false
      }

      this.conditionData = [...showData].map(item => ({ ...item }))

      this.page = 1

      this.getData()
      this.$refs.SeniorQuery.handleCancel()
    },
    // 高级查询 重置
    resetCall() {
      this.queryParams = {}
      this.conditionData = []
      this.$refs.SeniorQuery.handleCancel()
      this.getData()
    },
    // 删除高级查询,删除查询数据
    async closeCondition(field, isShow) {
      if (field) {
        delete this.queryParams[field]
      }
      if (field === 'stamp') {
        delete this.queryParams._stamp
      }

      if (field) {
        delete this.queryParams[field]
      }

      if (isShow) {
        this.isShow = false
        this.conditionData = []
      }
      else {
        this.conditionData = this.conditionData.filter(i => i.field !== field)
      }
      this.page = 1
      this.getData()
    },
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    handleReset() {
      this.page = 1
      this.search = ''
      this.queryParams = {}
      this.conditionData = []
      this.handleSearch()
    },
    handleSearch() {
      this.page = 1
      this.getData()
    },
    getPresetData() {
      const { page, size } = this
      this.loading = true

      const params = {
        page,
        size,
        q: this.search,
      }

      window.$oAjax.get('/rest/sample/rfid/pagination', { params }).then((res) => {
        if (res.code !== 20010) {
          this.data = res.rows
          this.pagination.total = res.count
          this.pagination.current = page
          this.pagination.pageSize = size
          this.loading = false
        }
      })
    },
    getData() {
      if (this.tabIndex === 2) {
        this.getPresetData()
        return
      }

      const { page, size } = this
      this.loading = true

      const stamp = this.queryParams._stamp
      const params = {
        page,
        size,
        search: this.search,
        ...this.queryParams,
        stamp,
      }

      delete params._stamp

      window.$oAjax.get(window.$oApi.electronicLabel.getList, { params }).then((res) => {
        if (res.code === 20000) {
          this.data = res.data.rows.map(item => ({
            ...item,
            dateStr: item.date
              ? formatTime(new Date(item.date), 'YYYY-MM-DD')
              : '',
          }))
          this.pagination.total = res.data.count
          this.pagination.current = page
          this.pagination.pageSize = size
          this.loading = false
        }
      })
    },
    downloadTemplate() {
      window.open(`${rootUrl}${window.$oApi.electronicLabel.template}`)
    },
    onSelectChange(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    validate(unbind) {
      return new Promise((resolve, reject) => {
        const rows = this.selectedRows || []
        if (rows.length < 1) {
          // eslint-disable-next-line prefer-promise-reject-errors
          reject('未选中电子标签记录')
        }
        const v = unbind
          ? rows.every(row => row.status !== '在用')
          : rows.some(row => row.status === '在用')
        if (v) {
          // eslint-disable-next-line prefer-promise-reject-errors
          reject(
            `您选中的电子标签${
              unbind ? '未使用，不需要重置' : '含有正在使用中的，无法删除'
            }`,
          )
        }
        const records = unbind
          ? rows.filter(row => row.status === '在用')
          : rows
        resolve(records)
      })
    },
    handleDelete() {
      this.validate()
        .then(data => this.confirmHandler(data))
        .catch(msg => window.$oAntdModal.warning(window.$oMsgTips.info(msg)))
    },
    handleUnbind() {
      this.validate(true)
        .then(data => this.confirmHandler(data, true))
        .catch(msg => window.$oAntdModal.warning(window.$oMsgTips.info(msg)))
    },
    confirmHandler(data, unbind) {
      const key = unbind ? '重置' : '删除'
      const p = unbind
        ? '该操作将会导致下列数据丢失：'
        : '该操作会删除以下电子标签：'
      window.$oAntdConfirm({
        title: `电子标签${key}`,
        content: () => {
          return h('div', [
            h('h2', `您正在${key}电子标签！`),
            h('p', p),
            h(
              'div',
              {
                style: {
                  'margin-top': '5px',
                  'display': 'inline-block',
                  'height': '100px',
                  'border': '1px solid',
                  'font-size': '13px',
                  'width': '100%',
                  'border-radius': '4px',
                  'padding-left': '4px',
                  '-ms-overflow-style': 'none',
                  'scrollbar-width': 'none',
                  'overflow-y': 'scroll',
                },
              },
              data.map(d =>
                h(
                  'p',
                  `标签编号：${d.id}${
                    unbind ? `  绑定数据：${d.code || ''}` : ''
                  }`,
                ),
              ),
            ),
          ])
        },
        onOk: () => this.submit(data, unbind),
        onCancel: () => {
          this.selectedRows = []
          this.selectedRowKeys = []
        },
      })
    },
    submit(data, unbind) {
      const config = {
        params: {
          rfids: data.map(e => e.id).join(','),
        },
      }
      const uri = unbind ? window.$oApi.electronicLabel.records : window.$oApi.electronicLabel.rfid
      window.$oAjax
        .delete(uri, config)
        .then((res) => {
          if (res.code === 23000) {
            window.$oAntdMessage.success('操作成功')
            this.getData()
            this.selectedRows = []
            this.selectedRowKeys = []
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info('操作失败'))
            console.error(res)
          }
        })
        .catch((err) => {
          window.$oAntdModal.warning(window.$oMsgTips.info('系统错误'))
          console.error(err)
        })
    },
    handleLog(row) {
      const uri = `${window.$oApi.electronicLabel.log}/${row.id}`
      window.$oAjax
        .get(uri)
        .then((res) => {
          if (res.code === 20000) {
            this.logs = res.data
            this.$refs.log.showModal()
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info('获取日志失败'))
            console.error(res)
          }
        })
        .catch((err) => {
          window.$oAntdModal.warning(window.$oMsgTips.info('系统错误'))
          console.error(err)
        })
    },

    delPresetSample(row) {
      const delIds = []

      if (row) {
        delIds.push(row.id)
      }
      else {
        delIds.push(...this.selectedRowKeys)
      }

      window.$oAntdConfirm({
        title: '确定要删除吗？',
        content: '删除后将无法恢复，您确定要删除吗？',
        onOk: async () => {
          await window.$oAjax({
            method: 'post',
            url: '/rest/sample/rfid/delete',
            headers: {
              'content-type': 'application/json',
            },
            data: JSON.stringify(delIds),
          })
          window.$oAntdMessage.success('操作成功！')
          this.handleReset()
        },
      })
    },
  },
}
</script>

<style lang="less" scoped>
@import './index.less';
</style>
