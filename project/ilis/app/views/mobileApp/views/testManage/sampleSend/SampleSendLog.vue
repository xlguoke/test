<template>
  <div class="log-list">
    <van-steps
      v-if="logList.length"
      :active="active"
      direction="vertical"
      active-color="#224059"
      inactive-color="#224059"
    >
      <van-step v-for="i in logList" :key="i.value">
        <template #active-icon>
          <div class="dot"></div>
        </template>
        <template #inactive-icon>
          <div class="dot"></div>
        </template>
        <div class="log-item">
          <div class="t">
            {{ formatDate(i.createDate, 'YYYY-MM-DD HH:mm:ss') }}
          </div>
          <div class="b" v-html="i.content"></div>
        </div>
      </van-step>
    </van-steps>
    <van-empty v-else description="暂无数据" />
    <van-overlay :show="loading" z-index="20">
      <van-loading type="spinner" color="#1989fa" />
    </van-overlay>
  </div>
</template>

<script>
import { showNotify } from 'vant'
import { formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'

export default {
  props: ['id'],
  data() {
    return {
      formatDate,
      logList: [],
      active: 0,
      loading: false,
    }
  },
  created() {
    this.getData()
  },
  methods: {
    async getData() {
      this.loading = true
      const res = await mRequest
        .get(
          `/rest/synthesis/log?id=${this.id}&objectType=${43}&relationQry=false`,
        )
        .finally(() => {
          this.loading = false
        })

      if (res.code === 20000) {
        this.logList = res.data
      }
      else {
        showNotify({
          type: 'danger',
          message: res.msg || res.message || '系统异常，请稍后重试',
        })
      }
    },
  },
}
</script>

<style lang="less" scoped>
.log-list {
  :deep(.van-step__line) {
    width: 1px !important;
    background-color: #0066ec !important;
  }
  .log-item {
    font-size: 12px;
  }
}
.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid #0066ec;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  &::after {
    content: '';
    display: block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #0066ec;
  }
}
.van-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  background: none;
}
</style>
