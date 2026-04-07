<template>
  <div class="header">
    <div class="bg"></div>
    <div class="info">
      <div class="l">
        <div>
          <img class="icon" src="@/assets/images/cutRoomScreen/location.svg" alt="" />
          <span>{{ currentCity }}</span>
        </div>
        <div>
          <img class="icon" src="@/assets/images/cutRoomScreen/building.svg" alt="" />
          <span>{{ data?.name || "--" }}</span>
        </div>
        <div>
          <img class="icon" src="@/assets/images/cutRoomScreen/time.svg" alt="" />
          <span>{{ currentTime }}</span>
        </div>
      </div>
      <div class="c">{{ screenConfig.name }}</div>
      <div class="r">
        <div>
          <img class="icon" src="@/assets/images/cutRoomScreen/temperature.svg" alt="" />
          <span>当前温度：{{ getTemperatureText() }}</span>
        </div>
        <div>
          <img class="icon" src="@/assets/images/cutRoomScreen/humidity.svg" alt="" />
          <span>当前湿度：{{ getHumidityText() }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { formatDate } from "@/utils/utils"
import { RoomEntity } from ".."
import { useStore } from "@/store"
import { useMapHooks } from "@/hooks/useMapHooks"

const { screenConfig } = useStore()

const { getCurrentCity } = useMapHooks()

const currentCity = ref("--")

const props = defineProps<{
  data: RoomEntity
}>()

const currentTime = ref(formatDate(new Date(), 2))
setInterval(() => {
  currentTime.value = formatDate(new Date(), 2)
}, 1000)

function getTemperatureText() {
  if (!props.data) return "--"
  if (props.data.showReallyTH) {
    return `${props.data?.temperature || "--"}℃`
  } else {
    return `${props.data?.minTemperature || "--"}℃ ~ ${props.data?.maxTemperature || "--"}℃`
  }
}
function getHumidityText() {
  if (!props.data) return "--"
  if (props.data.showReallyTH) {
    return `${props.data?.humidity || "--"}%rh`
  } else {
    return `${props.data?.minHumidity || "--"}%rh ~ ${props.data?.maxHumidity || "--"}%rh`
  }
}

async function init() {
  currentCity.value = await getCurrentCity()
}

init()
</script>

<style lang="less" scoped>
.header {
  width: 100%;
  position: relative;
  .bg {
    height: 88px;
    background-image: url("@/assets/images/home-top-bg.png");
    background-repeat: no-repeat;
    background-size: 100% 100%;
  }
  img {
    display: inline-block;
    width: 100%;
  }
  .info {
    position: absolute;
    height: 56px;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    font-size: 14px;
    color: #ffffff;
    .icon {
      width: 16px;
      height: 16px;
    }
    .r {
      justify-content: flex-end;
    }
    .l,
    .r {
      display: flex;
      align-items: center;
      height: 56px;
      padding: 0 32px;
      gap: 25px;
      > div {
        display: flex;
        align-items: center;
        gap: 6px;
      }
    }
    .c {
      font-family: YSFont;
      font-size: 48px;
      background: linear-gradient(0deg, #87daff 0%, #ffffff 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-fill-color: transparent;
      text-align: center;
    }
  }
}
</style>
