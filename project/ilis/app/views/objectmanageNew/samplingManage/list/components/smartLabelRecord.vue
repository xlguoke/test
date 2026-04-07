<!-- eslint-disable vue/no-unused-refs -->
<template>
  <div>
    <ht-modal
      width="860px"
      centered
      title="智能标签编号变更"
      :open="recordVisible"
      :mask-closable="false"
      @cancel="cancelRecord"
    >
      <a-table
        ref="table"
        :columns="columns"
        :data-source="data"
        bordered
        :pagination="false"
        :scroll="{ y: 360 }"
        row-key="id"
        :loading="loading"
      />
      <template #footer>
        <a-button type="primary" @click="cancelRecord">
          关闭
        </a-button>
        <div style="clear: both"></div>
      </template>
    </ht-modal>
  </div>
</template>

<script>
import { formatTime } from '~/providers/common/utils'

const columns = [
  {
    title: '状态',
    dataIndex: 'deprecatedStr',
    width: '13%',
  },
  {
    title: '标签编号',
    dataIndex: 'storeId',
    width: '13%',
  },
  {
    title: '二维码',
    dataIndex: 'barcodeId',
    width: '13%',
  },
  {
    title: 'RFID',
    dataIndex: 'rfid',
    width: '13%',
  },
  {
    title: '操作人',
    dataIndex: 'createName',
    width: '14%',
  },
  {
    title: '操作时间',
    dataIndex: 'createDateStr',
    width: '20%',
  },
  {
    title: '备注',
    dataIndex: 'remark',
    width: '14%',
  },
]

export default {
  data() {
    return {
      recordVisible: false,
      data: [],
      columns,
      loading: false,
    }
  },
  methods: {
    getData(id) {
      if (!id) {
        return
      }

      this.loading = true
      window.$oAjax
        .get(window.$oApi.samplingManage.labelRecordList, {
          params: {
            param: id,
          },
        })
        .then((res) => {
          this.loading = false
          if (res.code === 20000) {
            this.data = res.data.map(item => ({
              ...item,
              deprecatedStr: item.deprecated ? '作废' : '新增',
              createDateStr: item.createDate
                ? formatTime(item.createDate, 'YYYY-MM-DD HH:mm:ss')
                : '',
            }))
          }
        })
        .catch(() => {
          this.loading = false
        })
    },
    checkLabelRecord(id) {
      this.getData(id)
      this.recordVisible = true
    },
    cancelRecord() {
      this.recordVisible = false
    },
  },
}
</script>
