<!-- eslint-disable vue/eqeqeq -->
<!-- eslint-disable vue/valid-v-for -->
<!-- eslint-disable vue/no-unused-refs -->
<template>
  <div class="testTaskStatistic">
    <a-spin :spinning="spinning">
      <div class="spin-content">
        <div class="mb-4">
          <a-form ref="formRef" :model="formState" layout="inline">
            <a-form-item
              label="统计周期"
            >
              <a-radio-group
                v-model:value="formState.queryType"
                name="queryType"
                @change="changequeryType"
              >
                <a-radio
                  v-for="(item, index) in queryTypeData"
                  :key="index"
                  :value="item.value"
                >
                  {{ item.name }}
                </a-radio>
              </a-radio-group>
            </a-form-item>
            <a-form-item
              label="统计时间"
            >
              <span v-if="queryType == 1000 || queryType == ''">
                <a-select
                  v-model:value="formState.consignDate"
                  style="width: 200px"
                  @change="changeconsignDate"
                >
                  <template v-for="item in yearData">
                    <a-select-option v-if="yearData.length > 0" :value="item.value">{{
                      item.name
                    }}</a-select-option>
                  </template>
                </a-select>
              </span>
              <span v-else-if="queryType == 2000">
                <a-month-picker @change="changeconsignDate" />
              </span>
              <span v-else-if="queryType == 3000">
                <a-week-picker @change="changeconsignDate" />
              </span>
            </a-form-item>
            <a-form-item>
              <a-button type="primary" @click="search">
                查询
              </a-button>
              <a-button @click="reset">
                重置
              </a-button>
            </a-form-item>
          </a-form>
        </div>
        <a-table
          v-if="treeData.length > 0"
          :scroll="scroll"
          :columns="columns"
          :data-source="treeData"
          :pagination="false"
          bordered
          :row-class-name="rowClassName"
        >
          <template #bodyCell="{ column, record, text }">
            <template v-if="columns.map((i) => i.key).filter((key) => key !== 'bigCategoryName').includes(column.dataIndex)">
              <span :data-id="column.dataIndex" class="text-[#0066ec] underline " @click="(e) => detailGrid(e, text, record)">{{
                record[column.dataIndex]
              }}</span>
            </template>
          </template>
        </a-table>
        <AddModal ref="AddModal" :callback="getData" />
      </div>
    </a-spin>
  </div>
</template>

<script>
/* eslint-disable eqeqeq */
import dayjs from 'dayjs'
import AddModal from './components/addModal.vue'

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
        obj[val.timeTag] = val.count
        obj[`${val.timeTag}TestObjectIds`] = val.testObjectIds
      })
    }
    if (children.length === 0) {
      delete obj.children
    }

    if (obj.type == 'DEPART') {
      obj.disabled = true
    }
    arr.push(obj)
  }
  return arr
}
// let chartEle = null
const columnsbase = [
  {
    title: '大类&样品',
    dataIndex: 'bigCategoryName',
    key: 'bigCategoryName',
    width: 260,
    fixed: 'left',
  },
]

