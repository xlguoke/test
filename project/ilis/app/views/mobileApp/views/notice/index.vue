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
        @click="onSelect(item)"
      >
        <div style="display: flex">
          <div class="noticesList-box-title">
            {{ item.noticeTitle }}
          </div>
          <div v-if="item.isRead === '1'" style="color: gray; font-size: 12px">
            已读
          </div>
          <div v-else style="color: red; font-size: 12px">
            未读
          </div>
        </div>
        <div class="textOverflow2 noticesList-box-content">
          <!-- 接口暂无详情数据，需提供 -->
        </div>
        <div class="noticesList-box-time">
          [{{ item.createTime ? item.createTime.split('.')[0] : '' }}]
        </div>
      </div>
    </van-list>
  </div>
</template>

<script>
import qs from 'qs'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'

export default {
  components: {
    MobileTitleBar,
  },
  data() {
    return {
      list: [],
      loading: false,
      finished: false,
      scrollTop: 0,
      query: {
        page: 0,
        rows: 10,
        sort: 'createTime',
        order: 'desc',
      },
    }
  },
  methods: {
    // 选中事件
    onSelect(row) {
      this.$router.push({ name: 'noticeDetail', params: { id: row.id } })
      this.$nextTick(() => {
        if (row.isRead === '0') {
          this.updateReadState(row)
        }
      })
    },
    // 设为已读
    updateReadState(row) {
      mRequest
        .get(api.home.updateNoticeRead, {
          params: {
            noticeId: row.id,
          },
        })
        .then(() => {
          this.list = this.list.map(item => ({
            ...item,
            isRead: item.id === row.id ? '1' : item.isRead,
          }))
        })
    },
    async onLoad() {
      this.query.page += 1
      this.loading = true
      const res = await mRequest.post(
        api.home.getNotice,
        qs.stringify(this.query),
        {
          params: {
            field: 'id,isRead,noticeTitle,createTime,',
          },
        },
      )

      if (res.rows && res.rows.length > 0) {
        this.list = [...this.list, ...res.rows]
      }

      if (res.rows && res.rows.length === 0) {
        this.finished = true
      }
      this.loading = false

      if (this.list.length >= res.total) {
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
