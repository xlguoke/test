<template>
  <div class="reportAudit">
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
        <van-tab :disabled="loading" title="待分配" :badge="count"></van-tab>
        <van-tab :disabled="loading" title="已分配"></van-tab>
      </van-tabs>

      <SearchBar>
        <SearchBarItem @click="openScreen(1)">
          <van-icon size="18" class-prefix="iconfont" name="search" />搜索
        </SearchBarItem>
        <SearchBarItem @click="openScreen(2)">
          <van-icon size="18" class-prefix="iconfont" name="sort" />排序
        </SearchBarItem>
        <SearchBarItem v-if="activeKey === 1" @click="openScreen(3)">
          <van-icon size="18" class-prefix="iconfont" name="sort" />筛选
        </SearchBarItem>
      </SearchBar>

      <van-search
        v-if="quickQryVisible"
        v-model.trim="query.quickQryParam"
        :placeholder="term(activeKey === 0
          ? `请输入编号/样品名称/工程项目、用途`
          : `请输入编号/样品名称/委托单位`)"
        @search="onSearch"
      />
    </van-sticky>

    <div class="reportAudit-list">
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
            enableProjectPartAndUse ? { label: '工程部位/用途', value: item.partAndUse } : null,
            { label: '委托编号', value: item.consign_code || item.consignCode },
            { label: term('样品编号'), value: item.test_object_code || item.testObjectCode },
            { label: '委托日期', value: dayjs(item.consign_date || item.consignDate).format(EDateFormatType.YYYY_MM_DD) },
          ]"
        >
          <template #title>
            <div class="flex gap-4">
              <div class="flex-1">
                <template v-if="activeKey === 0">
                  <van-tag
                    v-if="item.status === '2'"
                    size="medium"
                    color="#FE6550"
                    title="退回重新流转的样品"
                    class="mr-1"
                  >
                    退
                  </van-tag>

                  <van-tag
                    v-if="item.ordernum === '3'"
                    size="medium"
                    color="#FE6550"
                    title="龄期超期"
                    class="mr-1"
                  >
                    龄
                  </van-tag>

                  <van-tag
                    v-if="item.ordernum === '2'"
                    size="medium"
                    color="#ff5c80"
                    title="龄期到期"
                    class="mr-1"
                  >
                    龄
                  </van-tag>

                  <van-tag
                    v-if="item.ordernum === '1'"
                    size="medium"
                    color="#ffb935"
                    title="龄期即将到期"
                    class="mr-1"
                  >
                    龄
                  </van-tag>

                  <van-tag
                    v-if="item.isSubcontract"
                    size="medium"
                    color="#008000"
                    title="分包"
                    class="mr-1"
                  >
                    分
                  </van-tag>
                </template>
                <span>{{ item.test_sample_display_name || item.testSampleDisplayName }}</span>
                <span v-if="item.standard">（{{ item.standard }}）</span>
              </div>
              <div
                v-if="activeKey === 1"
                :style="{ color: item.testTaskStatus === '40' ? '#24B276' : '#999' }"
              >
                {{ item.statusStr }}
              </div>
            </div>
          </template>
          <template #footer>
            <ListCardAction>
              <van-button
                v-if="activeKey === 0"
                type="primary"
                size="small"
                @click="allotByObjectPage(item)"
              >
                分配
              </van-button>

              <van-button
                v-if="activeKey === 1"
                size="small"
                @click="onSelect(item)"
              >
                详情
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
    <EquipmentSearch
      ref="EquipmentSearch"
      v-model:value="searchVisible"
      @callback="getMoreSearch"
    />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { mapWritableState } from 'pinia'
import qs from 'qs'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import ListCard from '~/views/mobileApp/components/MobileUI/ListCard.vue'
import ListCardAction from '~/views/mobileApp/components/MobileUI/ListCardAction.vue'
import SearchBar from '~/views/mobileApp/components/MobileUI/SearchBar.vue'
import SearchBarItem from '~/views/mobileApp/components/MobileUI/SearchBarItem.vue'
import SwitchIndustry from '~/views/mobileApp/components/switchIndustry/index.vue'
import { useAppIndustryHooks } from '~/views/mobileApp/hooks/useAppIndustryHooks'
import { api } from '~/views/mobileApp/provides/api/api'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { useAppPageStateStore } from '~/views/mobileApp/store/useAppPageStateStore'
import { useTaskAssignStore } from '~/views/mobileApp/store/useTaskAssignStore'
import EquipmentSearch from './filter.vue'

