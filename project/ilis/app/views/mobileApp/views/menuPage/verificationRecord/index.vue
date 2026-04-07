<template>
  <div class="verificationRecord-wrap">
    <van-sticky>
      <MobileTitleBar title="授权记录" left-arrow @click-left="$router.go(-1)">
      </MobileTitleBar>
      <van-search
        v-model.trim="searchStr"
        left-icon=""
        right-icon="search"
        placeholder="请输入设备名称、编号"
        @search="onSearch"
      >
      </van-search>
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
        @load="onLoad"
      >
        <ul class="verification-list">
          <li
            v-for="(item, index) in list"
            :key="index"
            class="verification-list-item"
          >
            <div class="verification-list-item-time">
              <van-icon name="tosend" />
              <span class="time"> {{ formatDate(item.authTime, "YYYY-MM-DD HH:mm:ss") }}</span>
            </div>
            <div class="verification-list-item-content">
              <div class="verification-list-item-title">
                <span class="">{{ item.equipmentName }}</span>
                <span class="">{{ item.equipmentSn }}</span>
              </div>
              <div class="verification-list-item-info">
                检测室：{{ item.laboratoryName }}
              </div>
              <div class="verification-list-item-info">
                <span class="">所属部门：{{ item.departName }}</span>
                <!-- <span :class="{ green: true, grey: false }">试验中</span> -->
              </div>
            </div>
          </li>
        </ul>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script>
import qs from 'qs'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'

export default {
  components: {
    MobileTitleBar,
  },
  data() {
    return {
      formatDate,
      searchStr: '',
      totalCount: 0,
      currentPage: 1,
      pageSize: 10,
      isLoading: false,
      loading: false,
      finished: false,
      error: false,
      finishedText: '没有更多了',
      list: [],
    }
  },
  methods: {
    onSearch() {
      this.currentPage = 1
      this.onLoad('refresh')
    },
    onLoad(type) {
      this.loading = true
      const toast
        = type === 'refresh'
          ? showLoadingToast({
              duration: 0,
              message: '加载中...',
              forbidClick: true,
            })
          : ''
      mRequest
        .get(
          api.verification.getAuthRecords,
          qs.stringify({
            quickQryParam: this.searchStr,
            page: this.currentPage,
            rows: this.pageSize,
          }),
        )
        .then((res) => {
          toast && toast.close()
          this.isLoading = false
          this.loading = false
          if (res.code === 20000) {
            this.list
              = this.currentPage === 1
                ? res.data.rows
                : [...this.list, ...res.data.rows]
            // 加载状态结束
            this.currentPage++
            this.error = false
            // 数据全部加载完成
            if (
              !res.data
              || !res.data.rows
              || !res.data.rows.length
              || !this.list.length
              || this.list >= this.totalCount
            ) {
              this.finished = true
            }
            this.finishedText = !this.list.length
              ? '数据为空哦！'
              : '没有更多了'
          }
          else {
            this.error = true
            showToast('获取信息失败！')
          }
        })
        .catch((_) => {
          showToast(_)
          this.isLoading = false
          this.loading = false
          this.error = true

          toast && toast.close()
        })
    },
    onRefresh() {
      // 清空列表数据
      this.finished = false
      this.error = false
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
