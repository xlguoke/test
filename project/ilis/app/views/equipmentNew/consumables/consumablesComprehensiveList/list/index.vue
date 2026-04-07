<template>
  <div class="consumablesComprehensiveList_box">
    <!--
        表单布局
       -->
    <div class="form-box">
      <div style="display: flex; flex: 1; align-items: center">
        耗材类别
        <a-select
          v-model:value="formData.consumableType"
          style="width: 70%"
          class="container-search-all"
          placeholder="请选择"
          allow-clear
          filter-option
          show-search
        >
          <a-select-option
            v-for="(item, index) in consumables"
            :key="index"
            :value="item.key"
          >
            {{ item.label }}
          </a-select-option>
        </a-select>
      </div>
      <div style="display: flex; flex: 1; align-items: center">
        出入库类型
        <a-select
          v-model:value="formData.inventoryType"
          style="width: 70%"
          class="container-search-all"
          allow-clear
          placeholder="请选择"
          filter-option
          show-search
        >
          <a-select-option
            v-for="(item, index) in outType"
            :key="index"
            :value="item.typename"
          >
            {{ item.typename }}
          </a-select-option>
        </a-select>
      </div>
      <div style="display: flex; flex: 1; align-items: center">
        耗材名称
        <a-input
          v-model:value="formData.quickQry"
          placeholder="请输入耗材名称 回车可以查询"
          size="small"
          allow-clear
          class="container-search-all"
          @keypress.enter="handleSearch()"
        />
      </div>
      <!--         v-model="formData.time" -->
      <div style="display: flex; flex: 1; align-items: center">
        选择日期
        <a-range-picker
          v-model:value="formData.time"
          class="container-search-all"
          allow-clear
          @change="handleTimeChange"
        >
        </a-range-picker>
      </div>
      <div>
        <a-button type="primary" @click="handleSearch">
          查询
        </a-button>
        <a-button @click="handleRest">
          重置
        </a-button>
      </div>
    </div>
    <div class="action-btn">
      <a-button type="primary" @click="hanleDown">
        导出
      </a-button>
      <a-button type="primary" @click="hanlePrint">
        打印
      </a-button>
    </div>
    <!-- 表格 -->
    <div class="table w-full">
      <a-table
        :columns="columns"
        :data-source="tableData"
        :loading="loading"
        bordered
        row-key="id"
        :pagination="{
          total,
          pageSize: formData.size,
          current: formData.page,
          pageSizeOptions: ['10', '20', '30', '50', '100', '200', '500'],
          showTotal: (total) =>
            `${
              formData.page == 1 ? 1 : (formData.page - 1) * formData.size + 1
            }-${
              formData.size * formData.page < total
                ? formData.size * formData.page
                : total
            } 共 ${total} 条`,
          showQuickJumper: true,
          showSizeChanger: true,
        }"
        @change="handleChange"
      >
      </a-table>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import qs from 'qs'
import { exportFile, getList } from '~/providers/api/consumablesComprehensiveList'
import { downloadFile } from '~/providers/common/utils.js'
import { columns } from './config'

