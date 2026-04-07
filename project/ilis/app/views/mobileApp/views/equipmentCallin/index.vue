<template>
  <div class="equipment">
    <van-sticky>
      <MobileTitleBar left-arrow @click-left="$router.go(-1)" />

      <van-tabs v-model:active="activeName" @click="onClickTab">
        <van-tab title="待调入设备" :name="1"></van-tab>
        <van-tab title="设备调入记录" :name="2"></van-tab>
      </van-tabs>
      <div v-if="activeName === 1">
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
      </div>
    </van-sticky>
    <div v-if="activeName === 1">
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
              <div>
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
            </div>
          </template>

          <template #footer>
            <ListCardAction>
              <van-button
                size="small"
                @click="goCallinForm(item)"
              >
                详情
              </van-button>
            </ListCardAction>
          </template>
        </ListCard>
      </van-list>
    </div>
    <div v-else-if="activeName === 2">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        class="p-4"
        @load="getEqRecord"
      >
        <ListCard
          v-for="item in eqRecordList"
          :key="item.id"
          :rows="[
            { label: '设备编号', value: item.equipmentSn },
            { label: '规格型号', value: item.standard },
            { label: '调出方', value: item.callOutName },
            { label: '调出时间', value: formatDate(item.callOutTime, 'YYYY-MM-DD') },
            { label: '调入方', value: item.callInName },
            { label: '调入时间', value: formatDate(item.callInTime, 'YYYY-MM-DD') },
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
            </div>
          </template>
        </ListCard>
      </van-list>
    </div>

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
import { formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import EquipmentSearch from './components/search.vue'

export default {
  components: {
    SearchBar,
    SearchBarItem,
    ListCardAction,
    ListCard,
    EquipmentSearch,
    MobileTitleBar,
  },
  data() {
    return {
      eqRecordList: [],
      currentDate: new Date(),
      userInfo: JSON.parse(localStorage.getItem('userInfo')),
      formatDate,
      callinSideShow: false,
      calloutSideShow: false,
      showCalloutForm: false,
      callInPersonShow: false,
      calloutDateShow: false,
      calloutStartDateShow: false,
      calloutEndDateShow: false,
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
      },
      recaordPage: 0,
      screenCondition: {},
      screenList: [
        { name: '默认排序', color: '#154bd0' },
        { name: '设备编号', field: 'equipmentSn' },
        { name: '下次检校时间', field: 'preCheckDate' },
      ],
      scrollTop: 0,
      moreCondition: {},

      callOutTime: formatDate(new Date(), 'YYYY-MM-DD'),
      transferStart: formatDate(new Date(), 'YYYY-MM-DD'),
      transferEnd: '',

      projectCalloutList: [],
      selCalloutSide: {},

      projectCallInList: [],
      selCallInSide: {},

      personCallInList: [],
      selCallInPerson: {},

      callOutRemark: '',
    }
  },
  created() {
    this.resetPage()
  },
  methods: {
    getMoreSearch(data) {
      this.moreCondition = { ...data }
      this.onSearch()
    },
    goCallinForm(item) {
      this.$router.push({
        name: 'equipmentCallinForm',
        params: {
          id: item.id,
        },
      })
    },
    onClickTab() {
      if (this.activeName === 1) {
        this.resetPage()
      }
      else {
        this.recaordPage = 0
        this.eqRecordList = []
        this.getEqRecord()
      }
    },
    getEqRecord() {
      this.recaordPage++
      mRequest
        .get('rest/eqTransfer/user/record/list', {
          params: {
            userId: this.userInfo.userId,
            callType: 20,
            page: this.recaordPage,
            rows: 10,
          },
        })
        .then((res) => {
          if (res.code === 20000) {
            this.eqRecordList = [...this.eqRecordList, ...res.data.rows]
            if (res.data.rows && res.data.rows.length === 0) {
              this.finished = true
            }
            this.loading = false

            if (this.eqRecordList.length >= res.data.count) {
              this.finished = true
            }
          }
        })
    },
    Search(data) {
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
        name: 'equipmentCallinForm',
        params: {
          id,
        },
      })
    },
    async onLoad() {
      this.query.page += 1

      this.loading = true
      const res = await mRequest.post(
        api.equipment.list,
        qs.stringify({
          transferStatus: 20,
          sort: 'recordTime',
          order: 'desc',
          ...this.query,
          ...this.screenCondition,
          ...this.moreCondition,
        }),
      )
      if (res.rows && res.rows.length > 0) {
        res.rows.forEach((item) => {
          item.checked = false
        })
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
