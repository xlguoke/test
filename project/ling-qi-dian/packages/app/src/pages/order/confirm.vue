<template>
  <view class="container">
    <view class="section">
      <text class="section-title">桌号</text>
      <input class="input" v-model="tableNo" placeholder="请输入桌号" />
    </view>
    
    <view class="section">
      <text class="section-title">订单明细</text>
      <view class="order-item">
        <text>美式咖啡 x 1</text>
        <text>¥18.00</text>
      </view>
    </view>
    
    <view class="action-bar">
      <text class="total">合计: ¥18.00</text>
      <button class="btn-primary" @click="submitOrder">提交订单</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const tableNo = ref('')

const submitOrder = () => {
  uni.navigateTo({
    url: '/pages/order/pay?orderNo=202405210001'
  })
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #f8f8f8;
  padding: 20rpx;
}

.section {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 500;
  display: block;
  margin-bottom: 20rpx;
}

.input {
  border: 2rpx solid #eee;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
}

.order-item {
  display: flex;
  justify-content: space-between;
  font-size: 28rpx;
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.total {
  font-size: 36rpx;
  font-weight: bold;
}

.btn-primary {
  background: #333;
  color: #fff;
  border-radius: 40rpx;
  font-size: 32rpx;
  margin: 0;
}
</style>
