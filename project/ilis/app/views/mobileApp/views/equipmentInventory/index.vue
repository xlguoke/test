<template>
  <div>
    <van-sticky>
      <MobileTitleBar
        class="left-title"
        title="固定资产盘点"
        left-arrow
        @click-left="$router.go(-1)"
      >
      </MobileTitleBar>

      <SearchBar>
        <SearchBarItem @click="openScreen(1)">
          <van-icon size="18" class-prefix="iconfont" name="search" />搜索
        </SearchBarItem>
        <SearchBarItem @click="openScreen(2)">
          <van-icon size="18" class-prefix="iconfont" name="sort" />筛选
        </SearchBarItem>
      </SearchBar>

      <van-search
        v-if="quickSearchVisible"
        v-model.trim="query.queryCode"
        placeholder="请输入盘点单号/盘点单名称"
        @search="onSearch"
      />
    </van-sticky>
    <van-list
      v-model:loading="loading"
      finished-text="没有更多了"
      :finished="finished"
      class="p-4"
      @load="onLoad()"
    >
      <div v-for="item in list" :key="item.id" @click="handleEdit(item)">
        <OrderCard :data="item"></OrderCard>
      </div>
    </van-list>
    <InventorySearch
      v-model:value="searchVisible"
      :inital-data="moreCondition"
      @callback="getMoreSearch"
    />
  </div>
</template>

<script>
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import SearchBar from '~/views/mobileApp/components/MobileUI/SearchBar.vue'
import SearchBarItem from '~/views/mobileApp/components/MobileUI/SearchBarItem.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import InventorySearch from './component/InventorySearch.vue'
import OrderCard from './component/OrderCard.vue'

export default {
  components: {
    SearchBar,
    SearchBarItem,
    InventorySearch,
    OrderCard,
    MobileTitleBar,
  },
  data() {
    return {
      loading: false,
      finished: false,
      list: [],
      query: {
        page: 0,
        size: 10,
        queryCode: '',
      },
      quickSearchVisible: false,
      searchVisible: false,
      moreCondition: {},
    }
  },
  methods: {
    openScreen(type) {
      if (type === 1) {
        this.quickSearchVisible = !this.quickSearchVisible
      }
      else if (type === 2) {
        this.searchVisible = !this.searchVisible
      }
    },
    async onLoad() {
      this.query.page += 1
      this.loading = true
      const res = await mRequest.get(api.equipmentInventory.pageList, {
        params: {
          ...this.query,
          ...this.moreCondition,
        },
      })
      if (res.code !== 20000) {
        showFailToast(res.message || '获取列表数据失败')
        return
      }
      if (res.data.rows && res.data.rows.length > 0) {
        this.list = [...this.list, ...res.data.rows]
        res.data.rows.forEach((item) => {
          this.getStatic(item)
        })
      }

      if (res.data.rows && res.data.rows.length === 0) {
        this.finished = true
      }
      this.loading = false

      if (this.list.length >= res.data.count) {
        this.finished = true
      }
    },
    async getStatic(row) {
      const { data, code } = await mRequest.get(
        api.equipmentInventory.static,
        {
          params: { inventoryId: row.id },
        },
      )
      if (code === 20000) {
        // row[20] = data[20] || 0
        // row[30] = data[30] || 0
        // row[40] = data[40] || 0
        row['20'] = data['20'] || 0
        row['30'] = data['30'] || 0
        row['40'] = data['40'] || 0
      }
    },
    handleEdit(item) {
      this.$router.push({
        name: 'equipmentMakeInventory',
        query: {
          id: item.id,
        },
      })
    },
    onSearch() {
      this.finished = false
      this.query.page = 0
      this.list = []
      this.onLoad()
    },
    getMoreSearch(data) {
      this.moreCondition = { ...data }
      this.onSearch()
    },
  },
}
</script>
