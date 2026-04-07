<!-- eslint-disable vue/no-unused-refs -->
<template>
  <div>
    <a-form ref="formRef" :model="formState">
      <a-row :gutter="15">
        <a-col span="8">
          <a-form-item
            label="委托日期"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 19 }"
          >
            <a-range-picker
              v-model:value="formState.consignDate"
              style="width: 100%"
              value-format="YYYY-MM-DD"
              @change="
                (date, val) => {
                  handleChange(date, 'consignDate')
                }
              "
            />
          </a-form-item>
        </a-col>
        <a-col span="8">
          <a-form-item
            label="检测日期"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 19 }"
          >
            <a-range-picker
              v-model:value="formState.testDate"
              style="width: 100%"
              value-format="YYYY-MM-DD"
              @change="
                (date, val) => {
                  handleChange(date, 'testDate')
                }
              "
            />
          </a-form-item>
        </a-col>
        <a-col span="8">
          <a-form-item
            label="检测参数"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 19 }"
          >
            <a-input
              v-model:value="formState.paramName"
              placeholder="请输入检测参数名称"
            />
          </a-form-item>
        </a-col>
        <a-col span="8">
          <a-row>
            <a-col span="19" offset="5">
              <a-button type="primary" @click="search">
                查询
              </a-button>
              <a-button @click="reset">
                重置
              </a-button>
            </a-col>
          </a-row>
        </a-col>
      </a-row>
    </a-form>
    <a-table
      class="mt-4"
      :columns="columns"
      :data-source="data"
      bordered
      :row-class-name="rowClassName"
      :pagination="data.length > 0 ? pagination : false"
      :loading="loading"
      row-key="index"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'operation'">
          <a-button type="text" @click="showDetail(record)">
            查看详情
          </a-button>
        </template>
      </template>
    </a-table>
    <TaskDetail ref="detail" />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import TaskDetail from './component/taskDetail.vue'

const columns = [
  {
    title: '大类',
    dataIndex: 'categoryName',
    width: '18%',
  },
  {
    title: '参数名称',
    dataIndex: 'testParamName',
    width: '20%',
  },
  {
    title: '检测项目',
    dataIndex: 'testItemName',
    width: '25%',
  },
  {
    title: '任务数量',
    dataIndex: 'count',
    width: '15%',
  },
  {
    title: '操作',
    dataIndex: 'operation',
    width: '22%',
    scopedSlots: { customRender: 'operation' },
  },
]

export default {
  name: 'TestParamWithTask',
  components: { TaskDetail },
  data() {
    return {
      formState: {
        consignDate: [],
      },
      data: [],
      columns,
      selectedRowKeys: [],
      selectedRows: [],
      page: 1,
      size: 10,
      queryParams: {},
      loading: false,
      defaultConsignDate: [],
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
      visible: false,
    }
  },
  mounted() {
    this.startDate = new Date()
    this.startDate.setDate(1)
    this.startDate.setMonth(0)
    this.defaultConsignDate = [
      dayjs(this.startDate).format('YYYY-MM-DD'),
      dayjs(new Date()).format('YYYY-MM-DD'),
    ]
    this.formState.consignDate = [...this.defaultConsignDate]
    this.search()
  },
  methods: {
    dayjs,
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    getData() {
      const { page, size } = this
      this.loading = true

      window.$oRest
        .get('rest/statistic/param-task', {
          params: {
            page,
            size,
            ...this.queryParams,
          },
        })
        .then((res) => {
          this.loading = false
          if (res.code === 20000) {
            this.data = res.data.rows
            this.pagination.total = res.data.count
            this.pagination.current = page
            this.pagination.pageSize = size
          }
          else {
            this.data = []
            window.$oAntdModal.warning(window.$oMsgTips.info('获取数据失败'))
          }
        })
        .catch((err) => {
          console.error(err)
          window.$oAntdModal.warning(window.$oMsgTips.info('获取数据失败'))
        })
    },
    search() {
      this.page = 1
      const fieldsValue = { ...this.formState }

      const consignDate = fieldsValue.consignDate || []
      const testDate = fieldsValue.testDate || []
      const paramName = fieldsValue.paramName || ''

      if (consignDate && consignDate.length > 0) {
        this.queryParams.consignDate = `${consignDate[0]},${consignDate[1]}`
      }
      else {
        this.queryParams.consignDate = undefined
      }
      if (testDate && testDate.length > 0) {
        this.queryParams.testDate = `${testDate[0]} 00:00:00,${testDate[1]} 23:59:59`
      }
      if (paramName) {
        this.queryParams.paramName = paramName
      }
      else {
        delete this.queryParams.paramName
      }
      this.getData()
    },
    reset() {
      this.formState = {}
      this.page = 1
      this.queryParams = {}
      this.formState.consignDate = [...this.defaultConsignDate]
      this.search()
    },
    handleChange(dates, field) {
      if (dates && dates.length === 0) {
        delete this.queryParams[field]
      }
    },
    showDetail(row) {
      const testParams = row.testParamName
      this.$refs.detail.showModal(row.paramId, this.queryParams, testParams)
    },
  },
}
</script>

<style scoped></style>
