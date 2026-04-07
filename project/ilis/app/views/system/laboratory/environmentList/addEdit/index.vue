<template>
  <a-form ref="formRef" :model="formState">
    <a-row>
      <a-col :span="8">
        <a-form-item
          :label-col="{ span: 8 }"
          label="检测室"
        >
          <a-select
            v-model:value="formState.laboratoryId"
            placeholder="请选择检测室"
            style="width: 195px"
            @change="onChangeType"
          >
            <a-select-option
              v-for="item in treeData"
              :key="item.id"
              :value="item.id"
            >
              {{ item.name }}
            </a-select-option>
          </a-select>
          <span class="ml-2"> {{ valueRemark }} </span>
        </a-form-item>
      </a-col>
      <a-col :span="8">
        <a-form-item
          label="检测参数"
        >
          <a-select
            v-model:value="formState.testObjectParamId"
            placeholder="请选择检测参数"
            style="width: 195px"
            @change="onChangeParam"
          >
            <a-select-option
              v-for="item in testObjectParams"
              :key="item.testObjectParamId"
              :value="item.testObjectParamId"
            >
              {{ item.testObjectParamDisplayName }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-col>
      <a-col :span="8">
        <a-form-item
          v-bind="formItemLayout"
          label="开始使用时间"
        >
          <a-date-picker
            v-model:value="formState.beginUseTime"
            show-time
            :value-format="fmt"
            @ok="timeOKChange"
          />
        </a-form-item>
      </a-col>
    </a-row>
    <a-row>
      <a-col :span="8">
        <a-form-item
          v-bind="formItemLayout"
          label="截止使用时间"
          :label-col="{ span: 8 }"
        >
          <a-date-picker
            v-model:value="formState.endUseTime"
            show-time
            :value-format="fmt"
            style="width: 195px"
            @ok="timeOKChange"
          />
        </a-form-item>
      </a-col>
      <a-col :span="8">
      </a-col>
      <a-col :span="8">
        <a-form-item
          v-bind="formItemLayout"
          label="记录时间"
        >
          <a-date-picker
            v-model:value="formState.recordTime"
            show-time
            :value-format="fmt"
          />
        </a-form-item>
      </a-col>
    </a-row>
    <a-row>
      <a-col :span="8">
        <a-form-item
          v-bind="formItemLayout"
          label="温度要求(°C)"
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 16 }"
        >
          <a-input-number
            v-model:value="formState.minTemperature"
            class="inputWith"
          />
          -
          <a-input-number
            v-model:value="formState.maxTemperature"
            class="inputWith"
          />
          <a-tooltip
            placement="top"
            title="若无要求则不填，若只有上限或下限则只填写上限或下限"
          >
            <QuestionCircleOutlined
              style="font-size: 14px;margin-left: 4px;vertical-align: middle;"
            />
          </a-tooltip>
        </a-form-item>
      </a-col>
      <a-col :span="8">
      </a-col>
      <a-col :span="8">
        <a-form-item
          v-bind="formItemLayout"
          label="湿度要求(%RH)"
          :wrapper-col="{ span: 16 }"
        >
          <a-input-number
            v-model:value="formState.minHumidity"
            class="inputWith"
          />
          -
          <a-input-number
            v-model:value="formState.maxHumidity"
            class="inputWith"
          />
          <a-tooltip
            placement="top"
            title="若无要求则不填，若只有上限或下限则只填写上限或下限"
          >
            <QuestionCircleOutlined
              style="font-size: 14px;margin-left: 4px;vertical-align: middle;"
            />
          </a-tooltip>
        </a-form-item>
      </a-col>
    </a-row>
    <a-row>
      <a-col :span="8">
        <a-form-item
          v-bind="formItemLayout"
          label="试验时温度(°C)"
          :rules="[{ required: true, message: '请输入试验时温度' }]"
          name="temperatureWhenTest"
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 16 }"
        >
          <a-input-number
            v-model:value="formState.temperatureWhenTest"
            style="width: 195px"
            @change="
              (value) => {
                checkData('temperatureWhenTest', value)
              }
            "
          />
        </a-form-item>
      </a-col>
      <a-col :span="8">
      </a-col>
      <a-col :span="8">
        <a-form-item
          v-bind="formItemLayout"
          label="试验时湿度(%RH)"
          :rules="[{ required: true, message: '请输入试验时湿度' }]"
          name="humidityWhenTest"
        >
          <a-input-number
            v-model:value="formState.humidityWhenTest"
            style="width: 195px"
            @change="
              (value) => {
                checkData('humidityWhenTest', value)
              }
            "
          />
        </a-form-item>
      </a-col>
    </a-row>
    <div>
      <div class="table-header">
        检测室当日环境记录：<span v-if="conflict">注意：当前登记的温湿度与检测室当日记录中温湿度要求有冲突！</span>
      </div>
      <a-table
        :loading="loading"
        bordered
        :data-source="data"
        row-key="id"
        :columns="columns"
        :pagination="false"
        :row-class-name="rowClassName"
      >
        <template #bodyCell="{ column, record, text }">
          <template v-if="column.dataIndex === 'temperature'">
            <template v-if="record.minTemperature && !record.maxTemperature">
              <span
                :class="{
                  active: record.temperatureConflict ? true : false,
                }"
              >
                ≥{{ record.minTemperature }}
              </span>
            </template>
            <template
              v-else-if="!record.minTemperature && record.maxTemperature"
            >
              <span
                :class="{
                  active: record.temperatureConflict ? true : false,
                }"
              >
                ≤{{ record.maxTemperature }}
              </span>
            </template>
            <template
              v-else-if="record.minTemperature && record.maxTemperature"
            >
              <span
                :class="{
                  active: record.temperatureConflict ? true : false,
                }"
              >
                {{ record.minTemperature }} - {{ record.maxTemperature }}
              </span>
            </template>
            <template v-else>
              <span
                :class="{
                  active: record.temperatureConflict ? true : false,
                }"
              >
                /
              </span>
            </template>
          </template>

          <template v-if="column.dataIndex === 'humidity'">
            <template v-if="record.minHumidity && !record.maxHumidity">
              <span
                :class="{
                  active: record.humidityConflict ? true : false,
                }"
              >
                ≥{{ record.minHumidity }}
              </span>
            </template>
            <template v-else-if="!record.minHumidity && record.maxHumidity">
              <span
                :class="{
                  active: record.humidityConflict ? true : false,
                }"
              >
                ≤{{ record.maxHumidity }}
              </span>
            </template>
            <template v-else-if="record.minHumidity && record.maxHumidity">
              <span
                :class="{
                  active: record.humidityConflict ? true : false,
                }"
              >
                {{ record.minHumidity }} - {{ record.maxHumidity }}
              </span>
            </template>
            <template v-else>
              <span
                :class="{
                  active: record.humidityConflict ? true : false,
                }"
              >
                /
              </span>
            </template>
          </template>

          <template v-if="column.dataIndex === 'temperatureWhenTest'">
            <span
              :class="{
                active: record.temperatureConflict ? true : false,
              }"
            >{{ text }}</span>
          </template>

          <template v-if="column.dataIndex === 'humidityWhenTest'">
            <span :class="{ active: record.humidityConflict ? true : false }">{{ text }}</span>
          </template>
        </template>
      </a-table>
    </div>
  </a-form>
