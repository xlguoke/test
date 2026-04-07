<!-- eslint-disable vue/require-v-for-key -->
<template>
  <div style="min-height: 344px">
    <h3 class="ht-page-title">
      充值记录
    </h3>
    <div class="content-box">
      <a-form layout="inline" style="margin-bottom: 4px">
        <a-form-item>
          <a-range-picker
            v-model:value="form.date"
            value-format="YYYY-MM-DD"
            :disabled-date="disabledDate"
            :placeholder="['请选择充值日期', '请选择充值日期']"
            style="width: 220px"
            @change="queryData"
          ></a-range-picker>
        </a-form-item>
      </a-form>
      <a-table
        row-key="id"
        :columns="columns"
        :data-source="tableData"
        :row-class-name="rowClassName"
        :pagination="pagination"
        :loading="loading"
        :scroll="{ y: tableHeight }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'operation'">
            <a-button type="link" @click="showDetail(record)">
              详情
            </a-button>
          </template>
        </template>
      </a-table>
    </div>

    <ht-modal
      v-model:open="visible"
      title="充值详情"
      :mask-closable="false"
      :keyboard="false"
      width="500px"
    >
      <template #footer>
        <div class="clearfix">
          <a-button @click="visible = false">
            关闭
          </a-button>
        </div>
      </template>
      <a-spin :spinning="detailLoaidng">
        <div style="padding: 0 10px; max-height: 70vh; overflow-y: auto">
          <a-row>
            <a-col :span="5">
              充值时间：
            </a-col>
            <a-col :span="18">
              {{ formatDate(detailObj.createDate) }}
            </a-col>
            <a-col :span="5">
              充值条数：
            </a-col>
            <a-col :span="18">
              {{ detailObj.amount }}
            </a-col>
            <a-col :span="5">
              短信总数：
            </a-col>
            <a-col :span="18">
              {{ detailObj.amountAfter }}
            </a-col>
            <a-col :span="5">
              备注：
            </a-col>
            <a-col :span="18">
              {{ detailObj.remark }}
            </a-col>
            <template
              v-if="detailObj.attachments && detailObj.attachments.length"
            >
              <a-col :span="5">
                附件：
              </a-col>
              <a-col :span="18">
                <div v-for="file in detailObj.attachments" class="files-item">
                  <a class="file-name" href="#" @click="downLoadFile(file)">{{
                    file.name
                  }}</a>
                  <!-- <a-button type="link" @click="downLoadFile(file)">下载</a-button> -->
                </div>
              </a-col>
            </template>
          </a-row>
        </div>
      </a-spin>
    </ht-modal>
  </div>
</template>

<script>
import dayjs from 'dayjs'

export default {
  data() {
    return {
      dayjs,
      loading: false,
      detailLoaidng: false,
      tableHeight: 196,
      columns: [
        {
          title: '充值时间',
          dataIndex: 'createDate',
          width: '28%',
          customRender: ({ text }) => this.formatDate(text),
        },
        {
          title: '充值条数',
          dataIndex: 'amount',
        },
        {
          title: '短信总数',
          dataIndex: 'amountAfter',
        },
        {
          title: '备注',
          dataIndex: 'remark',
          ellipsis: true,
        },
        {
          title: '操作',
          dataIndex: 'operation',
          width: 90,
          scopedSlots: { customRender: 'operation' },
        },
      ],
      form: {
        date: [],
      },
      tableData: [],
      fileList: [],
      pagination: {
        current: 1,
        total: 0,
        ...window.pageConfig,
        pageSize: 4,
        pageSizeOptions: ['4', '10', '20', '30', '40', '50'],
        onChange: (page) => {
          this.pagination.current = page
          this.getData()
        },
        onShowSizeChange: (page, size) => {
          this.pagination.current = page
          this.pagination.pageSize = size
          this.getData()
        },
      },
      visible: false,
      detailObj: {},
    }
  },
  created() {
    this.getData()
  },
  methods: {
    rowClassName(record, index) {
      return index % 2 === 1 ? 'dark-row' : 'light-row'
    },
    formatDate(t) {
      return t ? dayjs(t).format('YYYY-MM-DD HH:mm:ss') : ''
    },
    disabledDate(current) {
      const toDay = dayjs().endOf('day')
      const startT = dayjs(toDay).subtract(2, 'years').subtract(1, 'day')
      return (current && current > toDay) || current < startT
    },
    queryData() {
      this.pagination.current = 1
      this.getData()
    },
    getData() {
      this.loading = true
      const { current, pageSize } = this.pagination
      const { date } = this.form
      const params = {
        page: current,
        size: pageSize,
      }
      if (date && date.length > 0) {
        params.startDate = date[0]
        params.endDate = date[1]
      }
      window.$oAjax
        .get('/rest/sms/recharge/pagination', { params })
        .then((res) => {
          this.loading = false
          if (res.code !== 20000) {
            window.$oErrorAlert(res.message)
            return
          }

          this.tableData = res.data.rows || []
          this.pagination.total = res.data.count
        })
        .catch((err) => {
          this.loading = false
          window.$oErrorAlert(err.message)
        })
    },
    showDetail(row) {
      this.visible = true
      this.detailLoaidng = true
      window.$oAjax
        .get(`/rest/sms/recharge/detail/${row.id}`)
        .then((res) => {
          this.detailLoaidng = false
          if (res.code !== 20000) {
            return window.$oErrorAlert(res.message)
          }
          this.detailObj = res.data
        })
        .catch((err) => {
          this.detailLoaidng = false
          window.$oErrorAlert(err.message)
        })
    },
    downLoadFile(file) {
      window.open(file.url, '_blank')
    },
  },
}
</script>

<style lang="less" scoped>
:deep(.ant-table-body) {
  min-height: 196px;
}
:deep(.ant-table-placeholder) {
  position: absolute;
  top: 39px;
  left: 0;
  right: 0;
}
.ant-col-5 {
  padding-right: 8px;
  text-align: right;
  color: #aaa;
  line-height: 28px;
}
.ant-col-18 {
  padding: 6px 0;
  min-height: 28px;
  line-height: 16px;
}
.files-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .file-name {
    line-height: 16px;
  }
}
</style>
