<template>
  <div class="temperatureRecord-wrap">
    <van-sticky>
      <MobileTitleBar title="报警记录" left-arrow @click-left="$router.go(-1)">
      </MobileTitleBar>
      <van-row class="temperatureRecord-row">
        <van-col span="12" @click="openScreen(1)">
          <van-icon size="18" name="filter-o" />
          功能室
        </van-col>
        <van-col span="12" @click="openScreen(2)">
          <van-icon size="18" class-prefix="iconfont" name="tosend" />报警时间
        </van-col>
        <template v-if="showTime">
          <van-col span="11" @click="selectStartDateVisible = true">
            <van-icon name="tosend" />
            <span :class="{ empty: !recordTimeBegin }" style="margin-left: 5px">
              {{ formatDate(recordTimeBegin, 'YYYY-MM-DD HH:mm') || '开始时间' }}
            </span>
            <van-icon
              v-if="recordTimeBegin"
              name="close"
              style="margin-left: 5px"
              @click.stop="recordTimeBegin = null"
            />
          </van-col>
          <van-col span="2">
            ~
          </van-col>
          <van-col span="11" @click="selectEndDateVisible = true">
            <van-icon name="tosend" />
            <span :class="{ empty: !recordTimeEnd }" style="margin-left: 5px">
              {{ formatDate(recordTimeEnd, 'YYYY-MM-DD HH:mm') || '结束时间' }}
            </span>
            <van-icon
              v-if="recordTimeEnd"
              name="close"
              style="margin-left: 5px"
              @click.stop="recordTimeEnd = null"
            />
          </van-col>
        </template>
      </van-row>
    </van-sticky>

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
          v-for="(item, index) in list"
          :key="index"
          :rows="[
            { label: '报警时间', value: formatDate(item.recordTime, 'YYYY-MM-DD HH:mm:ss') },
            { label: '当前温度', value: `${item.temperatureValue}℃`, color: item.overType === '10' || item.overType === '30' ? 'red' : '' },
            { label: '当前湿度', value: `${item.humidityValue}%`, color: item.overType === '20' || item.overType === '30' ? 'red' : '' },
            ...item.notice,
          ]"
        >
          <template #title>
            <span>{{ item.labName }}</span>
          </template>
        </ListCard>
      </van-list>
    </van-pull-refresh>

    <van-action-sheet
      v-model:show="screenVisible"
      :actions="screenList"
      :round="false"
      @select="onSortSelect"
    />

    <MobileDateSelector
      v-model:open="selectStartDateVisible"
      enable-time
      @select="(val) => {
        recordTimeBegin = val
        onChangeDate()
      }"
    />

    <MobileDateSelector
      v-model:open="selectEndDateVisible"
      enable-time
      @select="(val) => {
        recordTimeEnd = val
        onChangeDate()
      }"
    />

    <van-calendar
      v-model:show="timeShow"
      type="range"
      color="#1989fa"
      :min-date="minDate"
      :max-date="maxDate"
      :default-date="defaultDate"
      allow-same-day
      @confirm="onConfirm"
    />
  </div>
</template>

<script>
import MobileDateSelector from '~/views/mobileApp/components/MobileSelector/MobileDateSelector.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import ListCard from '~/views/mobileApp/components/MobileUI/ListCard.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { useAppPageStateStore } from '~/views/mobileApp/store/useAppPageStateStore'

