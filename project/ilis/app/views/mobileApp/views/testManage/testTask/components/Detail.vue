<template>
  <div class="page-warp">
    <van-sticky style="position: relative; z-index: 100">
      <MobileTitleBar left-arrow title="任务详情" @click-left="$router.go(-1)" />
    </van-sticky>
    <div class="sample-card">
      <p class="title">
        {{ sampleInfo.sampleName }}
      </p>
      <ul class="content">
        <li class="sample-info">
          <span class="label">规格型号</span>
          <span class="value">{{ sampleInfo.standard }}</span>
        </li>
        <li class="sample-info">
          <span class="label">{{ term('样品编号') }}</span>
          <span class="value">{{ sampleInfo.testObjectCode }}</span>
        </li>
        <li class="sample-info">
          <span class="label">任务编号</span>
          <span class="value">{{ sampleInfo.testTaskCode }}</span>
        </li>
        <li class="sample-info">
          <span class="label">记录编号</span>
          <span class="value">{{ sampleInfo.testRecordCode }}</span>
        </li>
        <li class="sample-info">
          <span class="label">要求报告日期</span>
          <span class="value">{{ sampleInfo.requireReportDate }}</span>
        </li>
      </ul>
    </div>

    <div class="param-or-equipment clearfix">
      <p class="title">
        检测参数及设备
      </p>
      <ul :class="`param-list clearfix ${showMore ? 'show-more' : ''}`">
        <li
          v-for="(d, i) in paramList"
          :key="i"
          :class="`param-item ${paramIndex === i ? 'active' : ''}`"
          @click="changeParams(d, i)"
        >
          {{ d.displayName || d.name }}
        </li>
      </ul>
      <div
        v-show="paramList.length > 0"
        class="handle-box"
        @click="showMore = !showMore"
      >
        {{ showMore ? '收起' : '展开' }}
        <van-icon v-show="!showMore" name="arrow-down" />
        <van-icon v-show="showMore" name="arrow-up" />
      </div>
    </div>
    <div class="param-or-equipment clearfix">
      <p class="title">
        智能送样管理
      </p>
      <div v-if="sampleSendList && sampleSendList.length">
        <div
          v-for="i in (showMoreSend ? sampleSendList : sampleSendList.slice(0, 3))"
          :key="i.id"
          class="sample-card"
          style="border: 1px solid #f2f2f2"
        >
          <ul class="content">
            <li class="sample-info">
              <span class="label">送样任务编号</span>
              <span class="value">{{ i.samplingTaskCode }}</span>
            </li>
            <li class="sample-info">
              <span class="label">送样类型</span>
              <span class="value">{{ taskTypeMap[i.taskType] }}</span>
            </li>
            <li class="sample-info">
              <span class="label">创建人</span>
              <span class="value">{{ i.operator }}</span>
            </li>
            <li class="sample-info">
              <span class="label">送样状态</span>
              <span class="value">{{ i.samplingTaskStatus }}</span>
            </li>
            <li class="sample-info">
              <span class="label">功能室</span>
              <span class="value">{{ i.labName }}</span>
            </li>
            <li class="sample-info">
              <span class="label">目的地编号</span>
              <span class="value">{{ i.positionCodeName }}</span>
            </li>
            <li class="sample-info">
              <span class="label">要求送达时间</span>
              <span class="value">{{ i.requireReportDate || '-' }}</span>
            </li>
            <div style="text-align: right">
              <van-button
                v-if="['CREATED', 'PENDING'].includes(i.status)"
                size="mini"
                type="danger"
                @click="handleCancle(i)"
              >
                取消送样
              </van-button>
              <van-button
                v-if="['PENDING'].includes(i.status)"
                size="mini"
                type="primary"
                @click="handleConfirm(i)"
              >
                送达确认
              </van-button>
              <van-button
                size="mini"
                type="primary"
                @click="
                  showSampleSendLog = true;
                  currentSampleSendLogId = i.id;
                "
              >
                进度跟踪
              </van-button>
            </div>
          </ul>
        </div>
      </div>
      <van-empty v-else description="暂无数据" image-size="80"></van-empty>
      <div
        v-if="sampleSendList.length > 3"
        class="handle-box"
        @click="showMoreSend = !showMoreSend"
      >
        {{ showMoreSend ? '收起' : '展开' }}
        <van-icon v-show="!showMoreSend" name="arrow-down" />
        <van-icon v-show="showMoreSend" name="arrow-up" />
      </div>
    </div>

    <div class="param-handle">
      <van-checkbox
        v-model="selectedAll"
        icon-size="18px"
        shape="square"
        @click="changeSelectedAll"
      >
        全选
      </van-checkbox>
      <span class="del" @click="batchDel">批量删除</span>
      <p v-show="paramList.length > 0" class="scan-btn">
        <span @click="scanAddEq">扫描添加</span>
      </p>
    </div>

    <div class="equipment-list">
      <van-checkbox-group v-model="selectedEq">
        <div v-for="(d, i) in equipmentList" :key="i" class="equipment-item">
          <span v-if="Number(d.useStatus) === 10" class="test-status run">运行中</span>
          <span v-else-if="Number(d.useStatus) === 20" class="test-status end">已结束</span>
          <span v-else class="test-status">未开始</span>
          <van-checkbox :name="d.id" icon-size="18px" shape="square">
            <p>设备编号：{{ d.equipmentSn }}</p>
            <p>设备名称：{{ d.equipmentName }}</p>
            <p v-if="d.startUseTime">
              开始时间：{{ formatDate(d.startUseTime, 'YYYY-MM-DD HH:mm:ss') }}
            </p>
            <p v-if="d.endUseTime">
              结束时间：{{ formatDate(d.endUseTime, 'YYYY-MM-DD HH:mm:ss') }}
            </p>
          </van-checkbox>
          <span v-if="Number(d.useStatus) !== 10" class="del" @click="del(d, i)">删除</span>
        </div>
      </van-checkbox-group>
    </div>

    <ActionBar>
      <van-button :loading="loading2" :disabled="selectedEq.length === 0 || loading1" @click="confirmFun(2)">
        确认结束
      </van-button>
      <van-button type="primary" :loading="loading1" :disabled="selectedEq.length === 0 || loading2" @click="confirmFun(1)">
        确认开始
      </van-button>
    </ActionBar>

    <van-dialog
      v-model:show="eqInfoVisible"
      title="确认设备信息"
      show-cancel-button
      @confirm="confirmTest"
    >
      <ul class="confirm-eqlist">
        <li v-for="(eq, index) in confirmEq" :key="index" class="item">
          <span v-if="eq.equipmentSn" style="margin-right: 5px">{{
            eq.equipmentSn
          }}</span>
          {{ eq.equipmentName }}
          <span style="color: #aaa">（{{ eq.isAdd ? '本次新增' : '默认引用' }}）</span>
        </li>
      </ul>
      <p style="padding: 10px 20px; color: #aaa; font-size: 12px">
        本次新增设备将同步至服务端并创建设备使用记录
      </p>
    </van-dialog>

    <van-overlay :show="loading" z-index="20">
      <van-loading type="spinner" color="#1989fa" />
    </van-overlay>
    <van-popup
      v-model:show="showSampleSendLog"
      position="right"
      style="width: 80vw; height: 100vh"
    >
      <SampleSendLog
        :id="currentSampleSendLogId"
        :key="currentSampleSendLogId"
      ></SampleSendLog>
    </van-popup>
  </div>
