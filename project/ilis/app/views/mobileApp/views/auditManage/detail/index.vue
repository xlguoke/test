<template>
  <div class="audit-detail">
    <van-sticky>
      <MobileTitleBar v-if="isDingTalk" />
      <MobileTitleBar v-else left-arrow @click-left="$router.go(-1)" />
    </van-sticky>

    <van-tabs color="#154bd0" title-active-color="#154bd0">
      <van-tab title="基本信息">
        <component
          :is="detailComponent"
          v-if="detailComponent && form.businessKey"
          style="margin-top: 16px; padding-bottom: 28px"
          :business-key="form.businessKey"
          :process-instance-id="processInstanceId"
        />

        <template v-if="!detailComponent">
          <van-cell-group style="margin-top: 16px">
            <van-cell title="流程类型">
              {{ form.processName }}
            </van-cell>
            <van-cell v-for="(d, index) in filterFormItem" :key="index" :title="d.name">
              <template v-if="d.type.name === 'file'">
                <AttachmentHandler
                  :key="d.value"
                  :fixed-qr-url="d.value"
                  business-type="WORKFLOW_FORM_FILE"
                  readonly
                />
              </template>
              <span v-else>{{ d.value }}</span>
            </van-cell>
          </van-cell-group>
        </template>
      </van-tab>
      <van-tab title="流程">
        <div style="margin-top: 15px">
          <van-steps
            v-if="auditers.length"
            direction="vertical"
            :active="activeKey"
            active-color="#0066EC"
          >
            <van-step
              v-for="(item, i) in auditers"
              :key="item.activitiNodeId"
              style="font-size: 14px"
            >
              <p>{{ item.processTaskName }}</p>
              <p style="margin-top: 8px">
                {{ item.presetUserRealName || '' }}
                <span v-if="item.pass === true" style="margin-left: 8px">通过审核</span>
                <span
                  v-if="item.pass === false"
                  style="color: #f44336; margin-left: 8px"
                >未通过</span>
                {{ activeKey < i ? '（待审批）' : '' }}
              </p>
              <p style="margin-top: 8px">
                {{ item.comment }}
              </p>
              <p style="margin-top: 8px">
                {{ formatDate(item.auditTime, 'YYYY-MM-DD HH:mm:ss') }}
              </p>
            </van-step>
          </van-steps>

          <van-empty v-else description="暂无数据" />
        </div>
      </van-tab>
      <van-tab title="日志">
        <Logs
          :business-key="form.businessKey"
          :process-type-id="form.processTypeId"
        />
      </van-tab>
    </van-tabs>

    <div
      v-if="tabType === 10 && !form.processEndTime"
      style="position: fixed; bottom: 0; left: 0; right: 0; z-index: 100"
    >
      <van-button type="primary" block @click="goAudit">
        审批
      </van-button>
    </div>
  </div>
</template>

<script>
import md5 from 'js-md5'
import { showLoadingToast } from 'vant'
import AttachmentHandler from '~/views/mobileApp/components/AttachmentHandler.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { URLHelper } from '~/views/mobileApp/provides/utils/URLHelper'
import { useAppPageStateStore } from '~/views/mobileApp/store/useAppPageStateStore'
import Logs from './components/Logs.vue'
import RWBHGSBSH from './components/任务不合格上报审核.vue'
import GYSPJSP from './components/供应商评价审批.vue'
import QTCGSH from './components/其他成果审核.vue'
import GDZCDBXXSP from './components/固定资产调拨信息审批.vue'
import PXJH from './components/培训计划.vue'
import FWCZSP from './components/废物处置审批.vue'
import BGGZSQSH from './components/报告更正申请审核.vue'
import WSDYCCZLC from './components/温湿度异常处置流程.vue'
import WSDXCTZSHLC from './components/温湿度巡查台账审核流程.vue'
import YYSH from './components/用印审核.vue'
import GCCXSH from './components/规程查新审核.vue'
import GCZLCGSP from './components/规程资料采购审批.vue'
import SBBYJHSP from './components/设备保养计划审批.vue'
import SBGNHCSH from './components/设备功能核查审核.vue'
import SBGNHCJHSH from './components/设备功能核查计划审核.vue'
import SBQTXXSP from './components/设备启停信息审批.vue'
import SBWCSQSH from './components/设备外出申请审核.vue'
import SBBF from './components/设备报废.vue'
import SBCZSQSQSH from './components/设备操作授权申请审核.vue'
import SBQJHCJHSP from './components/设备期间核查计划审批.vue'
import SBQJHCJLSP from './components/设备期间核查记录审批.vue'
import SBJJQRSP from './components/设备检校确认审批.vue'
import SBJJJHSP from './components/设备检校计划审批.vue'
import SBPDSP from './components/设备盘点审批.vue'
import SBPDJHSP from './components/设备盘点计划审批.vue'
import SBZJXXSP from './components/设备租借信息审批.vue'
import SBWXXXSP from './components/设备维修信息审批.vue'
import SBDBXXSP from './components/设备调拨信息审批.vue'
import SBGZXXSP from './components/设备购置信息审批.vue'
import SBGZSQSP from './components/设备购置申请审批.vue'
import SBGZJHSP from './components/设备购置计划审批.vue'
import SBSJDJSP from './components/设备送检登记审批.vue'
import CGSQSP from './components/采购申请审批.vue'

