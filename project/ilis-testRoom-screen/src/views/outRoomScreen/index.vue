<template>
  <div class="screen-warp" style="width: 100%">
    <ScreenHeader :title="screenConfig.name" />
    <div class="head-warp">
      <EqCountHead ref="box1" :lab-id="labId" class="head"></EqCountHead>
    </div>
    <div class="body-warp">
      <div class="left-warp">
        <GoOutEqRecord ref="box2" :lab-id="labId" class="down-card l1"></GoOutEqRecord>
        <ReturnExpireEq ref="box5" :lab-id="labId" class="down-card l2"></ReturnExpireEq>
      </div>
      <div class="content-warp">
        <MapOutEq ref="box4" :lab-id="labId" class="down-card c1"></MapOutEq>
      </div>
      <div class="right-warp">
        <CheckExpireEqCount ref="box6" :lab-id="labId" class="down-card r1"></CheckExpireEqCount>
      </div>
    </div>
    <ScreenFooter></ScreenFooter>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, toRefs } from "vue"
import ScreenHeader from "./components/ScreenHeader.vue"
import GoOutEqRecord from "./components/GoOutEqRecord.vue"
import ReturnExpireEq from "./components/ReturnExpireEq.vue"
import CheckExpireEqCount from "./components/CheckExpireEqCount.vue"
import MapOutEq from "./components/MapOutEq.vue"
import EqCountHead from "./components/EqCountHead.vue"
import { parseAddressToObj } from "@/utils/utils"
import { useStore } from "@/store"
import { useScreenHooks } from "@/hooks/useScreenHooks"
import ScreenFooter from "./components/ScreenFooter.vue"

const { screenConfig } = toRefs(useStore())

const { refreshData } = useScreenHooks()

const labId = computed(() => {
  if (!screenConfig.value.url) return ""
  const query = parseAddressToObj(screenConfig.value.url)
  return query.labId || ""
})

window.onresize = () => {
  initPageScale()
}

const box1 = ref()
const box2 = ref()
const box3 = ref()
const box4 = ref()
const box5 = ref()
const box6 = ref()

/** # 是否为宽比例屏幕 */
const isBroadBeam = ref(false)

/**
 * # 初始化页面适配
 */
const initPageScale = () => {
  const winW = window.innerWidth || document.body.clientWidth
  const winH = window.innerHeight || document.body.clientHeight
  let size = (winH / 1080) * 100
  const wh = winW / winH

  document.documentElement.style.fontSize = size + "px"
  // 设备宽高比大于2
  if (wh >= 2) {
    document.querySelector(".screen-warp")?.classList.add("broad-beam")
    isBroadBeam.value = true
  } else {
    document.querySelector(".screen-warp")?.classList.remove("broad-beam")
    isBroadBeam.value = false
  }
}

const getDatas = () => {
  box1.value?.getData()
  box2.value?.getData()
  box3.value?.getData()
  box4.value?.getData()
  box5.value?.getData()
  box6.value?.getData()
}

onMounted(() => {
  initPageScale()
  refreshData(getDatas)
})
</script>

<style lang="less" scoped>
@col-gap: 0.26rem;
@row-gap: 0.24rem;

.mg-t {
  margin-top: 20px;
}

.screen-warp {
  color: #fff;
  height: 100%;
  overflow-y: hidden;
}
.head {
  width: 100%;
}
.head-warp {
  height: 1.45rem;
  padding: 0.17rem @row-gap 0;
}
.body-warp {
  padding: 0.2rem @row-gap 0;
  height: calc(100% - 0.88rem - 1.4rem - 0.4rem);
  display: flex;
  row-gap: @row-gap;
  column-gap: @col-gap;
  box-sizing: border-box;
  .left-warp,
  .right-warp {
    width: 27%;
    height: 100%;
    display: flex;
    flex-direction: column;
    row-gap: @row-gap;
  }
  .content-warp {
    flex: 1;
    display: flex;
    flex-direction: column;
    row-gap: @row-gap;
    width: 0;
    height: 100%;
  }

  .s-card {
    flex: 1;
    height: 0;
  }

  .down-card {
    flex: initial !important;
    &.l1 {
      height: 4.13rem;
    }
    &.l2 {
      height: 3.38rem;
    }
    &.c1 {
      height: 7.76rem;
    }
    &.c2 {
      height: 2.73rem;
    }
    &.r1 {
      height: 7.76rem;
    }
    &.r2 {
      height: 5.31rem;
    }
  }
}

:deep(.broad-beam) {
  .person-statistics {
    padding: 0 5%;
    .person-statistics-right {
      margin-left: -0.4rem;
    }
  }
  .device-statistics {
    padding: 0 0.2rem;
    .device-statistics-item-box {
      &.left {
        .device-statistics-info {
          margin-right: 0.7rem;
        }
      }
      &.right {
        .device-statistics-info {
          margin-left: 0.7rem;
        }
      }
    }
  }
}
</style>
