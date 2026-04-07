<template>
  <div>
    <a-table
      bordered
      :data-source="data"
      row-key="id"
      :columns="columns"
      :pagination="false"
      :row-class-name="rowClassName"
    >
    </a-table>
  </div>
</template>

<script>
// ;
// import dayjs from 'dayjs';
import { ajaxRequest, formatTime } from '~/providers/common/utils.js'

function formatTimeHtml({ text }) {
  return text ? formatTime(text, 'YYYY-MM-DD HH:mm') : ''
}
const columns = [
  { title: '记录时间', dataIndex: 'recordTime', customRender: formatTimeHtml },
  { title: '试验时温度(°C)', dataIndex: 'temperatureWhenTest' },
  { title: '试验时湿度(%RH)', dataIndex: 'humidityWhenTest' },
  { title: '记录人', dataIndex: 'createName' },
]
export default {
  name: 'TableDetail',
  props: ['queryParams'],
  data() {
    return {
      columns,
      data: [],
    }
  },
  methods: {
    // dayjs,
    formatTime,
    ajaxRequest,
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    getData() {
      if (this.queryParams.laboratoryId) {
        ajaxRequest(
          window.$oApi.environmentStatistics.tableUrl,
          window.$oQs.stringify(this.queryParams),
          this.getDataCall,
        )
      }
    },
    getDataCall(res) {
      this.data = res.rows.sort((a, b) => a.recordTime - b.recordTime)
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
