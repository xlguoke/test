<template>
  <div class="top-wrap">
    <div class="left">
      <span class="img"></span>
      <span class="logo">
        {{ unitName || "" }}
      </span>
    </div>
    <span class="timeAndSign">
      <span>{{ nowDate }}</span>
      <i v-if="network" class="iconfont icon-xinhao"></i>
      <i v-else class="iconfont icon-wangluoduankai"></i>
    </span>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, toRefs, onBeforeUnmount } from "vue"
import { formatDate } from "@/utils/utils"
let dateTiming: any = null
let nowDate = ref<string>("-")
let network = ref<boolean>(true)
const props = defineProps<{ unitName: string }>()
const { unitName } = toRefs(props)
onMounted(() => {
  dateTiming = setInterval(() => {
    nowDate.value = formatDate("", 3)
  }, 1000)
  // 初始化
  window.addEventListener("online", () => (network.value = true), false)
  window.addEventListener("offline", () => (network.value = false), false)
})
onBeforeUnmount(() => {
  dateTiming && clearInterval(dateTiming)
})
</script>

<style lang="less" scoped>
.top-wrap {
  font-size: 0.36rem;
  display: flex;
  justify-content: space-between;
  line-height: 0.9rem;
  align-items: center;
  color: #bceaff;
  height: 0.9rem;
  width: 100%;

  .left {
    display: flex;
    align-items: center;

    .img {
      width: 0.36rem;
      height: 0.36rem;
      border-radius: 4px;
      background: #bceaff;
      margin-right: 0.16rem;
    }

    .logo {
      font-family: "YSFont";
      letter-spacing: 2px;
    }
  }

  .timeAndSign {
    display: flex;
    align-items: center;

    span {
      font-size: 0.24rem;
      margin-right: 0.2rem;
    }
    .iconfont {
      font-size: 0.24rem;
    }
  }
}
</style>
