<!-- eslint-disable vue/require-v-for-key -->
<template>
  <div class="workbench-wrap">
    <div class="workbench-card">
      <div class="card-content">
        <h3>{{ userInfo.realName || userInfo.username || '--' }}，您好！</h3>
      </div>
    </div>
    <div class="workbench-card">
      <h3 class="card-title">
        待办事项
      </h3>
      <div class="card-content">
        <ul class="backlog-list">
          <li
            v-for="d in backLogDatas"
            class="backlog-item"
            @click="goEqAllotApply(d.tabIndex)"
          >
            <h4 class="title">
              {{ d.title }}
            </h4>
            <h2 class="count">
              {{ d.count }}
            </h2>
          </li>
        </ul>
      </div>
    </div>

    <div class="workbench-card">
      <h3 class="card-title">
        部门设备位置分布及管理类别
      </h3>
      <div class="card-content">
        <div style="height: 30px">
          <a-cascader
            v-model:value="selectedDepartIds"
            :options="departOption"
            :field-names="{ label: 'text', value: 'id', children: 'children' }"
            placeholder="选择所属部门"
            style="width: 240px; float: right"
            change-on-select
            :display-render="displayRender"
            :show-search="{ filter: filterOrg }"
            @change="changeDepart"
          />
        </div>
        <ul class="echart-list">
          <li id="eqDistribution" class="echart-box"></li>
          <li id="eqManageType" class="echart-box"></li>
        </ul>
      </div>
    </div>

    <div class="workbench-card">
      <h3 class="card-title">
        设备概况
      </h3>
      <div class="card-content">
        <ul class="echart-list">
          <li id="eqGeneralSituation" class="echart-box"></li>
          <li class="echart-box">
            <div class="echart-table">
              <ul class="tr">
                <li class="th">
                  所属部门
                </li>
                <li class="th">
                  设备数量
                </li>
                <li class="th">
                  占比
                </li>
                <li class="th">
                  管理员
                </li>
              </ul>
              <div class="tbody">
                <ul v-for="d in overviewDatas" class="tr">
                  <li class="td">
                    {{ d.departname }}
                  </li>
                  <li
                    class="td blue"
                    @click="goEquipmentList({ eqDepartId: d.departId })"
                  >
                    {{ d.count }}
                  </li>
                  <li class="td">
                    {{ scale(d.count, d.total) }}%
                  </li>
                  <li class="td" :title="d.keeperName">
                    {{ d.keeperName }}
                  </li>
                </ul>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <div class="workbench-card">
      <h3 class="card-title">
        设备状态
      </h3>
      <div class="card-content">
        <ul class="echart-list">
          <li id="eqStatus" class="echart-box"></li>
          <li id="" class="echart-box">
            <div class="echart-table echart-table-flex">
              <ul class="tr">
                <li class="th">
                  设备状态
                </li>
                <li class="th">
                  数量
                </li>
                <li class="th">
                  占比
                </li>
              </ul>
              <div class="tbody">
                <ul v-for="d in eqStatusDatas" class="tr">
                  <li class="td">
                    {{ d.status }}
                  </li>
                  <li
                    class="td blue"
                    @click="goEquipmentList({ eqStatus: d.status })"
                  >
                    {{ d.count }}
                  </li>
                  <li class="td">
                    {{ scale(d.count, d.total) }}%
                  </li>
                </ul>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- <div class="workbench-card">
        <h3 class="card-title">设备购置统计</h3>
        <div class="card-content">
          <div class="echart-box" style="450px" id="eqPurchaseStatistics"></div>
        </div>
      </div> -->
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  components: {},
  data() {
    return {
      userInfo: {},
      backLogDatas: [
        {
          title: '申请待审批',
          key: 'handle',
          tabIndex: '2',
          count: 0,
        },
        {
          title: '已审批待邮寄',
          key: 'sender',
          tabIndex: '3',
          count: 0,
        },
        {
          title: '已邮寄待确认',
          key: 'confirm',
          tabIndex: '4',
          count: 0,
        },
      ],
      overviewDatas: [],
      eqStatusDatas: [],
      selectedDepartIds: [],
      departId: '',
      departOption: [],
    }
  },
  mounted() {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    this.userInfo = userInfo
    this.getData()
  },
  methods: {
    scale(count, total) {
      return ((count / total) * 100).toFixed(2)
    },
    // 修改所属部门
    displayRender({ labels, selectedOptions }) {
      const n = labels.length - 1
      if (n === -1) {
        this.departId = ''
        return ''
      }
      else {
        const name = labels[n]
        const obj = selectedOptions[n]
        this.departId = obj.id
        return name
      }
    },
    changeDepart(e) {
      if (e.length === 0)
        return
      window.$oNextTick(() => {
        this.getEqStorage()
        this.getEqMgrType()
      })
    },
    // 搜索部门
    filterOrg(inputValue, path) {
      return path.some(
        option =>
          option.text.toLowerCase().includes(inputValue.toLowerCase()),
      )
    },
    getData() {
      this.getBacklog()
      this.getAllDepart()
      this.getEqOverview()
      this.getEqStatus()
      // this.getEqPurchase()
    },
    // 待办事项
    async getBacklog() {
      try {
        const res = await window.$oAjax.post(window.$oApi.eqWrokbench.backlog)
        if (res.code === 20000) {
          for (let i = 0; i < this.backLogDatas.length; i++) {
            const item = this.backLogDatas[i]
            const count = res.data[item.key]
            if (count !== undefined) {
              item.count = count || 0
            }
          }
        }
        else {
          window.$oAntdMessage.error(res.message || '获取待办事项数据失败')
        }
      }
      catch (err) {
        window.$oAntdMessage.error(err.message || '获取待办事项数据失败')
      }
    },
    async getAllDepart() {
      try {
        let depart = await window.$oAjax.get(window.$oApi.common.getDepartmentTree)
        if (!depart || depart.length === 0)
          return
        depart = depart.filter(d => d.id)
        // eslint-disable-next-line ts/no-unused-expressions
        ~(function fn(datas) {
          for (let i = 0; i < datas.length; i++) {
            const item = datas[i]
            if (item.children && item.children.length > 0) {
              fn(item.children)
            }
            else {
              delete item.children
            }
          }
        })(depart)
        this.departOption = depart
        const _id = this.departOption[0].id || ''
        this.departId = _id
        this.selectedDepartIds = [_id]
        await this.getEqStorage()
        await this.getEqMgrType()
      }
      // eslint-disable-next-line unused-imports/no-unused-vars
      catch (err) {}
    },
    // 部门设备分布
    async getEqStorage() {
      try {
        const res = await window.$oAjax({
          url: `${window.$oApi.eqWrokbench.storage}?departId=${this.departId}`,
          method: 'post',
        })
        if (res.code === 20000) {
          this.initEqDistribution(res.data)
        }
        else {
          window.$oAntdMessage.error(res.message || '获取部门设备分布数据失败')
        }
      }
      catch (err) {
        window.$oAntdMessage.error(err.message || '获取部门设备分布数据失败')
      }
    },
    // 部门管理类别
    async getEqMgrType() {
      try {
        const res = await window.$oAjax({
          url: `${window.$oApi.eqWrokbench.mgrType}?departId=${this.departId}`,
          method: 'post',
        })
        if (res.code === 20000) {
          this.initEqManageType(res.data)
        }
        else {
          window.$oAntdMessage.error(res.message || '获取部门管理类别数据失败')
        }
      }
      catch (err) {
        window.$oAntdMessage.error(err.message || '获取部门管理类别数据失败')
      }
    },
    // 设备概况
    async getEqOverview() {
      try {
        const res = await window.$oAjax({
          url: window.$oApi.eqWrokbench.overview,
          method: 'post',
        })
        if (res.code === 20000) {
          this.overviewDatas = res.data
          this.initEqGeneralSituation(res.data)
        }
        else {
          window.$oAntdMessage.error(res.message || '获取设备概况数据失败')
        }
      }
      catch (err) {
        window.$oAntdMessage.error(err.message || '获取设备概况数据失败')
      }
    },
    // 设备状态
    async getEqStatus() {
      try {
        const res = await window.$oAjax({
          url: window.$oApi.eqWrokbench.status,
          method: 'post',
        })
        if (res.code === 20000) {
          this.eqStatusDatas = res.data
          this.initEqStatus(res.data)
        }
        else {
          window.$oAntdMessage.error(res.message || '获取设备状态数据失败')
        }
      }
      catch (err) {
        window.$oAntdMessage.error(err.message || '获取设备状态数据失败')
      }
    },
    // 设备购置统计
    async getEqPurchase() {
      try {
        const res = await window.$oAjax({
          url: window.$oApi.eqWrokbench.purchase,
          method: 'post',
        })
        if (res.code === 20000) {
          this.initEqPurchaseStatistics(res.data)
        }
        else {
          window.$oAntdMessage.error(res.message || '获取设备购置统计数据失败')
        }
      }
      catch (err) {
        window.$oAntdMessage.error(err.message || '获取设备购置统计数据失败')
      }
    },
    // 部门设备分布
    initEqDistribution(resData) {
      const dom = document.getElementById('eqDistribution')
      const myChart = echarts.init(dom)
      myChart.setOption({
        legend: {
          top: 'bottom',
        },
        color: [
          '#3DB3FB',
          '#AA89FE',
          '#25C8A7',
          '#F5BA2F',
          '#89fefd',
          '#89b9fe',
          '#d5728a',
          '#F0A293',
          '#80e982',
          '#65efe1',
          '#c7e980',
          '#e18961',
        ],
        tooltip: {},
        grid: {
          top: 30,
          right: 20,
          bottom: 40,
          left: 50,
        },
        series: [
          {
            name: '部门设备分布',
            type: 'pie',
            radius: [45, 120],
            center: ['50%', '40%'],
            roseType: 'area',
            itemStyle: {
              borderRadius: 8,
            },
            label: {
              normal: {
                formatter: '{d}%',
              },
            },
            data: resData.map(d => ({
              value: d.count,
              name: d.storageSite,
            })),
          },
        ],
      })
      myChart.on('click', (params) => {
        if (params.data.name === '其它')
          return
        this.goEquipmentList({
          eqDepartId: this.departId,
          location: params.data.name,
        })
      })
    },
    // 部门设备管理类别
    initEqManageType(resData) {
      const dom = document.getElementById('eqManageType')
      const myChart = echarts.init(dom)
      myChart.setOption({
        legend: {
          top: 'bottom',
        },
        tooltip: {},
        color: ['#78b4ef'],
        grid: {
          top: 30,
          left: '5%',
          containLabel: true,
        },
        xAxis: {
          type: 'value',
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
        },
        yAxis: {
          type: 'category',
          data: resData.map(d => d.manageType),
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
        },
        series: [
          {
            name: '部门设备类别',
            data: resData.map(d => d.count),
            type: 'bar',
            showBackground: true,
            barWidth: 20,
            label: {
              normal: {
                show: true,
                position: 'right',
              },
            },
            backgroundStyle: {
              color: 'rgba(180, 180, 180, 0.2)',
            },
          },
        ],
      })
      myChart.on('click', (params) => {
        if (params.data.name === '其它')
          return
        this.goEquipmentList({
          eqDepartId: this.departId,
          manageType: params.name,
        })
      })
    },
    // 设备概况
    initEqGeneralSituation(resData) {
      const dom = document.getElementById('eqGeneralSituation')
      const myChart = echarts.init(dom)
      myChart.setOption({
        legend: {
          top: 'bottom',
        },
        tooltip: {},
        color: [
          '#e18961',
          '#c7e980',
          '#AA89FE',
          '#d5728a',
          '#25C8A7',
          '#65efe1',
          '#89fefd',
          '#89b9fe',
          '#F5BA2F',
          '#F0A293',
          '#80e982',
          '#3DB3FB',
        ],
        grid: {
          top: 30,
          right: 20,
          bottom: 40,
          left: 50,
        },
        series: [
          {
            name: '设备概况',
            type: 'pie',
            radius: [50, 100],
            center: ['50%', '40%'],
            label: {
              normal: {
                formatter: '{d}%',
              },
            },
            itemStyle: {
              borderRadius: 8,
            },
            data: resData.map(d => ({
              ...d,
              value: d.count,
              name: d.departname,
            })),
          },
        ],
      })
      myChart.on('click', (params) => {
        if (params.data.name === '其它')
          return
        this.goEquipmentList({ eqDepartId: params.data.departId })
      })
    },
    // 设备状态
    initEqStatus(resData) {
      const dom = document.getElementById('eqStatus')
      const myChart = echarts.init(dom)
      const datas = resData.map(d => ({
        value: d.count,
        name: d.status,
      }))
      const totalVal = datas.reduce((p, n) => p + Number.parseInt(n.value), 0)
      myChart.setOption({
        legend: {
          top: 'bottom',
        },
        tooltip: {},
        color: [
          '#3DB3FB',
          '#AA89FE',
          '#25C8A7',
          '#F5BA2F',
          '#89fefd',
          '#89b9fe',
          '#d5728a',
          '#F0A293',
          '#80e982',
          '#65efe1',
          '#c7e980',
          '#e18961',
        ],
        grid: {
          top: 30,
          right: 20,
          bottom: 40,
          left: 50,
        },
        series: [
          {
            name: '设备状态',
            type: 'pie',
            radius: ['40%', '80%'],
            center: ['50%', '60%'],
            startAngle: 180,
            label: {
              normal: {
                formatter(data) {
                  return `${((data.value / totalVal) * 100).toFixed(2)}%`
                },
              },
            },
            data: [
              ...datas,
              {
                value: totalVal,
                itemStyle: {
                  color: 'none',
                  decal: {
                    symbol: 'none',
                  },
                },
                label: {
                  show: false,
                },
              },
            ],
          },
        ],
      })
      myChart.on('click', (params) => {
        if (params.data.name === '其它')
          return
        this.goEquipmentList({ eqStatus: params.data.name })
      })
    },
    // 设备购置统计
    initEqPurchaseStatistics(resData) {
      if (!resData)
        resData = []
      const dom = document.getElementById('eqPurchaseStatistics')
      const myChart = echarts.init(dom)
      const xDatas = [...new Set(resData.map(d => d.year))]
      const yDatas = {}
      const series = []
      xDatas.push(xDatas.shift())
      // 按部门拆解数据
      for (let j = 0; j < resData.length; j++) {
        const item = resData[j]
        if (!yDatas[item.departname])
          yDatas[item.departname] = []
        yDatas[item.departname].push(item)
      }
      // 补全部门年份数据，缺少的年份数据设为0
      for (const k in yDatas) {
        const departData = yDatas[k]
        const years = [...xDatas]
        for (let i = 0; i < years.length; i++) {
          const year = years[i]
          if (departData.find(d => d.year === year)) {
            years.splice(i, 1)
            i--
          }
        }
        if (years.length === 0)
          continue
        for (let i = 0; i < years.length; i++) {
          departData.push({
            year: years[i],
            departname: k,
            departId: departData[0].departId,
            count: 0,
          })
        }
        yDatas[k] = departData.sort((p, n) => p.year - n.year)
        yDatas[k].push(yDatas[k].shift())
      }
      for (const k in yDatas) {
        const item = yDatas[k]
        series.push({
          name: k,
          data: item.map(d => d.count),
          type: 'line',
          smooth: true,
          showSymbol: false,
        })
      }
      myChart.setOption({
        tooltip: {
          trigger: 'axis',
        },
        legend: {
          top: 'bottom',
        },
        color: [
          '#3DB3FB',
          '#AA89FE',
          '#25C8A7',
          '#F5BA2F',
          '#89fefd',
          '#89b9fe',
          '#d5728a',
          '#F0A293',
          '#80e982',
          '#89fdfe',
          '#65efe1',
          '#89fef7',
          '#c7e980',
          '#e18961',
        ],
        grid: {
          top: 20,
          right: 20,
          bottom: 60,
          left: 10,
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: xDatas,
          boundaryGap: false,
          axisTick: {
            show: false,
          },
          axisLine: {
            lineStyle: {},
          },
          axisLabel: {
            rotate: 25,
          },
        },
        yAxis: {
          type: 'value',
          axisTick: {
            show: false,
          },
          splitLine: {
            lineStyle: {
              type: 'dashed',
            },
          },
          axisLine: {
            show: false,
          },
        },
        series,
      })

      myChart.on('click', (params) => {
        if (params.data.name === '其它')
          return

        // eslint-disable-next-line ts/no-unused-expressions
        yDatas[params.seriesName][params.dataIndex]
        // this.goEquipmentList({ eqStatus: params.data.name })
      })
    },
    // 待办事项跳转设备申请页
    goEqAllotApply(tabIndex) {
      top.addTabs
      && top.addTabs({
        title: '调拨申请',
        url: `view.do?page=equipAllotApply&tabIndex=${tabIndex}`,
      })
    },
    // 跳转综合设备管理页
    goEquipmentList(paramObj) {
      if (!paramObj)
        return
      let paramStr = ``
      for (const k in paramObj) {
        paramStr += `&${k}=${paramObj[k]}`
      }

      top.addTabs
      && top.addTabs({
        title: '综合管理',
        url: `equipmentNewController.do?goEquipmentList${paramStr}`,
      })
    },
  },
}
</script>

