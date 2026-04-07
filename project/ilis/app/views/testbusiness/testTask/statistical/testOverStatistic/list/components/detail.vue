<template>
  <div>
    <ht-modal
      v-model:open="visible"
      title="详情"
      width="90%"
      :footer="false"
      @ok="cancelModal"
    >
      <div style="padding-top: 10px; padding-bottom: 10px">
        <a-button @click="exportFile">
          导出
        </a-button>
      </div>
      <a-table
        :columns="columns"
        :pagination="pagination"
        :data-source="data"
        :loading="loading"
        bordered
        :row-class-name="rowClassName"
      >
        <template #bodyCell="{ column, record, text }">
          <template v-if="column.dataIndex === 'otherInfo'">
            <span>
              {{ text }}
              <span v-if="record.editPerson">{{ record.editPerson }};</span>
              <span v-if="record.reviewPerson">{{ record.reviewPerson }};</span>
              <span v-if="record.auditPerson">{{ record.auditPerson }};</span>
              <span v-if="record.approvePerson">{{ record.approvePerson }};</span>
            </span>
          </template>
        </template>
      </a-table>
    </ht-modal>
  </div>
</template>

<script>
import { rootUrl } from '~/providers/configs/rootUrl'

const columns = [
  {
    title: '任务编号',
    dataIndex: 'testTaskCode',
    width: '10%',
  },
  {
    title: '记录编号',
    dataIndex: 'testRecordCode',
    width: '10%',
  },
  {
    title: '委托时间',
    dataIndex: 'consignDate',
    width: '10%',
  },
  {
    title: '要求报告时间',
    dataIndex: 'requiredReportDate',
    width: '10%',
  },
  {
    title: '检测时间',
    dataIndex: 'testDate',
    width: '15%',
  },
  {
    title: '签发日期',
    dataIndex: 'signDate',
    width: '10%',
  },
  {
    title: '检测人员',
    dataIndex: 'testPerson',
    width: '10%',
  },
  {
    title: '更多',
    dataIndex: 'otherInfo',
    width: '25%',
    scopedSlots: { customRender: 'otherInfo' },
  },
]

export default {
  data() {
    return {
      data: [],
      columns,
      loading: false,
      visible: false,
      taskIds: '',
      page: 1,
      size: 5,
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
  methods: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    getData(taskIds) {
      const { page, size } = this
      this.loading = true
      window.$oAjax({
        methods: 'GET',
        url: window.$oApi.testOverStatistic.detail,
        params: {
          taskIds: taskIds || this.taskIds,
          pager: true,
          page,
          size,
        },
      }).then((res) => {
        if (res.code && res.code === 20000) {
          this.data = res.data.rows
          this.pagination.total = res.data.count
          this.pagination.current = page
          this.pagination.pageSize = size
          this.page = page
          this.size = size
          this.loading = false
        }
        else {
          this.loading = false
        }
      })
    },
    showModal(taskIds) {
      this.taskIds = taskIds
      this.getData(taskIds)
      this.visible = true
    },
    cancelModal() {
      this.visible = false
    },
    exportFile() {
      const a = document.createElement('a')
      const params = {
        taskIds: this.taskIds,
        page: 0,
        size: 999999,
        pager: false,
      }
      let href = `${rootUrl}${window.$oApi.testOverStatistic.detail_export}`

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
