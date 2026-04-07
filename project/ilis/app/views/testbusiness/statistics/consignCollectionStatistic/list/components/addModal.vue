<template>
  <div>
    <ht-modal
      title="样品分类统计详情"
      :open="visible"
      centered
      :confirm-loading="confirmLoading"
      class="projectManageList-addModal"
      width="70%"
      :mask-closable="false"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <div>
        <a-table
          :columns="columns"
          :pagination="pagination"
          :data-source="data"
          :loading="loading"
          bordered
          row-key="index"
          :scroll="{ y: 350 }"
          :row-class-name="rowClassName"
        >
        </a-table>
      </div>
    </ht-modal>
  </div>
</template>

<script>
import dayjs from 'dayjs'

const columns = [
  {
    title: '委托日期',
    dataIndex: 'consignDate',
    width: '15%',
    customRender: ({ text }) => {
      return dayjs(text).format('YYYY-MM-DD')
    },
  },
  {
    title: '委托编号',
    dataIndex: 'consignCode',
    width: '20%',
  },
  {
    title: '样品名称',
    dataIndex: 'sampleName',
    width: '15%',
  },
  {
    title: '样品编号',
    dataIndex: 'sampleCode',
    width: '15%',
  },
  {
    title: '规格型号',
    dataIndex: 'sampleModel',
    width: '15%',
  },
  {
    title: '工程部位/用途',
    dataIndex: 'partUse',
    width: '20%',
  },
]
export default {
  props: ['callback'],
  data() {
    return {
      columns,
      visible: false,
      confirmLoading: false,
      data: [],
      loading: false,
      page: 1,
      size: 10,
      testObjectIds: '',
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
  created() {},
  methods: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    getData() {
      const { page, size } = this
      // eslint-disable-next-line unused-imports/no-unused-vars
      const params = {
        page,
        size,
        testObjectIds: this.testObjectIds,
      }
      this.loading = true
      window.$oAjax({
        method: 'POST',
        url: window.$oApi.consignCollectionStatistic.detail,
        data: JSON.stringify({
          page,
          size,
          testObjectIds: this.testObjectIds,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      }).then((res) => {
        if (res && res.data && res.data.total >= 0) {
          this.data = res.data.rows
          this.pagination.total = res.data.total || 0
          this.pagination.current = page
          this.pagination.pageSize = size
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
        this.loading = false
      })
    },
    showModal(data) {
      this.page = 1
      this.testObjectIds = data
      this.getData()
      this.visible = true
    },
    handleOk() {
      this.visible = false
    },
    handleCancel() {
      this.visible = false
    },
  },
}
</script>

<style></style>
