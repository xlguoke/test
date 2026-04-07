<template>
  <div>
    <van-sticky>
      <MobileTitleBar left-arrow @click-left="$router.go(-1)">
        <template #right>
          <span @click="goScanReg">扫码登记</span>
        </template>
      </MobileTitleBar>

      <SearchBar>
        <SearchBarItem @click="openScreen(1)">
          <van-icon size="18" name="filter-o" />筛选
        </SearchBarItem>
        <SearchBarItem @click="openScreen(2)">
          <van-icon size="18" class-prefix="iconfont" name="sort" />排序
        </SearchBarItem>
      </SearchBar>

      <div v-if="equipmentStore" v-permission="'mobile_eqUseRecord::edit'" class="p-4 flex justify-between items-center bg-[#f5f5f5]">
        <span style="display: flex; align-items: center">
          <van-icon
            style="margin-right: 7px; color: #ff5252; font-size: 18px"
            name="warning-o"
          />
          <span style="color: #939393">您上次有未填写完成的设备</span>
        </span>
        <a @click="goIncompleteEq">编辑</a>
      </div>
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
          { label: '使用人', value: item.userName },
          { label: '开始使用时间', value: item.startUseTime },
          { label: '结束使用时间', value: item.endUseTime },
          { label: '任务编号', value: item.testTaskCode },
          { label: '检测参数', value: item.testParamDisplayName },
          { label: '使用地点', value: item.usePlace },
        ]"
      >
        <template #title>
          <div class="flex items-center gap-[12px]">
            <div>
              <p>{{ item.equipmentName }}</p>
              <p>{{ item.equipmentCode }}</p>
            </div>
          </div>
        </template>
        <template #footer>
          <ListCardAction>
            <van-button v-permission="'mobile_eqUseRecord::edit'" size="small" @click="onEdit(item)">
              编辑
            </van-button>
            <van-button v-permission="'mobile_eqUseRecord::delete'" size="small" type="danger" @click="onDelete(item)">
              删除
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
import dayjs from 'dayjs'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import ListCard from '~/views/mobileApp/components/MobileUI/ListCard.vue'
import ListCardAction from '~/views/mobileApp/components/MobileUI/ListCardAction.vue'
import SearchBar from '~/views/mobileApp/components/MobileUI/SearchBar.vue'
import SearchBarItem from '~/views/mobileApp/components/MobileUI/SearchBarItem.vue'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import EquipmentSearch from '../components/usageRecordSearch.vue'

export default {
  components: {
    ListCard,
    EquipmentSearch,
    MobileTitleBar,
    SearchBar,
    SearchBarItem,
    ListCardAction,
  },
  data() {
    return {
      equipmentStore: null,
      sleList: [],
      list: [],
      loading: false,
      finished: false,
      searchVisible: false,
      screenVisible: false,
      searchValue: '',
      query: {
        page: 0,
        rows: 10,
      },
      screenCondition: {},
      screenList: [
        { name: '默认排序', color: '#154bd0' },
        { name: '使用时间', field: 'date' },
      ],
      scrollTop: 0,
      moreCondition: {
        equipmentName: null, // 设备名称
        equipmentCode: null, // 设备编号
        startUseTime: null, // 开始时间
        endUseTime: null, // 结束时间
        userName: null, // 使用人
        usePlace: null, // 使用地点
      },
      sorting: {},
    }
  },

  created() {
    const a = localStorage.getItem('equipmentStore')
    if (a && a !== 'undefined') {
      this.equipmentStore = JSON.parse(localStorage.getItem('equipmentStore'))
    }
  },
  methods: {
    getMoreSearch(data) {
      this.moreCondition = { ...data }
      this.onRefresh()
    },
    // 刷新
    onRefresh() {
      this.finished = false
      this.list = []
      this.query.page = 0
      this.onLoad()
    },
    goScanReg() {
      this.$router.push({ name: 'scanRegistration' })
    },
    goIncompleteEq() {
      sessionStorage.setItem(
        'paramsEq',
        JSON.stringify({ type: '3', eqStore: this.equipmentStore }),
      )
      this.$router.push({
        name: 'equipmentUseRecord',
        // query: { type:"3",eqStore:this.equipmentStore},
      })
    },
    onEdit(item) {
      sessionStorage.setItem(
        'paramsEq',
        JSON.stringify({ type: '2', selEqList: [item] }),
      )
      this.$router.push({
        name: 'equipmentUseRecord',
        // query: { type:"2",selEqList:selEqList},
      })
    },
    async onDelete(item) {
      showConfirmDialog({
        title: '您正在删除设备使用记录！',
        message: '删除后无法恢复，且会同步删除关联任务中对应参数的设备使用数据，若已转换报告文件，可能需要您重新转换更新，您确定要删除吗？',
        messageAlign: 'left',
      }).then(async () => {
        const res = await mRequest.delete(`testTaskUseEquipmentController/${item.id}`)
        if (res.code === 20000) {
          showSuccessToast('删除成功')
          this.onRefresh()
        }
      })
    },
    openScreen(type) {
      if (type === 1) {
        this.searchVisible = !this.searchVisible
      }
      else if (type === 2) {
        this.screenVisible = true
      }
    },

    // 选择排序
    onSortSelect(row) {
      if (row.field === 'date') {
        this.sorting.orderBy = 'startUseTime'
        this.sorting.sort = 'startUseTime'
        this.sorting.asc = 'asc'
      }
      else {
        this.sorting = {}
      }
      this.screenVisible = false
      this.finished = false
      this.query.page = 0
      this.list = []
      this.onLoad()
    },
    async onLoad() {
      this.query.page += 1
      this.loading = true
      const data = { ...this.moreCondition, ...this.sorting }

      const stamp = []
      if (data.startUseTime || data.endUseTime) {
        if (data.startUseTime) {
          stamp[0] = new Date(data.startUseTime).getTime()
        }
        if (data.endUseTime) {
          stamp[1] = new Date(data.endUseTime).getTime()
        }
        if (!stamp[0]) {
          stamp[0] = dayjs().set('year', -10).valueOf()
        }
        if (!stamp[1]) {
          stamp[1] = dayjs().valueOf()
        }
      }

      const res = await mRequest.get('rest/equipment/useRecord', {
        params: {
          notBindTask: false,
          size: 10,
          page: this.query.page,
          ...data,
          stamp: stamp.length > 0 ? stamp.join(',') : undefined,
          startUseTime: undefined,
          endUseTime: undefined,
        },
      })
      if (res.code === 20000) {
        if (res.data.rows && res.data.rows.length > 0) {
          this.list = [...this.list, ...res.data.rows]
        }
        if (res.data.rows && res.data.rows.length === 0) {
          this.finished = true
        }
        this.loading = false
        if (this.list.length >= res.data.count) {
          this.finished = true
        }
      }
    },
  },
}
</script>
