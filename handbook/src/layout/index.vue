<script setup lang="ts">
import AppMain from './components/AppMain.vue'
import Nav from './components/Nav.vue'
</script>

<template>
  <div class="layout-warp">
    <div class="app-main">
      <AppMain />
    </div>
    <Nav />
  </div>
</template>

<style lang="less">
.layout-warp {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  .app-main {
    flex: 1;
    height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    background-color: #fafafa;
    .title-bar-wrap {
      display: none;
    }
    .show-title-bar {
      position: relative;
      padding-top: 45px;
      height: 100%;
      overflow-y: auto;
      .title-bar-wrap {
        display: block;
      }
    }
  }
}
</style>
