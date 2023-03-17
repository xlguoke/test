<template>
  <router-view v-slot="{ Component, route }">
    <transition name="transitionRouter" mode="out-in" :appear="true">
      <KeepAlive :include="cachedViews">
        <component :is="Component" :key="route.path" />
      </KeepAlive>
    </transition>
  </router-view>
</template>
<script setup lang="ts">
import { RouterView } from "vue-router"
import { storeToRefs } from "pinia"
import tagsViewStore from "@/stores/tagsView"
const { cachedViews } = storeToRefs(tagsViewStore())
</script>

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
  transition: all 0.3s;
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