</template>

<script>
import { mapState } from 'pinia'
import qs from 'qs'
import {
  showNotify,
} from 'vant'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import ActionBar from '~/views/mobileApp/components/MobileUI/ActionBar.vue'
import { useAppIndustryHooks } from '~/views/mobileApp/hooks/useAppIndustryHooks'
import { api } from '~/views/mobileApp/provides/api/api'
import { formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { useAppPageStateStore } from '~/views/mobileApp/store/useAppPageStateStore'
import { useEquipmentStore } from '~/views/mobileApp/store/useEquipmentStore'
import SampleSendLog from '~/views/mobileApp/views/testManage/sampleSend/SampleSendLog.vue'

export default {
  name: 'testTaskDetail',
  components: {
    ActionBar,
    SampleSendLog,
    MobileTitleBar,
  },
  beforeRouteEnter(to, from, next) {
    if (from.name === 'testTask' || from.name === 'sampleDetail') {
      const toPageState = useAppPageStateStore().getPage('testTaskDetail')
      toPageState.scrollTop = 0
      toPageState.resetPage = true
    }

    next()
  },
  setup() {
    const { term } = useAppIndustryHooks()

    return { term }
  },
  data() {
    return {
      loading: false,
      showMore: false,
      showMoreSend: false,
      eqInfoVisible: false,
      formatDate,
      taskId: '',
      sampleInfo: {},
      paramIndex: 0,
      paramList: [],
      equipmentList: [],
      selectedAll: false,
      selectedEq: [],
      loading1: false,
      loading2: false,
      confirmEq: [],
      handleType: 1,
      showSampleSendLog: false,
      sampleSendList: [],
      currentSampleSendLogId: '',
      taskTypeMap: {
        IMMEDIATE: '立即送样（机器人送样）',
        APPOINTMENT: '预约送样（机器人送样）',
        SELF_DELIVERY: '自行送样（人工自取）',
      },
      positionCodeDict: [],
    }
  },
  computed: {
    ...mapState(useEquipmentStore, ['scanAddEquipment']),
  },
  watch: {
    selectedEq(val) {
      this.selectedAll = val.length && val.length === this.equipmentList.length
    },
    scanAddEquipment(dataObj) {
      this.equipmentList = dataObj.equipmentList
      this.selectedEq = dataObj.selectedEq
    },
  },
  activated() {
    const pageState = useAppPageStateStore().getPage('testTaskDetail')
    const { scrollTop, resetPage } = pageState

    if (resetPage) {
      window.scrollTo(0, scrollTop || 0)
      this.initPageData()
    }
  },
  methods: {
    initPageData() {
      const { id, sampleInfo } = this.$route.query
      this.taskId = id
      this.sampleInfo = JSON.parse(decodeURIComponent(sampleInfo))
      this.loading = true
      this.paramIndex = 0
      this.paramList = []
      this.equipmentList = []
      this.selectedAll = false
      this.getTaskParams()
      this.getSampleSendList()
    },
    async getPositionCodeDict() {
      const { data, code } = await mRequest.get(
        'rest/type/getTypesByGroupCode',
        {
          params: { groupCode: 'lab::position' },
        },
      )
      if (code === 20000) {
        this.positionCodeDict = data
      }
    },
    async getSampleSendList() {
      await this.getPositionCodeDict()
      const { code, data } = await mRequest.get(
        'rest/intelligent/sampling/list',
        {
          params: {
            taskId: this.taskId,
          },
        },
      )
      if (code === 20000) {
        this.sampleSendList = data.map((i) => {
          return {
            ...i,
            positionCodeName:
              this.positionCodeDict.find(
                j => j.typeCode === i.positionCode,
              )
              && this.positionCodeDict.find(j => j.typeCode === i.positionCode)
                .typeName,
          }
        })
      }
    },
    async handleCancle(row) {
      showConfirmDialog({
        title: '提示',
        message: '确认取消送样？',
      }).then(async () => {
        this.loading = true
        const res = await mRequest
          .put(
            `/rest/intelligent/sampling/cancel/${row.id}`,
            {},
            {
              headers: {
                'Content-Type': 'application/json',
              },
            },
          )
          .finally(() => {
            this.loading = false
          })
        if (res.code === 20010) {
          showNotify({
            type: 'danger',
            message: res.msg || res.message || '操作失败',
          })
        }
        else {
          showNotify({ type: 'success', message: '取消成功' })
          this.getSampleSendList()
        }
      })
    },
    async handleConfirm(row) {
      this.loading = true
      const res = await mRequest
        .put(
          `rest/intelligent/sampling/deliver/${row.id}`,
          {},
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        )
        .finally(() => {
          this.loading = false
        })
      if (res && res.code === 20010) {
        showNotify({
          type: 'danger',
          message: res.msg || res.message || '操作失败',
        })
      }
      else {
        showNotify({ type: 'success', message: '操作成功' })
        setTimeout(() => {
          window.open(res)
        }, 500)
        this.getSampleSendList()
      }
    },
    // 获取参数列表
    async getTaskParams() {
      try {
        const res = await mRequest.get(
          `${api.testManage.testTaskParams}&testTaskId=${this.taskId}`,
        )
        this.loading = false
        if (!res.success) {
          showNotify({
            type: 'danger',
            message: res.msg || res.message || '查询参数信息异常',
          })
          return
        }
        this.paramList = res.obj || []
        if (this.paramList.length > 0) {
          this.getEquipmentData()
        }
      }
      catch (err) {
        this.loading = false
        showNotify({
          type: 'danger',
          message: err.msg || err.message || '系统异常，请稍后重试',
        })
      }
    },
    // 获取参数下的设备列表
    getEquipmentData() {
      this.loading = true
      const paramItem = this.paramList[this.paramIndex]
      this.selectedEq = []
      mRequest
        .get(
          `${api.testManage.taskParamEquipment}?testTaskId=${this.taskId}&taskParamId=${paramItem.taskParamId}`,
        )
        .then((res) => {
          this.loading = false
          if (res.code !== 20000) {
            showNotify({
              type: 'danger',
              message: res.msg || res.message || '查询设备列表异常',
            })
            return
          }
          const list = res.data || []
          this.equipmentList = list.map(data => ({
            equipmentSn: data.equipmentSn,
            equipmentName: data.name,
            equipmentCode: data.archiveSn, // 是档案编号，改为使用设备编号
            standard: data.standard,
            userName: '',
            startUseTime: data.startUseTime,
            endUseTime: data.endUseTime,
            status: data.status,
            useStatus: data.useStatus,
            testTaskId: this.taskId,
            taskParamId: paramItem.taskParamId,
            id: data.taskEquipmentUseId,
            startUseState: '正常',
            endUseState: '正常',
            equipmentId: data.id,
          }))
        })
        .catch((err) => {
          this.loading = false
          showNotify({
            type: 'danger',
            message: err.msg || err.message || '系统异常，请稍后重试',
          })
        })
    },
    // 切换参数全选
    changeSelectedAll() {
      if (this.selectedAll) {
        this.selectedEq = this.equipmentList.map(d => d.id)
      }
      else {
        this.selectedEq = []
      }
    },
    // 切换参数
    changeParams(item, i) {
      this.paramIndex = i
      this.selectedAll = false
      this.equipmentList = []
      this.getEquipmentData()
    },
    // 扫码添加
    scanAddEq() {
      const paramItem = this.paramList[this.paramIndex]
      const equipmentStore = useEquipmentStore()

      equipmentStore.setTestTaskDetail({
        taskId: this.taskId,
        paramId: paramItem.taskParamId,
        paramObjectId: paramItem.id,
        selectedEq: this.selectedEq,
        equipmentList: this.equipmentList,
      })

      this.$nextTick(() => {
        this.$router.push({
          name: 'testTaskScanResult',
        })
      })
    },
    // 批量删除
    batchDel() {
      if (this.selectedEq.length === 0) {
        showNotify({ type: 'warning', message: '请选择需要删除设备' })
        return
      }
      const isRun = this.equipmentList.some(
        d => this.selectedEq.includes(d.id) && Number(d.useStatus) === 10,
      )
      if (isRun) {
        showNotify({
          type: 'warning',
          message: '不能删除运行中的设备，请重新选择',
        })
        return
      }
      showConfirmDialog({
        title: '删除提示',
        message: '确认删除选中的设备？',
      })
        .then(async () => {
          await this.delUseEquipments(this.selectedEq)
          this.equipmentList = this.equipmentList.filter(
            d => !this.selectedEq.includes(d.id),
          )
          this.selectedEq = []
        })
        .catch(() => {})
    },
    // 删除
    del(item) {
      showConfirmDialog({
        title: '删除提示',
        message: '确认删除该设备？',
      })
        .then(() => {
          this.delUseEquipments([item.id])
          const ind = this.equipmentList.indexOf(item.id)
          this.equipmentList.splice(ind, 1)
          if (ind !== -1) {
            this.selectedEq.splice(ind, 1)
          }
        })
        .catch(() => {})
    },
    // 删除使用设备
    async delUseEquipments(ids) {
      for (let i = 0; i < ids.length; i++) {
        const id = ids[i]
        try {
          const res = await mRequest.post(
            api.testManage.delUseEquipment,
            qs.stringify({ id }),
          )
          if (res.success) {
            showNotify({ type: 'success', message: '删除成功' })
          }
          else {
            showNotify({
              type: 'danger',
              message: res.msg || res.message || '删除失败',
            })
          }
        }
        catch (err) {
          console.warn(err)
          showNotify({
            type: 'danger',
            message: res.msg || res.message || '删除失败',
          })
        }
      }
    },
    confirmFun(type) {
      const selectedList = this.equipmentList.filter(d =>
        this.selectedEq.includes(d.id),
      )
      this.handleType = type
      if (type === 2) {
        // 检测中的才可以结束
        this.confirmEq = selectedList.filter(d => Number(d.useStatus) === 10)
      }
      else {
        // 未开始的和已结束的才可以开始
        this.confirmEq = selectedList.filter(d => Number(d.useStatus) !== 10)
      }
      if (this.confirmEq.length === 0) {
        showDialog({
          title: '提示',
          message:
            type === 2 ? '请选择检测中的设备' : '请选择未开始和已结束的设备',
        })
      }
      else {
        this.eqInfoVisible = true
      }
    },
    confirmTest() {
      const apiUrl = api.testManage[
        this.handleType === 2 ? 'testTaskEnd' : 'testTaskStart'
      ]
      const ids = this.confirmEq.map(d => d.id)
      this[`loading${this.handleType}`] = true
      mRequest
        .post(apiUrl, JSON.stringify(ids), {
          headers: {
            'content-type': 'application/json',
          },
        })
        .then((res) => {
          this[`loading${this.handleType}`] = false
          if (res.code === 20000) {
            showNotify({ type: 'success', message: '操作成功' })
            this.getEquipmentData()
          }
          else {
            showNotify({
              type: 'danger',
              message: res.msg || res.message || '操作失败',
            })
          }
        })
        .catch((err) => {
          this[`loading${this.handleType}`] = false
          showNotify({
            type: 'danger',
            message: err.msg || err.message || '操作失败',
          })
        })
    },
  },
}
</script>

<style lang="less" scoped>
.page-warp {
  padding-bottom: 50px;
}
.sample-card {
  margin: 16px;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  .title {
    padding: 12px 15px;
    border-bottom: 1px solid #f5f5f5;
    font-size: 16px;
    font-weight: 600;
  }
  .content {
    padding: 10px 15px;
  }
  .sample-info {
    padding: 3px 0;
    display: flex;
    .label {
      width: 100px;
      color: #999;
    }
    .value {
      flex: 1;
      width: 0;
      color: #333;
      text-align: right;
    }
  }
}
.param-or-equipment {
  position: relative;
  margin: 10px 0;
  background-color: #fff;
  .title {
    padding: 10px 15px;
    font-size: 15px;
    border-bottom: 1px solid #eee;
    &::before {
      content: '';
      display: inline-block;
      margin-right: 5px;
      margin-top: -1px;
      width: 4px;
      height: 16px;
      vertical-align: middle;
      background-color: #0066ec;
    }
  }
  .param-list {
    padding: 10px 10px 0;
    height: 42px;
    overflow: hidden;
    font-size: 12px;
    &.show-more {
      height: auto;
    }
    .param-item {
      padding: 3px 5px;
      margin-right: 9px;
      margin-bottom: 10px;
      float: left;
      width: calc(33.33333% - 6px);
      color: #0066ec;
      text-align: center;
      border: 1px solid #0066ec;
      border-radius: 4px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      box-sizing: border-box;
      &.active {
        background-color: #0066ec;
        color: #fff;
      }
      &:nth-child(3n) {
        margin-right: 0;
      }
    }
  }
  .handle-box {
    float: right;
    padding: 5px 8px 1px;
    font-size: 12px;
    color: #0066ec;
  }
}
.param-handle {
  padding: 5px 10px;
  display: flex;
  align-items: center;
  .del {
    margin-left: 30px;
    color: #e05050;
  }
  .scan-btn {
    flex: 1;
    color: #0066ec;
    text-align: right;
  }
}
.equipment-list {
  padding: 10px;
  .equipment-item {
    position: relative;
    display: flex;
    align-items: center;
    padding: 10px 8px 10px 15px;
    margin-bottom: 10px;
    background-color: #fff;
    border-radius: 4px;
    overflow: hidden;
    .test-status {
      position: absolute;
      left: -22px;
      top: -7px;
      width: 60px;
      height: 30px;
      line-height: 36px;
      text-align: center;
      background-color: #aaa;
      color: #fff;
      font-size: 12px;
      transform: rotate(-45deg) scale(0.9);
      &.run {
        background-color: #0066ec;
      }
      &.end {
        background-color: #d9001b;
      }
    }
    .van-checkbox {
      flex: 1;
      width: 0;
    }
    .del {
      margin-left: 5px;
      color: #e05050;
    }
  }
}

.van-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  background: none;
}
:deep(.van-dialog__header) {
  padding-top: 10px;
}
.confirm-eqlist {
  padding: 10px 20px;
  line-height: 16px;
  .item {
    padding: 5px 0;
    font-size: 12px;
  }
}
</style>
