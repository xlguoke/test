<script setup lang="ts">
import { RouterView, onBeforeRouteUpdate } from 'vue-router'
import keepAliveStore from '@/stores/keepAliveView'

const { cachedViews } = keepAliveStore()

onBeforeRouteUpdate((to) => {
  if (to.meta.keepAlive)
    keepAliveStore().addCachedView(to as any)
})
</script>

<template>
  <RouterView v-slot="{ Component, route }">
    <transition name="transitionRouter" mode="out-in">
      <KeepAlive :include="cachedViews">
        <component :is="Component" :key="route.path" />
      </KeepAlive>
    </transition>
  </RouterView>
</template>

<style lang="less">
/* 进入时元素动画开始状态 */
.transitionRouter-enter-from {
  transform: translateX(50px);
  opacity: 0;
}

/* 进入时元素动画结束状态 */
.transitionRouter-enter-to {
  transform: translateX(0px);
  opacity: 1;
}

/* 进入时元素动画效果 */
.transitionRouter-enter-active {
  transition: all 0.2s;
}

/* 离开时元素动画开始状态 */
.transitionRouter-leave-from {
  transform: translateX(0px);
  opacity: 1;
}

/* 离开时元素动画结束状态 */
.transitionRouter-leave-to {
  transform: translateX(50px);
  opacity: 0;
}

/* 离开时元素动画效果 */
.transitionRouter-leave-active {
  transition: all 0.2s;
}
</style>
