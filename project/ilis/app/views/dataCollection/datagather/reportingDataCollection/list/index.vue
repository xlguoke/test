<template>
  <div>
    <a-tabs :default-active-key="tabsActive" @change="changeTabs">
      <a-tab-pane :key="0" tab="未上报"></a-tab-pane>
      <a-tab-pane :key="1" tab="已上报"></a-tab-pane>
    </a-tabs>
    <div>
      <a-form :model="formState">
        <a-row :gutter="15">
          <a-col :xl="6" :md="8">
            <a-form-item
              label="采集项目"
              :label-col="{ span: 6 }"
              :wrapper-col="{ span: 18 }"
            >
              <a-tree-select
                v-model:value="formState.testTypeCode"
                style="width: 100%"
                :dropdown-style="{ maxHeight: '300px', overflow: 'auto' }"
                placeholder="请选择采集项目"
                :tree-data="collectionData"
                tree-default-expand-all
                show-search
                @change="handleChange"
              />
            </a-form-item>
          </a-col>
          <a-col :xl="6" :md="8">
            <a-form-item
              label="是否已出报告"
              :label-col="{ span: 6 }"
              :wrapper-col="{ span: 18 }"
            >
              <a-select v-model:value="formState.isReport" placeholder="请选择">
                <a-select-option
                  v-for="d in radioData"
                  :key="d.value + 1"
                  :value="d.value"
                >
                  {{ d.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col v-if="tabsActive === 0" :xl="6" :md="8">
            <a-form-item
              label="采集时间"
              :label-col="{ span: 6 }"
              :wrapper-col="{ span: 18 }"
            >
              <a-range-picker
                v-model:value="formState.collectTime"
                format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
                :show-time="{
                  defaultValue: [
                    dayjs('00:00:00', 'HH:mm:ss'),
                    dayjs('23:59:59', 'HH:mm:ss'),
                  ],
                }"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </a-form-item>
          </a-col>
          <a-col v-else :xl="6" :md="8">
            <a-form-item
              label="上报时间"
              :label-col="{ span: 6 }"
              :wrapper-col="{ span: 18 }"
            >
              <a-range-picker
                v-model:value="formState.pushTime"
                format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
                :show-time="{
                  defaultValue: [
                    dayjs('00:00:00', 'HH:mm:ss'),
                    dayjs('23:59:59', 'HH:mm:ss'),
                  ],
                }"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </a-form-item>
          </a-col>
          <a-col :xl="6" :md="8">
            <a-form-item
              label="信息查询"
              :label-col="{ span: 6 }"
              :wrapper-col="{ span: 18 }"
            >
              <a-input
                v-model:value="formState.keyWord"
                style="width: 100%"
                placeholder="请输入样品编号/设备编号"
              />
            </a-form-item>
          </a-col>
          <a-col :xl="6" :md="8">
            <a-button style="margin-left: 20px" type="primary" @click="search">
              查询
            </a-button>
            <a-button @click="reset">
              重置
            </a-button>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <div v-show="tabsActive === 0" class="btns-box">
      <a-button :loading="reportLoading" @click="chooseReport">
        选择上报
      </a-button>
      <a-button :loading="allLoading" @click="allReport">
        一键上报
      </a-button>
    </div>
    <a-table
      :row-class-name="rowClassName"
      :row-selection="tabsActive === 0 ? rowSelection : null"
      style="margin-top: 5px"
      :columns="columns"
      :scroll="scroll"
      :data-source="dataSource"
      bordered
      :pagination="pagination"
      :loading="loading"
      row-key="id"
    >
      <template #bodyCell="{ column, record, text }">
        <template v-if="column.dataIndex === 'pushStatus'">
          <span v-if="text == '10'">上报成功</span>
          <span v-else-if="text == '20'">上报失败</span>
          <span v-else>未上报</span>
        </template>

        <template v-if="column.dataIndex === 'operation'">
          <span class="table-handle">
            <a href="javascript:void(0);" @click="showTask(record)">查看</a>
          </span>
        </template>
      </template>
    </a-table>

    <ht-modal
      title="任务列表"
      width="1000px"
      :open="showTaskList"
      :mask-closable="false"
      :keyboard="false"
    >
      <template #footer>
        <a-button style="float: none" @click="showTaskList = false">
          关闭
        </a-button>
      </template>
      <div style="min-height: 200px">
        <a-table
          :columns="taskColumns"
          :data-source="taskDataList"
          :pagination="false"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'operation'">
              <div class="table-handle">
                <a href="javascript:void(0);" @click="openTaskDetail(record)">查看</a>
              </div>
            </template>
          </template>
        </a-table>
      </div>
    </ht-modal>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { rootUrl } from '~/providers/configs/rootUrl'

