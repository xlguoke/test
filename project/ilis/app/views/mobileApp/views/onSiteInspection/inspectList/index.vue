<template>
  <div>
    <van-sticky>
      <MobileTitleBar left-arrow @click-left="$router.push({ name: 'menuPage' })" />

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
          { label: '状态', value: item.testStatus },
          {
            label: '检测日期',
            value: item.testDate !== item.testDateEnd
              ? `${formatDate(item.testDate, 'YYYY-MM-DD')} ~ ${formatDate(item.testDateEnd, 'YYYY-MM-DD')}`
              : formatDate(item.testDate, 'YYYY-MM-DD'),
          },
        ]"
      >
        <template #title>
          <div class="flex items-center">
            <div class="flex-1">
              {{ item.sn ? item.sn : '-' }}
            </div>
            <van-tag v-if="item.reformStatus === '整改中'" color="#ff0000">
              {{ item.reformStatus }}
            </van-tag>
            <van-tag v-else color="green">
              {{ item.reformStatus }}
            </van-tag>
          </div>
        </template>

        <template #footer>
          <ListCardAction>
            <van-button
              size="small"
              type="danger"
              @click="delInspect(item)"
            >
              删除
            </van-button>
            <van-button
              size="small"
              @click="copyInspect(item)"
            >
              复制
            </van-button>
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

    <ActionBar>
      <van-button type="primary" @click="goAddInspect">
        新增
      </van-button>
    </ActionBar>

    <van-popup v-model:show="categoryPopup" position="bottom">
      <van-picker
        title="选择分类"
        show-toolbar
        :columns="categoryColumns"
        :columns-field-names="{
          text: 'name',
        }"
        @confirm="onConfirm"
        @cancel="onCancel"
      />
    </van-popup>

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
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import ActionBar from '~/views/mobileApp/components/MobileUI/ActionBar.vue'
import ListCard from '~/views/mobileApp/components/MobileUI/ListCard.vue'
import ListCardAction from '~/views/mobileApp/components/MobileUI/ListCardAction.vue'
import SearchBar from '~/views/mobileApp/components/MobileUI/SearchBar.vue'
import SearchBarItem from '~/views/mobileApp/components/MobileUI/SearchBarItem.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import EquipmentSearch from '../components/search.vue'

export default {
  components: {
    ActionBar,
    SearchBar,
    SearchBarItem,
    ListCardAction,
    ListCard,
    EquipmentSearch,
    MobileTitleBar,
  },
  data() {
    return {
      categoryPopup: false,
      categoryColumns: [],
      list: [],
      loading: false,
      finished: false,
      searchVisible: false,
      screenVisible: false,
      searchValue: '',
      query: {
        quickQry: '',
        page: 0,
        size: 10,
      },
      screenCondition: {},
      screenList: [
        { name: '默认排序', color: '#154bd0' },
        { name: '按时间排序', field: 'testDate' },
        { name: '按标题排序', field: 'sn' },
      ],
      scrollTop: 0,
      moreCondition: {},
    }
  },
  mounted() {
    this.getCategoryList()
  },

  methods: {
    formatDate,
    onConfirm({ selectedOptions }) {
      const row = selectedOptions[0]
      this.$router.push({
        name: 'inspectDetail',
        query: { categoryId: row.id },
      })
    },
    copyInspect(val) {
      mRequest({
        method: 'get',
        url: api.inspectManage.copyInspect,
        params: {
          id: val.id,
        },
      }).then((res) => {
        if (res.code === 20000) {
          showSuccessToast('复制成功')
          this.resetPage()
        }
      })
    },
    delInspect(val) {
      showConfirmDialog({
        title: '提示',
        message: '确认删除',
      }).then(async () => {
        await mRequest({
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'post',
          url: api.inspectManage.delInspects,
          data: [val.id],
        }).then((res) => {
          if (res.code === 20000) {
            this.resetPage()
          }
        })
      })
    },
    onCancel() {
      this.categoryPopup = false
    },
    getMoreSearch(data) {
      this.moreCondition = { ...data }
      this.onSearch()
    },
    resetPage() {
      window.scrollTo(0, 0)
      this.query = {
        quickQry: '',
        page: 1,
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
    async getCategoryList() {
      const res = await mRequest({
        method: 'get',
        url: api.inspectManage.categoryList,
        params: {
          page: 1,
          size: 999,
          quickQry: '',
        },
      })

      if (res.code === 20000) {
        this.categoryColumns = res.data.rows
      }
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
      this.query.page = 1
      this.list = []
      this.getListData()
    },
    // 选择排序
    onSortSelect(row, index) {
      if (!row.field) {
        this.screenCondition = {}
      }
      else {
        this.screenCondition = {
          orderBy: row.field,
          order: 'asc',
          // order: "desc",
        }
      }

      this.screenList = this.screenList.map(item => ({
        ...item,
        color: '',
      }))
      this.screenList[index].color = '#154bd0'

      this.screenVisible = false
      this.finished = false
      this.query.page = 1
      this.list = []
      this.getListData()
    },
    // 选中事件
    onSelect(id) {
      this.$router.push({
        name: 'inspectDetail',
        query: {
          inspectId: id,
        },
      })
    },
    onLoad() {
      this.query.page++
      this.getListData()
    },
    async getListData() {
      this.loading = true
      const res = await mRequest({
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'post',
        url: api.inspectManage.inspectList,
        data: {
          ...this.query,
          ...this.screenCondition,
          ...this.moreCondition,
        },
      })
      this.loading = false
      if (res.code === 20000) {
        if (res.data.rows && res.data.rows.length > 0) {
          this.list = [...this.list, ...res.data.rows]
        }
        if (res.data.rows && res.data.rows.length === 0) {
          this.finished = true
        }
        if (this.list.length >= res.data.count) {
          this.finished = true
        }
      }
      else {
        this.finished = true
        showFailToast(res.message || res.msg || '请求失败')
      }
    },
    goAddInspect() {
      this.categoryPopup = true
    },
  },
}
</script>
