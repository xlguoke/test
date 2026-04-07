<template>
  <div>
    <a-table
      bordered
      :data-source="data"
      row-key="id"
      :columns="columns"
      :pagination="data.length > 0 ? pagination : false"
      :row-class-name="rowClassName"
    >
    </a-table>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'

const columns = [
  {
    title: '采集时间',
    dataIndex: 'recordTime',
    customRender: ({ text }) =>
      text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '',
  },
  { title: '温度(°C)', dataIndex: 'temperatureValue' },
  { title: '湿度(%RH)', dataIndex: 'humidityValue' },
  { title: '采集设备钥匙', dataIndex: 'deviceKey' },
]
export default {
  name: 'TableDetail',
  props: ['queryParams'],
  emits: ['load-success'],
  data() {
    return {
      dayjs,
      columns,
      data: [],
      page: 1,
      size: 10,
      pagination: {
        current: 1,
        total: 0,
        ...window.pageConfig,
        onChange: (page) => {
          this.page = page
          this.getData()
        },
        onShowSizeChange: (page, size) => {
          this.size = size
          this.page = 1
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
    getData(flag) {
      // eslint-disable-next-line ts/no-unused-expressions
      flag ? (this.page = 1) : ''
      if (this.queryParams.laboratoryId) {
        const params = {
          labId: this.queryParams.laboratoryId,
          ...this.queryParams,
          page: this.page,
          size: this.size,
        }
        delete params.laboratoryId
        window.$oAjax({
          url: window.$oApi.environmentCollection.list,
          params,
        }).then((res) => {
          this.data = []

          if (res.code === 20000) {
            this.data = res.data.rows.sort(
              (a, b) => a.recordTime - b.recordTime,
            )
            this.pagination.pageSize = this.size
            this.pagination.current = this.page
            this.pagination.total = res.data.count
          }
          // this.$emit("load-success");
        })
      }
      $emit(this, 'load-success')
    },
  },
}
</script>

<style lang="less" scoped>
@import './index.less';
</style>
