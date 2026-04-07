<template>
  <div class="project-sroduction-statistics">
    <a-spin :spinning="spinning">
      <ul class="query-form">
        <li class="query-form-item">
          <p class="query-form-item-label">
            统计周期
            <a-tooltip placement="top">
              <template #title>
                <span>统计周期按委托日期计</span>
              </template>
              <QuestionCircleOutlined
                style="color: #999; cursor: pointer"
              />
            </a-tooltip>
          </p>
          <div class="query-form-item-content flex">
            <a-range-picker
              v-model:value="period"
              :open="openRangePicker"
              :format="monthFormat"
              :mode="['month', 'month']"
              style="width: 180px"
              @open-change="(open) => (openRangePicker = open)"
              @panel-change="handlePanelChange"
            >
              <template #renderExtraFooter>
                <div style="text-align: right">
                  <a-button type="primary" @click="savePeriod">
                    确定
                  </a-button>
                </div>
              </template>
            </a-range-picker>
            <a-button style="margin-left: 5px" @click="openSetting">
              设置
            </a-button>
          </div>
        </li>
        <li class="query-form-item">
          <span class="query-form-item-label">合同类型</span>
          <div class="query-form-item-content">
            <a-select
              v-model:value="queryForm.contractType"
              style="width: 150px"
              allow-clear
              placeholder="请选择合同类型"
            >
              <a-select-option value="1">
                全包合同
              </a-select-option>
              <a-select-option value="2">
                折扣合同
              </a-select-option>
              <a-select-option value="4">
                参数单价合同
              </a-select-option>
              <a-select-option value="0">
                无关联合同
              </a-select-option>
            </a-select>
          </div>
        </li>
        <li class="query-form-item">
          <a-input
            v-model:value="queryForm.q"
            style="width: 400px"
            allow-clear
            placeholder="请输入委托单位/工程项目/项目编号/合同名称/合同编号后回车查询"
            @keypress.enter="queryFun"
          />
        </li>
        <li class="query-form-item">
          <a-button type="primary" style="width: 60px" @click="queryFun">
            查询
          </a-button>
        </li>
      </ul>
      <div class="table-tool-btns">
        <a-button type="primary" :loading="saveLoading" @click="exportData">
          导出Excel
        </a-button>
      </div>
      <a-table
        bordered
        :columns="columns"
        :data-source="tableDatas"
        :pagination="pagination"
        :scroll="{ x: 1500, y: tableHeight }"
        @change="chagneTable"
      >
        <template #bodyCell="{ column, text }">
          <template v-if="column.dataIndex === 'cellEllipsis'">
            <a-tooltip placement="topLeft" :title="text">
              <div class="text-ellipsis">
                {{ text }}
              </div>
            </a-tooltip>
          </template>
        </template>
      </a-table>

      <ht-modal
        v-model:open="visible"
        title="设置"
        :keyboard="false"
        :mask-closable="false"
        width="400px"
        :confirm-loading="setLoading"
        @ok="saveConfig"
      >
        <div class="modal-setting-box">
          <h3 class="title">
            请选择统计类型
          </h3>
          <a-radio-group v-model:value="settingForm.type">
            <a-radio :style="radioStyle" :value="0">
              按自然月统计
            </a-radio>
            <a-radio :style="radioStyle" :value="1">
              按非自然月统计
            </a-radio>
          </a-radio-group>
          <div v-show="settingForm.type == 1" class="month-day">
            每月
            <a-input-number
              v-model:value="settingForm.start"
              :min="1"
              :max="31"
              :precision="0"
            />
            日 至 次月
            <a-input-number
              v-model:value="settingForm.end"
              :min="1"
              :max="31"
              :precision="0"
            />
            日
          </div>
        </div>
      </ht-modal>
    </a-spin>
  </div>
</template>

