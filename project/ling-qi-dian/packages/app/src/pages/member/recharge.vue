<template>
  <view class="container">
    <text class="page-title">会员充值</text>
    
    <view class="tier-list">
      <view 
        class="tier-item" 
        :class="{ active: selectedTier === tier.id }"
        v-for="tier in tiers" 
        :key="tier.id"
        @click="selectTier(tier.id)"
      >
        <text class="tier-amount">¥{{ tier.amount }}</text>
        <text class="tier-bonus">送¥{{ tier.bonus }} + {{ tier.points }}积分</text>
      </view>
    </view>
    
    <button class="btn-recharge" @click="doRecharge">立即充值</button>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const selectedTier = ref(1)

const tiers = [
  { id: 1, amount: 198, bonus: 20, points: 218 },
  { id: 2, amount: 680, bonus: 68, points: 748 },
  { id: 3, amount: 1000, bonus: 100, points: 1100 },
  { id: 4, amount: 3000, bonus: 300, points: 3300 },
  { id: 5, amount: 8000, bonus: 800, points: 8800 }
]

const selectTier = (id: number) => {
  selectedTier.value = id
}

const doRecharge = () => {
  const tier = tiers.find(t => t.id === selectedTier.value)
  uni.showModal({
    title: '确认充值',
    content: `充值¥${tier?.amount}，到账¥${(tier?.amount || 0) + (tier?.bonus || 0)}`,
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '支付成功', icon: 'success' })
      }
    }
  })
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #f8f8f8;
  padding: 40rpx;
}

.page-title {
  font-size: 40rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 40rpx;
}

.tier-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.tier-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 40rpx;
  border: 4rpx solid transparent;
}

.tier-item.active {
  border-color: #333;
}

.tier-amount {
  font-size: 48rpx;
  font-weight: bold;
  display: block;
}

.tier-bonus {
  font-size: 28rpx;
  color: #ff6600;
  margin-top: 10rpx;
  display: block;
}

.btn-recharge {
  margin-top: 60rpx;
  background: #333;
  color: #fff;
  border-radius: 40rpx;
  font-size: 36rpx;
  font-weight: 500;
}
</style>
