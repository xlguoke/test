<template>
  <van-tabbar v-if="show" v-model="active" placeholder route>
    <van-tabbar-item replace to="/">
      功能室
      <template #icon="props">
        <img v-if="props.active" src="../assets/tabbar-home-active.svg" />
        <img v-else src="../assets/tabbar-home.svg" />
      </template>
    </van-tabbar-item>
    <van-tabbar-item replace to="/appointment-management">
      试验预约
      <template #icon="props">
        <img v-if="props.active" src="../assets/tabbar-test-active.svg" />
        <img v-else src="../assets/tabbar-test.svg" />
      </template>
    </van-tabbar-item>
    <van-tabbar-item replace to="/account-book">
      巡查台账
      <template #icon="props">
        <img v-if="props.active" src="../assets/tabbar-ledger-active.svg" />
        <img v-else src="../assets/tabbar-ledger.svg" />
      </template>
    </van-tabbar-item>
    <van-tabbar-item replace to="/profile">
      <template #icon="props">
        <img v-if="props.active" src="../assets/tabbar-mine-active.svg" />
        <img v-else src="../assets/tabbar-mine.svg" />
      </template>
      我的
    </van-tabbar-item>
  </van-tabbar>
</template>

<script setup lang="ts">
import { routeWhiteList } from '@/config/routes'
import { InEmbed } from '@/utils/referrer'

const active = ref(0)
const route = useRoute()

const show = computed(() => !InEmbed && route.name && routeWhiteList.includes(route.name))
</script>

<style lang="less" scoped>
:deep(.van-tabbar) {
  left: 16px;
  right: 16px;
  width: auto;
  bottom: 16px;
  border-radius: 8px;
  background: #f2f4fb;
  border: 1px solid #ffffff;

  .van-tabbar-item--active {
    background: transparent;
  }
}
</style>
