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
        placeholder="请输入编号/样品名称"
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
            { label: '任务编号', value: item.testTaskCode },
            { label: '记录编号', value: item.testRecordCode },
            { label: '样品名称', value: item.sampleName },
            { label: '签字类型', value: item.signType },
          ]"
        >
          <template #title>
            {{ item.reportNumber }}
          </template>
          <template #footer>
            <ListCardAction>
              <van-button
                size="small"
                type="primary"
                @click="electronicSign(item)"
              >
                签名
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

    <SendCodePopup v-model:value="showSendCode" />
  </div>
</template>

<script>
import qs from 'qs'
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
  name: 'electronicSignature',
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
      const pageState = useAppPageStateStore().getPage('electronicSignature')
      pageState.scrollTop = 0
      pageState.resetPage = true
    }
    next()
  },
  beforeRouteLeave(to, from, next) {
    if (from.name === 'reportAudit') {
      const pageState = useAppPageStateStore().getPage(from.name)
      pageState.scrollTop = document.documentElement.scrollTop || 0
    }
    next()
  },
  data() {
    return {
      formatDate,
      list: [],
      firstLoad: true,
      searchVisible: false,
      sortVisible: false,
      sortList: [
        { name: '默认排序' },
        { name: '报告编号', sort: 'reportNumber' },
        { name: '任务编号', sort: 'testTaskCode' },
        { name: '记录编号', sort: 'testRecordCode' },
      ],
      query: {
        queryCondition: '',
        page: 0,
        rows: 10,
      },
      finished: false,
      loading: false,
      showSendCode: false,
    }
  },
  activated() {
    const pageState = useAppPageStateStore().getPage('electronicSignature')
    const { scrollTop, resetPage } = pageState

    window.scrollTo(0, scrollTop || 0)
    if (resetPage === true || resetPage === undefined || resetPage === null) {
      this.resetPage()
      pageState.resetPage = false
    }
  },
  methods: {
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
      this.count = ''
      if (!this.firstLoad) {
        this.onSearch()
      }
    },
    // 签名
    electronicSign(row) {
      SignerObj.signConfirm({
        context: this,
        signerServerType: 'signature',
        reportData: row,
      })
    },
    // 签字服务调用成功回调
    signServerOk() {},
    // 签字服务调用失败回调
    signServerErr() {},
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
    onSearch() {
      this.finished = false
      this.firstLoad = false
      this.query.page = 0
      this.list = []
      this.onLoad()
    },
    // electronicSignature.js 调用
    reloadPageData() {
      this.onSearch()
    },
    async onLoad() {
      this.query.page += 1
      this.loading = true
      const res = await mRequest.post(
        api.report.signList,
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
