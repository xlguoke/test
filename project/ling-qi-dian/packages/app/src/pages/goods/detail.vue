<template>
  <view class="container">
    <image class="goods-image" src="/static/logo.png" mode="aspectFill" />
    <view class="goods-info">
      <text class="goods-name">{{ goods.name }}</text>
      <text class="goods-price">¥{{ formatPrice(goods.price) }}</text>
      <text class="goods-desc">{{ goods.description }}</text>
    </view>
    <view class="action-bar">
      <button class="btn-primary" @click="addToCart">加入购物车</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { formatPrice } from '@lingqi/shared'

const goods = ref({
  id: '1',
  name: '美式咖啡',
  price: 1800,
  description: '精选阿拉比卡咖啡豆，香醇浓郁'
})

const addToCart = () => {
  uni.showToast({
    title: '已加入购物车',
    icon: 'success'
  })
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #f8f8f8;
}

.goods-image {
  width: 100%;
  height: 400rpx;
  background: #f5f5f5;
}

.goods-info {
  padding: 30rpx;
  background: #fff;
}

.goods-name {
  font-size: 40rpx;
  font-weight: bold;
  display: block;
}

.goods-price {
  font-size: 48rpx;
  color: #ff6600;
  font-weight: bold;
  margin-top: 20rpx;
  display: block;
}

.goods-desc {
  font-size: 28rpx;
  color: #666;
  margin-top: 20rpx;
  display: block;
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.btn-primary {
  background: #333;
  color: #fff;
  border-radius: 40rpx;
  font-size: 32rpx;
}
</style>
