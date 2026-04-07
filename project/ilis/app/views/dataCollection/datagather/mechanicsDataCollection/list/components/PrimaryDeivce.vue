<template>
  <div class="h-full">
    <a-form :model="formState">
      <a-row :gutter="15">
        <a-col span="8" style="height: 26px">
          <a-form-item
            label="采集项目"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 19 }"
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
        <a-col span="8">
          <a-form-item
            label="样品编号"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 19 }"
          >
            <a-input
              v-model:value="formState.yangpbh"
              style="width: 100%"
              placeholder="请输入样品编号"
            />
          </a-form-item>
        </a-col>
        <a-col span="8">
          <a-form-item
            label="设备编号"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 19 }"
          >
            <a-input
              v-model:value="formState.sbbianhao"
              style="width: 100%"
              placeholder="请输入设备编号"
            />
          </a-form-item>
        </a-col>
        <a-col span="8">
          <a-form-item
            label="设备名称"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 19 }"
          >
            <a-input
              v-model:value="formState.sbmingcheng"
              style="width: 100%"
              placeholder="请输入设备名称"
            />
          </a-form-item>
        </a-col>
        <a-col span="8">
          <a-form-item
            label="检测时间"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 19 }"
          >
            <a-range-picker
              v-model:value="formState.stamp"
              :placeholder="['开始时间', '结束时间']"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 100%"
              :show-time="{
                defaultValue: [
                  dayjs('00:00:00', 'HH:mm:ss'),
                  dayjs('23:59:59', 'HH:mm:ss'),
                ],
              }"
            />
          </a-form-item>
        </a-col>
        <a-col span="8">
          <a-form-item
            label="上传时间"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 19 }"
          >
            <a-range-picker
              v-model:value="formState.createDate"
              :placeholder="['开始时间', '结束时间']"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 100%"
              :show-time="{
                defaultValue: [
                  dayjs('00:00:00', 'HH:mm:ss'),
                  dayjs('23:59:59', 'HH:mm:ss'),
                ],
              }"
            />
          </a-form-item>
        </a-col>
        <a-col span="8">
          <a-form-item
            label="是否已出报告"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 19 }"
          >
            <a-radio-group
              v-model:value="formState.isReport"
              name="radioGroup"
            >
              <a-radio
                v-for="(item, index) in radioData"
                :key="index"
                :value="item.value"
              >
                {{ item.name }}
              </a-radio>
            </a-radio-group>
          </a-form-item>
        </a-col>
        <a-col span="8">
          <a-form-item
            label="查询类型"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 19 }"
          >
            <a-radio-group
              v-model:value="formState.purposeType"
              name="purposeType"
            >
              <a-radio
                v-for="(item, index) in purposeType"
                :key="index"
                :value="item.value"
              >
                {{ item.name }}
              </a-radio>
            </a-radio-group>
          </a-form-item>
        </a-col>
        <a-col span="8">
          <a-button type="primary" @click="search">
            查询
          </a-button>
          <a-button @click="reset">
            重置
          </a-button>
        </a-col>
      </a-row>
    </a-form>
    <a-table
      style="margin-top: 15px"
      :columns="columns"
      :data-source="data"
      bordered
      :pagination="pagination"
      :scroll="scroll"
      :row-class-name="rowClassName"
      :loading="loading"
      row-key="id"
    >
      <template #bodyCell="{ column, record, text }">
        <template v-if="column.dataIndex === '_bean'">
          <div style="max-height: 100px; overflow-y: auto">
            {{ text }}
          </div>
        </template>

        <template v-if="column.dataIndex === '_list'">
          <div style="max-height: 100px; overflow-y: auto">
            {{ text }}
          </div>
        </template>

        <template v-if="column.dataIndex === '_beanList'">
          <div style="max-height: 100px; overflow-y: auto">
            {{ text }}
          </div>
        </template>

        <template v-if="column.dataIndex === 'purposeType'">
          <span class="table-handle">
            {{ record.purposeType === 'REGULAR' ? '常规数据' : record.purposeType === 'BENCHMARK' ? '基准数据' : '' }}
          </span>
        </template>

        <template v-if="column.dataIndex === 'operation'">
          <span class="table-handle">
            <a v-if="record.dots" href="javascript:;">
              <LineChartOutlined
                type="line-chart"
                title="查看曲线"
                @click="() => viewDetail(record)"
              />
            </a>
          </span>
        </template>
      </template>
    </a-table>
    <Detail ref="Detail" />
  </div>
</template>

