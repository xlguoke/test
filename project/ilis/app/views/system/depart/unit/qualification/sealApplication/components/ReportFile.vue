<template>
  <ht-modal
    v-model:open="visible"
    title="附件"
    :mask-closable="false"
    :width="640"
  >
    <a-table
      :columns="columns"
      :data-source="data"
      :loading="loading"
      row-key="id"
      bordered
      :pagination="false"
      :scroll="{ y: 350 }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'Action'">
          <div class="table-handle">
            <a href="javascript:;" @click="onCheck(record)">查看</a>
            <a
              href="javascript:;"
              style="color: var(--colorError); margin-left: 4px"
              @click="onDel(record)"
            >删除</a>
          </div>
        </template>
      </template>
    </a-table>

    <template #footer>
      <a-button style="float: none" @click="cancel">
        关闭
      </a-button>
    </template>
  </ht-modal>
</template>

<script>
import { TReportOtherFileControllerService } from '~/providers/providers/services/tReportOtherFileController'

const tReportOtherFileControllerService
  = new TReportOtherFileControllerService()

export default {
  data() {
    return {
      data: [],
      columns: [
        {
          title: '文件',
          dataIndex: 'name',
        },
        {
          title: '操作',
          dataIndex: 'Action',
          width: '100px',
          scopedSlots: { customRender: 'Action' },
        },
      ],
      loading: false,
      visible: false,
      reportId: null,
    }
  },
  methods: {
    async getData(reportId) {
      this.loading = true
      const res = await tReportOtherFileControllerService
        .list(reportId)
        .finally(() => {
          this.loading = false
        })
      this.data = res.rows
    },
    async open(reportId) {
      this.reportId = reportId
      this.getData(reportId)
      this.visible = true
    },
    onCheck(row) {
      window.open(row.url)
    },
    async onDel(row) {
      this.loading = true
      // eslint-disable-next-line unused-imports/no-unused-vars
      const res = await tReportOtherFileControllerService
        .del(row.id)
        .finally(() => {
          this.loading = false
        })
      this.getData(this.reportId)
      window.$oAntdMessage.success('删除成功！')
    },
    cancel() {
      this.visible = false
      window.$oNextTick(() => {
        this.data = []
        this.reportId = null
      })
    },
  },
}
</script>