export default {
  name: 'taskAssigned',
  components: {
    SearchBarItem,
    SearchBar,
    EquipmentSearch,
    MobileTitleBar,
    ListCard,
    ListCardAction,
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
    const { term, getIndustryField } = useAppIndustryHooks()

    return { term, getIndustryField }
  },
  data() {
    return {
      dayjs,
      EDateFormatType,
      list: [],
      activeKey: 0,
      searchVisible: false,
      quickQryVisible: false, // 快速
      sortVisible: false,
      sortList: [{ name: '默认排序' }],
      sortList0: [
        { name: '默认排序' },
        { name: '委托编号', sort: 'consignCode' },
        { name: '样品编号', sort: 'testObjectCode' },
        { name: '委托日期', sort: 'consignDate' },
      ],
      sortList1: [
        { name: '默认排序' },
        { name: '任务编号', sort: 'testTaskCode' },
        { name: '样品编号', sort: 'testObjectCode' },
        { name: '任务分配日期', sort: 'taskAssignDate' },
      ],
      moreBtnVisible: false,
      otherBtn: [{ name: '退回', color: 'red' }, { name: '通知修改委托' }],
      count: '',
      finished: false,
      loading: false,
      query: {
        quickQryParam: '',
        page: 0,
        rows: 10,
      },
      clickMoreObj: {},
      sourceModule: 3,
      moreCondition: {},
      testTaskTitle: {
        10: '待分配',
        20: '试验检测中',
        30: '复核确认中',
        40: '已提交正式报告',
      },
    }
  },
  computed: {
    ...mapWritableState(useTaskAssignStore, ['taskAssignData']),
    enableProjectPartAndUse() {
      const item = this.getIndustryField('projectPartAndUse')
      return item ? item.selected : false
    },
  },
  watch: {
    activeKey() {
      this.query = {
        quickQryParam: '',
        page: 0,
        rows: 10,
      }
      this.moreCondition = {}
      this.onSearch()
    },
  },
  activated() {
    const pageState = useAppPageStateStore().getPage('taskAssigned')
    const { scrollTop, resetPage } = pageState

    window.scrollTo(0, scrollTop || 0)
    if (resetPage === true || resetPage === undefined || resetPage === null) {
      this.resetPage()
      pageState.resetPage = false
      this.moreCondition = {}
    }
  },
  methods: {
    resetPage() {
      window.scrollTo(0, 0)
      this.query = {
        quickQryParam: '',
        page: 0,
        rows: 10,
      }
      this.moreCondition = {}
      this.sortList
        = this.activeKey === 1 ? [...this.sortList1] : [...this.sortList0]
      this.sortList = this.sortList.map(item => ({
        ...item,
        color: '',
      }))
      this.sortList[0].color = '#40a9ff'

      this.quickQryVisible = false
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
            reportType: this.clickMoreObj.reportType,
            reportCode: this.clickMoreObj.reportNumber,
          },
        })
      }
      else if (val && val.name && val.name === '通知修改委托') {
        this.$router.push({
          name: 'reportNoticeModifyForm',
          params: {
            id: this.clickMoreObj.id,
            reportCode: this.clickMoreObj.reportNumber,
          },
        })
      }
    },
    // 分配
    allotByObjectPage(row) {
      this.taskAssignData = {
        id: row.id,
        sampleIds: row.sampleId,
        department: row.department || '',
        departmentId: row.departmentId || '',
        consignId: row.consignId || '',
      }

      this.$router.push({
        name: 'allotByObject',
        params: {
          id: row.id,
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
      this.sortList[index].color = '#40a9ff'

      this.onSearch()
      this.sortVisible = false
    },
    openScreen(type) {
      if (type === 1) {
        this.quickQryVisible = !this.quickQryVisible
      }
      else if (type === 2) {
        this.sortList
          = this.activeKey === 1 ? [...this.sortList1] : [...this.sortList0]
        this.sortList = this.sortList.map(item => ({
          ...item,
          color: '',
        }))
        this.sortList[0].color = '#40a9ff'
        this.sortVisible = true
      }
      else if (type === 3) {
        this.searchVisible = !this.searchVisible
        this.$refs.EquipmentSearch.showData({ ...this.moreCondition })
      }
    },
    // 选中事件
    onSelect(item) {
      if (this.activeKey === 0) {
        return
      }

      this.taskAssignData = {
        id: item.testTaskId,
        sampleIds: '',
        department: item.department || '',
        departmentId: item.departmentId || '',
        consignId: item.consignId || '',
      }

      this.$router.push({
        name: 'taskAssignedDetail',
        params: {
          id: item.testTaskId,
        },
      })
    },
    getMoreSearch(data) {
      this.moreCondition = { ...data }
      this.onSearch()
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

      let url = api.testManage.unAssignedlist
      let obj = {
        qryType: 'common',
        filterByDepartment: '0',
        subcontract: false,
      }
      if (this.activeKey !== 0) {
        url = api.testManage.assignedlist
        obj = { showAll: true }
      }
      const res = await mRequest.post(
        url,
        qs.stringify({ ...this.query, ...obj, ...this.moreCondition }),
        {
          params: {
            // ...this.moreCondition
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
        this.list = [...this.list, ...res.rows].map((item) => {
          return {
            ...item,
            statusStr: this.testTaskTitle[item.testTaskStatus],
          }
        })
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

<style lang="less" scoped>
@import './index';
.textOverflow .statusBox {
  border-radius: 50%;
  border: 1px solid red;
  padding: 0 2px;
}
</style>
