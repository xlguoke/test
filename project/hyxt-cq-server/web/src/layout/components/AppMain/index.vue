<template>
  <router-view v-slot="{ Component }">
    <transition name="transitionRouter" mode="out-in" :appear="true">
      <KeepAlive>
        <component :is="Component" />
      </KeepAlive>
    </transition>
  </router-view>
</template>
<script setup lang="ts">
import { RouterView } from "vue-router"
import { onMounted } from "vue"
import { getMenuData, userLocalStorage } from "@/assets/js/common"
import menuStore from "@/stores/menuTree"
const menuStoreReal = menuStore()

onMounted(async () => {
  //如果在登录状态重新加载权限并加入到store  ，每次加载获取最新权限
  if (userLocalStorage.get("userToken")) {
    let v = await getMenuData()
    menuStoreReal.menuTree = v
  }
})
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
