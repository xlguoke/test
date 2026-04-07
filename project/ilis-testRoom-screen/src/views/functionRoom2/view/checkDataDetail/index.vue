<template>
  <div class="main">
    <CommonTitle>巡查详情</CommonTitle>
    <CheckDetailLine></CheckDetailLine>
    <van-list
      v-model:loading="loading"
      finished-text="没有更多了"
      :finished="finished"
      @load="getList"
    >
      <CheckDetailLine
        v-for="(item, index) in data"
        :key="index"
        :data="item"
        :class="{
          bg: index % 2 === 0
        }"
      ></CheckDetailLine>
    </van-list>
  </div>
</template>
<script lang="ts" setup>
import { ref } from "vue"
import CheckDetailLine from "./components/CheckDetailLine.vue"
import CommonTitle from "../../components/CommonTitle.vue"

const data = ref<any[]>([])
const finished = ref(false)
const loading = ref(false)

async function getList() {
  // 异步更新数据
  // setTimeout 仅做示例，真实场景中一般为 ajax 请求
  setTimeout(() => {
    for (let i = 0; i < 10; i++) {
      data.value.push({ a: "xxx" })
    }

    // 加载状态结束
    loading.value = false

    // 数据全部加载完成
    if (data.value.length >= 80) {
      finished.value = true
    }
  }, 1000)
  console.log("getList", data.value)
}
</script>
<style lang="less" scoped>
.bg {
  background: rgba(255, 255, 255, 0.2);
}
.main {
  height: 100%;
}
</style>
