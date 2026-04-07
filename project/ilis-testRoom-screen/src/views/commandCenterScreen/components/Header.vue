<template>
  <header>
    <div class="header-title">{{ title }}</div>
    <div class="flex-1 h-[60px] flex items-center pl-[288px]">
      <nav>
        <RouterLink :class="getActive('commandCenterScreenHome')" to="/commandCenterScreen">
          首页
        </RouterLink>
        <RouterLink
          :class="getActive('commandCenterScreenDataCenter')"
          to="/commandCenterScreen/dataCenter"
        >
          数据中心
        </RouterLink>
        <!-- <RouterLink
          :class="getActive('commandCenterScreenTestMonitor')"
          to="/commandCenterScreen/testMonitor"
        >
          检测机构监控
        </RouterLink>
        <RouterLink
          :class="getActive('commandCenterScreenLabMgt')"
          to="/commandCenterScreen/labMgt"
        >
          工地试验室管理
        </RouterLink> -->
      </nav>
    </div>
    <div class="header-info">
      <span>
        <img src="../../../assets/images/header-address.svg" />
        {{ currentCity }}
      </span>
      <span>
        <img src="../../../assets/images/header-time.svg" />
        {{ currentTime }}
      </span>
      <span>
        <img src="../../../assets/images/header-weather.svg" />
        {{ currentWeather.weather || "-" }}
        {{ currentWeather.temperature || "-" }}℃
      </span>
    </div>
  </header>
</template>

<script setup lang="ts">
import { getCockpitName } from "@/api/commandCenterScreen.api"
import { computed, ref } from "vue"
import { formatDate } from "@/utils/utils"
import { useRouter } from "vue-router"
import { useMapHooks } from "@/hooks/useMapHooks"
import { WeatherEntity } from "@/views/deviceSmallScreen/component"

const { getCurrentCity, getCurrentCityWeather } = useMapHooks()

const title = ref("")

getCockpitName().then((res: string) => {
  title.value = res
})

const router = useRouter()

const routerName = computed(() => router.currentRoute.value.name)

const currentCity = ref("-")

const currentWeather = ref({} as WeatherEntity)

const currentTime = ref(formatDate(new Date(), 2))

function getActive(name: string) {
  return routerName.value === name ? "active" : ""
}

async function init() {
  currentCity.value = await getCurrentCity()
  currentWeather.value = await getCurrentCityWeather()

  setInterval(() => {
    currentTime.value = formatDate(new Date(), 2)
  }, 1000)
}

init()
</script>

<style scoped lang="less">
header {
  height: 88px;
  background: url("@/assets/images/commandCenterScreen/header-bg.png") no-repeat;
  background-size: 100% 100%;
  display: flex;

  .header-title {
    color: #bceaff;
    font-size: 42px;
    padding-left: 84px;
    letter-spacing: 2px;
    line-height: 88px;
  }

  .header-info {
    display: flex;
    gap: 24px;
    height: 60px;
    padding-right: 32px;

    span {
      display: flex;
      align-items: center;
      color: #fff;
    }

    img {
      width: 16px;
      margin-right: 6px;
    }
  }

  nav {
    color: #5ac3ff;
    font-size: 18px;
    font-family: "YSFont";
    display: flex;

    a {
      display: block;
      padding: 0 24px;
      line-height: 60px;
      cursor: pointer;

      &:hover,
      &.active {
        color: #00ffea;
        background: url(../../../assets/images/commandCenterScreen/nav-active.svg) no-repeat;
        background-position: bottom;
        background-size: 100%;
      }
    }
  }
}
</style>
