<template>
  <view class="container">
    <view class="current-level">
      <text class="level-title">当前等级</text>
      <text class="level-name">普通用户</text>
      <text class="level-desc">充值¥680即可成为青铜会员</text>
    </view>
    
    <view class="benefits-list">
      <text class="section-title">等级权益</text>
      <view class="benefit-item">
        <text class="benefit-name">饮品折扣</text>
        <text class="benefit-value">无折扣</text>
      </view>
      <view class="benefit-item">
        <text class="benefit-name">工时费折扣</text>
        <text class="benefit-value">无折扣</text>
      </view>
      <view class="benefit-item">
        <text class="benefit-name">积分倍率</text>
        <text class="benefit-value">1.0x</text>
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
  padding: 20rpx;
}

.current-level {
  background: linear-gradient(135deg, #333 0%, #666 100%);
  border-radius: 16rpx;
  padding: 60rpx 40rpx;
  text-align: center;
  margin-bottom: 20rpx;
}

.level-title {
  color: rgba(255, 255, 255, 0.8);
  font-size: 28rpx;
  display: block;
}

.level-name {
  color: #fff;
  font-size: 48rpx;
  font-weight: bold;
  margin: 20rpx 0;
  display: block;
}

.level-desc {
  color: rgba(255, 255, 255, 0.9);
  font-size: 28rpx;
  display: block;
}

.benefits-list {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 500;
  display: block;
  margin-bottom: 30rpx;
}

.benefit-item {
  display: flex;
  justify-content: space-between;
  padding: 24rpx 0;
  border-bottom: 2rpx solid #f5f5f5;
  font-size: 30rpx;
}

.benefit-item:last-child {
  border-bottom: none;
}

.benefit-name {
  color: #666;
}

.benefit-value {
  color: #333;
  font-weight: 500;
}
</style>
