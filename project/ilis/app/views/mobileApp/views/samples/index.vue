<template>
  <div class="samples">
    <van-sticky>
      <MobileTitleBar
        left-arrow
        @click-left="$router.go(-1)"
        @click-right="openScreen(2)"
      >
        <template #right>
          筛选
          <img
            :src="filterIcon"
            width="22"
            style="margin-left: 6px"
          />
        </template>
      </MobileTitleBar>
      <div style="padding: 15px; background: #fff">
        <van-search
          v-model.trim="query.quickQryParam"
          placeholder="请输入样品编号/样品名称/规格型号"
          @search="onSearch"
        />
      </div>
    </van-sticky>

    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      style="border-top: solid 1px #e2e2e2"
      @load="onLoad"
    >
      <div class="px-4 pt-4">
        <ListCard
          v-for="(item, index) in list"
          :key="index"
          :rows="[
            { label: '样品名称', value: item.displayName },
            statusTextObj[item.status] ? { label: '状态', value: statusTextObj[item.status] } : null,
            { label: '规格型号', value: item.standard },
            { label: '数量', value: item.getAmount },
          ]"
          @click="onSelect(item)"
        >
          <template #title>
            {{ item.testObjectCode }}
          </template>
          <template v-if="item._separateSampleId" #footer>
            <div
              class="samples-separate"
              @click.stop="onSeparate(item)"
            >
              [分样]{{ item._separateSampleNum }}
              <span style="margin-left: 15px">收样处留样</span>
            </div>
          </template>
        </ListCard>
      </div>
    </van-list>

    <van-action-sheet
      v-model:show="screenVisible"
      :actions="screenList"
      :round="false"
      @select="onSortSelect"
    />
  </div>
</template>

<script>
import qs from 'qs'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import ListCard from '~/views/mobileApp/components/MobileUI/ListCard.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { useAppPageStateStore } from '~/views/mobileApp/store/useAppPageStateStore'

export default {
  name: 'samples',
  components: {
    MobileTitleBar,
    ListCard,
  },
  beforeRouteEnter(to, from, next) {
    if (from.name === 'menuPage' || from.name === 'menuSearch') {
      const pageState = useAppPageStateStore().getPage('samples')
      pageState.scrollTop = 0
      pageState.resetPage = true
    }

    next()
  },
  beforeRouteLeave(to, from, next) {
    if (from.name === 'samples') {
      const pageState = useAppPageStateStore().getPage('samples')
      pageState.scrollTop = document.documentElement.scrollTop || 0
    }
    next()
  },
  data() {
    return {
      filterIcon: new URL(`~/views/mobileApp/assets/icon/filter.svg`, import.meta.url).href,
      list: [],
      loading: false,
      finished: false,
      screenVisible: false,
      searchValue: '',
      query: {
        quickQryParam: '',
        page: 0,
        rows: 10,
      },
      screenList: [
        { name: '全部样品', url: api.samples.allObject },
        { name: '待检测样品', url: api.samples.waitTestObject },
        { name: '在检样品', url: api.samples.testingObject },
        { name: '已留样样品', url: api.samples.savedObject },
        { name: '已处理样品', url: api.samples.processedObject },
      ],
      screenIndex: 0,
      scrollTop: 0,
      statusTextObj: {
        '000': '待入库',
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
        '11': '分包',
      },
    }
  },
  activated() {
    const pageState = useAppPageStateStore().getPage('samples')
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

      this.screenIndex = 0
      this.screenList = this.screenList.map(item => ({
        ...item,
        color: '',
      }))
      this.screenList[this.screenIndex].color = '#154bd0'

      this.screenVisible = false
      this.screenVisible = false
      this.onSearch()
    },
    openScreen(type) {
      if (type === 2) {
        this.screenVisible = true
      }
    },
    onSearch() {
      this.finished = false
      this.query.page = 0
      this.list = []
      this.onLoad()
    },
    // 选择排序
    onSortSelect(row, index) {
      this.screenList = this.screenList.map(item => ({
        ...item,
        color: '',
      }))
      this.screenList[index].color = '#154bd0'

      this.screenIndex = index
      this.screenVisible = false
      this.finished = false
      this.query.page = 0
      this.list = []
      this.onLoad()
    },
    // 选中事件
    onSelect(row) {
      this.$router.push({
        name: 'sampleDetail',
        params: {
          id: row.id || row.objectProcessId,
        },
      })
    },
    // 选中分样
    onSeparate(row) {
      this.$router.push({
        name: 'sampleDetail',
        params: {
          id: row._separateSampleId,
        },
      })
    },
    getSeparateSample(data) {
      const obj = {}
      if (data) {
        const arr = data.split('@@@')
        obj._separateSampleId = arr[0]
        obj._separateSampleNum = arr[1]
      }

      return obj
    },
    async onLoad() {
      this.query.page += 1

      this.loading = true
      const res = await mRequest.post(
        this.screenList[this.screenIndex].url,
        qs.stringify(this.query),
      )
      if (res.rows && res.rows.length > 0) {
        this.list = [
          ...this.list,
          ...res.rows.map(item => ({
            ...item,
            ...this.getSeparateSample(item.separateSample),
          })),
        ]
      }

      if (res.rows && res.rows.length === 0) {
        this.finished = true
      }
      this.loading = false

      if (this.list.length >= res.totalCount) {
        this.finished = true
      }
    },
  },
}
</script>

<style lang="less" scoped>
@import url('./index.less');
</style>
