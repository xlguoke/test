<!-- eslint-disable vue/no-unused-refs -->
<template>
  <AppProvider>
    <a-form ref="formRef" class="form-box">
      <a-row class="form-box-row">
        <a-col :span="12">
          <a-form-item>
            <span>功能室: &nbsp; &nbsp;</span>
            <a-tree-select
              style="width: 50%"
              :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
              :tree-data="treeData"
              placeholder="请选择功能室"
              tree-default-expand-all
              @change="onChangeType"
            ></a-tree-select>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item v-bind="formItemLayout" label="记录时间">
            <a-range-picker
              :show-time="{
                defaultValue: [
                  dayjs('00:00:00', 'HH:mm:ss'),
                  dayjs('23:59:59', 'HH:mm:ss'),
                ],
              }"
              format="YYYY-MM-DD HH:mm:ss"
              @change="timeOKChange"
            />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row class="form-box-row select-html">
        <a-col :span="12">
          <span>{{ selectHtml }}</span>
        </a-col>
      </a-row>
      <a-row class="form-box-row switch-btn">
        <a-button type="primary" @click="switchDisplay(true)">
          {{ isTable ? '图表查看' : '表格查看' }}
        </a-button>
        <a-button @click="printFun()">
          打印
        </a-button>
        <a-button @click="exportFun()">
          导出
        </a-button>
      </a-row>
      <TableDetail
        v-show="isTable"
        ref="tableChild"
        :query-params="queryParams"
      />
      <ChartDetail
        v-show="!isTable"
        ref="chartChild"
        :query-params="queryParams"
      />
    </a-form>
  </AppProvider>
</template>

<script>
import dayjs from 'dayjs'
import { ajaxRequest, formatTime } from '~/providers/common/utils.js'
import { rootUrl } from '~/providers/configs/rootUrl'
import ChartDetail from '../chartDetail/index.vue'
import TableDetail from '../tableDetail/index.vue'

/*
 * EditableCell Code https://github.com/vueComponent/ant-design-vue/blob/master/components/table/demo/EditableCell.vue
 */

export default {
  components: {
    TableDetail,
    ChartDetail,
  },
  data() {
    return {
      dayjs,
      queryParams: {},
      treeData: [],
      fmt: 'YYYY-MM-DD HH:mm:ss',
      isTable: true,
      formItemLayout: {
        labelCol: {
          xs: { span: 7 },
          sm: { span: 7 },
        },
        wrapperCol: {
          xs: { span: 12 },
          sm: { span: 12 },
        },
      },
      selectHtml: '',
      // editData:{},
    }
  },
  created() {
    this.getTreeData()
  },
  methods: {
    formatTime,
    ajaxRequest,
    getTreeData() {
      const data = {
        page: 1,
        rows: 10,
      }
      ajaxRequest(
        window.$oApi.laboratory.tableUrl,
        window.$oQs.stringify(data),
        this.getTreeDataCall,
      )
    },
    getTreeDataCall(res) {
      if (res.rows && res.rows.length > 0) {
        this.renderTreeNodes(res.rows)
        this.treeData = res.rows
      }
    },
    renderTreeNodes(data) {
      for (const keys in data) {
        const item = data[keys]
        item.title = item.name
        item.key = item.id
        item.value = item.id
        if (item.children && item.children.length) {
          this.renderTreeNodes(item.children)
        }
      }
    },
    // 时间变化后获取数据
    timeOKChange(date, dateString) {
      this.queryParams.recordTimeBegin = dateString[0]
      this.queryParams.recordTimeEnd = dateString[1]
      this.switchDisplay()
    },

    laboratoryHtml(data) {
      let temperature = '/'
      let humidity = '/'
      if (data.minTemperature && !data.maxTemperature) {
        temperature = `>=${data.minTemperature}`
      }
      if (!data.minTemperature && data.maxTemperature) {
        temperature = `<=${data.maxTemperature}`
      }
      if (data.minTemperature && data.maxTemperature) {
        temperature = `${data.minTemperature} - ${data.maxTemperature}`
      }
      if (data.minHumidity && !data.maxHumidity) {
        humidity = `>=${data.minHumidity}`
      }
      if (!data.minHumidity && data.maxHumidity) {
        humidity = `<=${data.maxHumidity}`
      }
      if (data.minHumidity && data.maxHumidity) {
        humidity = `${data.minHumidity} - ${data.maxHumidity}`
      }

      this.selectHtml = `温度要求(℃): ${temperature} ；湿度要求(%RH): ${humidity} ;备注：${
        data.remark || ''
      }`
    },
    onChangeType(value) {
      const node = this.treeData.find(i => i.id === value)
      const laboratoryData = node
      this.laboratoryHtml(laboratoryData)

      this.queryParams.laboratoryId = value
      this.switchDisplay()
    },
    switchDisplay(isSwitch) {
      if (isSwitch) {
        this.isTable = !this.isTable
      }
      if (this.isTable) {
        this.$refs.tableChild.getData()
      }
      else {
        this.$refs.chartChild.getData()
      }
    },
    handleOkAddEditCall() {

    },
    // 打印
    printFun() {
      if (!this.queryParams.laboratoryId) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请先选择功能室'))
        return
      }

      const UDRPrint = new IlisPrintUdr()
      UDRPrint.printLedger('LaboratoryEnvironment', this.queryParams || {})
    },
    // 导出
    exportFun() {
      if (!this.queryParams.laboratoryId) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请先选择功能室'))
        return
      }
      const a = document.createElement('a')
      const params = this.queryParams || {}
      let href = `${rootUrl}${window.$oApi.environmentStatistics.export}`

      // eslint-disable-next-line array-callback-return
      Object.keys(params).map((item) => {
        if (params[item]) {
          href += `&${item}=${params[item]}`
        }
      })

      a.href = href
      a.click()
    },
  },
}
</script>

<style scoped>
.form-box {
  padding: 15px;
}
.select-html,
.switch-btn {
  margin-bottom: 10px;
}
</style>