const columns = [
  {
    title: '上报状态',
    dataIndex: 'pushStatus', // 00未推送 10 推送成功 20 推送失败
    fixed: 'left',
    scopedSlots: { customRender: 'pushStatus' },
  },
  {
    title: '样品编号',
    dataIndex: 'yangpbh',
    fixed: 'left',
  },
  {
    title: '试验时间',
    dataIndex: 'jcshijian',
  },
  {
    title: '采集时间',
    dataIndex: 'pushTime',
  },
  {
    title: '设备编号',
    dataIndex: 'sbbianhao',
    width: '150',
  },
  {
    title: '设备名称',
    dataIndex: 'sbmingcheng',
    width: '150',
  },
  {
    title: '是否已出报告',
    dataIndex: 'isReport',
    width: '10%',
  },
]

const taskColumns = [
  {
    title: '资质类型',
    dataIndex: 'quaName',
  },
  {
    title: '编号类别',
    dataIndex: 'snName',
  },
  {
    title: '委托编号',
    dataIndex: 'consginCode',
  },
  {
    title: '样品编号',
    dataIndex: 'testObjectCode',
  },
  {
    title: '任务编号',
    dataIndex: 'testTaskCode',
  },
  {
    title: '检测参数',
    dataIndex: 'paramsName',
  },
  {
    title: '操作',
    dataIndex: 'operation',
    scopedSlots: { customRender: 'operation' },
  },
]

const allItems = {}

