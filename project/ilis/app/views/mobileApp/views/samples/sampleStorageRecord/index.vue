<template>
  <div class="sampleStorageRecord-wrap">
    <van-sticky>
      <MobileTitleBar title="入库记录" left-arrow @click-left="$router.go(-1)">
        <template #right>
          <span @click.stop="showFilter">筛选 </span>
        </template>
      </MobileTitleBar>
    </van-sticky>
    <div
      v-if="
        filterList
          && filterList.filter((item) => !item.hidden && item.value).length
      "
      class="sampleStorageRecord-filter-wrap"
    >
      <div class="sampleStorageRecord-filter-info">
        <div
          v-for="(item, index) in filterList"
          v-show="!item.hidden && item.value"
          :key="index"
          class="sampleStorageRecord-tag-box"
        >
          <div class="sampleStorageRecord-tag">
            {{ item.name }}
            <template v-if="item.type === 1">
              {{ formatDate(item.value) }}~{{ formatDate(filterList[index + 1].value) }}
            </template>
            <template v-else>
              {{ item.value }}
            </template>
          </div>
          <div
            class="sampleStorageRecord-tag-icon"
            @click="delTag(item, index)"
          >
            <van-icon name="cross" />
          </div>
        </div>
      </div>
    </div>
    <div class="sampleStorageRecord-content">
      <van-pull-refresh
        v-model="isLoading"
        success-text="刷新成功"
        @refresh="onRefresh"
      >
        <van-list
          v-model:loading="loading"
          v-model:error="error"
          :finished="finished"
          error-text="请求失败，点击重新加载"
          :finished-text="finishedText"
          @load="onLoad"
        >
          <div class="sampleStorageRecord-list px-4">
            <ListCard
              v-for="(item, index) in list"
              :key="index"
              :rows="[
                { label: '试样数量', value: item.sampleNum },
                { label: '入库日期', value: item.storageDate },
                { label: '样品编号', value: item.testObjectSn },
              ]"
              @click.stop="detail(item, index)"
            >
              <template #title>
                {{ item.sampleDisplayName }}
                <template v-if="item.standard">
                  ({{ item.standard }})
                </template>
              </template>
            </ListCard>
          </div>
        </van-list>
      </van-pull-refresh>
    </div>
    <VFilter
      v-model:value="filterVisible"
      :inital-data="params"
      @callback="onSearch"
    ></VFilter>
  </div>
</template>

<script>
import { mapState } from 'pinia'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import ListCard from '~/views/mobileApp/components/MobileUI/ListCard.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { useAppUserStore } from '~/views/mobileApp/store/useUserStore.ts'
import vFilter from './components/filter.vue'

export default {
  components: {
    ListCard,
    VFilter: vFilter,
    MobileTitleBar,
  },
  data() {
    return {
      formatDate,
      searchStr: '',
      totalCount: 0,
      currentPage: 1,
      pageSize: 10,
      timeTagShow: true,
      personTagShow: true,
      isLoading: false,
      loading: false,
      finished: false,
      error: false,
      list: [],
      initalData: {},
      filterVisible: false,
      finishedText: '没有更多了',
      filterList: [],
      filter: {
        dateStart: {
          value: new Date(),
          name: '',
          type: 1,
          hidden: false,
        },
        dateEnd: {
          value: new Date(),
          name: '',
          type: 1,
          hidden: true,
        },
        saveSite: {
          value: '',
          name: '存放位置：',
          hidden: false,
        },
        operator: {
          value: '',
          name: '入库操作者：',
          hidden: false,
        },
      },
    }
  },
  computed: {
    ...mapState(useAppUserStore, ['userInfo']),
    realName() {
      return this.userInfo.realName
    },
    params() {
      const obj = {}
      const arr = []
      const operator = this.filter.operator.value
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      this.filter.dateStart.value = formatDate(this.filter.dateStart.value)
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      this.filter.dateEnd.value = formatDate(this.filter.dateEnd.value)
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      this.filter.operator.value = this.filter.operator.hidden ? '' : (operator || this.realName)
      Object.keys(this.filter).forEach((item) => {
        arr.push({ ...this.filter[item], label: `${item}` })
        obj[item] = this.filter[item].value ? this.filter[item].value : null
      })
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      this.filterList = arr
      return obj
    },
  },
  methods: {
    delTag(item) {
      if (item.type === 1) {
        this.filter.dateStart.value = ''
        this.filter.dateEnd.value = ''
      }
      else {
        this.filter[item.label].value = ''
        this.filter[item.label].hidden = true
      }
      this.onRefresh()
    },
    detail(row) {
      this.$router.push({
        name: 'sampleDetail',
        params: {
          id: row.processObjectId || row.testObjectId,
        },
        query: {
          type: 'sampleStorageRecord',
        },
      })
    },
    showFilter() {
      this.filterVisible = true
    },
    onSearch(formData) {
      const filter = this.filter
      Object.keys(formData).forEach((i) => {
        if (Object.prototype.hasOwnProperty.call(filter, i)) {
          this.filter[i].value = formData[i]
          if (i === 'dateEnd') {
            this.filter[i].hidden = true
          }
          else {
            this.filter[i].hidden = !formData[i]
          }
        }
      })
      this.onRefresh()
    },

    onLoad(type) {
      const toast
        = type === 'refresh'
          ? showLoadingToast({
              duration: 0,
              message: '加载中...',
              forbidClick: true,
            })
          : ''
      this.loading = true
      mRequest
        .get(api.samples.queryStorageRecord, {
          params: {
            ...this.params,
            page: this.currentPage,
            rows: this.pageSize,
          },
        })
        .then((res) => {
          toast && toast.close()
          this.isLoading = false
          this.loading = false
          if (res.code === 20000) {
            // 加载状态结束
            const arr = res.data ? (res.data.rows ? res.data.rows : []) : []
            this.list = this.currentPage === 1 ? arr : [...this.list, ...arr]
            // 加载状态结束
            this.currentPage++
            this.error = false
            // 数据全部加载完成
            if (!arr || !arr.length) {
              // 数据全部加载完成
              this.finished = true
              this.finishedText = !this.list.length
                ? '数据为空哦！'
                : '没有更多了'
            }
          }
          else {
            showDialog({ message: res.msg || res.message })
            this.error = true
          }
        })
        .catch((_) => {
          this.isLoading = false
          this.loading = false
          this.error = true

          toast && toast.close()
        })
    },
    onRefresh() {
      // 清空列表数据
      this.finished = false
      // 重新加载数据
      // 将 loading 设置为 true，表示处于加载状态
      this.isLoading = true
      this.currentPage = 1
      this.onLoad('refresh')
    },
  },
}
</script>

<style lang="less" scoped>
@import url('./index.less');
</style>
