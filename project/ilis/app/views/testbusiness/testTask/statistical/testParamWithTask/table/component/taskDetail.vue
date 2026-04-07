<template>
  <ht-modal
    title="试验任务"
    :open="visible"
    :footer="false"
    width="80%"
    :mask-closable="false"
    :closable="true"
    @cancel="handleCancel"
  >
    <a-table
      :columns="columns"
      :data-source="data"
      bordered
      :pagination="data.length > 0 ? pagination : false"
      :loading="loading"
      row-key="index"
    >
    </a-table>
  </ht-modal>
</template>

<script>
export default {
  name: 'TaskDetail',
  data() {
    return {
      visible: false,
      loading: false,
      data: [],
      columns: [
        {
          title: '任务编号',
          dataIndex: 'testTaskCode',
          width: '10%',
        },
        {
          title: '样品编号',
          dataIndex: 'testObjectCode',
          width: '10%',
        },
        {
          title: '样品名称',
          dataIndex: 'testObjectName',
          width: '15%',
        },
        {
          title: '规格型号',
          dataIndex: 'standard',
          width: '10%',
        },
        {
          title: '委托编号',
          dataIndex: 'consignCode',
          width: '15%',
        },
        {
          title: '委托单位',
          dataIndex: 'consignUnitName',
          width: '20%',
        },
        {
          title: '工程项目',
          dataIndex: 'projectName',
          width: '20%',
        },
      ],
      paramId: '',
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
      queryParams: {},
    }
  },
  methods: {
    showModal(id, query, rowParams) {
      this.paramId = id
      this.visible = true
      this.queryParams = query
      this.queryParams.objectParamDisplayName = rowParams
      this.getData()
    },
    handleCancel() {
      this.visible = false
      this.data = []
      this.paramId = ''
    },
    getData() {
      const { page, size, paramId } = this
      this.loading = true
      if (this.paramId) {
        window.$oRest
          .get('rest/statistic/param-task-details', {
            params: {
              page,
              size,
              paramId,
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
              window.$oAntdModal.warning(window.$oMsgTips.info('获取数据失败'))
            }
          })
          .catch((err) => {
            console.error(err)
            window.$oAntdModal.warning(window.$oMsgTips.info('获取数据失败'))
          })
      }
      else {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped></style>
