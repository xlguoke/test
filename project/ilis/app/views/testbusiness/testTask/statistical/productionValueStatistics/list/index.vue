<!-- eslint-disable vue/no-unused-refs -->
<template>
  <div ref="bodyBox">
    <a-spin :spinning="spinning">
      <div class="spin-content">
        <div ref="headerBox">
          <div>
            <a-row type="flex" justify="start">
              <a-col>
                <a-form-item
                  label="委托年月"
                  :label-col="{ span: 5 }"
                  :wrapper-col="{ span: 19 }"
                >
                  <a-range-picker
                    :placeholder="['开始月份', '结束月份']"
                    format="YYYY-MM"
                    value-format="YYYY-MM"
                    :mode="mode"
                    :value="dateBeginEnd.length > 0 ? dateBeginEnd : []"
                    show-time
                    :allow-clear="false"
                    @panel-change="handlePanelChange"
                    @change="handleChange"
                    @ok="onOk"
                  />
                </a-form-item>
              </a-col>
              <a-col>
                <a-button
                  type="primary"
                  style="margin-left: 16px"
                  @click="quickSearch"
                >
                  查询
                </a-button>
                <a-button @click="seniorQueryFun">
                  切换到高级查询
                </a-button>
              </a-col>
            </a-row>
          </div>
          <SeniorShowSpan
            v-if="isShow"
            ref="SeniorShowSpan"
            :callback="closeCondition"
            :show-data="showData"
          />
          <div>
            <a-button @click="exportFun">
              导出Excel
            </a-button>
            <a-checkbox
              style="float: right"
              :checked="commitedFormalReport"
              @change="commitedChk"
            >
              已提交正式报告
            </a-checkbox>
          </div>
          <div style="text-align: right; color: green; margin: 5px">
            注意：本功能仅适用于一个委托一个样品的情况，单委托多个样品时产值数据会被重复计算。
          </div>
        </div>
        <a-table
          :scroll="{ y: scrollY, x: scrollX }"
          :columns="columns"
          :data-source="treeData"
          :pagination="false"
          bordered
          :row-class-name="rowClassName"
          rowkey="id"
        >
          <template #bodyCell="{ column, text }">
            <template v-if="column.dataIndex === 'samplePrice'">
              <span v-if="text">{{ filters.formatMoney(text) }}</span>
            </template>
          </template>
        </a-table>
      </div>
    </a-spin>
    <DetailModal ref="DetailModal" :callback="getData" />

    <SeniorQuery
      ref="SeniorQuery"
      :callback="seniorQueryCall"
      :reset-call="resetCall"
    >
      <template #bigCategoryId>
        <div>
          <a-row :gutter="15">
            <a-col :span="18">
              <a-input
                :value="bigData.map(i => i.name).join('; ')"
                :disabled="true"
                class="readonlyCls"
                placeholder="请选择"
                autocomplete="off"
              />
            </a-col>
            <a-col :span="6" style="text-align: right">
              <a-button style="float: right" @click="setBigCate">
                选择
              </a-button>
            </a-col>
          </a-row>
        </div>
      </template>
      <template #dateBeginEndChild>
        <div>
          <a-range-picker
            :placeholder="['开始月份', '结束月份']"
            format="YYYY-MM"
            value-format="YYYY-MM"
            :mode="modeChild"
            :value="dateBeginEndChild.length > 0 ? dateBeginEndChild : []"
            show-time
            style="width: 100%"
            @panel-change="handlePanelChange2"
            @change="handleChange2"
            @ok="onOk2"
          />
        </div>
      </template>
    </SeniorQuery>
    <SelectBigCate ref="SelectBigCate" :callback="getBigCate" />
    <SeniorShowSpan ref="SeniorShowSpan" :callback="closeCondition" />
  </div>
</template>

