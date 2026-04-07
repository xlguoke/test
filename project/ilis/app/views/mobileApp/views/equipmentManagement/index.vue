<template>
  <div class="equipment">
    <van-sticky>
      <MobileTitleBar left-arrow @click-left="$router.go(-1)" />

      <van-tabs v-model:active="activeName" @click="onClickTab">
        <van-tab title="全部设备" :name="1"></van-tab>
        <van-tab title="我的设备" :name="2"></van-tab>
      </van-tabs>

      <van-search
        v-model.trim="query.quickQryParam"
        show-action
        placeholder="请输入设备名称或编号"
        @search="onSearch"
      >
        <template #action>
          <div style="padding: 0 8px">
            <van-icon
              color="#154bd0"
              size="20"
              class-prefix="iconfont"
              name="scan"
            />
          </div>
        </template>
      </van-search>

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
          { label: '所属部门', value: item.departName },
          { label: '下次检验时间', value: formatDate(item.nextCheckDate, 'YYYY-MM-DD') },
          { label: '所在位置', value: item.serveLocation },
        ]"
      >
        <template #title>
          <div class="flex items-center">
            <div class="flex-1">
              {{ item.name }}
            </div>
            <van-tag v-if="item.transferStatus === '10'" color="#6fae00">
              闲置
            </van-tag>
            <van-tag v-if="item.transferStatus === '20'" color="#154bd0">
              调拨中
            </van-tag>
            <van-tag v-if="item.transferStatus === '30'" type="warning">
              使用中
            </van-tag>
            <van-tag v-if="item.transferStatus === '40'" type="success">
              已安装
            </van-tag>
            <van-tag v-if="item.transferStatus === '50'" color="#ff99aa">
              已移交
            </van-tag>
            <van-tag color="#93b2ff" class="ml-2">
              {{ item.type }}
            </van-tag>
          </div>
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
import { formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import EquipmentSearch from './components/search.vue'

export default {
  components: {
    ListCardAction,
    ListCard,
    SearchBar,
    SearchBarItem,
    EquipmentSearch,
    MobileTitleBar,
  },
  data() {
    return {
      userId: '',
      formatDate,
      showCalloutForm: false,
      activeName: 1,
      checked: false,
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
        ownerId: '',
      },
      screenCondition: {},
      screenList: [
        { name: '默认排序', color: '#154bd0' },
        { name: '设备编号', field: 'equipmentSn' },
        { name: '下次检校时间', field: 'preCheckDate' },
      ],
      scrollTop: 0,
      moreCondition: {},
    }
  },
  created() {
    this.resetPage()
  },
  methods: {
    onClickTab() {
      this.userId
        = this.activeName === 1
          ? ''
          : JSON.parse(localStorage.getItem('userInfo')).userId
      this.resetPage()
    },
    openCalloutBox() {
      this.showCalloutForm = true
    },
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
        ownerId: this.userId,
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
      if (!row.field) {
        this.screenCondition = {}
      }
      else {
        this.screenCondition = {
          sort: row.field,
          order: 'asc',
        }
      }

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
        name: 'equipmentManagementDetail',
        params: {
          id,
        },
      })
    },

    async onLoad() {
      this.query.page += 1
      this.loading = true
      const res = await mRequest.post(
        'equipmentNewController.do?datagrid',
        qs.stringify({
          sort: 'recordTime',
          order: 'desc',
          ...this.query,
          ...this.screenCondition,
          ...this.moreCondition,
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