export default {
  components: {
    ListCard,
    MobileDateSelector,
    MobileTitleBar,
  },
  beforeRouteLeave(to, from, next) {
    if (to.name === 'samples' && this.isSubmit === true) {
      const pageState = useAppPageStateStore().getPage(to.name)
      pageState.resetPage = true
    }
    next()
  },
  data() {
    return {
      formatDate,
      list: [],
      activeName: '',
      activeLabel: '',
      activeId: '',
      activeValue: '',
      recordTimeBegin: '',
      recordTimeEnd: '',
      selectStartDateVisible: false,
      selectEndDateVisible: false,
      screenVisible: false,
      showTime: false,
      currentRow: '',
      screenList: [{ name: '所有功能室', loading: true }],
      totalCount: 0,
      currentPage: 1,
      pageSize: 10,
      isLoading: false,
      loading: false,
      finished: false,
      error: false,
      finishedText: '没有更多了',
      deviceKey: '',
      labId: '',
      timeShow: false,
      defaultDate: null,
      countSampleRoomSave: 0,
      minDate: new Date(new Date().Format('yyyy/01/01')).add('y', -5),
      maxDate: new Date(new Date().Format('yyyy/12/31')).add('y', 1),
    }
  },
  created() {
    const query = this.$route.query
    const samplesName = query.name ? query.name : ''
    const samplesLabel = query.label ? query.label : ''
    const samplesId = query.id ? query.id : ''
    const samplesValue = query.value ? query.value : ''
    this.activeName = samplesName || ''
    this.activeLabel = samplesLabel || ''
    this.activeId = samplesId || ''
    this.activeValue = samplesValue || ''
    this.getAppList()
  },
  methods: {
    openScreen(type) {
      if (type === 1) {
        this.screenVisible = true
      }
      else if (type === 2) {
        this.showTime = !this.showTime
        if (!this.showTime) {
          this.recordTimeBegin = null
          this.recordTimeEnd = null
          this.onRefresh()
        }
      }
    },
    getAppList() {
      const toast = showLoadingToast({
        duration: 0,
        message: '加载中...',
        forbidClick: true,
      })
      mRequest
        .get(api.temperature.appList)
        .then((res) => {
          const list = res.data
            ? res.data.map((i) => {
                i.name = i.labName
                return i
              })
            : []
          this.screenList = [
            {
              name: '所有功能室',
              deviceKey: null,
              labId: null,
              color: '#154bd0',
            },
            ...list,
          ]
        })
        .finally(() => {
          if (toast) {
            toast.close()
          }
        })
    },
    // 选择排序
    onSortSelect(row, index) {
      this.screenList = this.screenList.map(item => ({
        ...item,
        color: '',
      }))
      this.screenList[index].color = '#154bd0'
      this.deviceKey = row.deviceKey
      this.labId = row.labId
      this.onRefresh()
      this.screenVisible = false
    },
    // 获取取样时间
    onChangeDate() {
      if (this.recordTimeBegin && this.recordTimeEnd) {
        this.onRefresh()
      }
    },
    selectData() {
      this.timeShow = true
    },
    onConfirm(date) {
      const [start, end] = date
      this.timeShow = false
      this.recordTimeBegin = formatDate(start)
      this.recordTimeEnd = formatDate(end)
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
        .get(api.temperature.recordlist, {
          params: {
            deviceKey: this.deviceKey,
            labId: this.labId,
            recordTimeBegin: this.recordTimeBegin,
            recordTimeEnd: this.recordTimeEnd,
            page: this.currentPage,
            rows: this.pageSize,
          },
        })
        .then((res) => {
          if (res.code === 20000) {
            // 加载状态结束
            const arr = (res.data || []).map(item => ({
              ...item,
              notice: this.formatNotice(item.notice || []),
            }))
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
            this.isLoading = false
            this.loading = false
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
      this.list = []
      this.isLoading = true
      this.currentPage = 1
      this.onLoad('refresh')
    },
    formatNotice(notice) {
      return notice.map((i) => {
        const arr = i.split(':')
        return {
          label: arr[0],
          value: arr[1],
        }
      })
    },
  },
}
</script>

<style lang="less" scoped>
.temperatureRecord-wrap {
  .temperatureRecord-row {
    .van-col {
      padding: 10px 0;
      text-align: center;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #fff;
      border-bottom: solid 1px #f5f5f5;
      color: #777;

      .iconfont {
        margin-right: 4px;
      }
    }
  }
}
</style>
