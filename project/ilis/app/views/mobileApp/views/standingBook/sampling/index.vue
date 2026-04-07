<template>
  <div ref="wrap" class="standingBook-wrap">
    <van-sticky>
      <MobileTitleBar
        :title="printModel ? `已选择 ${selectNum} 项` : '取样台账'"
        left-arrow
        @click-left="onLeft"
      >
        <template #right>
          <span v-if="!printModel" @click.stop="showFilter">筛选 </span>
        </template>
        <template #left>
          <van-icon v-if="printModel" name="cross" size="16" />
          <van-icon v-else name="arrow-left" size="16" />
        </template>
      </MobileTitleBar>
    </van-sticky>
    <div
      v-if="filterList && filterList.filter((item) => !item.hidden && item.value && item.name).length"
      class="standingBook-filter-wrap"
    >
      <div class="standingBook-filter-info">
        <template v-for="(item, index) in filterList">
          <div v-if="!item.hidden && item.value && item.name" :key="index" class="standingBook-tag-box">
            <div class="standingBook-tag">
              {{ item.name }}
              <template v-if="item.type === 1 || item.type === 2">
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
    <div class="flex-1 overflow-y-auto">
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
          class="p-4 pt-0"
          @load="onLoad"
        >
          <ListCard
            v-for="item in list"
            :key="item.id"
            :rows="[
              { label: '取样地点', value: item.extractSampleLocation },
              { label: '取样人', value: item.createName },
              { label: '样品编号', value: item.testObjectCode },
              { label: '取样日期', value: item.extractedDate ? dayjs(item.extractedDate).format('YYYY-MM-DD') : '' },
            ]"
            @touchstart="onTouchstart(item)"
            @touchend="onTouchend"
          >
            <template #title>
              <div class="flex items-center gap-2">
                <van-checkbox
                  v-if="printModel"
                  v-model="item._printChecked"
                  shape="square"
                ></van-checkbox>
                <span>
                  {{ item.testSampleDisplayName }}
                  <template v-if="item.standard">
                    ({{ item.standard }})
                  </template>
                </span>
              </div>
            </template>
            <template #footer>
              <ListCardAction>
                <van-button
                  v-if="!printModel"
                  size="small"
                  @click="onDetail(item, index)"
                >
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

    <div v-if="printModel && InAndroid" class="p-4 flex flex-col gap-4">
      <van-button type="primary" block @click="onPrint(1)">
        打印样品标签
      </van-button>
      <van-button type="primary" block @click="onPrint(2)">
        打印样品标签（按试件打印）
      </van-button>
    </div>
  </div>
</template>

<script>
/* eslint-disable vue/no-side-effects-in-computed-properties */

import dayjs from 'dayjs'
import { mapState, mapWritableState } from 'pinia'
import {
  showDialog,
} from 'vant'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import ListCard from '~/views/mobileApp/components/MobileUI/ListCard.vue'
import ListCardAction from '~/views/mobileApp/components/MobileUI/ListCardAction.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { compatibleDate, formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { InAndroid } from '~/views/mobileApp/provides/utils/referrer'
import { useSampleStore } from '~/views/mobileApp/store/useSampleStore'
import { useAppUserStore } from '~/views/mobileApp/store/useUserStore.ts'
import { $emit } from '../../utils/gogocodeTransfer'
import vFilter from './components/filter.vue'

