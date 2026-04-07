<template>
  <div class="noticesList">
    <van-sticky>
      <MobileTitleBar left-arrow :show-user="true" @click-left="$router.go(-1)" />
    </van-sticky>

    <van-list
      v-model:loading="loading"
      style="margin-top: 8px"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <div
        v-for="(item, index) in list"
        :key="index"
        class="noticesList-box"
        @click="onSelect(item.id)"
      >
        <div class="noticesList-box-title">
          {{ item.title }}
        </div>
        <div class="textOverflow2 noticesList-box-content">
          {{ item.content }}
        </div>
        <div class="noticesList-box-time">
          [{{ item.createTime }}]
        </div>
      </div>
    </van-list>
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
      list: [],
      loading: false,
      finished: false,
      scrollTop: 0,
      query: {
        page: 0,
        size: 10,
      },
    }
  },
  methods: {
    onClick() {
      this.list = []
      this.query.page = 0
      this.onLoad()
    },
    // 选中事件
    onSelect(id) {
      this.$router.push({
        name: 'messageDetail',
        params: {
          id,
        },
      })
    },
    async onLoad() {
      this.query.page += 1
      this.loading = true
      const res = await mRequest.post(
        api.home.getMessage,
        qs.stringify(this.query),
      )

      if (res.data.rows && res.data.rows.length > 0) {
        this.list = [...this.list, ...res.data.rows]
      }

      if (res.data.rows && res.data.rows.length === 0) {
        this.finished = true
      }
      this.loading = false

      if (this.list.length >= res.data.count) {
        this.finished = true

        if (this.list.length === 0) {
          this.list = this.webUserNotices
        }
      }
    },
  },
}
</script>

<style lang="less" scoped>
@import './index';
</style>
