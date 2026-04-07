<template>
  <a-spin :spinning="loading">
    <DataQueryForm query-tab="2" @query="queryData" />
    <div id="dataTrend" class="data-trend"></div>
  </a-spin>
</template>

<script>
import * as echarts from 'echarts'
import DataQueryForm from './DataQueryForm.vue'

export default {
  components: {
    DataQueryForm,
  },
  data() {
    return {
      loading: false,
    }
  },
  methods: {
    queryData(params) {
      this.loading = true
      window.$oAjax
        .get('/rest/sms/history/statistics', {
          params,
        })
        .then((res) => {
          this.loading = false
          if (res.code !== 20000) {
            window.$oErrorAlert(res.message)
            return
          }
          window.$oNextTick(() => {
            this.renderEchard(res.data)
          })
        })
        .catch((err) => {
          this.loading = false
          window.$oErrorAlert(err.message)
        })
    },
    renderEchard(datas = []) {
      const chartDom = document.getElementById('dataTrend')
      const myChart = echarts.init(chartDom)
      myChart.setOption({
        tooltip: {
          trigger: 'axis',
        },
        legend: {
          data: ['发送总数', '发送成功', '发送失败'],
          bottom: 24,
          icon: 'rect',
          itemWidth: 30,
          itemHeight: 4,
        },
        grid: {
          top: 50,
          right: 20,
          bottom: 80,
          left: 50,
        },
        xAxis: {
          type: 'category',
          data: datas.map(d => d.date),
          axisTick: {
            show: false,
          },
          axisLine: {
            lineStyle: {
              color: '#aaa',
            },
          },
          axisLabel: {
            color: '#333',
          },
        },
        yAxis: {
          type: 'value',
          axisTick: {
            show: false,
          },
          splitLine: {
            lineStyle: {
              color: '#ccc',
              type: 'dashed',
            },
          },
          axisLine: {
            show: false,
          },
          axisLabel: {
            color: '#333',
          },
        },
        series: [
          {
            name: '发送总数',
            data: datas.map(d => d.total || 0),
            type: 'line',
            smooth: true,
            color: '#1890ff',
          },
          {
            name: '发送成功',
            data: datas.map(d => d.success || 0),
            type: 'line',
            smooth: true,
            color: '#67F1FA',
            showSymbol: false,
          },
          {
            name: '发送失败',
            data: datas.map(d => d.fail || 0),
            type: 'line',
            smooth: true,
            color: '#f75353',
            showSymbol: false,
          },
        ],
      })
    },
  },
}
</script>

<style lang="less" scoped>
.data-trend {
  height: 500px;
}
</style>