<script>
import axios from 'axios'
import dayjs from 'dayjs'
import filters from '~/providers/common/filters'
import SelectBigCate from '~/providers/components/bigCategory.vue'
import SeniorQuery from '~/providers/components/seniorQuery/list.vue'
import SeniorShowSpan from '~/providers/components/seniorQuery/showSpan.vue'
import DetailModal from './components/detailModal.vue'

// 整理数据
function getTree(data) {
  if (!Array.isArray(data)) {
    return
  }
  const arr = []
  for (let i = 0; i < data.length; i++) {
    let children = []
    if (data[i].children && data[i].children.length != 0) {
      children = getTree(data[i].children)
    }
    const obj = {
      ...data[i],
      value: data[i].bigCategoryId,
      title: data[i].bigCategoryName,
      key: data[i].bigCategoryId,
      children,
    }
    if (data[i].sampleCountList && data[i].sampleCountList.length > 0) {
      data[i].sampleCountList.forEach((val) => {
        // obj[val['timeTag']] = val['count'];
        obj[`${val.timeTag}C`] = val.count
        obj[`${val.timeTag}S`] = val.samplePriceSum
        obj[`${val.timeTag}TestObjectIds`] = val.testObjectIds
      })
    }
    if (children.length === 0) {
      delete obj.children
    }

    if (obj.type === 'DEPART') {
      obj.disabled = true
    }
    arr.push(obj)
  }
  return arr
}

const columnsbaseS = [
  {
    title: '名称',
    dataIndex: 'bigCategoryName',
    key: 'bigCategoryName',
    width: 300,
    ellipsis: true,
  },
]
const columnsbase = [
  {
    title: '名称',
    dataIndex: 'bigCategoryName',
    key: 'bigCategoryName',
    width: 300,
    ellipsis: true,
    // fixed: 'left'
  },
]
const columnsEnd = [
  {
    title: '合计',
    children: [
      {
        title: '组数',
        dataIndex: 'count',
        key: 'count',
        width: 60,
      },
      {
        title: '委托金额(元)',
        dataIndex: 'samplePrice',
        key: 'samplePrice',
        scopedSlots: { customRender: 'samplePrice' },
        width: 100,
      },
    ],
  },
]

