<template>
  <div class="common_layout">
    <a-layout>
      <a-layout-header>
        <Layout.header />
      </a-layout-header>
      <a-layout style="height: calc(100vh - 60px)">
        <a-layout-sider width="200px" class="sider-wrap">
          <Layout.sidebar />
        </a-layout-sider>
        <a-layout-content>
          <a-layout-header style="height: 40px">
            <Layout.tagsView />
          </a-layout-header>
          <a-layout-content class="main_view">
            <Layout.appMain />
          </a-layout-content>
        </a-layout-content>
      </a-layout>
    </a-layout>
  </div>
</template>
<script setup lang="ts">
import * as Layout from "./components/index"
</script>
<style lang="less">
.sider-wrap {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}
.main_view {
  padding: 10px;
  background: white;
  height: calc(100% - 40px);
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
