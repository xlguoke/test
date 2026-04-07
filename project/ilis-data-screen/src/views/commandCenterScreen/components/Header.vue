<template>
  <header>
    <div class="header-title">{{ title }}</div>
    <div class="flex-1 h-60 flex items-center pl-288">
      <nav>
        <RouterLink :class="getActive('commandCenterHome')" to="/commandCenter">首页</RouterLink>
        <RouterLink :class="getActive('commandCenterDataCenter')" to="/commandCenter/dataCenter">
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
        <img src="../../../assets/images/commandCenterScreen/header-address.svg" />
        {{ currentCity }}
      </span>
      <span>
        <img src="../../../assets/images/commandCenterScreen/header-time.svg" />
        {{ currentTime }}
      </span>
      <span>
        <img src="../../../assets/images/commandCenterScreen/header-weather.svg" />
        <template v-if="currentWeather">
          {{ currentWeather.text || "-" }}
          {{ currentWeather.temp || "-" }}℃
        </template>
        <template v-else>
          {{ "-" }}
        </template>
      </span>
    </div>
  </header>
</template>

<script setup lang="ts">
import { getCockpitName } from "@/api/commandCenterScreen.api"
import { computed, ref } from "vue"
import { formatDate } from "@/utils/utils"
import { useRouter } from "vue-router"
import { useMapHooks, NowWeatherDTO } from "@/hooks/useMapHooks"

const { getCurrentCity, getCurrentCityWeather } = useMapHooks()

const title = ref("")

getCockpitName().then((res: string) => {
  title.value = res
})

const router = useRouter()

const routerName = computed(() => router.currentRoute.value.name)

const currentCity = ref("-")

const currentWeather = ref<NowWeatherDTO>()

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
  height: 0.88rem;
  background: url("@/assets/images/commandCenterScreen/header-bg.png") no-repeat;
  background-size: 100% 100%;
  display: flex;

  .header-title {
    color: #bceaff;
    font-size: 0.42rem;
    padding-left: 0.84rem;
    letter-spacing: 0.02rem;
    line-height: 0.84rem;
  }

  .header-info {
    display: flex;
    gap: 0.24rem;
    height: 0.6rem;
    padding-right: 0.32rem;

    span {
      display: flex;
      align-items: center;
      color: #fff;
    }

    img {
      width: 0.16rem;
      margin-right: 0.06rem;
    }
  }

  nav {
    color: #5ac3ff;
    font-size: 0.18rem;
    font-family: "YSFont";
    display: flex;

    a {
      display: block;
      padding: 0 0.24rem;
      line-height: 0.6rem;
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
