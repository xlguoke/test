<template>
  <div ref="wrap" class="standingBook-wrap">
    <van-sticky>
      <MobileTitleBar
        title="标养室出入库台账"
        left-arrow
        @click-left="$router.go(-1)"
      >
        <template #right>
          <span @click.stop="showFilter">筛选 </span>
        </template>
      </MobileTitleBar>
    </van-sticky>
    <div
      v-if="
        filterList
          && filterList.filter(
            (item) =>
              (item.valueStr && item.valueStr !== '全部')
              || (!item.hidden && (item.value || item.value === 0) && item.name),
          ).length
      "
      class="standingBook-filter-wrap"
    >
      <div class="standingBook-filter-info">
        <template v-for="(item, index) in filterList" :key="index">
          <div
            v-if="
              (item.valueStr && item.valueStr !== '全部')
                || (!item.hidden && (item.value || item.value === 0) && item.name)
            "
            class="standingBook-tag-box"
          >
            <div class="standingBook-tag">
              <!-- {{ item.name }} -->
              <template v-if="item.valueStr">
                {{ item.valueStr }}
              </template>
              <template v-else-if="item.type === 1 || item.type === 2">
                {{ formatDate(item.value) }}~{{ formatDate(filter[item.end].value) }}
              </template>
              <template v-else>
                {{ item.value }}
              </template>
            </div>
            <div class="standingBook-tag-icon" @click="delTag(item, index)">
              <van-icon name="cross" />
            </div>
          </div>
        </template>
      </div>
    </div>
    <div class="standingBook-content">
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
          <div
            class="px-4"
            :class="{
              'pt-4': filterList.length,
            }"
          >
            <ListCard
              v-for="item in list"
              :key="item.id"
              :rows="[
                { label: '试件编号', value: item.periodCode },
                { label: '入库人', value: item.operator },
                { label: item.operationType === '1' ? '入库时间' : '出库时间', value: dayjs(item.operationDate).format('YYYY-MM-DD') },
              ]"
            >
              <template #title>
                <div class="flex items-center gap-4">
                  <div class="flex-1">
                    {{ item.testSampleDisplayName }}
                    <template v-if="item.testObjectCode">
                      ({{ item.testObjectCode }})
                    </template>
                  </div>
                  <van-tag v-if="item.operationType === '1'" color="green">
                    入库
                  </van-tag>
                  <van-tag v-else color="#f59a23">
                    出库
                  </van-tag>
                </div>
              </template>
              <template #footer>
                <ListCardAction>
                  <van-button size="small" @click="detail(item)">
                    详情
                  </van-button>
                </ListCardAction>
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
/* eslint-disable vue/no-side-effects-in-computed-properties */

import dayjs from 'dayjs'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import ListCard from '~/views/mobileApp/components/MobileUI/ListCard.vue'
import ListCardAction from '~/views/mobileApp/components/MobileUI/ListCardAction.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import vFilter from './components/filter.vue'

export default {
  components: {
    ListCardAction,
    VFilter: vFilter,
    MobileTitleBar,
    ListCard,
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
        operationDateStart: {
          value: new Date(new Date().add('d', -6)),
          name: '入库日期：',
          type: 1,
          start: 'operationDateStart',
          end: 'operationDateEnd',
          hidden: false,
        },
        operationDateEnd: {
          value: new Date(),
          name: '',
          type: 1,
          start: 'operationDateStart',
          end: 'operationDateEnd',
          hidden: true,
        },
        sampleName: {
          value: '',
          name: '样品名称：',
          hidden: false,
        },
        sampleSn: {
          value: '',
          name: '样品编号：',
          hidden: false,
        },
        inOut: {
          value: '',
          valueStr: '全部',
          name: '分类：',
          hidden: false,
        },
      },
    }
  },
  computed: {
    params() {
      const obj = {}
      const arr = []
      const inOut = this.filter.inOut.value
      this.filter.operationDateStart.value = formatDate(
        this.filter.operationDateStart.value,
        'YYYY-MM-DD 00:00:00',
      )
      this.filter.operationDateEnd.value = formatDate(
        this.filter.operationDateEnd.value,
        'YYYY-MM-DD 23:59:59',
      )
      if (inOut === '入库' || inOut === 1) {
        this.filter.inOut.value = 1
        this.filter.inOut.valueStr = '入库'
      }
      else if (inOut === '出库' || inOut === 2) {
        this.filter.inOut.value = 2
        this.filter.inOut.valueStr = '出库'
      }
      else {
        this.filter.inOut.value = null
        this.filter.inOut.valueStr = '全部'
      }
      Object.keys(this.filter).forEach((item) => {
        arr.push({ ...this.filter[item], label: `${item}` })
        obj[item] = this.filter[item].value ? this.filter[item].value : null
      })
      this.filterList = arr
      return obj
    },
  },
  mounted() {
    this.changeScroll()
  },
  methods: {
    dayjs,
    changeScroll() {
      if (this.$refs && this.$refs.wrap) {
        this.$refs.wrap.scrollTop = 0
      }
    },
    delTag(item) {
      if (item.type === 1 || item.type === 2) {
        this.filter[item.start].value = ''
        this.filter[item.end].value = ''
        this.filter[item.end].hidden = true
      }
      else {
        this.filter[item.label].value = ''
        this.filter[item.label].hidden = true
      }
      this.onRefresh()
    },
    detail(row) {
      this.$router.push({
        name: 'standardCuringDeliveryDetail',
        query: {
          id: row.id,
          type: 'standardCuringDelivery',
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
          if (i === 'operationDateEnd') {
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
        .get(api.samples.periodStorageGetPager, {
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
