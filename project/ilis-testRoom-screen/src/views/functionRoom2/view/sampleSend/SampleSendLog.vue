<template>
  <div class="log-list">
    <container>
      <van-steps
        v-if="logList?.length"
        direction="vertical"
        active-color="#224059"
        inactive-color="#224059"
      >
        <van-step v-for="i in logList" :key="i.value">
          <template #active-icon>
            <div class="dot"></div>
          </template>
          <template #inactive-icon>
            <div class="dot"></div>
          </template>
          <div class="log-item">
            <div class="t">{{ dayjs(i.createDate).format("YYYY-MM-DD HH:mm:ss") }}</div>
            <div class="b" v-html="i.content"></div>
          </div>
        </van-step>
      </van-steps>
      <van-empty v-else description="暂无数据" :image="emptyImage" />
    </container>
  </div>
</template>

<script lang="ts" setup>
import Container from "@/views/functionRoom2/components/Container.vue"
import { onMounted, onUnmounted, ref } from "vue"
import { closeToast, showFailToast, showLoadingToast } from "vant"
import request from "@/utils/request"
import { useRoute } from "vue-router"
import emptyImage from "@/assets/images/functionRoom2/empty.svg"
import dayjs from "dayjs"
const logList = ref()

let timer: any = null
const route = useRoute()
const id = route.query.id as string

async function getData(flag?: boolean) {
  if (!flag) {
    showLoadingToast({
      message: "加载中...",
      duration: 0
    })
  }
  const { code, data, msg, message } = await request
    .get(`/api/synthesis/log?id=${id}&objectType=${43}&relationQry=false`)
    .finally(() => {
      closeToast()
    })
  if (code === 20000) {
    logList.value = data

    if (timer) clearTimeout(timer)

    timer = setTimeout(() => {
      getData(true)
    }, 3000)
  } else {
    showFailToast(msg || message)
  }
}

onMounted(() => {
  getData()
})
onUnmounted(() => {
  clearTimeout(timer)
})
</script>
<style lang="less" scoped>
.log-list {
  :deep(.van-step__line) {
    width: 0.01rem !important;
    background-color: #0066ec !important;
  }
  .log-item {
    font-size: 0.24rem;
  }
}
.dot {
  width: 0.24rem;
  height: 0.24rem;
  border-radius: 50%;
  border: 1px solid #0066ec;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  &::after {
    content: "";
    display: block;
    width: 0.16rem;
    height: 0.16rem;
    border-radius: 50%;
    background-color: #0066ec;
  }
}
</style>
