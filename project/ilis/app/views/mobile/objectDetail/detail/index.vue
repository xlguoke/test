<!-- eslint-disable vue/eqeqeq -->
<template>
  <div class="sampleManageApp-detail">
    <div class="sampleManageApp-detail-header">
      样品信息（{{ testObjectSn }}）
      <span v-if="statusText" class="sampleManageApp-detail-status">{{ statusText }}</span>
      <span v-if="auditStatus == '10'" class="sampleManageApp-detail-status">{{
        auditStatusObj[auditStatus]
      }}</span>
    </div>

    <div class="sampleManageApp-detail-content">
      <div class="sampleManageApp-detail-info">
        <div v-for="(info, index) in baseInfo" :key="index">
          {{ info.name }}：{{ info.value }}
        </div>
      </div>

      <div v-for="(item, index) in processInfo" :key="index">
        <div class="sampleManageApp-detail-title">
          <span
            v-if="hasSampleRoomSavedObjId == parseInt(index) + 1"
            style="float: right; color: #1e9fff"
            @click="goDetail"
          >
            <RightOutlined />
          </span>
          {{ item.title }}
          <!-- <span class="sampleManageApp-detail-status" v-if="hasSampleRoomSavedObjId == parseInt(index)+1">留样到期返还</span> -->
        </div>
        <div class="sampleManageApp-detail-info">
          <div v-for="(info, index) in item.data" :key="index">
            <div v-if="info.name != 'sampleRoomSavedObjId'">
              {{ info.name }}：{{ info.value }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="testResultInfo.length > 0"
      class="sampleManageApp-detail-content"
    >
      <div class="sampleManageApp-detail-title">
        检测结果
      </div>
      <div class="sampleManageApp-detail-info">
        <div v-for="(info, index) in testResultInfo" :key="index">
          {{ info.paramName }}：{{ info.testValue }}{{ info.unit }}
        </div>
      </div>
    </div>

    <div v-if="periodInfo.length > 0" class="sampleManageApp-detail-content">
      <div class="sampleManageApp-detail-title">
        制件信息
      </div>
      <div v-for="(info, index) in periodInfo" :key="index">
        <div
          style="
            padding-left: 15px;
            padding-top: 10px;
            border-bottom: solid 1px #e2e2e2;
            border-top: solid 1px #e2e2e2;
            padding-bottom: 10px;
          "
        >
          {{ info.title }}
        </div>
        <div class="sampleManageApp-detail-info">
          <div v-for="(item, index2) in info.data" :key="index2">
            {{ item.name }}：{{ item.value }}
          </div>
        </div>
      </div>
    </div>

    <!-- <a-button type="primary" class="sampleManageApp-detail-btn">确认入库</a-button> -->

    <router-link
      v-if="status == '00'"
      :to="{ name: 'receiveTest', params: { id } }"
    >
      <a-button type="primary" class="sampleManageApp-detail-btn">
        领取样品
      </a-button>
    </router-link>

    <!-- <router-link
        :to="{ name:'addTest', params:{ id } }"
        v-if="status=='0'"
      >
        <a-button type="primary" class="sampleManageApp-detail-btn">制件登记/龄期登记</a-button>
      </router-link> -->

    <router-link
      v-if="status == '0'"
      :to="{ name: 'handleSample', params: { id } }"
    >
      <a-button type="primary" class="sampleManageApp-detail-btn">
        完成试验
      </a-button>
    </router-link>

    <a-button
      v-if="status == '2'"
      type="primary"
      class="sampleManageApp-detail-btn"
      :disabled="auditStatus == '10'"
      @click="handleSample"
    >
      留样处理
    </a-button>
    <!-- <a-button type="primary" class="sampleManageApp-detail-btn">留样延期</a-button> -->
  </div>
</template>

<script>
/* eslint-disable eqeqeq */
import { RightOutlined } from '@ant-design/icons-vue'
import mAjax from '~/providers-moblie/common/ajax'
import mApi from '~/providers-moblie/common/api'
import { formatTime, getQueryVariable } from '~/providers-moblie/common/utils'

const dateType = {
  D: '天',
  M: '月',
  Y: '年',
}

const baseInfoFields = [
  { name: '样品名称', field: 'sampleName' },
  { name: '资质类型', field: 'qualification' },
  { name: '检测参数', field: 'paramName' },
  { name: '试验规程', field: 'stdGist' },
  { name: '评定标准', field: 'stdStandard' },
  { name: '规格型号', field: 'standard' },
  { name: '样品数量', field: 'sampleNum' },
  { name: '收样时间', field: 'receiveSampleDate' },
  { name: '收样人员', field: 'receiveSampleUser' },
  { name: '试验人员', field: 'testUser' },
  { name: '要求报告时间', field: 'requireReportDate' },
  { name: '约定测后样品处理', field: 'sampleProcessMethod' },
  { name: '是否需要留样', field: 'isRetentionSample' },
  { name: '约定留样期限', field: 'appiontSaveDays' },
]
const periodInfoFields = [
  { name: '制件编号', field: 'processObjectSn' },
  { name: '检测参数', field: 'testParamName' },
  { name: '龄期', field: 'days' },
  { name: '制件时间', field: 'formingDate' },
  { name: '龄期到期', field: 'date' },
  { name: '制件人', field: 'appiontSaveDays' },
  { name: '制样情况', field: 'description' },
  // { name: "样品照片", field: "appiontSaveDays" }
]
const statusTextObj = {
  '00': '待检测',
  '0': '检测中',
  '2': '测后留样',
  '3': '测后废弃',
  '4': '留样到期废弃',
  '5': '留样到期返还',
}
const auditStatusObj = {
  10: '审核中',
  20: '审核中断',
  30: '审核通过',
  40: '审核不通过',
}

export default {
  components: {
    RightOutlined,
  },
  data() {
    return {
      id: getQueryVariable('id'),
      baseInfo: [],
      processInfo: [],
      testResultInfo: [],
      periodInfo: [],
      sampleHandleType: 'earlyHandle',
      status: '',
      statusText: '',
      expireDate: '',
      testObjectSn: '',
      lyDate: '',
      hasSampleRoomSavedObjId: false,
      sampleRoomSavedObjId: '',
      auditStatus: null,
      auditStatusObj,
    }
  },
  created() {
    this.getBaseInfo()
    this.getProcessInfo()
    this.getTestResultInfo()
    this.getPeriodInfo()
  },
  methods: {
    getBaseInfo() {
      mAjax({
        method: 'GET',
        url: mApi.sampleManageApp.baseInfo,
        params: {
          id: this.id,
        },
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).then((res) => {
        if (res.code && res.code !== 20010) {
          let baseInfo = []
          if (res.data && JSON.stringify(res.data) != '{}') {
            // baseInfo = baseInfoFields.map(item=>{
            //   // let value = res.data[item.field]
            //   // if(item.field == "stdGist"){
            //   //   value = `${res.data[item.field]}(${res.data})`
            //   // }
            //   // if(item.field == "stdStandard"){
            //   //   value = res.data[item.field]
            //   // }
            //   // if(item.field == "stdStandard"){
            //   //   value = res.data[item.field]
            //   // }
            //   return {
            //     name: item.name,
            //     value: res.data[item.field]
            //   }
            // })
            baseInfo = baseInfoFields.map((item) => {
              let value = res.data[item.field]
              if (item.field == 'isRetentionSample') {
                value = res.data[item.field] ? '是' : '否'
              }
              else if (item.field == 'appiontSaveDays') {
                if (res.data[item.field]) {
                  value
                    = res.data[item.field] + dateType[res.data.retentionTimeUnit]
                }
                else {
                  value = ''
                }
              }

              return {
                name: item.name,
                value,
              }
            })
          }
          this.baseInfo = baseInfo
          this.status = res.data.status
          this.testObjectSn = res.data.testObjectSn

          this.statusText = statusTextObj[this.status]

          if (res.data.auditInfo && res.data.auditInfo.status) {
            this.auditStatus = res.data.auditInfo.status
          }
        }
        else {
          this.baseInfo = []
        }
      })
    },
    getProcessInfo() {
      mAjax({
        method: 'GET',
        url: mApi.sampleManageApp.processInfo,
        params: {
          id: this.id,
        },
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).then((res) => {
        if (res.code && res.code !== 20010) {
          let processInfo = []
          if (res.data) {
            const data = res.data.filter(item => item.data !== null)

            processInfo = data.map((item) => {
              const keys = Object.keys(item.data)
              return {
                title: item.dataName,
                data: keys.map((key) => {
                  let value = item.data[key]
                  if (item.orderNum === 2 && key == '留样时间') {
                    const lyDate = Number.parseInt(value) + 90 * 24 * 60 * 60 * 1000
                    this.lyDate = lyDate
                  }
                  if (
                    key == '留样时间'
                    || key == '处理时间'
                    || key == '领取时间'
                    || key == '留样到期时间'
                  ) {
                    if (value == '没有指定留样期限' || String(value).includes('无法计算')) {
                      // eslint-disable-next-line no-self-assign
                      value = value
                    }
                    else {
                      value = value ? formatTime(value, 'YYYY-MM-DD') : ''
                    }
                  }
                  if (key == 'sampleRoomSavedObjId') {
                    this.hasSampleRoomSavedObjId = item.orderNum
                    this.sampleRoomSavedObjId = value
                  }
                  return {
                    name: key,
                    value,
                  }
                }),
              }
            })
          }
          this.processInfo = processInfo
        }
        else {
          this.processInfo = []
        }
      })
    },
    getTestResultInfo() {
      mAjax({
        method: 'GET',
        url: mApi.sampleManageApp.testResultInfo,
        params: {
          id: this.id,
        },
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).then((res) => {
        if (res.code && res.code !== 20010) {
          let testResultInfo = []
          if (res.data && res.data.paramValues) {
            testResultInfo.unshift({
              paramName: '报告编号',
              testValue: res.data.reportSn,
            })
            testResultInfo = [...testResultInfo, ...res.data.paramValues]
          }
          this.testResultInfo = testResultInfo
        }
        else {
          this.testResultInfo = []
        }
      })
    },
    getPeriodInfo() {
      mAjax({
        method: 'GET',
        url: mApi.sampleManageApp.periodInfo,
        params: {
          id: this.id,
        },
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).then((res) => {
        if (res.code && res.code !== 20010) {
          let periodInfo = []

          if (res.data) {
            periodInfo = res.data.map((item, index) => {
              return {
                title: `制件${index + 1} (${item.processObjectSn}-${
                  index + 1
                })`,
                data: periodInfoFields.map(info => ({
                  name: info.name,
                  value: item[info.field],
                })),
              }
            })
          }
          this.periodInfo = periodInfo
        }
        else {
          this.periodInfo = []
        }
      })
    },
    handleSample() {
      if (this.auditStatus == '30') {
        this.$router.push({
          name: 'expireHandle',
          params: { id: this.id, early: true },
        })
      }
      else {
        let name = 'earlyHandle'
        if (new Date().getTime() > this.lyDate) {
          name = 'expireHandle'
        }
        this.$router.push({ name, params: { id: this.id } })
      }
    },
    goDetail() {
      top.location.href = `${window.location.origin}/sampleManageApp.html?id=${this.sampleRoomSavedObjId}`
    },
  },
}
</script>

<style lang="less">
@import url('./index.less');
</style>