export default {
  data() {
    return {
      dayjs,
      formState: {},
      tabsActive: 0,
      columns,
      defaultColumns: JSON.parse(JSON.stringify(columns)),
      page: 1,
      size: 10,
      loading: false,
      reportLoading: false,
      allLoading: false,
      dataSource: [],
      collectionData: [],
      radioData: [
        { name: '全部', value: '-1' },
        { name: '已出', value: '1' },
        { name: '未出', value: '0' },
      ],
      collectionItem: {}, // 当前选择的采集项目
      taskColumns,
      showTaskList: false,
      taskDataList: [],
      selectedRowKeys: [],
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
      fields: [],
      scroll: {
        x: 1200,
      },
      allFields: [],
      regulatoryList: [],
      regulatory: {},
    }
  },
  computed: {
    rowSelection() {
      return {
        selectedRowKeys: this.selectedRowKeys,
        onChange: (selectedRowKeys) => {
          this.selectedRowKeys = selectedRowKeys
        },
      }
    },
  },
  created() {
    this.getRegulatoryList()
    this.getLaboratoryData()
    this.getAllCustomField()
  },
  methods: {
    // 获取监管系统信息
    getRegulatoryList() {
      this.loading = true
      window.$oRest.get('/rest/regulatory').then((res) => {
        if (res) {
          if (res.data.length < 1) {
            window.$oAntdModal.warning(window.$oMsgTips.info('没有获取到监管平台信息！!'))
          }
          this.regulatoryList = res.data
          this.regulatory = res.data[0]
        }
      })
    },

    changeTabs(key) {
      this.tabsActive = key
      this.formState = {}
      this.selectedRowKeys = []
      this.getData()
    },
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    // 获取采集项目
    getLaboratoryData() {
      window.$oAjax
        .get(window.$oApi.mechanicsDataCollection.getTypeData, {
          params: { testType: 'data' },
        })
        .then((res) => {
          if (res.success) {
            this.collectionData = this.formatDepartmentData(res.obj || [])
            const typeItem = allItems[this.getInitalTestTypeCode()]
            this.getCustomField(typeItem.id)
            this.getFieldsAllObj()
            if (this.collectionData.length !== 0) {
              this.getData()
            }
          }
        })
    },
    // 获取采集项目的默认值
    getInitalTestTypeCode() {
      if (this.collectionData.length > 0) {
        const item = this.collectionData[0]
        if (item.children && item.children.length > 0) {
          return item.children[0].value
        }
        else {
          return item.value
        }
      }
      else {
        return undefined
      }
    },
    // 格式化采集项目数据
    formatDepartmentData(data) {
      if (!(data && Array.isArray(data))) {
        return []
      }
      const arr = []
      // eslint-disable-next-line array-callback-return
      data.map((item) => {
        let children = []
        const obj = {}
        if (item.children && item.children.length > 0) {
          obj.disabled = true
          children = this.formatDepartmentData(item.children)
        }
        if (item.testTypeCode) {
          allItems[item.testTypeCode] = item
        }
        arr.push({
          ...obj,
          title: item.typeName,
          value: item.testTypeCode,
          key: item.testTypeCode,
          children,
        })
      })
      return arr
    },
    // 获取自定义字段
    async getCustomField(testTypeId) {
      try {
        const res = await window.$oAjax.get('/rest/testField/show-fields', {
          params: {
            testTypeId,
          },
        })
        if (res.code === 20000) {
          this.fields = res.data
        }
        else {
          this.fields = []
          window.$oAntdModal.warning(
            window.$oMsgTips.info(res.msg || res.message || '请求失败，请稍后再试'),
          )
        }
      }
      // eslint-disable-next-line unused-imports/no-unused-vars
      catch (e) {
        this.fields = []
        window.$oAntdModal.warning(window.$oMsgTips.info('请求失败，请稍后再试'))
      }
    },
    // 获取所有字段
    async getAllCustomField() {
      try {
        const res = await window.$oAjax.get('/rest/dataGatherField/fields')

        if (res.code === 20000) {
          this.allFields = res.data
        }
        else {
          this.allFields = []
          window.$oAntdModal.warning(
            window.$oMsgTips.info(res.msg || res.message || '请求失败，请稍后再试'),
          )
        }
      }
      // eslint-disable-next-line unused-imports/no-unused-vars
      catch (e) {
        this.allFields = []
        window.$oAntdModal.warning(window.$oMsgTips.info('请求失败，请稍后再试'))
      }
    },
    // 获取数据
    async getData() {
      if (this.collectionData.length == 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请配置采集项目后再操作'))
        return
      }
      const { page, size } = this
      const params = await this.initParams()
      this.loading = true
      window.$oAjax
        .get(window.$oApi.mechanicsDataCollection.list, {
          params: {
            ...params,
            testTypeCode: params.testTypeCode || this.getInitalTestTypeCode(),
            isPush: this.tabsActive,
            page,
            size,
          },
        })
        .then((res) => {
          this.loading = false
          if (res.success) {
            this.initColumns()

            this.dataSource = res.obj.rows.map(item => ({
              ...this.getCustomDataByJSON(item.jsonData),
              ...item,
              jcshijian: item.jcshijian
                ? dayjs(item.jcshijian).format('YYYY-MM-DD HH:mm')
                : '',
              isReport: item.isReport === '0' ? '否' : '是',
            }))

            this.pagination.pageSize = size
            this.pagination.current = page
            this.pagination.total = res.obj.count
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
          }
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.log(err)
          this.loading = false
        })
    },
    initColumns() {
      const _columns = [...columns]
      // 当存在自定义字段时，表格中展示自定义字段，不存在自定义字段是展示默认的表格列
      if (this.fields.length > 0) {
        for (let i = 0; i < this.fields.length; i++) {
          const item = this.fields[i]
          const ind = _columns.findIndex(d => d.dataIndex === item.filedCode)
          if (ind !== -1)
            continue
          _columns.push({
            title: item.displayName,
            dataIndex: item.filedCode,
            align: 'left',
            scopedSlots: this.getScopedSlots(item),
          })
        }
      }

      _columns.push({
        title: '操作',
        dataIndex: 'operation',
        scopedSlots: { customRender: 'operation' },
        fixed: 'right',
      })

      // 界面宽度
      const docWidth = document.body.clientWidth
      // 每一列预设宽度
      const colWidth = 150

      // 此处判断数据超过界面宽度时，增加滚动条等操作
      if (docWidth > _columns.length * colWidth) {
        const width = (docWidth - 150) / (_columns.length - 1)
        this.columns = _columns.map((item) => {
          if (item.dataIndex === 'operation') {
            return {
              title: '操作',
              dataIndex: 'operation',
              scopedSlots: { customRender: 'operation' },
              width: undefined,
              fixed: undefined,
            }
          }
          else {
            return {
              ...item,
              width,
            }
          }
        })
      }
      else {
        this.columns = _columns.map((item) => {
          return {
            ...item,
            width: colWidth,
          }
        })
      }
    },
    async initParams() {
      const params = { ...this.formState }
      await this.formatDate(params, 'pushTime')
      await this.formatDate(params, 'collectTime')
      params.isReport = params.isReport == '-1' ? '' : params.isReport
      params.regulatoryId = this.regulatory.id
      return params
    },
    formatDate(params, key) {
      if (!params[key] || params[key].length < 2)
        return
      params[`${key}Start`] = dayjs(params[key][0]).format(
        'YYYY-MM-DD HH:mm:ss',
      )
      params[`${key}End`] = dayjs(params[key][1]).format('YYYY-MM-DD HH:mm:ss')
      delete params[key]
    },
    // 从jsonData中获取自定义数据，并根据采集项目格式化数据
    getCustomDataByJSON(jsonData) {
      const data = JSON.parse(jsonData || '{}')
      const keys = Object.keys(data)
      // 没有自定义数据时，直接返回
      if (keys.length == 0) {
        return {}
      }

      // 循环自定义数据中的每一项，再根据该采集项目下配置的fields来获取每一项的数据类型，格式化显示
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        let dataItem = data[key]
        for (let j = 0; j < this.fields.length; j++) {
          const fieldItem = this.fields[j]
          if (key === fieldItem.filedName) {
            // string 字符串
            // bean 对象
            // list 数组
            // beanList 对象数组
            // file 文件
            // bool 布尔值
            const fieldType = fieldItem.fieldType
            if (
              fieldType === 'bean'
              || fieldType === 'list'
              || fieldType === 'beanList'
            ) {
              data[key] = JSON.stringify(this.formatKeyByFields(dataItem))
            }
            if (fieldType === 'file') {
              dataItem = dataItem || []
              data[key] = dataItem.map(obj => obj.fileName).join(',')
            }
            break
          }
          if (key === fieldItem.filedCode && fieldItem.fieldType === 'bool') {
            data[key] = data[key] == 'true' || data[key] == 'True' ? '是' : '否'
          }
        }
      }

      return data
    },
    // 根据采集项目中的字段中文名格式化对象或数组中的key
    formatKeyByFields(data) {
      if (Array.isArray(data)) {
        return data.map((item) => {
          const obj = {}
          // eslint-disable-next-line array-callback-return
          Object.keys(item).map((key) => {
            const value = item[key]
            if (value && typeof value === 'object') {
              obj[this.fieldsAllObj[key]] = this.formatKeyByFields(value)
            }
            else {
              obj[this.fieldsAllObj[key]] = value
            }
          })
          return obj
        })
      }
      else {
        const obj = {}
        // eslint-disable-next-line array-callback-return
        Object.keys(data).map((key) => {
          const value = data[key]
          if (value && typeof value === 'object') {
            obj[this.fieldsAllObj[key]] = this.formatKeyByFields(value)
          }
          else {
            obj[this.fieldsAllObj[key]] = value
          }
        })
        return obj
      }
    },
    // 获取自定义列
    getScopedSlots(fieldItem) {
      const fieldType = fieldItem.fieldType
      if (fieldType === 'bean') {
        return { customRender: '_bean' }
      }

      if (fieldType === 'list') {
        return { customRender: '_list' }
      }

      if (fieldType === 'beanList') {
        return { customRender: '_beanList' }
      }

      return undefined
    },
    search() {
      this.page = 1
      this.getData()
    },
    reset() {
      this.page = 1
      this.formState = {}
      this.getData()
    },
    // 选择上报
    chooseReport() {
      const keys = this.selectedRowKeys
      if (keys.length === 0) {
        window.$oAntdMessage.warning('请选择需要上报的数据')
        return
      }
      window.$oAntdConfirm({
        title: '提示',
        content: '是否将选择数据上传至重庆市公路水运工程质量检测管理平台？',
        onOk: () => {
          this.reportLoading = true
          window.$oAjax({
            method: 'POST',
            url: window.$oApi.reportingDataCollection.push + this.regulatory.id,
            headers: {
              'content-type': 'application/json',
            },
            data: keys,
          })
            .then((res) => {
              this.reportLoading = false
              if (res.success) {
                window.$oAntdMessage.success('上报成功')
                this.getData()
              }
              else {
                window.$oAntdModal.warning(window.$oMsgTips.info('上报失败'))
              }
            })
            .catch(() => {
              this.reportLoading = false
            })
        },
      })
    },
    // 一键上报
    allReport() {
      window.$oAntdConfirm({
        title: '提示',
        content: '是否将数据上传至重庆市公路水运工程质量检测管理平台？',
        onOk: () => {
          this.allLoading = true
          window.$oAjax({
            method: 'POST',
            url:
              `${window.$oApi.reportingDataCollection.pushAll
              + this.collectionItem.id
              }/${
                this.regulatory.id}`,
            headers: {
              'content-type': 'application/json',
            },
          })
            .then((res) => {
              this.allLoading = false
              if (res.success) {
                window.$oAntdMessage.success('上报成功')
                this.getData()
              }
              else {
                window.$oAntdModal.warning(window.$oMsgTips.info('上报失败'))
              }
            })
            .catch(() => {
              this.allLoading = false
            })
        },
      })
    },
    // 查看
    showTask(row) {
      window.$oAjax({
        method: 'get',
        url: window.$oApi.reportingDataCollection.getTaskInfo + row.id,
      }).then((res) => {
        const len = res.data.length
        if (!res || !res.data || len === 0) {
          window.$oAntdModal.warning(
            window.$oMsgTips.info(
              '选择数据无法与已创建任务匹配，请从检测任务中手动选择采集数据后重新打开',
            ),
          )
          return
        }
        if (len === 1) {
          const obj = res.data[0]
          this.openTaskDetail(obj)
          return
        }
        this.taskDataList = res.data
        this.showTaskList = true
      })
    },
    // 跳转任务详情
    openTaskDetail(obj) {
      window.open(
        `${rootUrl}/testTaskController.do?goTestTaskDetail&id=${obj.taskId}&rid=${obj.reportId}&printEmptyTable=1&dataType=5&readType=2&udrReadOnly=1&hideBtn=1`,
      )
    },
    downloadAccessory(data) {
      window.open(
        data.url,
      )
    },
    handleChange(value) {
      const typeItem = allItems[value]
      this.collectionItem = typeItem
      this.getCustomField(typeItem.id)
      this.getFieldsAllObj()
    },
    getFieldsAllObj() {
      const arr = this.allFields.map(item => ({
        filedCode: item.filedCode,
        filedName: item.filedName,
      }))

      const obj = {}
      // eslint-disable-next-line array-callback-return
      arr.map((item) => {
        obj[item.filedCode] = item.filedName
      })

      this.fieldsAllObj = obj
    },
  },
}
</script>

<style lang="less">
@import './index.less';
.ant-form-item {
  height: 28px;
}
.btns-box {
  margin-top: 15px;
  .ant-btn {
    margin-right: 10px;
  }
}
</style>