<style lang="less" scoped>
.blue {
  color: #42bdf4;
  cursor: pointer;
}
.workbench-wrap {
  height: 100%;
  overflow-y: auto;
  .backlog-list {
    .backlog-item {
      padding: 15px 30px;
      display: inline-block;
      width: 18%;
      min-width: 220px;
      max-width: 270px;
      background-color: #f199a3;
      border-radius: 4px;
      cursor: pointer;
      &:hover {
        opacity: 0.9;
      }
      &:not(:last-child) {
        margin-right: 9%;
      }
      &:nth-child(2) {
        background-color: #89c3f8;
      }
      &:nth-child(3) {
        background-color: #bc8dee;
      }
      .title {
        color: #fff;
        font-size: 16px;
      }
      .count {
        margin-left: 16%;
        line-height: 60px;
        color: #fff;
        font-size: 36px;
      }
    }
  }
  .echart-list {
    display: flex;
  }
  .echart-box {
    height: 400px;
    flex: 1;
    &:last-child {
      margin-left: 30px;
    }
  }
  .echart-table {
    width: 100%;
    height: 100%;
    .tbody {
      height: 350px;
      overflow-y: auto;
    }
    .tr {
      display: flex;
      width: 100%;
      height: 50px;
      line-height: 50px;
      .th {
        background-color: var(--colorBgContainer);
      }
      .th,
      .td {
        height: 100%;
        width: 35%;
        text-align: center;
        white-space: normal;
        overflow: hidden;
        text-overflow: ellipsis;
        &:nth-child(2),
        &:nth-child(3) {
          width: 15%;
        }
      }
    }
    &.echart-table-flex {
      .tr {
        .th,
        .td {
          flex: 1;
        }
      }
    }
  }
}
.workbench-card {
  margin-bottom: 15px;
  background-color: var(--colorBgContainer);
  border-radius: 4px;
  box-shadow: 0 0 3px rgba(1, 1, 1, 0.1);
  .card-title {
    padding: 15px;
    border-bottom: 1px solid var(--colorSplit);
    font-size: 16px;
    &::before {
      content: '';
      position: relative;
      top: -1px;
      display: inline-block;
      margin-right: 8px;
      width: 5px;
      height: 16px;
      vertical-align: middle;
      background-color: #42ace9;
    }
  }
  .card-content {
    padding: 20px;
  }
}
</style>