<script>
import { QuestionCircleOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'

const baseColumns = [
  {
    title: '项目编号',
    dataIndex: 'projectCode',
    sorter: true,
    fixed: 'left',
    scopedSlots: { customRender: 'cellEllipsis' },
    width: 120,
  },
  {
    title: '工程项目',
    dataIndex: 'projectName',
    fixed: 'left',
    scopedSlots: { customRender: 'cellEllipsis' },
    width: 120,
  },
  {
    title: '委托单位',
    dataIndex: 'consignUnit',
    fixed: 'left',
    scopedSlots: { customRender: 'cellEllipsis' },
    width: 120,
  },
  {
    title: '项目性质',
    dataIndex: 'projectNature',
    scopedSlots: { customRender: 'cellEllipsis' },
    width: 100,
  },
  {
    title: '协作单位',
    dataIndex: 'cooperativeUnit',
    scopedSlots: { customRender: 'cellEllipsis' },
    width: 120,
  },
  {
    title: '收费标准',
    dataIndex: 'priceStandard',
    scopedSlots: { customRender: 'cellEllipsis' },
    width: 120,
  },
  {
    title: '合同名称',
    dataIndex: 'contractName',
    scopedSlots: { customRender: 'cellEllipsis' },
    width: 120,
  },
  {
    title: '合同编号',
    dataIndex: 'contractCode',
    sorter: true,
    width: 120,
  },
  {
    title: '合同类型',
    dataIndex: 'contractType',
    width: 100,
  },
  {
    title: '合同折扣率',
    dataIndex: 'contractDiscount',
    width: 100,
  },
  {
    title: '合同负责人',
    scopedSlots: { customRender: 'cellEllipsis' },
    dataIndex: 'owner',
    width: 100,
  },
]
const totalColumn = [
  {
    title: '年度费用合计',
    dataIndex: 'annualFeeTotal',
    fixed: 'right',
    children: [
      {
        title: '年度检测费用合计',
        dataIndex: 'consignAmountCombined',
        width: 120,
      },
      {
        title: '年度产值合计',
        dataIndex: 'outputCombined',
        width: 100,
      },
      {
        title: '年度实际营收合计',
        dataIndex: 'revenueCombined',
        width: 120,
      },
      {
        title: '年度累计未收合计',
        dataIndex: 'uncollectedCombined',
        width: 120,
      },
    ],
  },
]

export default {
  components: {
    QuestionCircleOutlined,
  },
  data() {
    return {
      visible: false,
      spinning: false,
      saveLoading: false,
      setLoading: false,
      openRangePicker: false,
      tableHeight: 300,
      monthFormat: 'YYYY-MM',
      period: [],
      columns: [],
      months: [],
      tableDatas: [],
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
        ...window.pageConfig,
        onChange: (page) => {
          this.pagination.current = page
          this.getDataSource()
        },
        onShowSizeChange: (page, size) => {
          this.pagination.current = page
          this.pagination.pageSize = size
          this.getDataSource()
        },
      },
      queryForm: {
        period: [],
        contractType: undefined,
        q: '',
        sort: '',
        order: '',
      },
      settingForm: {
        type: 0,
        start: 1,
        end: 1,
      },
      cacheSet: {
        type: 0,
        start: 1,
        end: 1,
      },
      radioStyle: {
        display: 'block',
        height: '30px',
        lineHeight: '30px',
      },
    }
  },
  async created() {
    await this.getNowDate()
    this.getConfigData()
    this.initColumns()
    this.getDataSource()
  },
  mounted() {
    const queryH = document.querySelector('.query-form').clientHeight
    this.tableHeight
      = (window.innerHeight || document.body.clientHeight) - 190 - queryH
  },
  methods: {
    handlePanelChange(value) {
      if (value.length === 0)
        return
      const startM = dayjs(value[0]).format(this.monthFormat)
      const endM = dayjs(value[1]).format(this.monthFormat)
      this.period = value
      this.queryForm.period = [startM, endM]
    },
    savePeriod() {
      this.openRangePicker = false
    },
    // 设置初始周期
    getNowDate() {
      const t = dayjs().format(this.monthFormat)
      this.period = [dayjs(), dayjs()]
      this.queryForm.period = [t, t]
    },
    // 初始化表格列
    initColumns() {
      const period = this.queryForm.period
      if (period.length === 0)
        return
      const startDate = period[0].split('-')
      const endDate = period[1].split('-')
      const startMonth = Number(startDate[1])
      let endMonth = Number(endDate[1])
      if (startDate[0] !== endDate[0]) {
        endMonth += 12
      }
      // 计算总月份
      const num = endMonth - startMonth + 1
      // 遍历生成每个月份
      const monthArr = []
      const months = []
      for (let i = 0; i < num; i++) {
        let month = (startMonth + i) % 12
        const year = i < 13 - startMonth ? startDate[0] : endDate[0]

        month == 0 && (month = 12)
        monthArr.push(`${`${year}年`}${month}月`)
        months.push(year + (month < 10 ? `0${month}` : month))
      }
      // 生成月份列数据
      const monthColumns = []
      for (let i = 0; i < monthArr.length; i++) {
        monthColumns.push({
          title: monthArr[i],
          dataIndex: `dateRange${months[i]}`,
          children: [
            {
              title: '检测费用',
              dataIndex: `consignAmount${months[i]}`,
              width: 100,
            },
            {
              title: '产值',
              dataIndex: `output${months[i]}`,
              width: 100,
            },
            {
              title: '实际营收',
              dataIndex: `revenue${months[i]}`,
              width: 100,
            },
          ],
        })
      }
      this.months = months
      this.columns = [...baseColumns, ...monthColumns, ...totalColumn]
    },
    // 查询
    queryFun() {
      this.initColumns()
      if (this.months.length <= 12) {
        this.getDataSource(true)
      }
      else {
        window.$oAntdMessage.warning('统计周期不能超过12个月，请重新选择周期！')
      }
    },
    // 获取数据
    getDataSource(flag) {
      if (flag) {
        this.pagination.current = 1
      }
      const params = {
        ...this.queryForm,
        page: this.pagination.current,
        size: this.pagination.pageSize,
      }
      if (params.period && params.period.length > 0) {
        params.start = params.period[0]
        params.end = params.period[1]
        delete params.period
      }
      this.spinning = true
      window.$oAjax({
        url: window.$oApi.projectProduction.pageList,
        method: 'get',
        params,
      })
        .then((res) => {
          this.spinning = false
          if (!res || res.code === 20010) {
            window.$oAntdMessage.error(res.msg || res.mesage || '获取数据异常')
            return
          }
          if (res.rows && res.rows.length > 0) {
            for (let i = 0; i < res.rows.length; i++) {
              res.rows[i].key = res.rows[i].unitId + i
              for (let j = 0; j < this.months.length; j++) {
                const month = this.months[j]
                if (!res.rows[i][month])
                  continue
                const data = res.rows[i][month][0]
                Object.assign(res.rows[i], data)
              }
            }
          }
          this.tableDatas = res.rows || []
          this.pagination.total = res.count
        })
        .catch(() => {
          this.spinning = false
        })
    },
    chagneTable(pagination, filters, sorter) {
      if (!sorter.order)
        return
      this.queryForm.order = sorter.order == 'ascend' ? 'asc' : 'desc'
      this.queryForm.sort = sorter.field
      this.getDataSource()
    },
    // 获取日期配置
    getConfigData() {
      window.$oAjax.get(window.$oApi.projectProduction.config).then((res) => {
        if (res.code === 20010) {
          window.$oAntdMessage.error(res.msg || err.message || '查询异常')
          return
        }
        this.settingForm = {
          type: res.data.type || 0,
          start: res.data.start || 1,
          end: res.data.end || 1,
        }
        this.cacheSet = { ...this.settingForm }
      })
    },
    // 保存日期配置
    saveConfig() {
      const { type, start, end } = this.settingForm
      if (type === 1 && (!start || !end)) {
        window.$oAntdMessage.warning('请输入开始或截至日期')
        return
      }
      this.setLoading = true
      window.$oAjax
        .post(window.$oApi.projectProduction.config, this.settingForm, {
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
        })
        .then(() => {
          window.$oAntdMessage.success('保存成功')
          this.setLoading = false
          this.visible = false
          this.cacheSet = { ...this.settingForm }
          this.getDataSource()
        })
        .catch(() => {
          this.setLoading = false
        })
    },
    // 打开设置
    openSetting() {
      this.settingForm = { ...this.cacheSet }
      this.visible = true
    },
    // 导出
    exportData() {
      const params = { ...this.queryForm }
      if (params.period && params.period.length > 0) {
        params.start = params.period[0]
        params.end = params.period[1]
        delete params.period
      }
      if (!params.contractType) {
        delete params.contractType
      }
      let paramStr = ''
      for (const k in params) {
        paramStr += `${k}=${params[k]}&`
      }
      const url = `/ilis2/${window.$oApi.projectProduction.export}?${paramStr}`
      window.open(url, '_blank')
    },
  },
}
</script>

<style lang="less" scoped>
.project-sroduction-statistics {
  padding: 15px 0;
  .query-form-item {
    display: inline-flex;
    margin-right: 15px;
    margin-bottom: 10px;

    .query-form-item-label {
      width: 80px;
      text-align: right;
      line-height: 28px;
    }
    .query-form-item-content {
      margin-left: 10px;
      min-width: 120px;
      &.flex {
        display: flex;
        align-items: center;
      }
      .ant-select,
      .ant-input {
        width: 100%;
      }
    }
  }
  .table-tool-btns {
    margin-bottom: 5px;
  }
  :deep(.ant-pagination) {
    margin-bottom: 0;
  }
  .text-ellipsis {
    max-height: 35px;
    text-overflow: -o-ellipsis-lastline;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2; // 显示多行，修改这里的数字即可
    -webkit-box-orient: vertical;
  }
}
.modal-setting-box {
  padding: 0 35px;
  .title {
    margin-bottom: 10px;
    font-weight: 600;
  }
  .month-day {
    margin-top: 20px;
  }
  .ant-input-number {
    width: 65px;
  }
}
</style>
