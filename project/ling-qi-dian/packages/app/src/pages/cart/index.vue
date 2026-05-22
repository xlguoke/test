<template>
  <view class="container">
    <view class="empty-cart" v-if="cartList.length === 0">
      <text>购物车是空的</text>
      <button class="btn-primary" @click="goToIndex">去点单</button>
    </view>
    <view class="cart-list" v-else>
      <view class="cart-item" v-for="item in cartList" :key="item.id">
        <text class="item-name">{{ item.name }}</text>
        <text class="item-price">¥{{ formatPrice(item.price) }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { formatPrice } from '@lingqi/shared'

const cartList = ref([])

const goToIndex = () => {
  uni.switchTab({
    url: '/pages/index/index'
  })
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #f8f8f8;
}

.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
}

.btn-primary {
  margin-top: 30rpx;
  background: #333;
  color: #fff;
  border-radius: 40rpx;
  padding: 0 60rpx;
}
</style>
