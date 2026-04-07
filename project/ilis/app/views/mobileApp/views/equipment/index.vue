<template>
  <div class="equipment">
    <van-sticky>
      <MobileTitleBar left-arrow @click-left="$router.go(-1)" />

      <SearchBar>
        <SearchBarItem @click="openScreen(1)">
          <van-icon size="18" class-prefix="iconfont" name="search" />筛选
        </SearchBarItem>
        <SearchBarItem @click="openScreen(2)">
          <van-icon size="18" class-prefix="iconfont" name="sort" />排序
        </SearchBarItem>
      </SearchBar>
    </van-sticky>

    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      class="p-4"
      @load="onLoad"
    >
      <ListCard
        v-for="item in list"
        :key="item.id"
        :rows="[
          { label: '设备编号', value: item.equipmentSn },
          { label: '规格型号', value: item.standard },
        ]"
      >
        <template #title>
          {{ item.name }}
        </template>

        <template #footer>
          <ListCardAction>
            <van-button
              size="small"
              @click="onSelect(item.id)"
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
      v-model:value="searchVisible"
      :inital-data="moreCondition"
      @callback="getMoreSearch"
    />
  </div>
</template>

<script>
import qs from 'qs'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import ListCard from '~/views/mobileApp/components/MobileUI/ListCard.vue'
import ListCardAction from '~/views/mobileApp/components/MobileUI/ListCardAction.vue'
import SearchBar from '~/views/mobileApp/components/MobileUI/SearchBar.vue'
import SearchBarItem from '~/views/mobileApp/components/MobileUI/SearchBarItem.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { useAppPageStateStore } from '~/views/mobileApp/store/useAppPageStateStore'
import EquipmentSearch from './components/search.vue'

export default {
  name: 'equipment',
  components: {
    EquipmentSearch,
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
  beforeRouteLeave(to, from, next) {
    if (from.name === 'equipment') {
      const pageState = useAppPageStateStore().getPage(from.name)
      pageState.scrollTop = document.documentElement.scrollTop || 0
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
        quickQryParam: '',
        page: 0,
        rows: 10,
      },
      screenCondition: {},
      screenList: [
        { name: '默认排序', color: '#154bd0' },
        { name: '设备编号', field: 'equipmentSn' },
        { name: '设备名称', field: 'name' },
      ],
      scrollTop: 0,
      moreCondition: {},
    }
  },
  activated() {
    const pageState = useAppPageStateStore().getPage('equipment')
    const { scrollTop, resetPage } = pageState

    window.scrollTo(0, scrollTop || 0)

    if (resetPage === true || resetPage === undefined || resetPage === null) {
      this.resetPage()
      pageState.resetPage = false
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
        quickQryParam: '',
        page: 0,
        rows: 10,
      }
      this.screenCondition = {}
      this.moreCondition = {}
      this.screenList = this.screenList.map(item => ({
        ...item,
        color: '',
      }))
      this.screenList[0].color = '#154bd0'
      this.searchVisible = false
      this.onSearch()
    },
    openScreen(type) {
      if (type === 1) {
        this.searchVisible = !this.searchVisible
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
      this.screenList[index].color = '#154bd0'

      this.screenVisible = false
      this.finished = false
      this.query.page = 0
      this.list = []
      this.onLoad()
    },
    // 选中事件
    onSelect(id) {
      this.$router.push({
        name: 'equipmentDetail',
        params: {
          id,
        },
      })
    },
    async onLoad() {
      this.query.page += 1

      this.loading = true
      const { checked, ...moreCondition } = this.moreCondition
      const res = await mRequest.post(
        api.equipment.list,
        qs.stringify({
          ...this.query,
          ...this.screenCondition,
          ...moreCondition,
        }),
      )
      if (res.rows && res.rows.length > 0) {
        this.list = [...this.list, ...res.rows]
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
