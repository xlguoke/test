<template>
  <div class="web-layout">
    <Header />
    <div class="web-content">
      <router-view />
    </div>
    <!-- <Footer /> -->
    <Footer2025 />
  </div>
</template>

<script setup lang="ts">
// import {reactive, ref} from 'vue';
import Header from "./Header.vue"
// import Footer from "./Footer.vue"
import Footer2025 from "./Footer2025.vue"
</script>

<style lang="less" scoped>
.web-layout {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100%;
  // background: url("@/assets/images/bk.png") no-repeat top/cover;
  // background-color: #f2f6f8;
}
</style>
