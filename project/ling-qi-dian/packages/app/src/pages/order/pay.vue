<template>
  <view class="container">
    <view class="pay-info">
      <text class="pay-title">支付金额</text>
      <text class="pay-amount">¥18.00</text>
      <text class="pay-order">订单号: {{ orderNo }}</text>
    </view>
    
    <button class="btn-pay" @click="doPay">微信支付</button>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const orderNo = ref('')

onLoad((options) => {
  orderNo.value = options?.orderNo || ''
})

const doPay = () => {
  uni.showLoading({ title: '支付中...' })
  setTimeout(() => {
    uni.hideLoading()
    uni.showToast({
      title: '支付成功',
      icon: 'success',
      success: () => {
        setTimeout(() => {
          uni.switchTab({ url: '/pages/order/list' })
        }, 1500)
      }
    })
  }, 1500)
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #f8f8f8;
  padding: 40rpx;
}

.pay-info {
  background: #fff;
  border-radius: 16rpx;
  padding: 60rpx;
  text-align: center;
  margin-bottom: 40rpx;
}

.pay-title {
  font-size: 28rpx;
  color: #666;
  display: block;
}

.pay-amount {
  font-size: 72rpx;
  font-weight: bold;
  color: #333;
  margin: 30rpx 0;
  display: block;
}

.pay-order {
  font-size: 24rpx;
  color: #999;
  display: block;
}

.btn-pay {
  background: #07c160;
  color: #fff;
  border-radius: 40rpx;
  font-size: 36rpx;
  font-weight: 500;
}
</style>
