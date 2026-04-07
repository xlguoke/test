<!-- eslint-disable vue/no-unused-refs -->
<template>
  <div class="projectManageList">
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
            />
          </a-form-item>
        </a-col>
        <a-col span="8">
          <a-form-item
            label="检测日期"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 19 }"
          >
            <a-range-picker v-model:value="formState.testDate" value-format="YYYY-MM-DD" style="width: 100%" />
          </a-form-item>
        </a-col>
        <a-col span="4">
          <a-button type="primary" @click="search">
            查询
          </a-button>
          <a-button @click="reset">
            重置
          </a-button>
        </a-col>
        <a-col span="4">
          <a-checkbox v-model:checked="notVoided" @change="search">
            仅查询未作废委托的参数
          </a-checkbox>
        </a-col>
      </a-row>
      <a-row style="margin-bottom: 15px">
        <a-col span="4">
          <a-button type="primary" @click="downTable">
            导出
          </a-button>
        </a-col>
      </a-row>
    </a-form>
    <a-table
      :columns="columns"
      :data-source="data"
      bordered
      :row-class-name="rowClassName"
      :pagination="data.length > 0 ? pagination : false"
      :loading="loading"
      row-key="index"
    >
    </a-table>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { rootUrl } from '~/providers/configs/rootUrl'

const columns = [
  {
    title: '大类',
    dataIndex: 'categoryName',
    width: '18%',
  },
  {
    title: '参数',
    dataIndex: 'testParamName',
    width: '20%',
  },
  {
    title: '规格名称',
    dataIndex: 'standradName',
    width: '25%',
  },
  {
    title: '颁布号',
    dataIndex: 'clauseCode',
    width: '15%',
  },
  {
    title: '规格用途',
    dataIndex: 'standradType',
    width: '22%',
  },
]

export default {

  components: {},
  data() {
    return {
      notVoided: false,
      formState: {
        consignDate: [],
      },
      data: [],
      columns,
      selectedRowKeys: [],
      selectedRows: [],
      isAdd: true,
      page: 1,
      size: 10,
      queryParams: null,
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
    }
  },
  computed: {},
  created() {},
  mounted() {
    this.startDate = new Date()
    this.startDate.setDate(1)
    this.startDate.setMonth(0)
    this.defaultConsignDate = [
      dayjs(this.startDate).format('YYYY-MM-DD'),
      dayjs(new Date()).format('YYYY-MM-DD'),
    ]
    this.queryParams = {
      queryType: 10010,
      consignDate: `${dayjs(this.startDate).format('YYYY-MM-DD')},${dayjs(
        new Date(),
      ).format('YYYY-MM-DD')}`,
    }
    this.formState.consignDate = [...this.defaultConsignDate]
    this.getData()
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
      if (this.notVoided) {
        this.queryParams.activeConsign = 1
      }
      else {
        this.queryParams.activeConsign = 0
      }

      window.$oRest
        .get(window.$oApi.testParameterStatistic.getData, {
          params: {
            page,
            size,
            ...this.queryParams,
          },
        })
        .then((res) => {
          this.loading = false
          if (res && res.data && res.data.total > 0) {
            this.data = res.data.rows
            this.pagination.total = res.data.total
            this.pagination.current = page
            this.pagination.pageSize = size
          }
          else {
            this.data = []
          }
        })
    },
    downTable() {
      window.location.href = `${rootUrl}/statisticalController.do?param-coverage-export&page=${this.pagination.current}&size=10&queryType=${this.queryParams.queryType}&consignDate=${this.queryParams.consignDate}&testDate=${this.queryParams.consignDate}&activeConsign=${this.queryParams.activeConsign}`
    },
    search() {
      this.page = 1
      const fieldsValue = { ...this.formState }
      // 查询类型 10010按照委托日期查询 10086按照检测日期查询 10000 同时查询
      const consignDate = fieldsValue.consignDate || []
      const testDate = fieldsValue.testDate || []

      if (consignDate.length > 0 && testDate.length > 0) {
        this.queryParams = {
          queryType: 10000,
          consignDate: `${consignDate[0]},${consignDate[1]}`,
          testDate: `${testDate[0]},${testDate[1]}`,
        }
      }
      else if (consignDate.length > 0 && testDate.length === 0) {
        this.queryParams = {
          queryType: 10010,
          consignDate: `${consignDate[0]},${consignDate[1]}`,
          testDate: '',
        }
      }
      else if (testDate.length > 0 && consignDate.length === 0) {
        this.queryParams = {
          queryType: 10086,
          consignDate: '',
          testDate: `${testDate[0]},${testDate[1]}`,
        }
      }
      else {
        this.queryParams = null
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择一个日期'))
      }

      if (this.queryParams) {
        this.getData()
      }
    },
    reset() {
      this.formState = {
        consignDate: [...this.defaultConsignDate],
      }
      this.page = 1
      this.notVoided = false
      this.queryParams = {
        queryType: 10010,
        consignDate: `${dayjs(this.startDate).format('YYYY-MM-DD')},${dayjs(
          new Date(),
        ).format('YYYY-MM-DD')}`,
      }
      this.getData()
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
