<!-- eslint-disable vue/eqeqeq -->
<template>
  <div>
    <div class="search-box">
      <a-select v-model:value="searchType">
        <a-select-option value="1">
          单位名称
        </a-select-option>
        <a-select-option value="2">
          欠费周期
        </a-select-option>
      </a-select>
      <a-input
        v-if="searchType == 1"
        v-model:value="consignUnit"
        style="width: 300px"
      />
      <a-range-picker v-else v-model:value="date" :format="dateFormat" :value-format="dateFormat" />
      <a-button type="primary" @click="search">
        查询
      </a-button>
      <a-button class="toolBtn-bar" @click="reset">
        重置
      </a-button>

      <!--      <a-form ref="formRef">
          <a-row :gutter="15" type="flex" align="middle">
            <a-col>
              <a-form-item>
                <label>欠费周期： </label>
                <a-radio-group name="queryType" @change="changequeryType">
                  <a-radio
                    v-for="(item, index) in queryTypeData"
                    :key="index"
                    :value="item.value"
                    >{{ item.name }}</a-radio
                  >
                </a-radio-group>
              </a-form-item>
            </a-col>
            <a-col>
              <a-form-item>
                <a-button type="primary" @click="search">查询 </a-button>
                <a-button class="toolBtn-bar" @click="reset"> 重置</a-button>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form> -->
    </div>
    <!-- <div id="chart" style="width:100%;height:400px;border:solid 1px #e2e2e2;margin-bottom:15px;"></div> -->
    <a-table
      :columns="columns"
      :data-source="data"
      bordered
      :pagination="pagination"
      :loading="loading"
      :row-class-name="rowClassName"
      row-key="unitId"
    >
      <template #bodyCell="{ column, record, text }">
        <template v-if="column.dataIndex === 'unit'">
          <span>
            <a class="text-blue-500" @click="() => goDetail(record.unit)">
              <u>{{ text }}</u>
            </a>
          </span>
        </template>
        <template v-if="column.dataIndex === 'billsProcess'">
          <div style="padding: 0 10px">
            <a-progress
              :percent="(record.bills / maxPercent) * 100"
              :format="(percent) => `${record.bills}`"
              :show-info="false"
            />
          </div>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script>
/* eslint-disable eqeqeq */
import dayjs from 'dayjs'

const columns = [
  {
    title: '排序',
    dataIndex: 'index',
    width: 60,
  },
  {
    title: '单位',
    dataIndex: 'unit',
    width: '35%',
  },
  {
    title: '欠费金额(元)',
    dataIndex: 'bills',
    key: 'price',
    width: 150,
  },
  {
    title: '欠费情况',
    dataIndex: 'billsProcess',
  },
]

