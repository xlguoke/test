<!-- eslint-disable vue/no-unused-refs -->
<template>
  <div>
    <div>
      <a-form ref="formRef" :model="formState">
        <a-row :gutter="15">
          <a-col span="8" style="height: 26px">
            <a-form-item
              label="部门科室"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 19 }"
            >
              <a-tree-select
                v-model:value="formState.departmentId"
                style="width: 100%"
                :dropdown-style="{ maxHeight: '300px', overflow: 'auto' }"
                placeholder="请选择部门科室"
                allow-clear
                :tree-data="departmentData"
                tree-default-expand-all
                show-search
              />
            </a-form-item>
          </a-col>
          <a-col span="8">
            <a-form-item
              label="委托日期"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 19 }"
            >
              <a-range-picker
                v-model:value="formState.consignDate"
                style="width: 100%"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
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
                v-model:value="formState.testDate"
                style="width: 100%"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </a-form-item>
          </a-col>
          <a-col span="8">
            <a-form-item
              label="签发日期"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 19 }"
            >
              <a-range-picker
                v-model:value="formState.signDate"
                style="width: 100%"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
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
    </div>
    <div style="padding-top: 10px; padding-bottom: 10px">
      <a-button @click="exportFile">
        导出
      </a-button>
    </div>
    <a-table
      :columns="columns"
      :data-source="data"
      :scroll="{ y: 500 }"
      bordered
      :pagination="false"
      :loading="loading"
      :row-class-name="rowClassName"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'operation'">
          <span class="table-handle">
            <a @click="() => viewDetail(record)">查看详情</a>
          </span>
        </template>
      </template>
    </a-table>
    <Detail ref="Detail" />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { rootUrl } from '~/providers/configs/rootUrl'
import Detail from './components/detail.vue'

const columns = [
  {
    title: '检测部门',
    dataIndex: 'department',
    width: '30%',
  },
  {
    title: '检测人员',
    dataIndex: 'testPerson',
    width: '30%',
  },
  {
    title: '超期任务数量',
    dataIndex: 'overDuoCount',
    width: '30%',
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
    Detail,
  },
  data() {
    return {
      formState: {},
      queryParams: {},
      columns,
      page: 1,
      size: 10,
      loading: false,
      dateFormat: 'YYYY-MM-DD',
      data: [],
      departmentData: [],
    }
  },
  created() {
    this.getLaboratoryData()
    this.getData()
  },
  methods: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    getLaboratoryData() {
      window.$oAjax.get(window.$oApi.common.getDepartmentTree).then((res) => {
        if (res && res.length > 0) {
          res.shift()
          this.departmentData = this.formatDepartmentData(res)
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
        if (item.children && item.children.length > 0) {
          children = this.formatDepartmentData(item.children)
        }
        arr.push({
          title: item.text,
          value: item.id,
          key: item.id,
          children,
        })
      })

      return arr
    },
    getData(params) {
      // eslint-disable-next-line unused-imports/no-unused-vars
      const { page, size, projectName } = this
      this.loading = true
      window.$oAjax
        .get(window.$oApi.testOverStatistic.getData, { params })
        .then((res) => {
          if (res.code && res.code === 20000) {
            this.data = res.data
            this.loading = false
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
          }
        })
    },
    search() {
      this.parseQueries()
      this.getData(this.queryParams)
    },
    parseQueries() {
      const data = { ...this.formState }

      if (data.consignDate) {
        data.consignDate = data.consignDate
          .map(item => dayjs(item).format('YYYY-MM-DD'))
          .join(',')
      }

      if (data.testDate) {
        data.testDate = data.testDate
          .map(item => dayjs(item).format('YYYY-MM-DD'))
          .join(',')
      }

      if (data.signDate) {
        data.signDate = data.signDate
          .map(item => dayjs(item).format('YYYY-MM-DD'))
          .join(',')
      }
      this.queryParams = data
    },
    reset() {
      this.formState = {}
      this.getData()
    },
    viewDetail(record) {
      this.$refs.Detail.showModal(record.taskIds)
    },
    exportFile() {
      this.parseQueries()
      const a = document.createElement('a')
      const params = {
        ...this.queryParams,
        page: 0,
        size: 999999,
        pager: false,
      }
      let href = `${rootUrl}${window.$oApi.testOverStatistic.export}`

      Object.keys(params)
        .filter(key => !!params[key])
        .map(
          (key, index) =>
            (href += `${index === 0 ? '?' : '&'}${key}=${params[key]}`),
        )

      a.href = href
      a.click()
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