<script>
/* eslint-disable eqeqeq */
import { LineChartOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import Detail from './detail.vue'

const columns = [
  {
    title: '样品编号',
    dataIndex: 'yangpbh',
    width: '150',
    fixed: 'left',
  },
  {
    title: '设备编号',
    dataIndex: 'sbbianhao',
    width: '150',
    fixed: 'left',
  },
  {
    title: '设备名称',
    dataIndex: 'sbmingcheng',
    width: '150',
    fixed: 'left',
  },
  {
    title: '工程部位',
    dataIndex: 'gongcbw',
    width: '10%',
  },
  {
    title: '检测时间',
    dataIndex: 'jcshijian',
    width: '20%',
  },
  {
    title: '是否已出报告',
    dataIndex: 'isReport',
    width: '10%',
  },
  {
    title: '查询类型',
    dataIndex: 'purposeType',
    width: '10%',
    scopedSlots: { customRender: 'purposeType' },
  },
  {
    title: '操作',
    dataIndex: 'operation',
    width: '150',
    scopedSlots: { customRender: 'operation' },
    fixed: 'right',
  },
]

const allItems = {}

export default {
  components: {
    Detail,
    LineChartOutlined,
  },
  data() {
    return {
      dayjs,
      columns,
      defaultColumns: JSON.parse(JSON.stringify(columns)),
      page: 1,
      size: 10,
      loading: false,
      data: [],
      collectionData: [],
      radioData: [
        { name: '全部', value: undefined },
        { name: '已出', value: '1' },
        { name: '未出', value: '0' },
      ],
      purposeType: [
        { name: '全部', value: 'ALL' },
        { name: '常规数据', value: 'REGULAR' },
        { name: '基准数据', value: 'BENCHMARK' },
      ],
      pagination: {
        current: 1,
        total: 0,
        ...window.pageConfig,
        onChange: (page) => {
          this.page = page
          this.getData(this.query)
        },
        onShowSizeChange: (page, size) => {
          this.page = 1
          this.size = size
          this.getData(this.query)
        },
      },
      query: {},
      scroll: {},
      fields: [],
      allFields: [],
      fieldsAllObj: {},
      formState: {
        testTypeCode: undefined,
        purposeType: 'ALL',
      },
    }
  },
  created() {
    this.getAllCustomField()
    this.getLaboratoryData()
  },
  methods: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
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
              this.formState.testTypeCode = this.getInitalTestTypeCode()
              this.getData()
            }
          }
        })
    },
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
        }
      }

      return data
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
    // 获取表格滚动高度
    getTableHeight() {
      const docHeight = document.body.offsetHeight
      return docHeight - 340
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
    // 请求列表数据
    getData(params) {
      if (this.collectionData.length == 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请配置采集项目后再操作'))
        return
      }

      if (!params) {
        params = {}
      }

      if (!params.purposeType) {
        params.purposeType = 'ALL'
      }

      const { page, size } = this
      this.loading = true
      window.$oAjax
        .get(window.$oApi.mechanicsDataCollection.list, {
          params: {
            ...params,
            testTypeCode: params.testTypeCode || this.getInitalTestTypeCode(),
            page,
            size,
          },
        })
        .then((res) => {
          if (res.success) {
            this.data = res.obj.rows.map(item => ({
              ...item,
              ...this.getCustomDataByJSON(item.jsonData),
              jcshijian: item.jcshijian
                ? dayjs(item.jcshijian).format('YYYY-MM-DD HH:mm')
                : '',
              isReport: item.isReport === '0' ? '否' : '是',
            }))

            let _columns = []

            // 当存在自定义字段时，表格中展示自定义字段，不存在自定义字段是展示默认的表格列
            if (this.fields.length > 0) {
              _columns = this.fields.map(item => ({
                title: item.displayName,
                dataIndex: item.filedCode,
                align: 'left',
                scopedSlots: this.getScopedSlots(item),
              }))
              _columns.push({
                title: '查询类型',
                dataIndex: 'purposeType',
                width: '10%',
                scopedSlots: { customRender: 'purposeType' },
              })
              _columns.push({
                title: '操作',
                dataIndex: 'operation',
                scopedSlots: { customRender: 'operation' },
                fixed: 'right',
              })
            }
            else {
              _columns = JSON.parse(JSON.stringify(this.defaultColumns))
            }

            // 界面宽度
            const docWidth = document.body.clientWidth
            // 每一列预设宽度
            const colWidth = 150

            // 此处判断数据超过界面宽度时，增加滚动条等操作
            if (docWidth > _columns.length * colWidth) {
              this.scroll = {
                y: this.getTableHeight(),
              }

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
              this.scroll = {
                x: _columns.length * 150,
                y: this.getTableHeight(),
              }

              this.columns = _columns.map((item) => {
                return {
                  ...item,
                  width: colWidth,
                }
              })
            }

            this.pagination.pageSize = size
            this.pagination.current = page
            this.pagination.total = res.obj.count
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
          }
          this.loading = false
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.log(err)
          this.loading = false
        })
    },
    search() {
      this.page = 1

      const data = { ...this.formState }
      if (data.stamp && data.stamp.length == 2) {
        data.jcshijianStart = dayjs(data.stamp[0]).format(
          'YYYY-MM-DD HH:mm:ss',
        )
        data.jcshijianEnd = dayjs(data.stamp[1]).format('YYYY-MM-DD HH:mm:ss')
        delete data.stamp
      }

      if (data.createDate && data.createDate.length == 2) {
        data.createDateStart = dayjs(data.createDate[0]).format(
          'YYYY-MM-DD HH:mm:ss',
        )
        data.createDateEnd = dayjs(data.createDate[1]).format('YYYY-MM-DD HH:mm:ss')
        delete data.createDate
      }

      this.query = data

      this.getData(data)
    },
    reset() {
      this.page = 1
      const typeItem = allItems[this.getInitalTestTypeCode()]
      this.getCustomField(typeItem.id)
      this.getFieldsAllObj()
      this.formState = {}
      this.query = {}
      this.getData()
    },
    viewDetail(record) {
      this.$refs.Detail.showModal(record)
    },
    handleChange(value) {
      const typeItem = allItems[value]
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

</style>
