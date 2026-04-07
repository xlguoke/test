<template>
  <div class="sampleDetail">
    <div class="sampleDetail-detail">
      <van-sticky>
        <MobileTitleBar left-arrow @click-left="$router.go(-1)" />
        <div class="sampleDetail-detail-header">
          样品信息
          <template v-if="testObjectSn">
            ({{ testObjectSn }})
          </template>
          <span v-if="statusText" class="sampleDetail-detail-status">{{
            statusText
          }}</span>
          <span
            v-if="
              auditStatus === '10'
                || auditStatus === '20'
                || auditStatus === '30'
                || auditStatus === '40'
            "
            class="sampleDetail-detail-status"
          >{{ auditStatusObj[auditStatus] }}
          </span>
          <div
            v-if="status === '11'"
            v-permission="'objectGet'"
            class="tag-icon"
          >
            分
          </div>
        </div>
      </van-sticky>

      <div class="sampleDetail-detail-content">
        <div class="sampleDetail-detail-info">
          <div
            v-for="(info, index) in baseInfo"
            :key="index"
            :style="`${
              info.fontWeight ? 'font-weight: bold;color: #333;' : ''
            }`"
          >
            {{ info.name }}：{{ info.value }}
          </div>
        </div>

        <div v-for="(item, index) in processInfo" :key="index">
          <div class="sampleDetail-detail-title">
            <span
              v-if="String(hasSampleRoomSavedObjId) === String(parseInt(index) + 1)"
              style="float: right; color: #1e9fff"
              @click="goDetail"
            >
              <van-icon name="arrow" />
            </span>
            {{ item.title }}
            <!-- <span class="sampleDetail-detail-status" v-if="hasSampleRoomSavedObjId == parseInt(index)+1">留样到期返还</span> -->
          </div>
          <div class="sampleDetail-detail-info">
            <div v-for="(info, index2) in item.data" :key="index2">
              <div
                v-if="info.name !== 'sampleRoomSavedObjId' && info.name !== ''"
              >
                {{ info.name }}：{{ info.value }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="testResultInfo.length > 0" class="sampleDetail-detail-content">
        <div class="sampleDetail-detail-title">
          检测结果
        </div>
        <div class="sampleDetail-detail-info">
          <div v-for="(info, index) in testResultInfo" :key="index">
            {{ info.paramName }}：{{ info.testValue }}{{ info.unit }}
          </div>
        </div>
      </div>

      <div v-if="periodInfo.length > 0" class="sampleDetail-detail-content">
        <div class="sampleDetail-detail-title">
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
          <div class="sampleDetail-detail-info">
            <div v-for="(item, index2) in info.data" :key="index2">
              {{ item.name }}：{{ item.value }}
            </div>
          </div>
        </div>
      </div>

      <!-- <van-button type="primary" class="sampleDetail-detail-btn">确认入库</van-button> -->
      <template v-if="!isScanEnter">
        <router-link
          v-if="status === '00'"
          v-permission="'mobile_receiveSample'"
          :to="`/samples/receiveTestSample/${id}`"
        >
          <van-button type="primary" class="sampleDetail-detail-btn">
            领取样品
          </van-button>
        </router-link>

        <router-link
          v-if="status === '00'"
          v-permission="'mobile_subpackageSample'"
          :to="`/samples/subpackage/${id}`"
        >
          <van-button type="primary" class="sampleDetail-detail-btn">
            分包样品
          </van-button>
        </router-link>

        <!-- <router-link
        :to="{ name:'addTest', params:{ id } }"
        v-if="status==='0'"
      >
        <van-button type="primary" class="sampleDetail-detail-btn">制件登记/龄期登记</van-button>
      </router-link> -->

        <router-link
          v-if="status === '0'"
          v-permission="'mobile_completeTest'"
          :to="{ name: 'handleSample', params: { id } }"
        >
          <van-button type="primary" class="sampleDetail-detail-btn">
            完成试验
          </van-button>
        </router-link>

        <van-button
          v-if="status === '2' || status === '1'"
          v-permission="'mobile_sampleHandle'"
          type="primary"
          class="sampleDetail-detail-btn"
          :disabled="auditStatus === '10'"
          @click="handleSample"
        >
          留样处理
        </van-button>
      </template>
      <!-- <van-button type="primary" class="sampleDetail-detail-btn">留样延期</van-button> -->
      <van-button
        v-else
        type="primary"
        class="sampleDetail-detail-btn"
        :loading="startLoading"
        loading-text="开始试验"
        @click="startTest"
      >
        开始试验
      </van-button>
    </div>
  </div>
</template>

<script>
import qs from 'qs'
import { showNotify } from 'vant'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { useAppPageStateStore } from '~/views/mobileApp/store/useAppPageStateStore'

const dateType = {
  D: '天',
  M: '月',
  Y: '年',
}

const baseInfoFields = [
  { name: '样品名称', field: 'sampleName', fontWeight: true },
  { name: '资质类型', field: 'qualification', fontWeight: true },
  { name: '检测参数', field: 'paramName', fontWeight: true },
  { name: '试验规程', field: 'stdGist', fontWeight: true },
  { name: '评定标准', field: 'stdStandard', fontWeight: true },
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
  { name: '龄期到期', field: 'dateExpire' },
  { name: '制件人', field: 'producer' },
  { name: '制样情况', field: 'description' },
  // { name: "样品照片", field: "appiontSaveDays" }
]
const statusTextObj = {
  '00': '待检测',
  '0': '检测中',
  '1': '收样处留样',
  '2': '测后留样',
  '3': '测后废弃',
  '4': '留样到期废弃',
  '5': '留样到期返还',
  '6': '提前废弃',
  '7': '提前返还',
  '8': '利用',
  '9': '提前利用',
  '10': '作废',
}
const auditStatusObj = {
  10: '留样处理审核中',
  20: '留样处理审核中断',
  30: '留样处理审核通过',
  40: '留样处理审核不通过',
}

export default {
  components: {
    MobileTitleBar,
  },
  beforeRouteLeave(to, from, next) {
    if (to.name === 'samples' && this.isSubmit === true) {
      const pageState = useAppPageStateStore().getPage(to.name)
      pageState.resetPage = true
    }
    next()
  },
  data() {
    return {
      id: this.$route.params.id,
      testObjectId: undefined,
      isSubmit: this.$route.params.isSubmit,
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
      auditType: null,
      auditStatusObj,
      recordVos: [],
      isScanEnter: false,
      startLoading: false,
    }
  },
  watch: {
    $route(to, from) {
      if (
        to.name === 'sampleDetail'
        && from.name === 'sampleDetail'
        && to.params.id !== from.params.id
      ) {
        this.$router.go(0)
      }
    },
  },
  created() {
    this.isScanEnter = String(this.$route.query.isScanEnter) === '1'
    this.getBaseInfo()
    this.getProcessInfo()
    this.getTestResultInfo()
    this.getPeriodInfo()
  },
  methods: {
    getBaseInfo() {
      mRequest({
        method: 'GET',
        url: api.sampleManageApp.baseInfo,
        params: {
          id: this.id,
        },
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).then((res) => {
        if (res.code && res.code !== 20010) {
          let isSampleRetention = false
          this.testObjectId = res.data.testObjectId
          this.recordVos = res.data.recordVos || []
          let baseInfo = []
          if (res.data && JSON.stringify(res.data) !== '{}') {
            baseInfo = baseInfoFields.map((item) => {
              let value = res.data[item.field]
              if (item.field === 'isRetentionSample') {
                isSampleRetention = value
                value = res.data[item.field] ? '是' : '否'
              }
              else if (item.field === 'appiontSaveDays') {
                if (res.data[item.field]) {
                  value
                    = (res.data[item.field] || '')
                      + (dateType[res.data.retentionTimeUnit] || '')
                }
                else {
                  value = ''
                }
              }
              return {
                name: item.name,
                value,
                fontWeight: item.fontWeight,
              }
            })
          }
          if (!isSampleRetention) {
            baseInfo.pop()
          }
          this.baseInfo = baseInfo
          this.status = res.data.status
          this.testObjectSn = res.data.testObjectSn

          this.statusText = statusTextObj[this.status]

          if (res.data.auditInfo && res.data.auditInfo.status) {
            this.auditStatus = res.data.auditInfo.status
            this.auditType = res.data.auditInfo.type
          }
        }
        else {
          this.baseInfo = []
        }
      })
    },
    getProcessInfo() {
      mRequest({
        method: 'GET',
        url: api.sampleManageApp.processInfo,
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
                  if (item.orderNum === 2 && key === '留样时间') {
                    // let lyDate = parseInt(value) + 90 * 24 * 60 * 60 * 1000;
                    const day = Number.parseInt(item.data['留样期限'] || 0)
                    const lyDate = Number.parseInt(value) + day * 24 * 60 * 60 * 1000
                    this.lyDate = lyDate
                  }
                  if (
                    key === '留样时间'
                    || key === '处理时间'
                    || key === '领取时间'
                    || key === '废弃时间'
                    || key === '留样到期时间'
                  ) {
                    if (typeof value === 'string') {
                      // value = value
                    }
                    else {
                      value = value ? formatDate(value, 'YYYY-MM-DD') : ''
                    }
                  }
                  if (key === 'sampleRoomSavedObjId') {
                    this.hasSampleRoomSavedObjId = item.orderNum
                    this.sampleRoomSavedObjId = value
                  }

                  if (
                    item.dataName.includes('留样处理方式')
                    && value === null
                  ) {
                    key = ''
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
      mRequest({
        method: 'GET',
        url: api.sampleManageApp.testResultInfo,
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
      mRequest({
        method: 'GET',
        url: api.sampleManageApp.periodInfo,
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
              // dateExpire //
              return {
                title: `制件${index + 1} (${item.processObjectSn}-${
                  index + 1
                })`,
                data: periodInfoFields.map((info) => {
                  let value = item[info.field]
                  if (info.name === '龄期到期' && item.formingDate) {
                    let stamp = new Date(item.formingDate).getTime()
                    stamp = stamp + (item.days || 0) * 24 * 60 * 60 * 1000
                    value = formatDate(new Date(stamp), 'YYYY-MM-DD')
                  }
                  return {
                    name: info.name,
                    value,
                  }
                }),
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
      if (this.auditStatus === '30') {
        this.$router.push({
          name: 'expireHandle',
          params: { id: this.id, early: true, auditType: this.auditType },
        })
      }
      else {
        if (!this.lyDate && this.status === '1') {
          const record = this.recordVos.find(
            item => item.operationType === this.status,
          )
          this.lyDate = record.reserveExpireTime || 0
        }

        let name = 'earlyHandle'
        if (new Date().getTime() > this.lyDate) {
          name = 'expireHandle'
        }
        this.$router.push({
          name,
          params: { id: this.id },
        })
      }
    },
    goDetail() {
      // top.location.href = `${window.location.origin}/sampleManageApp.html?id=${this.sampleRoomSavedObjId}`;
      this.$router.push({
        name: 'sampleDetail',
        params: {
          id: this.sampleRoomSavedObjId,
        },
      })
    },
    // 开始试验
    startTest() {
      this.startLoading = true
      mRequest
        .post(
          api.testManage.testTaskUrl,
          qs.stringify({
            testObjectId: this.testObjectId,
            page: 1,
            rows: 10,
          }),
          {
            params: {
              type: 1,
              queryScope: 'user',
            },
          },
        )
        .then((res) => {
          this.startLoading = false
          if (res && res.rows && res.rows.length > 0) {
            if (res.rows.length === 1) {
              const item = res.rows[0]
              const sampleInfo = {
                sampleName: item.testSampleDisplayName,
                testObjectCode: item.testObjectCode,
                testTaskCode: item.testTaskCode,
                testRecordCode: item.testRecordCode,
                standard: item.standard,
              }
              this.$router.push({
                name: 'testTaskDetail',
                query: {
                  id: item.id,
                  sampleInfo: encodeURIComponent(JSON.stringify(sampleInfo)),
                },
              })
            }
            else {
              this.$router.push({
                name: 'testTask',
                query: {
                  sampleId: this.id,
                },
              })
            }
          }
          else {
            showNotify({
              type: 'danger',
              message: res.msg || res.message || '未查到相关任务',
            })
          }
        })
        .catch((err) => {
          this.startLoading = false
          showNotify({
            type: 'danger',
            message: err.msg || err.message || '系统异常，请稍后重试',
          })
        })
    },
  },
}
</script>

<style lang="less" scoped>
@import url('./index.less');
</style>