const componentType = {
  10: 'SBGZJHSP',
  20: 'SBJJJHSP',
  30: 'SBJJQRSP',
  40: 'QTCGSH',
  50: 'SBQJHCJHSP',
  60: 'SBQJHCJLSP',
  70: 'SBGZSQSP',
  80: 'SBGZXXSP',
  90: 'SBGZXXSP', // 详情同 设备购置信息审批
  100: 'SBBYJHSP',
  110: 'SBWXXXSP',
  120: 'SBWXXXSP', // 详情同 设备维修信息审批
  130: 'SBDBXXSP',
  362: 'GDZCDBXXSP',
  140: 'SBZJXXSP',
  150: 'SBQTXXSP',
  160: 'SBBF',
  170: 'PXJH',
  // PS：疑似已废弃
  // 180: '设备调拨申请审批'
  190: 'GCZLCGSP',
  200: 'GYSPJSP',
  210: 'SBSJDJSP',
  220: 'WSDXCTZSHLC',
  230: 'WSDYCCZLC',
  365: 'FWCZSP',
  88: 'YYSH',
  300: 'GCCXSH',
  310: 'SBWCSQSH',
  320: 'CGSQSP',
  340: 'SBPDJHSP',
  350: 'SBPDSP',
  330: 'SBCZSQSQSH',
  360: 'SBGNHCJHSH',
  361: 'SBGNHCSH',
  363: 'RWBHGSBSH',
  364: 'BGGZSQSH',
}