const queryDataC = [
  {
    type: 'custom',
    field: 'dateBeginEndChild',
    title: '委托年月',
    options: [],
    default: '',
    col: '12',
    expend: {},
  },
  {
    type: 'custom',
    field: 'bigCategoryId',
    title: '检测大类',
    options: [],
    default: '',
    col: '12',
    expend: {},
  },
  {
    type: 'input',
    field: 'consignUnit',
    title: '委托单位',
    options: [],
    default: '',
    col: '12',
    expend: {},
  },
  {
    type: 'input',
    field: 'consignProject',
    title: '工程项目',
    options: [],
    default: '',
    col: '12',
    expend: {},
  },
  {
    type: 'input',
    field: 'sampleSenderName',
    title: '委托人',
    options: [],
    default: '',
    col: '12',
    expend: {},
  },
  {
    type: 'input',
    field: 'sampleSenderTel',
    title: '委托人电话',
    options: [],
    default: '',
    col: '12',
    expend: {},
  },
  {
    type: 'input',
    field: 'consignSn',
    title: '委托编号',
    options: [],
    default: '',
    col: '12',
    expend: {},
  },
  {
    type: 'input',
    field: 'testObjectSn',
    title: '样品编号',
    options: [],
    default: '',
    col: '12',
    expend: {},
  },
  {
    type: 'select',
    field: 'qualificationTypeId',
    title: '资质类型',
    options: [],
    default: '',
    col: '12',
    expend: {},
  },
  {
    type: 'select',
    field: 'checkTypeId',
    title: '检测类别',
    options: [],
    default: '',
    col: '12',
    expend: {},
  },
  {
    type: 'select',
    field: 'isSubPackage',
    title: '是否分包',
    options: [
      { id: 'true', name: '是' },
      { id: 'false', name: '否' },
    ],
    default: '',
    col: '12',
    expend: {},
  },
  // {type: "switch", field: 'commitedFormalReport', title: "已提交正式报告", options: [{id:"true",name:"是"},{id:"false",name:"否"}], default: true, col: "12", expend: {}},
  {
    type: 'select',
    field: 'consignBigType',
    title: '委托数据来源',
    options: [
      { id: '1', name: '创建委托' },
      { id: '2', name: '创建综合任务' },
    ],
    default: '',
    col: '12',
    expend: {},
  },
  {
    type: 'select',
    field: 'feeStatus',
    title: '缴费状态',
    options: [
      { id: '1', name: '已结清' },
      { id: '2', name: '部分缴费' },
      { id: '3', name: '未缴费' },
    ],
    default: '',
    col: '12',
    expend: {},
  },
]
export default {
  components: {
    DetailModal,
    SeniorQuery,
    SeniorShowSpan,
    SelectBigCate,
  },
  data() {
    return {
      dayjs,
      filters,
      treeData: [],
      columns: [],
      newColumns: [],
      scrollY: 500,
      scrollX: true,
      spinning: false,
      mode: ['month', 'month'],
      modeChild: ['month', 'month'],
      initDateBeginEnd: [],
      dateBeginEnd: [],
      dateBeginEndChild: [],
      bigData: [],
      queryParams: {},
      submitParams: {},
      queryData: queryDataC,
      isShow: false,
      showData: [],
      commitedFormalReport: false,
    }
  },
  created() {
    // this.getBigCategoryData();
    this.getTypeData()
  },
  mounted() {
    const year = new Date().getFullYear()
    const month = new Date().getMonth()
    const month2 = (`${month + 1}`).length > 1 ? month + 1 : `0${month + 1}`
    this.dateBeginEnd = [
      dayjs(`${year}-01`).format('YYYY-MM'),
      dayjs(`${year}-${month2}`).format('YYYY-MM'),
    ]
    this.initDateBeginEnd = [...this.dateBeginEnd]
    this.newColumns = this.columnsSet(this.dateBeginEnd).concat(columnsEnd)
    this.getData()
  },
  methods: {
    rowClassName() {
      // let className = "light-row";
      // if (index % 2 === 1) className = "dark-row";
      // return className;
    },
    detailGrid(e, text, record) {
      const titleKey = event.target.dataset.id
      const testObjectIds = record[`${titleKey}TestObjectIds`]
      if (testObjectIds) {
        this.$refs.DetailModal.showModal(testObjectIds)
      }
    },
    customRenderClick(bianlian, isMoney, text, row) {
      // eslint-disable-next-line ts/no-this-alias
      const that = this
      const child = h('span', {
        'data-id': bianlian,
        'class': 'open-detail',
        onClick(e) {
          that.detailGrid(e, text, row)
        },
      }, isMoney ? this.filters.formatMoney(text) : text)
      return child
    },
    yearTitle(arr, startMonth) {
      return arr.map((item, i) => {
        const index = startMonth + i
        const bianlian
          = `${item}-${
            (`${index + 1}`).length > 1 ? index + 1 : `0${index + 1}`}`
        return {
          title: bianlian,
          key: bianlian,
          children: [
            {
              title: '组数',
              dataIndex: `${bianlian}C`,
              key: `${bianlian}C`,
              width: 60,
              customRender: ({ text, record: row, index }) => {
                if (!text) {
                  return ''
                }
                return this.customRenderClick(bianlian, false, text, row, index)
              },
            },
            {
              title: '委托金额(元)',
              dataIndex: `${bianlian}S`,
              key: `${bianlian}S`,
              width: 100,
              customRender: ({ text, record: row, index }) => {
                if (!text) {
                  return ''
                }
                return this.customRenderClick(bianlian, true, text, row, index)
              },
            },
          ],
        }
        // return {
        //   title: bianlian,
        //   dataIndex: bianlian,
        //   key: bianlian,
        //   scopedSlots: {customRender: bianlian}
        // };
      })
    },
    // 根据年月周 设置不同的columns
    columnsSet(dateArr) {
      if (dateArr.length === 0) {
        return
      }
      const startYear = new Date(dateArr[0]).getFullYear()
      const startMonth = new Date(dateArr[0]).getMonth()
      const endYear = new Date(dateArr[1]).getFullYear()
      const endMonth = new Date(dateArr[1]).getMonth()
      let startTitle = []
      let middleTitle = []
      let endTitle = []
      let yearMiddleNum
      let yearMiddle = []
      if (startYear === endYear) {
        // 2019-03  2019-08 (7-2=5 +1 )
        // eslint-disable-next-line unicorn/no-new-array
        const endArr = new Array(endMonth - startMonth + 1).fill(endYear)
        endTitle = this.yearTitle(endArr, startMonth)
      }
      else {
        // 开始年 2017 2 （2017 1） 11 个 2017年 1的个开始
        const startArr = Array.from({ length: 12 - startMonth }).fill(startYear)
        if (endYear > startYear) {
          startTitle = this.yearTitle(startArr, startMonth)
          yearMiddleNum = endYear - startYear - 1
          if (yearMiddleNum > 0) {
            // eslint-disable-next-line unicorn/no-new-array
            yearMiddle = new Array(yearMiddleNum).fill(yearMiddleNum)
          }
        }
        if (yearMiddle.length > 0) {
          // 中间年 2020-2017=3-1 (2 2018,2019)
          //  yearNum = endYear - startYear - 1;
          // eslint-disable-next-line array-callback-return
          yearMiddle.map((item, index) => {
            const middleArr = Array.from({ length: 12 }).fill(startYear + (index + 1))
            middleTitle = middleTitle.concat(this.yearTitle(middleArr, 0))
          })
        }
        // 结束年 2020 5 （2020 4）
        // eslint-disable-next-line unicorn/no-new-array
        const endArr = new Array(endMonth + 1).fill(endYear)
        endTitle = this.yearTitle(endArr, 0)
      }

      return [...startTitle, ...middleTitle, ...endTitle]
    },
    getData(flag) {
      this.spinning = true
      // eslint-disable-next-line ts/no-unused-expressions
      flag ? (this.page = 1) : ''
      const data = {
        commitedFormalReport: this.commitedFormalReport,
        ...this.queryParams,
      }
      if (this.dateBeginEnd.length > 0) {
        data.dateBegin
          = `${dayjs(this.dateBeginEnd[0]).startOf('month').format('YYYY-MM-DD')
          } 00:00:00`
        data.dateEnd
          = `${dayjs(this.dateBeginEnd[1]).endOf('month').format('YYYY-MM-DD')
          } 23:59:59`
      }
      if (this.queryParams.dateBeginEndChild) {
        data.dateBegin
          = `${dayjs(this.dateBeginEndChild[0])
            .startOf('month')
            .format('YYYY-MM-DD')} 00:00:00`
        data.dateEnd
          = `${dayjs(this.dateBeginEndChild[1])
            .endOf('month')
            .format('YYYY-MM-DD')} 23:59:59`
      }
      delete data.dateBeginEndChild
      // eslint-disable-next-line array-callback-return
      Object.keys(data).map((key) => {
        data[key]
        && typeof data[key] == 'string'
        && (data[key] = data[key].trim())
      })

      this.submitParams = data
      window.$oAjax({
        url: window.$oApi.productionValueStatistics.list,
        method: 'POST',
        timeout: 30 * 1000,
        data,
        headers: {
          'Content-Type': 'application/json',
          'paramsIsTrim': true,
        },
      }).then((res) => {
        let arr = []
        if (res.code && res.code === 20000) {
          // this.columns = this.newColumns;
          if (res.data && Array.isArray(res.data) && res.data.length > 0) {
            // eslint-disable-next-line ts/no-unused-expressions
            res.tips ? window.$oAntdMessage.success(res.tips) : ''
            arr = getTree(res.data)
          }
          this.spinning = false
        }
        else {
          this.spinning = false
        }
        window.$oNextTick(() => {
          const height = document.body.clientHeight
          const height2 = this.$refs ? this.$refs.headerBox.clientHeight : ''
          this.scrollY = height - height2 - 35 - 90
        })

        this.scrollX = this.newColumns.length < 6 ? false : 1300
        if (this.newColumns.length < 6) {
          this.scrollX = false
          this.columns = columnsbase.concat(this.newColumns)
        }
        else {
          this.scrollX = 1300
          this.columns = columnsbaseS.concat(this.newColumns)
        }
        this.treeData = [...arr]
      })
    },
    // 快速查询,清空高级查询(显示数据)
    quickSearch() {
      if (!this.dateBeginEnd || this.dateBeginEnd.length === 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择委托年月'))
        return
      }
      this.queryParams = {}
      this.bigData = []
      this.showData = []
      this.dateBeginEndChild = []
      this.isShow = false
      this.newColumns = this.columnsSet(this.dateBeginEnd).concat(columnsEnd)
      this.getData(true)
    },
    // 删除高级查询,删除查询数据
    async closeCondition(field, isShow) {
      if (field) {
        if (field === 'bigCategoryId') {
          this.bigData = []
        }
        if (field === 'dateBeginEndChild') {
          this.dateBeginEndChild = [...this.initDateBeginEnd]
        }
        this.queryParams[field] = ''
      }
      if (isShow) {
        this.isShow = false
        this.showData = []
        this.dateBeginEnd = [...this.initDateBeginEnd]
        this.newColumns = this.columnsSet(this.dateBeginEnd).concat(columnsEnd)
      }
      else {
        this.showData = this.showData.filter(i => i.field !== field)
        this.newColumns = this.columnsSet(this.dateBeginEndChild).concat(
          columnsEnd,
        )
      }
      this.getData(true)
    },
    // 高级查询 inputArr的默认值更改
    inputDefault(field, arrOpt, defaults) {
      const newData = [...this.queryData]
      const target = newData.filter(item => field === item.field)[0]
      if (target) {
        if (arrOpt && arrOpt.length > 0) {
          target.options = [...target.options, ...arrOpt]
        }
        target.default = defaults
        this.queryData = newData
      }
    },
    // 高级查询 重置
    resetCall() {
      this.$refs.SeniorQuery.formState = {}
      this.dateBeginEnd = [...this.initDateBeginEnd]
      this.quickSearch(true)
    },
    // 高级查询回调，更改查询数据(显示数据)
    async seniorQueryCall(params, showData) {
      this.dateBeginEnd = []
      if (params.bigCategoryId) {
        const nameStr = this.bigData.map(item => item.name).join('; ')
        params.bigCategoryId = this.bigData.map(item => item.id).join(',')
        showData.push({
          name: '检测大类',
          value: nameStr,
          field: 'bigCategoryId',
        })
      }
      if (this.dateBeginEndChild.length === 0) {
        this.dateBeginEndChild = [...this.initDateBeginEnd]
      }
      if (this.dateBeginEndChild.length > 0) {
        // 处理显示值及查询数据
        const dateBegin = dayjs(this.dateBeginEndChild[0]).format('YYYY-MM')
        const dateEnd = dayjs(this.dateBeginEndChild[1]).format('YYYY-MM')
        showData.push({
          name: '委托日期',
          value: `${dateBegin} ~ ${dateEnd}`,
          field: 'dateBeginEndChild',
        })
        params.dateBeginEndChild = `${dateBegin}-${dateEnd}`
        this.newColumns = this.columnsSet(this.dateBeginEndChild).concat(
          columnsEnd,
        )
      }
      this.queryParams = { ...params }
      if (showData.length) {
        this.isShow = true
      }
      else {
        this.isShow = false
      }
      this.showData = [...showData].map(item => ({ ...item }))
      this.getData(true)
    },
    // 高级查询，根据查询数据 回显
    seniorQueryFun() {
      const params = { ...this.queryParams }
      this.$refs.SeniorQuery.showModal(this.queryData, params)
    },
    handlePanelChange(value, mode) {
      this.dateBeginEnd = value
      this.mode = [
        mode[0] === 'date' ? 'month' : mode[0],
        mode[1] === 'date' ? 'month' : mode[1],
      ]
    },
    handleChange(value) {
      // 点击删除时设置
      this.dateBeginEnd = value
    },
    onOk() {

    },
    async exportFun() {
      this.spinning = true
      const res = await axios({
        url: `/ilis2/${window.$oApi.productionValueStatistics.exportUrl}`,
        method: 'POST',
        timeout: 30 * 1000,
        responseType: 'blob',
        // data: {"bigCategoryId":"2c98b9136db4683b016db969860a0159,2c98b9136dbed1be016dbef58eb20098,2c98b9136dbed1be016dbef5c6bf00c5,2c98b9136dbed1be016dbef6042500cd"},
        data: { ...this.submitParams },
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
      })
      this.spinning = false

      const url = window.URL.createObjectURL(res.data) // 表示一个指定的file对象或Blob对象
      const a = document.createElement('a')
      document.body.appendChild(a)
      // let fileName=res.headers["content-disposition"].split(";")[1].split("=")[1];  //filename名称截取

      const fileName = '单位产值统计.xlsx'
      a.href = url
      a.download = fileName // 命名下载名称
      a.click() // 点击触发下载
      window.URL.revokeObjectURL(url) // 下载完成进行释放
      // const blob = new Blob([res]);
      // let reader = new FileReader();
      // reader.readAsDataURL(blob);
      // reader.onload = function (e) {
      //   const a = document.createElement('a');
      //   a.download = '单位产值统计.xlsx';
      //   a.href = e.target.result;
      //   a.click()
      // };
    },
    getTypeData() {
      let checkTypeData = []
      let qualificationTypeData = []
      window.$oAjax({ url: window.$oApi.consignList.getConsginTestType }).then(
        (res) => {
          let arr = []
          if (res.length > 0) {
            arr = res.map(item => ({ id: item.id, name: item.name }))
          }
          else {
            // eslint-disable-next-line ts/no-unused-expressions
            res.success === false
              ? window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
              : ''
          }
          checkTypeData = [...arr]
          this.inputDefault('checkTypeId', checkTypeData, '')
        },
      )
      window.$oAjax({ url: window.$oApi.common.qualifications }).then((res) => {
        let arr = []
        if (res.code !== 20010) {
          arr = res.data
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
        qualificationTypeData = [...arr]
        this.inputDefault('qualificationTypeId', qualificationTypeData, '')
      })
    },
    handlePanelChange2(value, mode) {
      this.dateBeginEndChild = value
      this.modeChild = [
        mode[0] === 'date' ? 'month' : mode[0],
        mode[1] === 'date' ? 'month' : mode[1],
      ]
    },
    handleChange2(value) {
      // 点击删除时设置
      this.dateBeginEndChild = value
    },
    onOk2() {

    },
    // 选择检测大类  setBigCate
    setBigCate() {
      const acceptData = this.bigData.length > 0 ? this.bigData : []
      this.$refs.SelectBigCate.showModal('checkbox', acceptData)
    },
    // 选择检测大类 回显
    getBigCate(acceptData) {
      this.bigData = acceptData.map(item => ({
        id: item.id,
        name: item.name,
      }))
      this.$refs.SeniorQuery.formState.bigCategoryId = acceptData[0].name
    },
    // 已提交正式报告
    commitedChk(e) {
      this.commitedFormalReport = e.target.checked
      this.getData()
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
