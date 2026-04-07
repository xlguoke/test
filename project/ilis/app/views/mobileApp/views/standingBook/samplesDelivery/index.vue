<template>
  <div ref="wrap" class="standingBook-wrap">
    <van-sticky>
      <MobileTitleBar title="样品出入库台账" left-arrow @click-left="$router.go(-1)">
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
              item.valueStr === 0
              || item.valueStr
              || (!item.hidden && item.value && item.name),
          ).length
      "
      class="standingBook-filter-wrap"
    >
      <div class="standingBook-filter-info">
        <template v-for="(item, index) in filterList" :key="index">
          <div
            v-if="
              item.valueStr === 0
                || item.valueStr
                || (!item.hidden && item.value && item.name)
            "
            class="standingBook-tag-box"
          >
            <div class="standingBook-tag">
              {{ item.name }}
              <template v-if="item.type === 1 || item.type === 2">
                {{ formatDate(item.value) }}~{{ formatDate(filter[item.end].value) }}
              </template>
              <template v-else-if="item.type === 3">
                <span v-if="item.valueStr === 1">已出库</span>
                <span v-else-if="item.valueStr === 0">未出库</span>
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
        class="p-4"
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
          <ListCard
            v-for="item in list"
            :key="item.id"
            :rows="[
              { label: '入库日期', value: item.storageDate },
              { label: '入库操作人', value: item.storageUser },
              { label: '试样数量', value: item.sampleNum },
              { label: '样品编号', value: item.testObjectSn },
            ]"
          >
            <template #title>
              <div class="flex items-center">
                <div class="flex-1">
                  {{ item.sampleDisplayName }}
                  <template v-if="item.standard">
                    ({{ item.standard }})
                  </template>
                </div>
                <van-tag v-if="item.getCount + item.subCount" color="green">
                  已出库
                </van-tag>
                <van-tag v-else>
                  未出库
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
          value: new Date(new Date().add('d', -6)),
          name: '入库日期：',
          type: 1,
          start: 'dateStart',
          end: 'dateEnd',
          hidden: false,
        },
        dateEnd: {
          value: new Date(),
          name: '',
          type: 1,
          start: 'dateStart',
          end: 'dateEnd',
          hidden: true,
        },
        objectName: {
          value: '',
          name: '样品名称：',
          hidden: false,
        },
        standard: {
          value: '',
          name: '规格型号：',
          hidden: false,
        },
        objectCode: {
          value: '',
          name: '样品编号：',
          hidden: false,
        },
        operator: {
          value: '',
          name: '入库操作人：',
          hidden: false,
        },
        outStorage: {
          value: '',
          valueStr: '',
          name: '出入库状态：',
          type: 3,
          hidden: false,
        },
        outTimeStart: {
          value: '',
          name: '出库日期：',
          type: 2,
          start: 'outTimeStart',
          end: 'outTimeEnd',
          hidden: false,
        },
        outTimeEnd: {
          value: '',
          name: '',
          type: 2,
          start: 'outTimeStart',
          end: 'outTimeEnd',
          hidden: true,
        },
      },
    }
  },
  computed: {
    params() {
      const obj = {}
      const arr = []
      this.filter.dateStart.value = formatDate(
        this.filter.dateStart.value,
        'YYYY-MM-DD 00:00:00',
      )
      this.filter.dateEnd.value = formatDate(
        this.filter.dateEnd.value,
        'YYYY-MM-DD 23:59:59',
      )
      this.filter.outTimeStart.value = formatDate(
        this.filter.outTimeStart.value,
        'YYYY-MM-DD 00:00:00',
      )
      this.filter.outTimeEnd.value = formatDate(
        this.filter.outTimeEnd.value,
        'YYYY-MM-DD 23:59:59',
      )
      const value = this.filter.outStorage.value
      this.filter.outStorage.valueStr = value
      if (value === 1) {
        this.filter.outStorage.value = true
      }
      else if (value === 0) {
        this.filter.outStorage.value = false
      }
      else {
        this.filter.outStorage.value = null
      }
      Object.keys(this.filter).forEach((item) => {
        arr.push({ ...this.filter[item], label: `${item}` })
        if (this.filter[item].type === 3) {
          if (this.filter[item].valueStr === 1) {
            obj[item] = true
          }
          else if (this.filter[item].valueStr === 0) {
            obj[item] = false
          }
          else {
            obj[item] = null
          }
        }
        else {
          obj[item] = this.filter[item].value ? this.filter[item].value : null
        }
      })
      this.filterList = arr
      return obj
    },
  },
  mounted() {
    this.filter.dateStart.value = new Date(new Date().add('d', -6))
    this.filter.dateEnd.value = new Date()
    this.changeScroll()
  },
  methods: {
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
      sessionStorage.setItem('samplesDeliveryDetail', JSON.stringify(row))
      this.$router.push({
        name: 'samplesDeliveryDetail',
        // query: {
        //   type: "samplesDelivery",
        //   id: row.processObjectId,
        // },
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