export default {
  data() {
    const current = dayjs().get('year')
    const currentMonth = dayjs().get('month') + 1 // 月份是 0 基，需 +1
    const currentDate = dayjs().get('date')

    // 统一补零函数：确保数字为两位数
    const padZero = num => num.toString().padStart(2, '0')

    const preYear = current - 1
    // 补零处理月份和日期
    const monthStr = padZero(currentMonth)
    const dateStr = padZero(currentDate)
    // 拼接标准格式的日期字符串
    const operationTimeStart = `${preYear}-${monthStr}-${dateStr}`
    const operationTimeEnd = `${current}-${monthStr}-${dateStr}`
    const dateFormat = 'YYYY-MM-DD'
    const defaultValue = [
      dayjs(operationTimeStart, dateFormat),
      dayjs(operationTimeEnd, dateFormat),
    ]
    return {
      formData: {
        page: 1,
        size: 10,
        time: defaultValue,
      },
      columns,
      tableData: [],
      consumables: [],
      outType: [],
      loading: false,
      total: 0,
      selectedRowKeys: [],
      defaultValue,
    }
  },
  mounted() {
    this.getConsumables()
    this.getStatus()
    const body = {
      ...this.formData,
    }
    const { time } = this.formData
    if (time && time.length) {
      const operationTimeStart = time[0].format('YYYY-MM-DD')
      const operationTimeEnd = time[1].format('YYYY-MM-DD')
      body.operationTimeStart = operationTimeStart
      body.operationTimeEnd = operationTimeEnd
    }
    delete body.time
    this.getDataTable(body)
  },
  methods: {
    // 处理时间变化事件
    handleTimeChange(date) {
      // date是一个数组，包含两个dayjs对象：[开始时间, 结束时间]
      if (date && date.length === 2) {
        this.formData.time = [date[0], date[1]]
      }
      else {
        this.formData.time = []
      }
    },
    handleSearch() {
      const { selectedRowKeys } = this
      if (selectedRowKeys && selectedRowKeys.length) {
        this.selectedRowKeys = []
      }
      this.formData.page = 1
      const { time } = this.formData
      const body = {
        ...this.formData,
      }
      if (time && time.length) {
        const operationTimeStart = time[0].format('YYYY-MM-DD')
        const operationTimeEnd = time[1].format('YYYY-MM-DD')
        body.operationTimeStart = operationTimeStart
        body.operationTimeEnd = operationTimeEnd
      }
      if (body.time) {
        delete body.time
      }
      this.getDataTable(body)
    },
    handleChange(page) {
      this.formData.page = page.current
      this.formData.size = page.pageSize
      const { time } = this.formData
      const body = {
        ...this.formData,
      }
      if (time && time.length) {
        const operationTimeStart = time[0].format('YYYY-MM-DD')
        const operationTimeEnd = time[1].format('YYYY-MM-DD')
        body.operationTimeStart = operationTimeStart
        body.operationTimeEnd = operationTimeEnd
      }
      if (body.time) {
        delete body.time
      }
      this.getDataTable(body)
    },
    // 重置
    handleRest() {
      this.formData = {
        page: 1,
        size: 10,
        time: this.defaultValue,
      }
      const body = {
        ...this.formData,
      }
      const { time } = this.formData
      if (time && time.length) {
        const operationTimeStart = time[0].format('YYYY-MM-DD')
        const operationTimeEnd = time[1].format('YYYY-MM-DD')
        body.operationTimeStart = operationTimeStart
        body.operationTimeEnd = operationTimeEnd
      }
      if (body.time) {
        delete body.time
      }
      this.getDataTable(body)
    },
    // 耗材类别
    getConsumables() {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      window.$oAjax({
        method: 'POST',
        url: `${window.$oApi.common.getDictionaryData}`,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
        data: qs.stringify({
          dictGroupId: 'fcc166c7340845a8ad97d7014e6b565f',
        }),
      }).then((res) => {
        if (res && res.success) {
          // eslint-disable-next-line array-callback-return
          res.obj.map((v) => {
            _this.consumables.push({ key: v.typecode, label: v.typename })
          })
        }
      })
    },
    // 出入库类型
    async getStatus() {
      const res = await window.$oAjax({
        method: 'POST',
        url: `${window.$oApi.eqEgressList.status}`,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
        data: qs.stringify({
          dictGroupId: 'f852d85d47ed64a40147ed70894c0005',
        }),
      })
      if (res && res.success) {
        const data = [
          {
            id: '1',
            typename: '入库',
          },
          {
            id: '2',
            typename: '出库',
          },
        ]
        this.outType = [...res.obj, ...data]
      }
      else {
        this.outType = []
      }
    },
    // 获取列表
    async getDataTable(queryInfo) {
      this.loading = true
      try {
        const { code, data } = await getList(queryInfo)
        if (code === 20000 && data) {
          this.tableData = data.rows || []
          this.total = data.count || 0
        }
      }
      finally {
        this.loading = false
      }
    },
    // 导出
    async hanleDown() {
      const body = {
        ...this.formData,
      }
      const { time } = this.formData
      if (time && time.length) {
        const operationTimeStart = time[0].format('YYYY-MM-DD')
        const operationTimeEnd = time[1].format('YYYY-MM-DD')
        body.operationTimeStart = operationTimeStart
        body.operationTimeEnd = operationTimeEnd
      }
      if (body.time) {
        delete body.time
      }
      this.loading = true
      try {
        const res = await exportFile(body)
        window.$oAntdMessage.success('导出成功')
        const blob = new Blob([res])
        const href = window.URL.createObjectURL(blob)
        const fileName = '耗材出入库记录.xlsx'
        downloadFile(href, fileName)
      }
      catch (err) {
        window.$oAntdMessage.error((err && err.message) || '导出失败')
      }
      finally {
        this.loading = false
      }
    },
    // 打印
    hanlePrint() {
      const body = {
        ...this.formData,
      }
      const { time } = this.formData
      if (time && time.length) {
        const operationTimeStart = time[0].format('YYYY-MM-DD')
        const operationTimeEnd = time[1].format('YYYY-MM-DD')
        body.operationTimeStart = operationTimeStart
        body.operationTimeEnd = operationTimeEnd
      }
      if (body.time) {
        delete body.time
        delete body.page
        delete body.size
      }

      const UDRPrint = new IlisPrintUdr()
      UDRPrint.printLedger('ConsumableInventoryLedger', { ...body })
    },
    handleSelectChange(selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys
    },
  },
}
</script>

<style lang="less" scoped>
.container-search-all {
  width: 70%;
  margin-left: 5px;
  .ant-table-thead {
    .ant-checkbox {
      display: none;
    }
  }
}
.consumablesComprehensiveList_box {
  .form-box {
    display: flex;
    // justify-content: space-between;
    align-items: center;
  }

  .action-btn {
    margin-top: 20px;
  }

  .table {
    margin-top: 20px;
  }
}
</style>
