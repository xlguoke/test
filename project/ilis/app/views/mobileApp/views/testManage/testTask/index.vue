<template>
  <div>
    <van-sticky>
      <MobileTitleBar left-arrow @click-left="$router.go(-1)">
        <template #right>
          <SwitchIndustry @on-ok="onSearch" />
        </template>
      </MobileTitleBar>

      <van-tabs
        v-model:active="activeKey"
        color="#40a9ff"
        title-active-color="#40a9ff"
      >
        <van-tab
          title="检测中"
          :badge="auditCount"
          :disabled="loading"
        ></van-tab>
        <van-tab title="复核中" :disabled="loading"></van-tab>
        <van-tab title="审批中" :disabled="loading"></van-tab>
        <van-tab title="已批准" :disabled="loading"></van-tab>
      </van-tabs>

      <SearchBar>
        <SearchBarItem @click="openScreen(1)">
          <van-icon size="18" class-prefix="iconfont" name="search" />搜索
        </SearchBarItem>
        <SearchBarItem @click="openScreen(2)">
          <van-icon size="18" class-prefix="iconfont" name="sort" />排序
        </SearchBarItem>
      </SearchBar>

      <van-search
        v-if="searchVisible"
        v-model.trim="query.quickQryParam"
        :placeholder="term('请输入编号/样品名称')"
        @search="onSearch"
      />

      <van-checkbox
        v-if="searchVisible"
        v-model="queryScope"
        v-permission="'mobile_allTestData'"
        style="padding: 0 0 10px 10px; background: #fff"
        @change="onSearch"
      >
        显示全部数据
      </van-checkbox>
    </van-sticky>

    <van-list
      v-model:loading="loading"
      class="p-4"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <ListCard
        v-for="item in list"
        :key="item.index"
        :rows="[
          enableProjectPartAndUse ? { label: '工程部位/用途', value: item.projectPartAndUse } : null,
          { label: term('样品编号'), value: item.testObjectCode },
          { label: '任务编号', value: item.testTaskCode },
          { label: '记录编号', value: item.testRecordCode },
          { label: '要求报告日期', value: item.requireReportDate },
        ]"
      >
        <template #title>
          {{ item.testSampleDisplayName }}
          <span v-if="item.standard">（{{ item.standard }}）</span>
        </template>
        <template #footer>
          <ListCardAction>
            <template v-if="activeKey !== 3">
              <van-button v-permission="'mobile_reservationLab'" size="small" @click.stop="resLab(item)">
                预约功能室
              </van-button>
              <van-button v-permission="'mobile_sampleSend'" size="small" @click.stop="sampleSend(item)">
                智能送样
              </van-button>
            </template>

            <van-button size="small" type="primary" @click.stop="registerRow(item)">
              登记
            </van-button>

            <van-button v-if="item.hasAppTemp === '1'" size="small" @click.stop="getUdrTemplate(item)">
              编辑
            </van-button>
          </ListCardAction>
        </template>
      </ListCard>
    </van-list>

    <van-action-sheet
      v-model:show="sortVisible"
      title="排序"
      :actions="sortList"
      :round="false"
      @select="onSortSelect"
    />
    <van-action-sheet
      v-model:show="moreBtnVisible"
      :actions="otherBtn"
      :round="false"
      @select="onMoreBtn"
    />

    <van-dialog
      v-model:show="udrVisible"
      title="请选择udr模板"
      show-cancel-button
      :before-close="onBeforeClose"
    >
      <van-radio-group v-model="udrTempleteId" class="p-4 flex flex-col gap-2">
        <van-radio
          v-for="item in udrTempleteList"
          :key="item.objectUdrId"
          :name="item.objectUdrId"
        >
          {{ item.templateName }}
        </van-radio>
      </van-radio-group>
    </van-dialog>
  </div>
</template>

