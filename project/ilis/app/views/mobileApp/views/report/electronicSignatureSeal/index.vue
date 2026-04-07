<template>
  <div>
    <van-sticky>
      <MobileTitleBar left-arrow @click-left="$router.go(-1)" />

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
        v-model.trim="query.queryCondition"
        placeholder="请输入报告编号/样品编号"
        @search="onSearch"
      />
    </van-sticky>

    <div class="p-4">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <ListCard
          v-for="item in list"
          :key="item.id"
          :rows="[
            { label: '记录编号', value: item.testRecordCode },
            { label: '样品编号', value: item.testObjectCode },
            { label: '样品名称', value: item.sampleName },
            { label: '报告资质', value: item.reportQualifications },
          ]"
        >
          <template #title>
            {{ item.reportNumber }}
          </template>
          <template #footer>
            <ListCardAction>
              <van-button type="primary" size="small" @click="electronicSign(item)">
                签章
              </van-button>
              <van-button size="small" @click="openMoreBtn(item)">
                更多
              </van-button>
            </ListCardAction>
          </template>
        </ListCard>
      </van-list>
    </div>

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

    <SendCodePopup v-model:value="showSendCode" />
  </div>
</template>

<script>
import qs from 'qs'
import { usePermissionStore } from '~/store/permissionStore'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import ListCard from '~/views/mobileApp/components/MobileUI/ListCard.vue'
import ListCardAction from '~/views/mobileApp/components/MobileUI/ListCardAction.vue'
import SearchBar from '~/views/mobileApp/components/MobileUI/SearchBar.vue'
import SearchBarItem from '~/views/mobileApp/components/MobileUI/SearchBarItem.vue'
import SignerObj from '~/views/mobileApp/libs/electronicSignature'
import { api } from '~/views/mobileApp/provides/api/api'
import { formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { useAppPageStateStore } from '~/views/mobileApp/store/useAppPageStateStore'
import SendCodePopup from '../components/sendCodePopup/index.vue'

export default {
  name: 'electronicSignatureSeal',
  components: {
    SendCodePopup,
    MobileTitleBar,
    SearchBar,
    SearchBarItem,
    ListCard,
    ListCardAction,
  },
  beforeRouteEnter(to, from, next) {
    if (from.name === 'menuPage' || from.name === 'menuSearch') {
      const pageState = useAppPageStateStore().getPage(to.name)
      pageState.scrollTop = 0
      pageState.resetPage = true
    }

    next()
  },
  data() {
    return {
      formatDate,
      list: [],
      searchVisible: false,
      sortVisible: false,
      sortList: [
        { name: '默认排序' },
        { name: '报告编号', sort: 'report_number' },
        { name: '样品编号', sort: 'test_object_code' },
        { name: '记录编号', sort: 'test_record_code' },
      ],
      moreBtnVisible: false,
      otherBtn: [],
      query: {
        queryCondition: '',
        page: 0,
        rows: 10,
      },
      finished: false,
      loading: false,
      clickMoreObj: {},
      sourceModule: 4,
      hasBackBtn: false,
      hasNoticeBtn: false,
      showSendCode: false,
    }
  },
  activated() {
    const pageState = useAppPageStateStore().getPage('electronicSignatureSeal')
    const { scrollTop, resetPage } = pageState

    window.scrollTo(0, scrollTop || 0)
    if (resetPage === true || resetPage === undefined || resetPage === null) {
      this.resetPage()
      pageState.resetPage = false
    }

    this.checkBtnAuth()
  },
  methods: {
    // 检查按钮权限
    checkBtnAuth() {
      const { hasPermission } = usePermissionStore()

      // 检查是否有退回按钮权限
      this.hasBackBtn = hasPermission('mobile_electronicSignatureSealBack')

      // 检查是否有通知修改委托按钮权限
      this.hasNoticeBtn = hasPermission('mobile_electronicSignatureSealModify')
    },
    resetPage() {
      window.scrollTo(0, 0)
      this.query = {
        queryCondition: '',
        page: 0,
        rows: 10,
      }

      this.sortList = this.sortList.map(item => ({
        ...item,
        color: '',
      }))
      this.sortList[0].color = '#154bd0'

      this.searchVisible = false
      this.sortVisible = false
      this.moreBtnVisible = false
      this.count = ''
      this.onSearch()
    },
    onMoreBtn(val) {
      this.moreBtnVisible = false
      if (val && val.name && val.name === '退回') {
        this.$router.push({
          name: 'reportReturnForm',
          params: {
            id: this.clickMoreObj.reportId,
            reportState: 30,
            reportType: this.clickMoreObj.reportType,
            reportCode: this.clickMoreObj.reportNumber,
          },
        })
      }
      else if (val && val.name && val.name === '通知修改委托') {
        this.$router.push({
          name: 'reportNoticeModifyForm',
          params: {
            id: this.clickMoreObj.reportId,
            reportState: 30,
            reportCode: this.clickMoreObj.reportNumber,
          },
        })
      }
      else if (val.name && val.name === '设置报告印章') {
        this.$router.push({
          name: 'qualificationStamp',
          params: {
            reportId: this.clickMoreObj.reportId,
          },
        })
      }
      else if (val.name && val.name === '设置签章页码') {
        this.$router.push({
          name: 'qualificationStampPage',
          params: {
            reportId: this.clickMoreObj.reportId,
          },
        })
      }
    },
    // 签章
    electronicSign(row) {
      SignerObj.signConfirm({
        context: this,
        signerServerType: 'stamp',
        reportData: row,
      })
    },
    // 更多
    openMoreBtn(row) {
      this.clickMoreObj = row
      const otherBtn = []

      otherBtn.push({ name: '设置报告印章' })
      otherBtn.push({ name: '设置签章页码' })

      if (
        this.hasNoticeBtn
        && row.reportType !== 'synthesis'
        && row.reportType !== 'synthesis_Temp'
      ) {
        otherBtn.push({ name: '通知修改委托' })
      }
      if (this.hasBackBtn) {
        otherBtn.push({ name: '退回', color: 'red' })
      }

      this.otherBtn = otherBtn
      this.moreBtnVisible = true
    },
    // 选择排序
    onSortSelect(row, index) {
      if (row.sort) {
        this.query.sort = row.sort
        this.query.order = 'asc'
      }
      else {
        delete this.query.sort
        delete this.query.order
      }

      this.sortList = this.sortList.map(item => ({
        ...item,
        color: '',
      }))
      this.sortList[index].color = '#154bd0'

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
    // 选中事件
    onSelect(item) {
      this.$router.push({
        name: 'reportDetail',
        params: {
          id: item.reportId,
          sourceModule: this.sourceModule,
          consignId: item.consignId,
        },
      })
    },
    // electronicSignature.js 调用
    reloadPageData() {
      this.onSearch()
    },
    onSearch() {
      this.finished = false
      this.firstLoad = false
      this.query.page = 0
      this.list = []
      this.onLoad()
    },
    async onLoad() {
      this.query.page += 1
      this.loading = true
      const res = await mRequest.post(
        api.report.stampSignList,
        qs.stringify(this.query),
      )

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