export default {
  components: {
    AddModal,
  },
  data() {
    return {

      treeData: [],
      columns: [],
      newColumns: [],
      scroll: { x: true },
      page: 1,
      size: 10,
      spinning: false,
      queryTypeData: [
        { name: '年', value: 1000 },
        { name: '月', value: 2000 },
        { name: '周', value: 3000 },
      ],
      dateFormat: 'YYYY-MM-DD',
      yearData: [],
      queryType: '', // 1000: 按年；2000：月；3000 周
      consignDate: '', // 日期范围参数：年：2020；月、周 2020-01-01,2020-01-16 以半角逗号分隔
      formState: {
        queryType: 1000,
        consignDate: new Date().getFullYear(),
      },
    }
  },
  created() {
    // this.getBigCategoryData();
  },
  mounted() {
    this.getData({
      queryType: 1000,
      consignDate: new Date().getFullYear(),
    })
    const year = new Date().getFullYear()
    this.yearData = Array.from({ length: 10 }).fill(year).map((item, index) => ({
      name: year - index,
      value: year - index,
    }))
    // let columnsY = this.columnsSet(new Array(12).fill(year));
    this.newColumns = columnsbase.concat(
      this.columnsSet(Array.from({ length: 12 }).fill(year)),
    )
  },
  methods: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    detailGrid(event, text, record) {
      const titleKey = event.target.dataset.id
      const testObjectIds = record[`${titleKey}TestObjectIds`]
      if (testObjectIds) {
        this.$refs.AddModal.showModal(testObjectIds)
      }
    },
    // 根据年月周 设置不同的columns
    columnsSet(arr, isWeek) {
      if (isWeek) {
        return arr.map(item => ({
          title: item,
          dataIndex: item,
          key: item,
          scopedSlots: { customRender: item },
        }))
      }
      else {
        return arr.map((item, index) => {
          const bianlian
            = `${item}-${
              (`${index + 1}`).length > 1 ? index + 1 : `0${index + 1}`}`
          return {
            title: bianlian,
            dataIndex: bianlian,
            key: bianlian,
            scopedSlots: { customRender: bianlian },
          }
        })
      }
    },
    getData(params) {
      this.spinning = true
      window.$oAjax
        .get(window.$oApi.consignCollectionStatistic.getData, {
          params,
          timeout: 30 * 1000,
        })
        .then((res) => {
          if (res.code && res.code === 20000) {
            this.scroll = this.queryType === 2000 ? { x: 1300 } : { x: true }
            this.columns = this.newColumns
            this.treeData = getTree(res.data)

            this.spinning = false
          }
          else {
            this.spinning = false
          }
        })
    },
    changequeryType(e) {
      this.consignDate = ''
      this.queryType = e.target.value
    },
    changeconsignDate(value, value2) {
      if (this.queryType == 2000) {
        const firstDate = new Date(value2)
        firstDate.setDate(1)
        const endDate = new Date(firstDate)
        endDate.setMonth(firstDate.getMonth() + 1)
        endDate.setDate(0)
        const Mdaty = dayjs(firstDate).daysInMonth()
        // let columnsM = this.columnsSet(new Array(Mdaty).fill(value2));
        this.newColumns = columnsbase.concat(
          // eslint-disable-next-line unicorn/no-new-array
          this.columnsSet(new Array(Mdaty).fill(value2)),
        )
        this.consignDate = `${dayjs(firstDate).format(
          this.dateFormat,
        )},${dayjs(endDate).format(this.dateFormat)}`
      }
      else if (this.queryType == 3000) {
        const firstDate = dayjs(value).weekday(0).format(this.dateFormat)
        const endDate = dayjs(value).weekday(6).format(this.dateFormat)
        const weekArr = [
          firstDate,
          dayjs(value).weekday(1).format(this.dateFormat),
          dayjs(value).weekday(2).format(this.dateFormat),
          dayjs(value).weekday(3).format(this.dateFormat),
          dayjs(value).weekday(4).format(this.dateFormat),
          dayjs(value).weekday(5).format(this.dateFormat),
          endDate,
        ]
        // let columnsW = this.columnsSet(weekArr, true);

        this.newColumns = columnsbase.concat(this.columnsSet(weekArr, true))
        this.consignDate = `${firstDate},${endDate}`
      }
      else {
        // let columnsY = this.columnsSet(new Array(12).fill(value));
        this.newColumns = columnsbase.concat(
          this.columnsSet(Array.from({ length: 12 }).fill(value)),
        )
      }
    },
    search() {
      const data = { ...this.formState }
      if (this.queryType == 2000 || this.queryType == 3000) {
        if (this.consignDate == '') {
          window.$oAntdModal.warning(window.$oMsgTips.info('请选择统计时间'))
          return
        }
        data.consignDate = this.consignDate
      }
      else {
        this.newColumns = columnsbase.concat(
          this.columnsSet(Array.from({ length: 12 }).fill(data.consignDate)),
        )
      }
      this.getData(data)
    },
    reset() {
      this.formState = {}
      this.consignDate = ''
      this.queryType = 1000
      const year = new Date().getFullYear()
      // let columnsY = this.columnsSet(new Array(12).fill(year));
      this.newColumns = columnsbase.concat(
        this.columnsSet(Array.from({ length: 12 }).fill(year)),
      )
      this.getData({
        queryType: 1000,
        consignDate: year,
      })
    },
  },
}
</script>

<style lang="less" scoped>
@import './index.less';
</style>
