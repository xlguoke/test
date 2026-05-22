<template>
  <view class="container">
    <view class="member-header">
      <image class="avatar" src="/static/logo.png" mode="aspectFill" />
      <view class="member-info">
        <text class="nickname">{{ member.nickname }}</text>
        <text class="level">{{ member.levelName }}</text>
      </view>
    </view>
    
    <view class="stats-bar">
      <view class="stat-item">
        <text class="stat-value">{{ member.points }}</text>
        <text class="stat-label">积分</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">¥{{ formatPrice(member.balance) }}</text>
        <text class="stat-label">余额</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">¥{{ formatPrice(member.totalConsume) }}</text>
        <text class="stat-label">累计消费</text>
      </view>
    </view>
    
    <view class="menu-list">
      <view class="menu-item" @click="goToBenefits">
        <text>会员权益</text>
        <text class="arrow">></text>
      </view>
      <view class="menu-item" @click="goToRecharge">
        <text>会员充值</text>
        <text class="arrow">></text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { formatPrice } from '@lingqi/shared'

const member = ref({
  nickname: '微信用户',
  levelName: '普通用户',
  points: 100,
  balance: 0,
  totalConsume: 5000
})

const goToBenefits = () => {
  uni.navigateTo({ url: '/pages/member/benefits' })
}

const goToRecharge = () => {
  uni.navigateTo({ url: '/pages/member/recharge' })
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #f8f8f8;
}

.member-header {
  background: linear-gradient(135deg, #333 0%, #666 100%);
  padding: 60rpx 40rpx;
  display: flex;
  align-items: center;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  background: #fff;
}

.member-info {
  margin-left: 30rpx;
}

.nickname {
  color: #fff;
  font-size: 36rpx;
  font-weight: 500;
  display: block;
}

.level {
  color: rgba(255, 255, 255, 0.8);
  font-size: 28rpx;
  margin-top: 10rpx;
  display: block;
}

.stats-bar {
  display: flex;
  background: #fff;
  padding: 40rpx 0;
  margin: 20rpx;
  border-radius: 16rpx;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-value {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.stat-label {
  font-size: 26rpx;
  color: #666;
  margin-top: 10rpx;
  display: block;
}

.menu-list {
  background: #fff;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 0 30rpx;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 0;
  font-size: 30rpx;
  border-bottom: 2rpx solid #f5f5f5;
}

.menu-item:last-child {
  border-bottom: none;
}

.arrow {
  color: #999;
}
</style>