export default {
  components: {
    ListCardAction,
    ListCard,
    VFilter: vFilter,
    MobileTitleBar,
  },
  emits: ['update:value'],
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
          name: '取样日期：',
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
        stamp: {
          value: '',
          name: '',
          type: 4,
          start: 'dateStart',
          end: 'dateEnd',
          hidden: true,
        },
        person: {
          value: '',
          name: '取样人：',
          hidden: false,
        },
        location: {
          value: '',
          name: '取样地点：',
          hidden: false,
        },
      },
      touchTimer: null,
      printModel: false,
      selectNum: 0,
      InAndroid,
    }
  },
  computed: {
    ...mapWritableState(useSampleStore, ['samplingPrintList']),
    ...mapState(useAppUserStore, ['userInfo']),
    realName() {
      return this.userInfo.realName
    },
    params: {
      get() {
        const obj = {}
        const arr = []
        this.filter.dateStart.value = formatDate(this.filter.dateStart.value)
        this.filter.dateEnd.value = formatDate(this.filter.dateEnd.value)
        this.filter.person.value = this.filter.person.hidden
          ? ''
          : this.filter.person.value
            ? this.filter.person.value
            : this.realName
        this.filter.stamp.value = [
          this.filter.dateStart.value,
          this.filter.dateEnd.value,
        ]
          .filter(i => i)
          .map(i => new Date(i).getTime())
          .join(',')
        Object.keys(this.filter).forEach((item) => {
          arr.push({ ...this.filter[item], label: `${item}` })
          obj[item] = this.filter[item].value ? this.filter[item].value : null
        })
        this.filterList = arr
        return obj
      },
      set(v) {
        $emit(this, 'update:value', v)
      },
    },
  },
  mounted() {
    this.changeScroll()
  },
  methods: {
    dayjs,
    // 长按事件 - 开始
    onTouchstart(row) {
      if (this.printModel === true) {
        return
      }

      clearTimeout(this.touchTimer)
      this.touchTimer = null

      this.touchTimer = setTimeout(() => {
        this.printModel = true
        row._printChecked = !row._printChecked
        this.getSelectNum()
        if (window._appPlus) {
          window._appPlus.device.vibrate(150)
        }
      }, 1000)
    },
    // 长按事件 - 结束
    onTouchend() {
      clearTimeout(this.touchTimer)
      this.touchTimer = null
    },
    // 点击左侧按钮
    onLeft() {
      if (this.printModel) {
        this.printModel = false
        this.selectNum = 0
        this.list = this.list.map(item => ({
          ...item,
          _printChecked: false,
        }))
      }
      else {
        this.$router.replace({
          name: 'menuPage',
        })
      }
    },
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
    // 获取选择数量
    getSelectNum() {
      const list = this.list.filter(item => item._printChecked === true)
      this.selectNum = list.length
    },
    onDetail(row) {
      if (this.printModel === true) {
        row._printChecked = !row._printChecked
        this.getSelectNum()
        return
      }

      this.$router.push({
        name: 'sampleInfo',
        query: {
          type: 'sampling',
          id: row.id,
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

      const query = { ...this.params }
      if (query.dateStart && query.dateEnd) {
        query.stamp = [
          new Date(compatibleDate(`${query.dateStart} 00:00:00`)).getTime(),
          new Date(compatibleDate(`${query.dateEnd} 23:59:59`)).getTime(),
        ].join(',')
      }

      mRequest
        .get(api.samples.extractSamples, {
          params: {
            ...query,
            page: this.currentPage,
            size: this.pageSize,
          },
        })
        .then((res) => {
          if (toast) {
            toast.close()
          }
          this.isLoading = false
          this.loading = false
          if (res.code === 20000) {
            // 加载状态结束
            const arr = res.data ? (res.data.rows ? res.data.rows : []) : []
            this.list
              = this.currentPage === 1
                ? arr
                : [
                    ...this.list,
                    ...arr.map(i => ({ ...i, _printChecked: false })),
                  ]
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
    /**
     * 按试件打印
     * @param type 1 按样品打印 2 按试件打印
     */
    onPrint(type) {
      const printList = this.list.filter(item => item._printChecked === true)
      if (printList.length === 0) {
        showDialog({ message: '请选择要打印的数据' })
        return
      }

      // 是否存在没有生成样品编号的数据
      let isNotTestObjectCode = false
      const testObjectIds = []
      const samplingPrintList = printList.map((item) => {
        const { testObjectId, testObjectCode, id } = item
        testObjectIds.push(testObjectId)
        if (!testObjectCode) {
          isNotTestObjectCode = true
        }
        return {
          id,
          testObjectId,
          testObjectCode,
        }
      })

      this.samplingPrintList = samplingPrintList

      if (isNotTestObjectCode === true) {
        const item = samplingPrintList.find(i => !i.testObjectCode)
        this.$router.push({
          name: 'sampleCodeGeneration',
          params: {
            type,
            extractSampleId: item.id,
            pageFrom: 1,
          },
        })
      }
      else {
        this.$router.push({
          name: 'bluetoothPrint',
          params: {
            type,
            testObjectId: testObjectIds.join(','),
            pageFrom: 1,
          },
        })
      }
    },
  },
}
</script>

<style lang="less" scoped>
@import url('./index.less');
</style>
