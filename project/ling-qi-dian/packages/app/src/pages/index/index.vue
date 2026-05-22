<template>
  <view class="container">
    <view class="header">
      <text class="title">机车俱乐部</text>
      <text class="subtitle">欢迎光临</text>
    </view>
    
    <view class="goods-list">
      <view class="goods-item" v-for="item in goodsList" :key="item.id" @click="goToDetail(item.id)">
        <image class="goods-image" :src="item.image" mode="aspectFill" />
        <view class="goods-info">
          <text class="goods-name">{{ item.name }}</text>
          <text class="goods-price">¥{{ formatPrice(item.price) }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { formatPrice } from '@lingqi/shared'

const goodsList = ref([
  { id: '1', name: '美式咖啡', price: 1800, image: '/static/logo.png' },
  { id: '2', name: '拿铁', price: 2200, image: '/static/logo.png' },
  { id: '3', name: '摩卡', price: 2500, image: '/static/logo.png' }
])

const goToDetail = (id: string) => {
  uni.navigateTo({
    url: `/pages/goods/detail?id=${id}`
  })
}
</script>

<style scoped>
.container {
  padding: 20rpx;
}

.header {
  text-align: center;
  padding: 40rpx 0;
}

.title {
  font-size: 48rpx;
  font-weight: bold;
  display: block;
}

.subtitle {
  font-size: 28rpx;
  color: #666;
  margin-top: 10rpx;
  display: block;
}

.goods-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.goods-item {
  display: flex;
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.goods-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  background: #f5f5f5;
}

.goods-info {
  flex: 1;
  margin-left: 20rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.goods-name {
  font-size: 32rpx;
  font-weight: 500;
}

.goods-price {
  font-size: 36rpx;
  color: #ff6600;
  font-weight: bold;
  margin-top: 10rpx;
}
</style>
