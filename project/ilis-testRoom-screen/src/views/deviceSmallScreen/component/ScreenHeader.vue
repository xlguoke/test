<template>
  <div class="main">
    <div class="logo">{{ unitInfo.departname }}</div>
    <div class="info">
      <span class="currentTime">{{ currentTime }}</span>
      <span class="week">{{ getCurrentDayOfWeek() }}</span>
      <span class="weather">
        <span>{{ currentWeather.province }}</span>
        <span>{{ currentWeather.weather }}</span>
        <span>{{ currentWeather.temperature || "--" }}℃</span>
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { formatDate } from "@/utils/utils"
import { ref } from "vue"
import { IUnitInfoEntity, WeatherEntity } from "."
import { useMapHooks } from "@/hooks/useMapHooks"
import { getUnitInfo } from "@/api/deviceSmallScreen.api"

const { getCurrentCity, getCurrentCityWeather } = useMapHooks()

const currentTime = ref(formatDate(new Date(), 2))
setInterval(() => {
  currentTime.value = formatDate(new Date(), 2)
}, 1000)

const currentCity = ref("--")
const currentWeather = ref({} as WeatherEntity)

const unitInfo = ref<IUnitInfoEntity>({})

/**
 * 获取当前星期几
 */
function getCurrentDayOfWeek() {
  const daysOfWeek = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"]
  const today = new Date()
  const dayIndex = today.getDay()
  return daysOfWeek[dayIndex]
}

async function init() {
  currentCity.value = await getCurrentCity()
  currentWeather.value = await getCurrentCityWeather()
  const { data, code } = await getUnitInfo()
  if (code === 20000) {
    unitInfo.value = data
  }
}

init()
</script>

<style lang="less" scoped>
.main {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  color: #fff;
  font-size: 28px;
  background: #000b32;
  .logo {
    flex: 1;
    margin-right: 200px;
    font-family: YSFont;
    font-size: 48px;
    background: linear-gradient(0deg, #87daff 0%, #ffffff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-fill-color: transparent;
    word-break: break-all;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .info {
    display: flex;
    align-items: center;
    > span {
      & + span {
        margin-left: 40px;
      }
    }
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
}
</style>
