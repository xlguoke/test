<template>
  <div class="equipment">
    <van-sticky>
      <MobileTitleBar left-arrow @click-left="$router.go(-1)">
        <template #right>
          <span name="filter-o" @click.stop="openScreen(1)">筛选</span>
        </template>
      </MobileTitleBar>
    </van-sticky>

    <van-list
      v-model:loading="loading"
      class="px-4 pt-4"
      :finished="finished"
      :immediate-check="false"
      finished-text="没有更多了"
      style="border-top: solid 1px #e2e2e2"
      @load="onLoad"
    >
      <ListCard
        v-for="item in list"
        :key="item.index"
        :rows="[
          { label: '工程部位/用途', value: item.projectPartAndUse },
          { label: '样品编号', value: item.testObjectCode },
          { label: '记录编号', value: item.testRecordCode },
        ]"
      >
        <template #title>
          {{ item.sampleName }}
          <span v-if="item.sampleStandard">（{{ item.sampleStandard }}）</span>
        </template>
        <template #footer>
          <ListCardAction>
            <van-button
              size="small"
              @click="onSelect(item.taskId)"
            >
              详情
            </van-button>
          </ListCardAction>
        </template>
      </ListCard>
    </van-list>
    <van-action-sheet
      v-model:show="screenVisible"
      title="排序"
      :actions="screenList"
      :round="false"
      @select="onSortSelect"
    />
    <EquipmentSearch
      ref="EquipmentSearch"
      v-model:value="searchVisible"
      @callback="getMoreSearch"
    />
  </div>
</template>

<script>
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import ListCard from '~/views/mobileApp/components/MobileUI/ListCard.vue'
import ListCardAction from '~/views/mobileApp/components/MobileUI/ListCardAction.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { useAppPageStateStore } from '~/views/mobileApp/store/useAppPageStateStore'
import EquipmentSearch from './filter.vue'

export default {
  name: 'unqualifiedTest',
  components: {
    EquipmentSearch,
    MobileTitleBar,
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
  beforeRouteLeave(to, from, next) {
    if (from.name === 'unqualifiedTest') {
      const pageState = useAppPageStateStore().getPage(from.name)
      pageState.scrollTop = document.documentElement.scrollTop || 0
      this.screenCondition = {}
    }
    next()
  },
  data() {
    return {
      list: [],
      loading: false,
      finished: false,
      searchVisible: false,
      screenVisible: false,
      searchValue: '',
      query: {
        quickQuery: '', // quickQuery
        page: 0,
        size: 10, // size
        showByTask: true,
        sort: 'consignDate',
        order: 'desc',
      },
      screenCondition: {},
      screenList: [
        { name: '默认排序', color: '#40a9ff' },
        { name: '设备编号', field: 'equipmentSn' },
        { name: '设备名称', field: 'name' },
      ],
      scrollTop: 0,
      moreCondition: {},
    }
  },
  activated() {
    const pageState = useAppPageStateStore().getPage('unqualifiedTest')
    const { scrollTop, resetPage } = pageState

    window.scrollTo(0, scrollTop || 0)

    if (resetPage === true || resetPage === undefined || resetPage === null) {
      this.resetPage()
      pageState.resetPage = false
      this.moreCondition = {}
      this.screenCondition = {}
    }
  },
  methods: {
    getMoreSearch(data) {
      this.moreCondition = { ...data }
      this.onSearch()
    },
    resetPage() {
      window.scrollTo(0, 0)
      this.query = {
        quickQuery: '',
        page: 0,
        size: 10,
        showByTask: true,
        sort: 'consignDate',
        order: 'desc',
      }
      this.screenCondition = {}
      this.moreCondition = {}
      this.screenList = this.screenList.map(item => ({
        ...item,
        color: '',
      }))
      this.screenList[0].color = '#40a9ff'
      this.searchVisible = false
      this.onSearch()
    },
    openScreen(type) {
      if (type === 1) {
        this.searchVisible = !this.searchVisible
        this.$refs.EquipmentSearch.showData(this.moreCondition)
      }
      else if (type === 2) {
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
      !row.field
        ? (this.screenCondition = {})
        : (this.screenCondition = {
            sort: row.field,
            order: 'asc',
          })

      this.screenList = this.screenList.map(item => ({
        ...item,
        color: '',
      }))
      this.screenList[index].color = '#40a9ff'

      this.screenVisible = false
      this.finished = false
      this.query.page = 0
      this.list = []
      this.onLoad()
    },
    // 选中事件
    onSelect(taskId) {
      this.$router.push({
        name: 'unqualifiedTestDetail',
        params: {
          taskId,
        },
      })
    },
    async onLoad() {
      this.query.page += 1
      this.loading = true
      const res = await mRequest.get(api.testManage.disqualificationUrl, {
        params: {
          ...this.query,
          ...this.screenCondition,
          ...this.moreCondition,
        },
      })
      if (res.code === 20000) {
        if (res.data.rows && res.data.rows.length > 0) {
          this.list = [...this.list, ...res.data.rows].map((item, index) => ({
            ...item,
            index,
          }))
        }
        if (res.data.count === 0) {
          this.finished = true
        }
      }
      this.loading = false
      if (this.list.length >= res.data.count) {
        this.finished = true
      }
    },
  },
}
</script>

<style lang="less" scoped>
@import url('./index.less');
</style>
