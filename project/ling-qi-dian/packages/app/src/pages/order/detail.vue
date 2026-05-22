<template>
  <view class="container">
    <view class="status-bar">
      <text class="status-text">订单已完成</text>
    </view>
    
    <view class="section">
      <text class="section-title">商品信息</text>
      <view class="goods-item">
        <text class="goods-name">美式咖啡</text>
        <text class="goods-price">¥18.00</text>
      </view>
    </view>
    
    <view class="section">
      <text class="section-title">订单信息</text>
      <view class="info-row">
        <text class="info-label">订单号</text>
        <text class="info-value">202405210001</text>
      </view>
      <view class="info-row">
        <text class="info-label">下单时间</text>
        <text class="info-value">2024-05-21 14:30</text>
      </view>
      <view class="info-row">
        <text class="info-label">支付方式</text>
        <text class="info-value">微信支付</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #f8f8f8;
}

.status-bar {
  background: #07c160;
  padding: 60rpx 40rpx;
}

.status-text {
  color: #fff;
  font-size: 40rpx;
  font-weight: bold;
}

.section {
  background: #fff;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 30rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 500;
  display: block;
  margin-bottom: 20rpx;
}

.goods-item {
  display: flex;
  justify-content: space-between;
  font-size: 30rpx;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 16rpx 0;
  font-size: 28rpx;
}

.info-label {
  color: #666;
}

.info-value {
  color: #333;
}
</style>
