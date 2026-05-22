<template>
  <view class="container">
    <view class="order-list">
      <view class="order-item" v-for="order in orderList" :key="order.id">
        <view class="order-header">
          <text class="order-no">订单号: {{ order.orderNo }}</text>
          <text class="order-status">{{ order.status }}</text>
        </view>
        <view class="order-goods">
          <text>{{ order.goodsName }} x {{ order.quantity }}</text>
        </view>
        <view class="order-footer">
          <text class="order-time">{{ order.createTime }}</text>
          <text class="order-amount">¥{{ formatPrice(order.amount) }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { formatPrice } from '@lingqi/shared'

const orderList = ref([
  {
    id: '1',
    orderNo: '202405210001',
    goodsName: '美式咖啡',
    quantity: 1,
    amount: 1800,
    status: '已完成',
    createTime: '2024-05-21 14:30'
  }
])
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #f8f8f8;
  padding: 20rpx;
}

.order-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.order-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.order-no {
  font-size: 26rpx;
  color: #666;
}

.order-status {
  font-size: 26rpx;
  color: #07c160;
}

.order-goods {
  font-size: 30rpx;
  padding: 20rpx 0;
  border-top: 2rpx solid #f5f5f5;
  border-bottom: 2rpx solid #f5f5f5;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 20rpx;
}

.order-time {
  font-size: 24rpx;
  color: #999;
}

.order-amount {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}
</style>
