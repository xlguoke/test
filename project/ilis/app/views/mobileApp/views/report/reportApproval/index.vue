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
        color="#154bd0"
        title-active-color="#154bd0"
      >
        <van-tab :disabled="loading" title="待批准" :badge="count"></van-tab>
        <van-tab :disabled="loading" title="已批准"></van-tab>
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
        v-model.trim="query.queryCondition"
        :placeholder="term('请输入编号/样品名称/检测参数')"
        @search="onSearch"
      />
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
        :key="item.id"
        :rows="[
          { label: '委托编号', value: item.consignCode },
          { label: '记录编号', value: item.recordCode },
          { label: term('样品名称'), value: item.sampleName },
          { label: '检测时间', value: item.testDate },
        ]"
      >
        <template #title>
          <van-tag v-if="activeKey === 0 && item.currentUserApproveTimes > 0" class="mr-1" color="forestgreen">
            批
          </van-tag>
          {{ item.reportCode }}
        </template>
        <template #footer>
          <ListCardAction>
            <van-button
              v-if="activeKey === 0 && item.reportState === '20' && hasPassBtn"
              size="small"
              type="primary"
              @click="toApprovalPage(item)"
            >
              批准
            </van-button>

            <template v-if="activeKey === 0 && item.reportState === '20'">
              <van-button
                v-if="hasNoticeBtn
                  && item.reportType !== 'synthesis'
                  && item.reportType !== 'synthesis_Temp'" size="small"
                @click="onMoreBtn('通知修改委托', item)"
              >
                通知修改委托
              </van-button>

              <van-button v-if="hasBackBtn" type="danger" size="small" @click="onMoreBtn('退回', item)">
                退回
              </van-button>
            </template>

            <van-button
              size="small"
              @click="onSelect(item)"
            >
              详情
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
import SwitchIndustry from '~/views/mobileApp/components/switchIndustry/index.vue'
import { useAppIndustryHooks } from '~/views/mobileApp/hooks/useAppIndustryHooks'
import { api } from '~/views/mobileApp/provides/api/api'
import { formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { useAppPageStateStore } from '~/views/mobileApp/store/useAppPageStateStore'

export default {
  name: 'reportApproval',
  components: {
    MobileTitleBar,
    ListCard,
    ListCardAction,
    SearchBar,
    SearchBarItem,
    SwitchIndustry,
  },
  beforeRouteEnter(to, from, next) {
    if (from.name === 'menuPage' || from.name === 'menuSearch') {
      const pageState = useAppPageStateStore().getPage(to.name)
      pageState.scrollTop = 0
      pageState.resetPage = true
    }

    next()
  },
  beforeRouteLeave(to, from, next) {
    if (from.name === 'reportApproval') {
      const pageState = useAppPageStateStore().getPage(from.name)
      pageState.scrollTop = document.documentElement.scrollTop || 0
    }
    next()
  },
  setup() {
    const { term } = useAppIndustryHooks()

    return {
      term,
    }
  },
  data() {
    return {
      formatDate,
      list: [],
      activeKey: 0,
      searchVisible: false,
      sortVisible: false,
      sortList: [
        { name: '默认排序' },
        { name: '报告编号', sort: 'reportCode' },
        { name: '委托编号', sort: 'consignCode' },
        { name: '记录编号', sort: 'recordCode' },
      ],
      count: '',
      finished: false,
      loading: false,
      query: {
        queryCondition: '',
        page: 0,
        rows: 10,
      },
      clickMoreObj: {},
      sourceModule: 3,
      hasBackBtn: false,
      hasNoticeBtn: false,
      hasPassBtn: false,
    }
  },
  watch: {
    activeKey() {
      this.onSearch()
    },
  },
  activated() {
    const pageState = useAppPageStateStore().getPage('reportApproval')
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
      this.hasBackBtn = hasPermission('mobile_reportApprovalBack')

      // 检查是否有通知修改委托按钮权限
      this.hasNoticeBtn = hasPermission('mobile_reportApprovalNoticeModify')

      // 检查是否有批准按钮权限
      this.hasPassBtn = hasPermission('mobile_reportApprovalSubmit')
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
      this.activeKey === 0 ? this.onSearch() : (this.activeKey = 0)
    },
    onClick() {
      this.list = []
      this.query.currPage = 0
      this.onLoad()
    },
    onMoreBtn(val, item) {
      if (val === '退回') {
        this.$router.push({
          name: 'reportReturnForm',
          params: {
            id: item.id,
            reportState: item.reportState,
            reportType: item.reportType,
            reportCode: item.reportNumber,
          },
        })
      }
      else if (val === '通知修改委托') {
        this.$router.push({
          name: 'reportNoticeModifyForm',
          params: {
            id: item.id,
            reportState: item.reportState,
            reportCode: item.reportNumber,
          },
        })
      }
    },
    // 通过
    toApprovalPage(row) {
      this.$router.push({
        name: 'reportSubmitForm',
        params: {
          id: row.id,
          reportState: row.reportState,
          reportCode: row.reportNumber,
          sourceModule: this.sourceModule,
        },
      })
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
          id: item.id,
          sourceModule: this.sourceModule,
          consignId: item.consignId,
        },
      })
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
        api.report.reportApprove,
        qs.stringify(this.query),
        {
          params: {
            dataType: this.activeKey + 2,
            queryScope: 'user',
          },
        },
      )

      if (this.activeKey === 0) {
        if (res.total === 0) {
          this.count = ''
        }
        else if (res.total > 99) {
          this.count = '99+'
        }
        else {
          this.count = res.total
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
