<template>
  <ht-modal
    v-model:open="visible"
    title="检测产值明细"
    centered
    width="90%"
    :mask-closable="false"
    class="components-selectPersonnel"
    :z-index="100000"
    :destroy-on-close="true"
    @ok="cancel"
    @cancel="cancel"
  >
    <div id="components-layout-demo-basic">
      <a-space class="mt-4">
        <a-input
          v-model:value="queryParam"
          class="w-[420px]"
          placeholder="请输入样品名称/任务编号/记录编号/样品编号进行查询"
        />
        <a-button @click="handleSearch()">
          查询
        </a-button>
        <a-button @click="handleReset">
          重置
        </a-button>
      </a-space>
      <a-table
        id="tableBox"
        class="mt-4"
        :columns="columns"
        :pagination="data.length > 0 ? pagination : false"
        :data-source="data"
        :loading="loading"
        :scroll="{ y: 450 }"
        bordered
      >
      </a-table>
    </div>
  </ht-modal>
</template>

<script>
import dayjs from 'dayjs'

let this0

function mergeCells(value, row, index, title) {
  const obj = {
    rowSpan: 0,
  }
  const merge = this0.merge[title]
  if (merge) {
    for (let i = 0; i < merge.length; i++) {
      if (merge[i].includes(index)) {
        if (merge[i][0] === index) {
          obj.rowSpan = merge[i].length
        }
        else {
          obj.rowSpan = 0
        }
        break
      }
    }
  }
  return obj
}

export default {
  name: 'TestWorkPriceDetail',
  data() {
    return {
      visible: false,
      loading: false,
      queryParam: null,
      departmentId: null,
      relationId: null,
      durationType: null,
      queryType: null,
      page: 1,
      rows: 10,
      merge: {
        sampleName: [],
        person: [],
        taskCode: [],
        recordCode: [],
        sampleCode: [],
        standard: [],
        testDate: [],
      },
      pagination: {
        current: 1,
        total: 0,
        ...window.pageConfig,
        onChange: (page) => {
          this.page = page
          this.getData(this.urlSplit(this.queryParam))
        },
        onShowSizeChange: (page, rows) => {
          this.rows = rows
          this.page = 1
          this.getData(this.urlSplit(this.queryParam))
        },
      },
      range: [],
      data: [],
      total: 0,
      columns: [
        {
          title: '检测人员',
          dataIndex: 'person',
          width: '9%',
          customCell: (record, index) => mergeCells(record.person, record, index, 'person'),
        },
        {
          title: '任务编号',
          dataIndex: 'taskCode',
          width: '11%',
          customCell: (record, index) => mergeCells(record.taskCode, record, index, 'taskCode'),
        },
        {
          title: '记录编号',
          dataIndex: 'recordCode',
          width: '11%',
          customCell: (record, index) => mergeCells(record.recordCode, record, index, 'recordCode'),
        },
        {
          title: '样品编号',
          dataIndex: 'sampleCode',
          width: '11%',
          customCell: (record, index) => mergeCells(record.sampleCode, record, index, 'sampleCode'),
        },
        {
          title: '样品名称',
          dataIndex: 'sampleName',
          width: '9%',
          customCell: (record, index) => mergeCells(record.sampleName, record, index, 'sampleName'),
        },
        {
          title: '规格型号',
          dataIndex: 'standard',
          width: '11%',
          customCell: (record, index) => mergeCells(record.standard, record, index, 'standard'),
        },
        {
          title: '检测时间',
          dataIndex: 'testDate',
          width: '7%',
          customCell: (record, index) => mergeCells(record.testDate, record, index, 'testDate'),
        },
        { title: '检测参数', dataIndex: 'testParam', width: '9%' },
        { title: '单价', dataIndex: 'price', width: '7%' },
        { title: '组数', dataIndex: 'group', width: '7%' },
        { title: '点数', dataIndex: 'point', width: '7%' },
      ],
    }
  },
  created() {
    // eslint-disable-next-line ts/no-this-alias
    this0 = this
  },
  methods: {
    init(params) {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      _this.visible = true

      const dt = {
        1000: 'year',
        2000: 'month',
        3000: 'week',
      }

      const qt = {
        100: 'depart',
        200: 'person',
      }
      // 统计类型
      _this.durationType = dt[params.durationType]
      // 查询方式
      _this.queryType = qt[params.queryType]
      // 查询时间段
      _this.range = params.range.split(',')
      // 部门ID
      _this.departmentId = params.departmentId
      // 关联ID (durationType为person时relationId为personId,durationType为depart时 relationID为日期)
      _this.relationId = params.relationId

      const urlParams = _this.urlSplit()

      _this.getData(urlParams)
    },
    getData(params) {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      _this.visible = true
      window.$oAjax
        .get(`/rest/test/work/price${params}`)
        .then((res) => {
          _this.data = res.data.rows.map(i => ({
            ...i,
            testDate: i.testDate ? dayjs(i.testDate).format('YYYY-MM-DD') : '',
          }))
          _this.pagination.total = res.data.total || 0
          _this.pagination.current = _this.page
          _this.pagination.pageSize = _this.rows

          // 合并单元格配置项
          _this.merges()
        })
    },

    merges() {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      let temp = {
        sampleName: null,
        testParam: null,
        person: null,
        taskCode: null,
        recordCode: null,
        sampleCode: null,
        standard: null,
        testDate: null,
        price: null,
        group: null,
        point: null,
      }
      _this.merge = {
        sampleName: [],
        person: [],
        taskCode: [],
        recordCode: [],
        sampleCode: [],
        standard: [],
        testDate: [],
      }
      // eslint-disable-next-line array-callback-return
      _this.data.map((datum, index) => {
        if (index === 0) {
          temp = { ...datum }
          Object.keys(datum).forEach((key) => {
            const merge = _this.merge[key]
            if (merge) {
              merge[0] = []
              merge[0].push(index)
            }
          })
        }
        else {
          Object.keys(datum).forEach((key) => {
            const merge = _this.merge[key]
            if (merge) {
              const length = merge.length
              if (temp[key] === datum[key]) {
                merge[length - 1].push(index)
              }
              else {
                temp[key] = datum[key]
                merge[length] = [index]
              }
            }
          })
        }
      })
    },
    urlSplit(param) {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      // 查询参数
      let urlParams
        = `?queryType=${_this.queryType}&durationType=${_this.durationType}`

      // 按部门统计的
      if (_this.queryType === 'depart') {
        urlParams
          += `&date=${_this.relationId}&departmentId=${_this.departmentId}`
      }
      else {
        if (_this.durationType === 'year') {
          if (_this.range.length < 2) {
            const start = _this.range[0]
            _this.range[0] = `${start}-01-01`
            _this.range[1] = `${start}-12-31`
          }
        }
        urlParams
          += `&personId=${
            _this.relationId
          }&start=${
            _this.range[0]
          }&end=${
            _this.range[1]}`
      }
      if (param != null) {
        urlParams += `&queryParam=${param}`
      }
      return `${urlParams}&page=${_this.page}&rows=${_this.rows}`
    },
    handleSearch() {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      const urlParams = _this.urlSplit(_this.queryParam)
      _this.getData(urlParams)
    },
    handleReset() {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      _this.queryParam = null
      const urlParams = _this.urlSplit()
      _this.getData(urlParams)
    },
    cancel() {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      _this.durationType = null
      _this.queryParam = null
      _this.queryType = null
      _this.range = null
      _this.data = []
      _this.page = 1
      _this.rows = 10
      _this.visible = false
    },
  },
}
</script>
