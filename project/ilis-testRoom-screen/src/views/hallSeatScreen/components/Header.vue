<template>
  <div class="hall-seat-header">
    <img class="logo" src="@/assets/images/logo-hbjs-white.svg" alt="logo" />
    <div class="header-right">
      <div class="date">
        <p>{{ week }}</p>
        <p>{{ toDay }}</p>
      </div>
      <p class="time">{{ time }}</p>
      <iframe
        width="150"
        scrolling="no"
        height="30"
        frameborder="0"
        allowtransparency="true"
        :src="src"
      ></iframe>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import { useRoute } from "vue-router"

const route = useRoute()
const week = ref("")
const toDay = ref("")
const time = ref("")
const src = ref("https://i.tianqi.com?c=code&id=34&color=%23333333&icon=1&py=wuhan&site=14")

if (route.name == "hallSeatScreen") {
  src.value = "https://i.tianqi.com?c=code&id=34&color=%23ffffff&icon=1&py=wuhan&site=14"
}

onMounted(() => {
  initData()
})

function zero(n: number): string {
  return n < 10 ? `0${n}` : n + ""
}

function initData() {
  const date = new Date()
  const _week = date.getDay()
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const h = date.getHours()
  const m = date.getMinutes()

  toDay.value = `${year}-${zero(month)}-${zero(day)}`
  time.value = `${zero(h)}:${zero(m)}`

  switch (_week) {
    case 0:
      week.value = "星期日"
      break
    case 1:
      week.value = "星期一"
      break
    case 2:
      week.value = "星期二"
      break
    case 3:
      week.value = "星期三"
      break
    case 4:
      week.value = "星期四"
      break
    case 5:
      week.value = "星期五"
      break
    case 6:
      week.value = "星期六"
      break
  }
}
</script>

<style scoped lang="less">
.hall-seat-header {
  padding: 24px 0;
  display: flex;
  justify-content: space-between;
  .logo {
    display: block;
    height: 60px;
    width: auto;
  }
  .header-right {
    display: flex;
    align-items: center;
    .date {
      line-height: 28px;
      font-size: 18px;
      text-align: right;
    }
    .time {
      margin-left: 10px;
      margin-right: 30px;
      font-size: 50px;
    }
  }
}
</style>