<script>
import qs from 'qs'
import {
  showDialog,
} from 'vant'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import ListCard from '~/views/mobileApp/components/MobileUI/ListCard.vue'
import ListCardAction from '~/views/mobileApp/components/MobileUI/ListCardAction.vue'
import SearchBar from '~/views/mobileApp/components/MobileUI/SearchBar.vue'
import SearchBarItem from '~/views/mobileApp/components/MobileUI/SearchBarItem.vue'
import SwitchIndustry from '~/views/mobileApp/components/switchIndustry/index.vue'
import { useAppIndustryHooks } from '~/views/mobileApp/hooks/useAppIndustryHooks'
import { api } from '~/views/mobileApp/provides/api/api'
import { formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { useAppPageStateStore } from '~/views/mobileApp/store/useAppPageStateStore'

export default {
  name: 'testTask',
  components: {
    SearchBarItem,
    SearchBar,
    SwitchIndustry,
    MobileTitleBar,
    ListCard,
    ListCardAction,
  },
  beforeRouteEnter(to, from, next) {
    if (
      from.name === 'menuPage'
      || from.name === 'menuSearch'
      || from.name === 'sampleDetail'
    ) {
      const pageState = useAppPageStateStore().getPage(to.name)
      pageState.scrollTop = 0
      pageState.resetPage = true
    }

    next()
  },
  beforeRouteLeave(to, from, next) {
    if (from.name === 'testTask') {
      const pageState = useAppPageStateStore().getPage(from.name)
      pageState.scrollTop = document.documentElement.scrollTop || 0
    }
    next()
  },
  setup() {
    const { term, getIndustryField } = useAppIndustryHooks()

    return { term, getIndustryField }
  },
  data() {
    return {
      formatDate,
      list: [],
      activeKey: 0,
      searchVisible: false,
      sortVisible: false,
      udrVisible: false,
      sortList: [
        { name: '默认排序' },
        { name: '任务编号', sort: 'testTaskCode' },
        { name: '记录编号', sort: 'testRecordCode' },
        { name: '样品编号', sort: 'testObjectCode' },
      ],
      queryScope: false,
      moreBtnVisible: false,
      otherBtn: [],
      query: {
        quickQryParam: '',
        page: 0,
        rows: 10,
      },
      finished: false,
      loading: false,
      auditCount: '',
      clickMoreObj: {},
      sourceModule: 2,
      udrTempleteList: [],
      udrTempleteId: null,
    }
  },
  computed: {
    enableProjectPartAndUse() {
      const item = this.getIndustryField('projectPartAndUse')
      return item ? item.selected : false
    },
  },
  watch: {
    activeKey() {
      this.onSearch()
    },
  },
  activated() {
    const pageState = useAppPageStateStore().getPage('testTask')
    const { scrollTop, resetPage } = pageState

    window.scrollTo(0, scrollTop || 0)

    if (resetPage === true || resetPage === undefined || resetPage === null) {
      this.resetPage()
      pageState.resetPage = false
      this.queryScope = false
    }
  },
  methods: {
    resLab(row) {
      sessionStorage.setItem('reservationLabPageData', JSON.stringify(row))

      this.$router.push({
        name: 'reservationLab',
        query: {
          id: row.id,
        },
      })
    },
    sampleSend(row) {
      sessionStorage.setItem('reservationLabPageData', JSON.stringify(row))
      this.$router.push({
        name: 'sampleSend',
        query: {
          id: row.id,
        },
      })
    },
    // 登记
    registerRow(row) {
      const sampleInfo = {
        sampleName: row.testSampleDisplayName,
        testObjectCode: row.testObjectCode,
        testTaskCode: row.testTaskCode,
        testRecordCode: row.testRecordCode,
        standard: row.standard,
        requireReportDate: row.requireReportDate || '',
      }
      this.$router.push({
        name: 'testTaskDetail',
        query: {
          id: row.id,
          sampleInfo: encodeURIComponent(JSON.stringify(sampleInfo)),
        },
      })
    },
    /**
     * 请求接口，获取打开移动端udr的相关参数
     */
    async getUdrTemplate(row) {
      const res = await mRequest
        .get(api.testManage.getUdrTemplate, {
          params: {
            taskId: row.id,
          },
        })
        .catch(() => {
          showDialog({ message: '请求异常，请稍后再试' })
        })

      if (res && res.code === 20000) {
        const tempCount = res.data.length
        if (tempCount === 0) {
          showDialog({ message: '未获取到udr模板' })
        }

        if (tempCount === 1) {
          this.openUdr(res.data[0])
        }

        if (tempCount > 1) {
          this.udrTempleteList = res.data
          this.udrTempleteId = res.data[0].objectUdrId
          this.udrVisible = true
        }
      }
      else {
        showDialog({
          message: res.msg || res.message || '请求异常，请稍后再试',
        })
      }
    },
    // 选择udr模板回调
    onBeforeClose(action, done) {
      if (action === 'confirm') {
        const udrTemplete = this.udrTempleteList.find(
          item => item.objectUdrId === this.udrTempleteId,
        )

        if (!udrTemplete) {
          showDialog({ message: '请选择要打开的模板' })
          return done(false)
        }
        else {
          this.openUdr(udrTemplete)
          return done()
        }
      }
      else {
        return done()
      }
    },
    // 打开udr
    openUdr(row) {
      const { testTaskId, objectUdrId, htmlJsFile, htmlUrl, templateName } = row

      this.$router.push({
        name: 'hitekUdrPage',
        params: {
          testTaskId,
          objectUdrId,
          htmlJsFile,
          htmlUrl,
          templateName,
        },
      })
    },
    resetPage() {
      window.scrollTo(0, 0)
      const sampleId = this.$route.query.sampleId
      this.query = {
        quickQryParam: '',
        page: 0,
        rows: 10,
      }

      this.query.testObjectId = sampleId || ''

      this.sortList = this.sortList.map(item => ({
        ...item,
        color: '',
      }))
      this.sortList[0].color = '#40a9ff'

      this.searchVisible = false
      this.sortVisible = false
      this.moreBtnVisible = false
      this.count = ''

      this.activeKey === 0 ? this.onSearch() : (this.activeKey = 0)
    },
    onMoreBtn(val) {
      if (val && val.name && val.name === '退回') {
        this.$router.push({
          name: 'reportReturnForm',
          params: {
            id: this.clickMoreObj.id,
            reportState: this.clickMoreObj.reportState,
            reportType: this.clickMoreObj.reportType,
            testTaskCode: this.clickMoreObj.reportNumber,
          },
        })
      }
      else if (val && val.name && val.name === '通知修改委托') {
        this.$router.push({
          name: 'reportNoticeModifyForm',
          params: {
            id: this.clickMoreObj.id,
            reportState: this.clickMoreObj.reportState,
            testTaskCode: this.clickMoreObj.reportNumber,
          },
        })
      }
    },
    // 选择排序
    onSortSelect(row, index) {
      if (row.sort) {
        this.query.sort = row.sort
        this.query.order = 'desc'
      }
      else {
        delete this.query.sort
        delete this.query.order
      }

      this.sortList = this.sortList.map(item => ({
        ...item,
        color: '',
      }))
      this.sortList[index].color = '#40a9ff'

      this.onSearch()
      this.sortVisible = false
    },
    openScreen(type) {
      if (type === 1) {
        this.searchVisible = !this.searchVisible
      }
      else if (type === 2) {
        this.sortVisible = true
      }
    },
    onSearch() {
      this.finished = false
      this.query.page = 0
      this.list = []
      this.onLoad()
    },
    async onLoad() {
      this.query.page += 1
      this.loading = true
      const res = await mRequest.post(
        api.testManage.testTaskUrl,
        qs.stringify(this.query),
        {
          params: {
            type: this.activeKey + 1,
            queryScope: this.queryScope ? 'all' : 'user',
          },
        },
      )
      if (this.activeKey === 0) {
        if (res.total === 0) {
          this.auditCount = ''
        }
        else if (res.total > 99) {
          this.auditCount = '99+'
        }
        else {
          this.auditCount = res.total
        }
      }

      if (res.rows && res.rows.length > 0) {
        this.list = [...this.list, ...res.rows]
      }

      if (res.rows && res.rows.length === 0) {
        this.finished = true
      }
      this.loading = false

      if (this.list.length >= res.total) {
        this.finished = true
      }
    },
  },
}
</script>