export default {
  components: {
    Logs,
    SBGZJHSP,
    SBJJJHSP,
    SBJJQRSP,
    QTCGSH,
    SBQJHCJHSP,
    SBQJHCJLSP,
    SBGZSQSP,
    SBGZXXSP,
    SBBYJHSP,
    SBWXXXSP,
    SBDBXXSP,
    SBQTXXSP,
    SBBF,
    PXJH,
    GCZLCGSP,
    GYSPJSP,
    WSDXCTZSHLC,
    WSDYCCZLC,
    FWCZSP,
    YYSH,
    GCCXSH,
    SBWCSQSH,
    CGSQSP,
    SBPDJHSP,
    SBCZSQSQSH,
    SBGNHCJHSH,
    SBGNHCSH,
    RWBHGSBSH,
    BGGZSQSH,
    SBPDSP,
    GDZCDBXXSP,
    SBZJXXSP,
    SBSJDJSP,
    MobileTitleBar,
    AttachmentHandler,
  },
  beforeRouteLeave(to, from, next) {
    if (this.oldTaskId !== this.taskId) {
      const pageState = useAppPageStateStore().getPage(to.name)
      pageState.scrollTop = 0
      pageState.resetPage = true
    }
    next()
  },
  data() {
    return {
      isDingTalk: false,
      tabType: 10,
      activeKey: -1,
      form: {
        startFormProperties: [],
      },
      auditers: [],
      processTypeId: '',
      processInstanceId: '',
      isRefreshList: false, // 是否需要刷新列表页
      oldTaskId: '',
      taskId: '',
      formatDate,
    }
  },
  computed: {
    detailComponent() {
      if (this.processTypeId) {
        return componentType[this.processTypeId]
      }

      return null
    },
    filterFormItem() {
      const { formProperties, startFormProperties } = this.form
      const formVal = formProperties ? JSON.parse(formProperties) : {}
      const forms = startFormProperties.filter((d) => {
        d.value = formVal[d.id] || ''
        if (d.type.name === 'boolean') {
          d.value = formVal[d.id] === '1' ? '是' : '否'
        }
        return d.readable
      })
      return forms
    },
  },
  created() {
    this.resetPage()
  },
  methods: {
    async DingTalkAuth() {
      const systemType = URLHelper.getUrlParam('systemType')
      const userId = URLHelper.getUrlParam('userId')
      const unitCode = URLHelper.getUrlParam('unitCode')

      if (systemType === 'DingTalk') {
        // 是从钉钉跳转
        this.isDingTalk = true
        const res = await mRequest.post(
          `/ilis2/rest/auth/getUserToken`,
          {
            userId,
            unitCode,
            secretKey: md5(`ILIS_DingTalk_C421AAEE0D114E9C${userId}`),
            loginSystemType: systemType,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        )

        if (res.code === 20000) {
          sessionStorage.setItem('userTokenAuth', res.data)

          mRequest
            .post(`/ilis2/rest/loginController.do?GetCurUserInfo`)
            .then((res) => {
              if (res.success) {
                localStorage.setItem('userInfo', JSON.stringify(res.attributes))
              }
            })
        }
      }
    },

    async resetPage() {
      const toast = showLoadingToast({
        duration: 0,
        forbidClick: true,
      })
      const { processTypeId, processInstanceId, tabType, id }
        = this.$route.query
      this.oldTaskId = id
      this.processTypeId = processTypeId
      this.processInstanceId = processInstanceId
      this.tabType = Number(tabType)

      await this.DingTalkAuth()

      await this.getDetailData()
      toast.close()
    },
    goAudit() {
      this.$router.push({
        name: 'audit',
        query: {
          id: this.taskId,
        },
      })
    },
    // 获取详情数据
    async getDetailData() {
      const res = await mRequest.get(
        `${api.auditProcess.detail}/${this.processInstanceId}`,
      )
      this.spinning = false
      if (res.code !== 20000) {
        showFailToast(res.message || '获取详情失败')
        return
      }

      this.form = res.data || {}
      this.taskId = res.data.taskId
      this.getAuditPersoners(res.data)
    },
    // 获取审核人员
    async getAuditPersoners(res) {
      const auditTasks = res.auditTasks ? JSON.parse(res.auditTasks) : []
      if (auditTasks.length === 0)
        return
      try {
        const resAuditer = await mRequest.get(
          `${api.auditProcess.getPresetAuditer}?processInstanceId=${this.processInstanceId}`,
        )
        if (resAuditer.code !== 20000) {
          showFailToast(resAuditer.message || '获取节点审核人员失败')
          return
        }

        if (!resAuditer.data) {
          return
        }

        for (let i = 0; i < auditTasks.length; i++) {
          const item = auditTasks[i]
          const findItem = resAuditer.data.find(
            d => d.activitiNodeId === item.key,
          )
          if (!findItem)
            continue
          auditTasks[i] = {
            activitiNodeId: item.key,
            processTaskName: item.name,
            ...findItem,
          }
        }
        this.auditers = auditTasks
        this.showAuditProcess(res)
      }
      catch (err) {
        showFailToast(err.message || '请求异常')
      }
    },
    // 回显审核进度
    showAuditProcess(res) {
      let auditRecords = res.auditRecords ? JSON.parse(res.auditRecords) : []
      if (auditRecords.length === 0)
        return
      auditRecords.sort((p, n) => p.auditTime - n.auditTime)
      // const ind = auditRecords.findLastIndex((d) => !d.pass)  不要用新特性，某些浏览器不支持
      let ind
      for (let i = auditRecords.length - 1; i >= 0; i--) {
        if (!auditRecords[i].isPass) {
          ind = i
          break
        }
      }

      if (ind !== -1) {
        auditRecords = auditRecords.slice(ind + 1)
      }
      for (let i = 0; i < this.auditers.length; i++) {
        const item = this.auditers[i]
        const findItem = auditRecords.find(
          d => d.taskName === item.processTaskName,
        )
        if (!findItem) {
          continue
        }
        item.auditTime = findItem.auditTime
        item.pass = findItem.pass
        item.comment = findItem.comment
        if (!item.presetUserRealName) {
          item.presetUserRealName = findItem.userRealName
        }
        this.activeKey = i
      }
    },
  },
}
</script>

<style lang="less" scoped>
.audit-detail {
  padding-bottom: 46px;
  .van-cell__title {
    width: 90px;
    flex: initial;
    color: #888;
  }

  .van-cell__value {
    margin-left: 10px;
    text-align: left;
    color: #333;
  }
}
</style>