</template>

<script>
import { QuestionCircleOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { ajaxRequest, formatTime } from '~/providers/common/utils.js'
import { getTaskTestObject } from './api.ts'
import { IotDataRequest } from './iotDataRequest.ts'

function formatTimeHtml({ text }) {
  // return text ? formatTime(text, 'YYYY-MM-DD HH:mm:ss') : '';
  return text ? formatTime(text, 'YYYY-MM-DD HH:mm:ss') : ''
}
const columns = [
  {
    title: '开始使用时间',
    dataIndex: 'beginUseTime',
    customRender: formatTimeHtml,
  },
  {
    title: '截止使用时间',
    dataIndex: 'endUseTime',
    customRender: formatTimeHtml,
  },
  { title: '记录时间', dataIndex: 'recordTime', customRender: formatTimeHtml },
  {
    title: '温度要求(°C)',
    dataIndex: 'temperature',
    scopedSlots: { customRender: 'temperature' },
  },
  {
    title: '试验时温度(°C)',
    dataIndex: 'temperatureWhenTest',
    scopedSlots: { customRender: 'temperatureWhenTest' },
  },
  {
    title: '湿度要求(%RH)',
    dataIndex: 'humidity',
    scopedSlots: { customRender: 'humidity' },
  },
  {
    title: '试验时湿度(%RH)',
    dataIndex: 'humidityWhenTest',
    scopedSlots: { customRender: 'humidityWhenTest' },
  },
  { title: '记录人', dataIndex: 'createName' },
  { title: '任务编号', dataIndex: 'testTaskSn' },
]
export default {
  name: 'AddEdit',
  components: {
    QuestionCircleOutlined,
  },
  props: ['editId', 'callback', 'visibleRules'],
  data() {
    return {
      columns,
      data: [],
      queryParams: {},
      conflict: false,
      fmt: 'YYYY-MM-DD HH:mm:ss',
      standardTypeIdEdit: '',
      treeData: [],
      valueRemark: '',
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
      initalDate: new Date(),
      loading: false,
      formState: {
        beginUseTime: null,
        endUseTime: null,
        recordTime: null,
      },
      testObjectParams: [],
      testObjectParamId: '',
      testObjectParamDisplayName: '',
      iotEqId: '',
      iotDataRequest: {},
      webSocketData: {},
    }
  },
  watch: {
    visibleRules(data) {
      if (data === true) {
        if (this.editId) {
          this.getEditData()
        }
        else {
          this.getTreeData()
          this.formState = {}
          this.formState.beginUseTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
          this.formState.endUseTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
          this.formState.recordTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
        }
      }
    },
    formState(data) {
      if (data.laboratoryId && this.queryParams.beginUseTime) {
        this.queryParams.laboratoryId = data.laboratoryId
        this.getData(this.queryParams)
      }
    },
    queryParams(queryParams) {
      if (this.formState.laboratoryId && queryParams.beginUseTime) {
        this.queryParams.laboratoryId = this.formState.laboratoryId
        this.getData(queryParams)
      }
    },
  },
  created() {
    this.getTestObjectParams()
    this.iotDataRequest = new IotDataRequest() // 创建网络请求对象
    if (this.editId) {
      this.getEditData()
    }
    else {
      this.getTreeData()
      this.formState.beginUseTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
      this.formState.endUseTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
      this.formState.recordTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
    }
  },
  methods: {
    dayjs,
    formatTime,
    ajaxRequest,
    // 新增获取下拉试验参数
    async getTestObjectParams() {
      const testTask = JSON.parse(localStorage.getItem('vue_testTask'))
      const res = await getTaskTestObject(testTask.testTaskId)
      this.testObjectParams = res.data[0].testObjectParams.map((item) => {
        return {
          testObjectParamId: item.testParamId,
          testObjectParamDisplayName: item.testParamDisplayName,
        }
      })
    },
    // 获取物联网设备数据
    listenIotData(listData) {
      const lData = []
      listData.forEach((item, index) => {
        if (item.iotEqId) {
          lData.push({
            entityType: 'DEVICE',
            entityId: item.iotEqId,
            cmdId: index,
          })
        }
      })

      if (lData.length === 0) {
        this.iotDataRequest.closeWebSocket()
        return
      }

      this.iotDataRequest.listenDataUpdate(lData, (res) => {
        const data = res.data
        const temperature = data.temperature
        const humidity = data.humidity

        if (temperature && temperature.length > 0) {
          this.webSocketData.tem = Number.parseFloat(temperature[0][1])
          this.formState.temperatureWhenTest = this.webSocketData.tem
        }
        else {
          this.webSocketData.tem = undefined
        }

        if (humidity && humidity.length > 0) {
          this.webSocketData.hum = Number.parseFloat(humidity[0][1])
          this.formState.humidityWhenTest = this.webSocketData.hum
        }
        else {
          this.webSocketData.hum = undefined
        }
        if (this.webSocketData.tem !== undefined) {
          const minTemperature = data.info?.minTemperature
          const maxTemperature = data.info?.maxTemperature

          if (
            minTemperature === undefined
            || minTemperature === null
            || maxTemperature === undefined
            || maxTemperature === null
          ) {
            this.webSocketData.temStatus = undefined
          }
          else if (
            this.webSocketData.tem >= data?.info?.minTemperature
            && this.webSocketData.tem <= data?.info?.maxTemperature
          ) {
            this.webSocketData.temStatus = '达标'
          }
          else {
            this.webSocketData.temStatus = '超标'
          }
        }
        else {
          this.webSocketData.temStatus = undefined
        }

        if (this.webSocketData.hum !== undefined) {
          const minHumidity = data?.info?.minHumidity
          const maxHumidity = data?.info?.maxHumidity

          if (
            minHumidity === undefined
            || minHumidity === null
            || maxHumidity === undefined
            || maxHumidity === null
          ) {
            this.webSocketData.humStatus = undefined
          }
          else if (
            this.webSocketData.hum >= data?.info?.minHumidity
            && this.webSocketData.hum <= data?.info?.maxHumidity
          ) {
            this.webSocketData.humStatus = '达标'
          }
          else {
            this.webSocketData.humStatus = '超标'
          }
        }
        else {
          this.webSocketData.humStatus = undefined
        }
      })
    },

    onChangeParam(value) {
      const data = this.testObjectParams.find(item => item.testObjectParamId === value) || {}
      if (data) {
        this.formState.testObjectParamDisplayName = data.testObjectParamDisplayName
        this.formState.testObjectParamId = data.testObjectParamId
      }
    },
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    getData(formData) {
      this.loading = true
      ajaxRequest(
        window.$oApi.environment.tableUrl,
        window.$oQs.stringify(formData),
        this.getDataCall,
      )
    },
    // 编辑时获取试验参数
    getTestParam(records) {
      const record = records.find((item) => {
        return item.id === this.editId
      })
      if (record) {
        this.formState.testObjectParamId = record.testObjectParamId
        this.formState.testObjectParamDisplayName = record.testObjectParamDisplayName
      }
    },
    getDataCall(res) {
      this.getTestParam(res.rows)
      this.loading = false
      if (res.rows) {
        this.data = res.rows
        if (this.editId) {
          this.checkData()
        }
      }
      else if (res.msg) {
        window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
      }
    },
    getEditData() {
      const data = {
        id: this.editId,
      }
      ajaxRequest(
        window.$oApi.environment.editUrl,
        window.$oQs.stringify(data),
        this.getEditDataCall,
      )
    },
    getEditDataCall(res) {
      if (res.success) {
        this.formState = res.obj || {}
        this.formState.beginUseTime = dayjs(this.formState.beginUseTime).format('YYYY-MM-DD HH:mm:ss')
        this.formState.endUseTime = dayjs(this.formState.endUseTime).format('YYYY-MM-DD HH:mm:ss')
        this.formState.recordTime = dayjs(this.formState.recordTime).format('YYYY-MM-DD HH:mm:ss')
        this.queryParams = {
          beginUseTime: this.formState.beginUseTime,
          endUseTime: this.formState.endUseTime,
          laboratoryId: this.formState.laboratoryId,
        }
        // 实验室当日环境记录
        this.getData(this.queryParams)
        this.getTreeData()
      }
    },
    checkData(field, value) {
      const data = { ...this.formState }
      if (field) {
        data[field] = value
      }

      let flag = true

      this.data = this.data.map((item) => {
        const time1 = new Date(data.beginUseTime).getTime()
        const time2 = new Date(data.endUseTime).getTime()
        const temperatureConflict = data.temperatureWhenTest
          ? this.isNumIntersection(
              data.temperatureWhenTest,
              item.minTemperature,
              item.maxTemperature,
            )
          : false
        const humidityConflict = data.humidityWhenTest
          ? this.isNumIntersection(
              data.humidityWhenTest,
              item.minHumidity,
              item.maxHumidity,
            )
          : false

        if (
          this.isDateIntersection(
            time1,
            time2,
            item.beginUseTime,
            item.endUseTime,
          )
          && (temperatureConflict || humidityConflict)
        ) {
          this.conflict = true
          flag = false
          return {
            ...item,
            temperatureConflict: !!temperatureConflict,
            humidityConflict: !!humidityConflict,
          }
        }
        else {
          return {
            ...item,
            temperatureConflict: false,
            humidityConflict: false,
          }
        }
      })

      if (flag) {
        this.conflict = false
      }
    },
    isNumIntersection(value, min, max) {
      if (!min && !max) {
        return false
      }
      else if (!min && max && value <= max) {
        return false
      }
      else if (!max && min && value >= min) {
        return false
      }
      else if (value >= min && value <= max) {
        return false
      }
      else {
        return true
      }
    },
    isDateIntersection(startdate1, enddate1, startdate2, enddate2) {
      if (startdate1 >= startdate2 && startdate1 <= enddate2) {
        return true
      }
      if (enddate1 >= startdate2 && enddate1 <= enddate2) {
        return true
      }
      if (startdate1 <= startdate2 && enddate1 >= enddate2) {
        return true
      }
      return false
    },
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
        this.treeData = res.rows
      }
    },
    onChangeType(value) {
      const rowData = this.treeData.find(item => item.id == value)
      this.iotEqId = rowData.iotEqId
      this.listenIotData([{ iotEqId: rowData.iotEqId }])
      this.valueRemark = rowData.remark ? `备注：${rowData.remark}` : ''
      this.formState.minTemperature = rowData.minTemperature || ''
      this.formState.maxTemperature = rowData.maxTemperature || ''
      this.formState.minHumidity = rowData.minHumidity || ''
      this.formState.maxHumidity = rowData.maxHumidity || ''
    },
    // 开始时间与结束时间比对
    timeCompare() {
      if (this.queryParams.beginUseTime || this.queryParams.endUseTime) {
        const beginUseTime2 = new Date(this.queryParams.beginUseTime).valueOf()
        const endUseTime2 = new Date(this.queryParams.endUseTime).valueOf()

        if (beginUseTime2 >= endUseTime2) {
          window.$oAntdModal.warning(window.$oMsgTips.info('开始使用时间需要小于截止使用时间'))
          return false
        }
        else if (endUseTime2 < beginUseTime2) {
          window.$oAntdModal.warning(window.$oMsgTips.info('截止使用时间需要大于开始使用时间'))
          return false
        }
      }
      return true
    },
    // 时间变化后获取数据
    timeOKChange() {
      const listV = { ...this.formState }
      const beginUseTime = listV.beginUseTime || ''
      const endUseTime = listV.endUseTime || ''
      this.queryParams = {
        beginUseTime,
        endUseTime,
        laboratoryId: listV.laboratoryId,
      }
      if (this.timeCompare()) {
        if (beginUseTime && listV.laboratoryId) {
          this.getData(this.queryParams)
        }
      }
    },
    handleSubmit() {
      const testTask = JSON.parse(localStorage.getItem('vue_testTask'))
      this.$refs.formRef.validateFields().then(() => {
        const fieldsValue = { ...this.formState }
        const data = {
          ...fieldsValue,
          testTaskId: testTask.testTaskId, // 必填
          testTaskSn: testTask.testTaskSn,
          testObjectParamId: this.formState.testObjectParamId,
          testObjectParamDisplayName: this.formState.testObjectParamDisplayName,
        }
        delete data.createDate
        delete data.updateDate

        if (this.editId) {
          data.id = this.editId
        }
        if (this.timeCompare()) {
          ajaxRequest(
            window.$oApi.environment.saveUrl,
            window.$oQs.stringify(data),
            this.saveCall,
          )
        }
      })
    },
    clearValidate() {
      this.$refs.formRef.clearValidate()
    },
    saveCall(res) {
      if (res.success) {
        message.success('保存成功')
        this.formState = {}
        this.valueRemark = ''
        this.queryParams = {}
        this.data = []
        this.conflict = false
        this.callback(res)
      }
      else {
        window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
      }
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