export default {
  data() {
    return {
      searchType: '1',
      date: [],
      consignUnit: '',
      dateFormat: 'YYYY-MM-DD',

      columns,
      pagination: {
        current: 1,
        total: 0,
        ...window.pageConfig,
        onChange: (page) => {
          this.page = page
          this.getData()
          // if (this.queryType === "无") {
          //   this.getData({
          //     page: this.page,
          //     size: this.size
          //   })
          // } else {
          //   this.getData({
          //     queryType: this.queryType,
          //     page: this.page,
          //     size: this.size
          //   })
          // }
        },
        onShowSizeChange: (page, size) => {
          this.page = page
          this.size = size
          this.getData()
          // if (this.queryType === "无") {
          //   this.getData({
          //     page: this.page,
          //     size: this.size
          //   })
          // } else {
          //   this.getData({
          //     // queryType: this.queryType,
          //     page: this.page,
          //     size: this.size
          //   })
          // }
        },
      },
      page: 1,
      size: 10,
      data: [],
      loading: false,
      maxPercent: 1,
      queryParams: null,
      queryTypeData: [
        { name: '本月', value: 112 },
        { name: '一年前至本月', value: 113 },
        { name: '超过一年', value: 114 },
        { name: '全部', value: '无' },
      ],
      queryType: '', // 查询类型
    }
  },
  created() {
    // this.getBigCategoryData();
    this.search()
  },
  mounted() {},
  methods: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    goDetail(name) {
      const d = this.date
      const paymentCompany = name
      const payCreateStart = d.length ? dayjs(d[0]).format(this.dateFormat) : ''
      const payCreateEnd = d.length ? dayjs(d[1]).format(this.dateFormat) : ''
      /* let newDate = new Date();
      if (112 === this.queryParams.queryType) {
        // 本月
        let firstDate = newDate;
        firstDate.setDate(1);
        let endDate = new Date(firstDate);
        endDate.setMonth(firstDate.getMonth() + 1);
        endDate.setDate(0);
        minCreateDate = dayjs(firstDate).format("YYYY-MM-DD");
        maxCreateDate = dayjs(endDate).format("YYYY-MM-DD");
      } else if (113 === this.queryParams.queryType) {
        // 一年前至今天
        var firstYear = dayjs(newDate).add(-1, "years").format("YYYY-MM-DD");
        var lastYear = dayjs(newDate).add(0, "years").format("YYYY-MM-DD");
        minCreateDate = firstYear;
        maxCreateDate = lastYear;
      } else if (114 === this.queryParams.queryType) {
        // 超过一年
        var firstYear = dayjs(newDate).add(-1, "years").format("YYYY-MM-DD");
        minCreateDate = firstYear;
      } */
      const url = `feeModelController.do?list&status='2,3'&paymentCompany=${encodeURI(
        encodeURI(paymentCompany),
      )}
      &payCreateStart=${payCreateStart}&payCreateEnd=${payCreateEnd}`

      if (top.addTabs) {
        top.addTabs({
          id: '1',
          title: '费用',
          close: false,
          url,
        })
      }
    },
    getData() {
      const params = {}
      params.page = this.page
      params.size = this.size
      if (this.searchType == 1) {
        params.consignUnit = this.consignUnit
      }
      else {
        const d = this.date
        params.dateBegin = d.length ? dayjs(d[0]).format(this.dateFormat) : ''
        params.dateEnd = d.length ? dayjs(d[1]).format(this.dateFormat) : ''
      }
      this.loading = true
      this.queryParams = params
      window.$oAjax
        .get(window.$oApi.arrearsStatistic.getData, { params })
        .then((res) => {
          if (res.code && res.code === 20000 && res.data.rows.length > 0) {
            const dataSort = res.data.rows.sort(this.compare('bills'))
            // eslint-disable-next-line array-callback-return
            dataSort.map((item, index) => {
              item.index = index + 1
            })
            this.maxPercent = dataSort[0].bills
            this.data = dataSort
            this.loading = false
            this.pagination.total = res.data.count
            this.pagination.current = this.page
            this.pagination.pageSize = this.size
          }
          else {
            this.data = []
            this.pagination.total = 0
            this.loading = false
          }
        })
    },
    compare(key) {
      return function (obj1, obj2) {
        if (Number(obj1[key]) > Number(obj2[key])) {
          return -1
        }
        else if (obj1[key] === obj2[key]) {
          return 0
        }
        else {
          return 1
        }
      }
    },
    changequeryType(e) {
      this.page = 1
      this.queryType = e.target.value
    },
    search() {
      this.page = 1
      this.getData()
      // if (this.searchType == 1) {
      //   this.getData({
      //     consignUnit: this.consignUnit
      //   })
      // } else {
      //   const d = this.date
      //   const dateBegin = d.length ? d[0].format(this.dateFormat) : ""
      //   const dateEnd = d.length ? d[1].format(this.dateFormat) : ""
      //   this.getData({
      //     dateBegin,
      //     dateEnd
      //   })
      // }
    },
    reset() {
      this.consignUnit = ''
      this.date = []
      this.page = 1
      this.getData()
    },
    // search() {
    //   // let data = this.form.getFieldsValue();
    //   if (!this.queryType) {
    //     window.$oAntdModal.warning(window.$oMsgTips.info("请选择欠费周期"));
    //     return;
    //   } else {
    //     if (this.queryType === "无") {
    //       this.getData({});
    //     } else {
    //       this.getData({
    //         queryType: this.queryType,
    //       });
    //     }
    //   }
    // },
    // reset() {
    //   this.form.resetFields();
    //   this.queryType = 112;
    //   this.getData({
    //     queryType: 112,
    //   });
    // },
    // buildEcharts(){
    //   chartEle.setOption(chartOption)
    // }
  },
}
</script>

<style lang="less" scoped>
@import './index.less';
:deep(.ant-progress-show-info .ant-progress-outer) {
  margin-right: 0;
  padding-right: 0;
}
:deep(.ant-progress-text) {
  margin-left: 0;
}
:deep(.ant-progress-inner) {
  background: #e2e2e2;
}
#chart canvas {
  cursor: pointer;
}
.search-box {
  margin-bottom: 8px;
  .ant-calendar-picker,
  .ant-input {
    margin: 0 10px;
  }
}
</style>
