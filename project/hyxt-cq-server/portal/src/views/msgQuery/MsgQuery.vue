<template>
  <div class="page-content card clearfix">
    <QueryList class="fl" is-tabs @change="changeTabs" />
    <div class="query-content fr">
      <ReportQuery v-if="activeKey === 'Report'" />
      <PerformanceQuery v-else-if="activeKey === 'Performance'" />
      <SignInForm v-else-if="activeKey === 'UnitSignin'" />
      <AdultEducationQuery v-else-if="activeKey === 'AdultEducationQuery'" />
      <BotSignIn v-else-if="activeKey === 'BotSignIn'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import QueryList from "@/components/queryList/QueryList.vue"
import ReportQuery from "./components/ReportQuery.vue"
import PerformanceQuery from "./components/PerformanceQuery.vue"
import SignInForm from "../unitSignIn/SignInForm.vue"
import AdultEducationQuery from "./components/AdultEducationQuery.vue"
import BotSignIn from "../botSignIn/SignInForm.vue"

const activeKey = ref("")
onMounted(() => {
  const key = sessionStorage.getItem("queryListKey") || "Report"
  activeKey.value = key
})

const changeTabs = (key: string) => {
  console.log(activeKey, key)
  activeKey.value = key
}
</script>
<style scoped lang="less">
.page-content {
  margin-top: 12px;
  min-height: 500px;
  display: flex;
  .serve-list {
    padding: 20px;
    width: 280px;
    border-right: 1px solid #dbe8fa;
    box-sizing: border-box;
    flex: 1;
    .item {
      padding: 0 15px;
      line-height: 52px;
      background: #edf4fc;
      border-radius: 4px;
      color: #4a8de5;
      font-weight: 700;
      font-size: 16px;
      cursor: pointer;
      &:hover {
        background: @theme_color;
        color: #fff;
      }
      &:not(:first-child) {
        margin-top: 21px;
      }
      .iconfont:first-child {
        font-size: 18px;
      }
      .iconfont:last-child {
        font-size: 12px;
      }
    }
  }
  .query-content {
    padding: 15px;
    width: calc(100% - 280px);
    box-sizing: border-box;
  }
}
</style>
