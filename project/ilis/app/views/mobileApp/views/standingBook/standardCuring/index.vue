<template>
  <div ref="wrap" class="standingBook-wrap">
    <van-sticky>
      <MobileTitleBar title="标养台账" left-arrow @click-left="$router.go(-1)">
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
          class="p-4"
          @load="onLoad"
        >
          <ListCard
            v-for="item in list"
            :key="item.id"
            :rows="[
              { label: '试件编号', value: item.periodCode },
              { label: '龄期', value: item.periodDays ? `${item.periodDays}天` : '' },
              { label: '制样人', value: item.producer },
              { label: '制样时间', value: formatDate(item.formingDate) },
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
                <van-tag v-if="item.isTested === '1'" color="green">
                  已检
                </van-tag>
                <van-tag v-else color="#999">
                  出库
                </van-tag>
              </div>
            </template>
            <template #footer>
              <div
                v-if="item.isTested !== '1' && item.planTestTime"
                class="text-right text-xs pb-4"
                :class="{
                  red: checkDate(item.planTestTime) < 0,
                  green:
                    checkDate(item.planTestTime) > 0
                    && checkDate(item.planTestTime) <= 24 * 60 * 60 * 1000,
                  yellow:
                    checkDate(item.planTestTime) > 24 * 60 * 60 * 1000
                    && checkDate(item.planTestTime) <= 72 * 60 * 60 * 1000,
                  blue: checkDate(item.planTestTime) > 72 * 60 * 60 * 1000,
                }"
              >
                <p>{{ checkDateStr(checkDate(item.planTestTime)) }}</p>
                <p class="mt-2">
                  计划试验时间 {{ dayjs(item.planTestTime).format('YYYY-MM-DD') }}
                </p>
              </div>
            </template>
          </ListCard>
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
      dayjs,
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
        dueDate: {
          value: '今日到期',
          name: '到期时间：',
          hidden: false,
        },
        tested: {
          value: 0,
          valueStr: '未检测',
          name: '是否已检测：',
          hidden: false,
        },
        planTestDateStart: {
          value: new Date(),
          name: '',
          type: 1,
          hidden: true,
        },
        planTestDateEnd: {
          value: new Date(),
          name: '',
          type: 1,
          hidden: true,
        },
        producer: {
          value: '',
          name: '制样人：',
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
      const dueDate = this.filter.dueDate.value
      const tested = this.filter.tested.value
      if (dueDate === '今日到期') {
        this.filter.planTestDateStart.value = formatDate(
          new Date(formatDate(new Date(), 'YYYY/MM/DD 00:00:00')),
          'YYYY-MM-DD 00:00:00',
        )
        this.filter.planTestDateEnd.value = formatDate(
          new Date(formatDate(new Date(), 'YYYY/MM/DD 00:00:00')),
          'YYYY-MM-DD 23:59:59',
        )
      }
      else if (dueDate === '三日内到期') {
        this.filter.planTestDateStart.value = formatDate(
          new Date(
            formatDate(new Date().add('d', -2), 'YYYY/MM/DD 00:00:00'),
          ),
          'YYYY-MM-DD 00:00:00',
        )
        this.filter.planTestDateEnd.value = formatDate(
          new Date(formatDate(new Date(), 'YYYY/MM/DD 00:00:00')),
          'YYYY-MM-DD 23:59:59',
        )
      }
      else {
        this.filter.planTestDateStart.value = null
        this.filter.planTestDateEnd.value = null
      }

      if (tested === '已检测' || tested === 1) {
        this.filter.tested.value = 1
        this.filter.tested.valueStr = '已检测'
      }
      else if (tested === '未检测' || tested === 0) {
        this.filter.tested.value = 0
        this.filter.tested.valueStr = '未检测'
      }
      else {
        this.filter.tested.value = null
        this.filter.tested.valueStr = '全部'
      }
      this.filter.producer.value = this.filter.producer.hidden
        ? ''
        : this.filter.producer.value
          ? this.filter.producer.value
          : this.realName
      Object.keys(this.filter).forEach((item) => {
        arr.push({ ...this.filter[item], label: `${item}` })
        obj[item]
          = this.filter[item].value || this.filter[item].value === 0
            ? this.filter[item].value
            : null
      })
      this.filterList = arr
      return obj
    },
  },
  mounted() {
    this.changeScroll()
  },
  methods: {
    changeScroll() {
      if (this.$refs && this.$refs.wrap) {
        this.$refs.wrap.scrollTop = 0
      }
    },
    checkDate(time) {
      const now = new Date().getTime()
      const playTime = new Date(time).getTime()
      return playTime - now
    },
    checkDateStr(val) {
      const num = Number.isNaN(val * 1) ? 0 : val * 1
      if (!num) {
        return '非数字无法转换!'
      }
      let str = ''
      const t = Math.abs(num / (60 * 60 * 1000))
      const d = Math.floor(t / 24)
      const h = Math.floor(t % 24)
      if (num > 0) {
        str = `${d === 0 ? '' : `${d}天`}${h}小时后到期`
      }
      else {
        str = `已超期${d === 0 ? '' : `${d}天`}${h}小时`
      }
      return str
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
        name: 'samplesDeliveryDetail',
        params: {
          id: row.processObjectId || row.testObjectId,
        },
        query: {
          type: 'samplesDelivery',
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
        .get(api.samples.periodControllerGetPager, {
          params: {
            ...this.params,
            page: this.currentPage,
            rows: this.pageSize,
          },
        })
        .then((res) => {
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
          this.error = true
        })
        .finally(() => {
          this.isLoading = false
          this.loading = false
          if (toast) {
            toast.close()
          }
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
