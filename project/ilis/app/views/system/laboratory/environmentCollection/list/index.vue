<!-- eslint-disable vue/no-unused-refs -->
<template>
  <a-spin :spinning="spinning">
    <div class="spin-content">
      <a-form ref="formRef" class="form-box">
        <a-row class="form-box-row">
          <a-col :span="deviceData.length > 1 ? 6 : 12">
            <a-form-item>
              <span>检测室: &nbsp; &nbsp;</span>
              <a-tree-select
                v-model:value="treeValue"
                style="width: 50%"
                :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                :tree-data="treeData"
                placeholder="请选择检测室"
                tree-default-expand-all
                @change="onChangeType"
              ></a-tree-select>
            </a-form-item>
          </a-col>

          <a-col v-if="deviceData.length > 1" :span="5">
            <a-form-item
              label="检测室设备"
              :label-col="labelCol"
              :wrapper-col="wrapperCol"
            >
              <!-- v-model="deviceData" -->
              <a-select
                placeholder="请选择"
                @change="
                  (e) => {
                    handleChange(e)
                  }
                "
              >
                <a-select-option value="">
                  请选择
                </a-select-option>
                <a-select-option
                  v-for="(item, index) in deviceData"
                  :key="index"
                  :value="item.deviceKey"
                >
                  {{ item.deviceKey }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item
              label="采集时间"
              :label-col="labelCol"
              :wrapper-col="wrapperCol"
            >
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

        <TableDetail
          ref="tableChild"
          :query-params="queryParams"
          @load-success="loadSuccess"
        />
      </a-form>
    </div>
  </a-spin>
</template>

<script>
import dayjs from 'dayjs'
import { rootUrl } from '~/providers/configs/rootUrl'
import TableDetail from '../tableDetail/index.vue'

/*
 * EditableCell Code https://github.com/vueComponent/ant-design-vue/blob/master/components/table/demo/EditableCell.vue
 */

export default {
  components: {
    TableDetail,
  },
  data() {
    return {
      dayjs,
      spinning: false,
      queryParams: {},
      treeData: [],
      deviceData: [],
      fmt: 'YYYY-MM-DD HH:mm:ss',
      isTable: true,

      labelCol: { span: 7 },
      wrapperCol: { span: 12 },
      selectHtml: '',
      treeValue: undefined,
    }
  },
  created() {
    this.getTreeData()
  },
  methods: {
    getTreeData() {
      const data = {
        page: 1,
        rows: 10,
      }
      this.spinning = true
      window.$oAjax({
        url: window.$oApi.laboratory.tableUrl,
        data: window.$oQs.stringify(data),
      }).then((res) => {
        if (res.rows && res.rows.length > 0) {
          this.renderTreeNodes(res.rows)
          this.treeData = res.rows

          window.$oNextTick(() => {
            const id = '2c9284d577e42cfb01780baf60d01976'
            const laboratoryData = this.treeData.find(item => item.id === id)
            if (laboratoryData) {
              this.laboratoryHtml(laboratoryData)
              this.queryParams.laboratoryId = id
              this.treeValue = id
              this.switchDisplay()
            }
          })
        }
        this.spinning = false
      })
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
      const laboratoryData = this.treeData.find(i => i.id === value)
      this.deviceData = laboratoryData.deviceKeys || []
      this.laboratoryHtml(laboratoryData)
      this.queryParams.laboratoryId = value
      this.switchDisplay()
    },
    handleChange(value) {
      this.queryParams.deviceKey = value
      this.switchDisplay()
    },
    switchDisplay(isSwitch) {
      this.spinning = true

      if (isSwitch) {
        this.isTable = !this.isTable
      }
      if (this.isTable) {
        this.$refs.tableChild.getData(true)
      }
      else {
        // this.$refs.chartChild.getData();
      }
    },
    // 打印
    printFun() {
      if (!this.queryParams.laboratoryId) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请先选择检测室'))
        return
      }

      const UDRPrint = new IlisPrintUdr()
      UDRPrint.printLedger('LaboratoryEnvironment', this.queryParams || {})
    },
    // 导出
    exportFun() {
      if (!this.queryParams.laboratoryId) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请先选择检测室'))
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
    loadSuccess() {
      this.spinning = false
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
.switch-btn {
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
  padding: 5px 0;
}
</style>
