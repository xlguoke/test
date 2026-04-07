<template>
  <div class="header">
    <div class="bg"></div>
    <div class="info">
      <div class="l">
        <div>
          <img class="icon" src="@/assets/images/cutRoomScreen/location.svg" alt="" />
          <span>{{ currentCity }}</span>
        </div>
      </div>
      <div class="c">{{ screenConfig.name }}</div>
      <div class="r">
        <div>
          <img class="icon" src="@/assets/images/cutRoomScreen/time.svg" alt="" />
          <span>{{ currentTime }}</span>
        </div>
        <span class="weather">
          <span>{{ currentWeather.weather }}</span>
          <span>{{ currentWeather.temperature || "--" }}℃</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { formatDate } from "@/utils/utils"
import { useStore } from "@/store"
import { useMapHooks } from "@/hooks/useMapHooks"
import { WeatherEntity } from "@/views/deviceSmallScreen/component"

defineProps<{
  title: string
}>()

const { screenConfig } = useStore()

const { getCurrentCity, getCurrentCityWeather } = useMapHooks()

const currentCity = ref("--")

const currentWeather = ref({} as WeatherEntity)

const currentTime = ref(formatDate(new Date(), 2))

setInterval(() => {
  currentTime.value = formatDate(new Date(), 2)
}, 1000)

async function init() {
  currentCity.value = await getCurrentCity()
  currentWeather.value = await getCurrentCityWeather()
}

init()
</script>

<style lang="less" scoped>
.header {
  width: 100%;
  position: relative;
  .bg {
    height: 0.88rem;
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
    height: 0.56rem;
    top: 0.06rem;
    bottom: 0;
    left: 0;
    right: 0;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    align-items: center;
    font-size: 0.14rem;
    color: #ffffff;
    .icon {
      width: 0.16rem;
      height: 0.16rem;
    }
    .r {
      justify-content: flex-end;
      .weather {
        display: flex;
        align-items: center;
        > span {
          & + span {
            margin-left: 10px;
          }
        }
      }
    }
    .l,
    .r {
      display: flex;
      align-items: center;
      height: 0.56rem;
      padding: 0 0.32rem;
      gap: 0.25rem;
      > div {
        display: flex;
        align-items: center;
        gap: 0.06rem;
      }
    }
    .c {
      font-family: YSFont;
      font-size: 0.48rem;
      white-space: nowrap;
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
