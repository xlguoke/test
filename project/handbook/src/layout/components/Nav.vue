<script setup lang="ts">
import type { RouteRecordRaw } from 'vue-router'
import { useRouter } from 'vue-router'

import navList from '@/router/modules/nav'

const router = useRouter()
const navNames = navList.map(item => item.name)
function jumpPage(item: RouteRecordRaw) {
  router.push({ name: item.name })
}
</script>

<template>
  <ul v-if="navNames.includes($route.name as string)" class="nav-warp">
    <li
      v-for="item in navList"
      :key="item.name"
      :class="`nav-item ${$route.name === item.name ? 'nav-item-active' : ''}`"
      @click="jumpPage(item)"
    >
      <a>
        <i :class="`iconfont ${item.meta?.icon}`" />
        {{ item.meta?.title }}
      </a>
    </li>
  </ul>
</template>

<style lang="less" scoped>
.nav-warp {
  display: flex;
  height: 7rem;
  min-height: 50px;
  background-color: #fff;
  .nav-item {
    flex: 1;
    height: 100%;
    a {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #afafb6;
      font-size: 16px;
    }
    .iconfont {
      margin-bottom: 0.5rem;
      font-size: 24px;
    }
  }
  .nav-item-active a {
    color: var(--primary-color) !important;
  }
}

@media screen and (max-width: 576px) {
  .nav-warp {
    .nav-item {
      a {
        font-size: 14px;
      }
      .iconfont {
        font-size: 20px;
      }
    }
  }
}
@media screen and (max-width: 480px) {
  .nav-warp {
    .nav-item {
      a {
        font-size: 12px;
      }
      .iconfont {
        margin-bottom: 0.8rem;
        font-size: 18px;
      }
    }
  }
}
</style>
