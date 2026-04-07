<template>
  <div class="smart-cockpit-header">
    <div class="w-[25.94rem] flex items-center ml-80 pb-40">
      <img src="../../assets/images/smartCockpit/logo.svg" class="h-[1.48rem]" />
      <div
        class="smart-cockpit-header-title font-ys"
        @click="router.push({ name: 'smartCockpitOverviewNew' })"
      >
        四川蜀工智慧驾驶舱
      </div>
    </div>
    <div class="smart-cockpit-nav font-ys">
      <template v-for="item in navList" :key="item.path">
        <a v-if="item.name === '工地试验'" :href="item.path">{{ item.name }}</a>
        <RouterLink
          v-else
          :to="item.path"
          :class="{
            active: routerPath === item.path
          }"
        >
          {{ item.name }}
        </RouterLink>
      </template>
    </div>
    <div class="smart-cockpit-header-date">
      <p>{{ week }}</p>
      <p>{{ time }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDateHooks } from "@/hooks/useDateHooks"
import { computed } from "vue"
import { useRoute, useRouter } from "vue-router"

const route = useRoute()

const router = useRouter()

const { time, week } = useDateHooks({
  timeFormat: "YYYY-MM-DD HH:mm",
  delay: 1000 * 10
})

const navList = [
  { name: "公司概况", path: "/smartCockpit" },
  // { name: "综合监管", path: "/smartCockpit/overviewNew" },
  // { name: "母体概况", path: "/smartCockpit/overview" },
  { name: "人力资源", path: "/smartCockpit/humanResources" },
  { name: "物资设备", path: "/smartCockpit/equipment" },
  { name: "委托/样品", path: "/smartCockpit/sample" },
  { name: "环境监控", path: "/smartCockpit/environment" },
  { name: "试验检测", path: "/smartCockpit/test" },
  {
    name: "工地试验",
    path: "http://110.185.107.18:51980/dashboards/view/87da7084-01aa-4c4c-8644-33c13908386e?theme=default&lng=zh-CN&token=1D92D38229BA89CD7B855BAB41FC0FE88ED510BE758080AB62B3E18D688BFA2E"
  },
  { name: "智能楼宇", path: "/smartCockpit/monitor" }
]

const routerPath = computed(() => {
  return route.path
})
</script>

<style lang="less" scoped>
.smart-cockpit-header {
  height: 3rem;
  display: flex;
  background: url("../../assets/images/smartCockpit/header-bg.png") no-repeat;
  background-size: 100% 100%;
}

.smart-cockpit-header-title {
  font-size: 1.68rem;
  margin-left: 1.32rem;
  font-variation-settings: "opsz" auto;
  font-feature-settings: "kern" on;
  background: linear-gradient(180deg, #ffffff 0%, #53ffec 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.smart-cockpit-nav {
  display: flex;
  margin-top: 1.36rem;
  flex: 1;
  justify-content: space-between;
}

.smart-cockpit-nav > a {
  // width: 5.4rem;
  width: 6rem;
  height: 1.6rem;
  background: url("../../assets/images/smartCockpit/nav-bg.png") no-repeat;
  background-size: 100% 100%;
  font-size: 0.8rem;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #a9dbdb;
}

.smart-cockpit-nav > a:hover,
.smart-cockpit-nav > a.active {
  color: #fff;
  background: url("../../assets/images/smartCockpit/nav-active-bg.png") no-repeat;
  background-size: 100% 100%;
}

.smart-cockpit-header-date {
  margin-top: 1rem;
  color: #40e7d5;
  margin-left: 0.6rem;
  margin-right: 0.68rem;
  text-align: right;

  p {
    margin-bottom: 0;
  }

  p:first-child {
    font-size: 0.72rem;
    margin-bottom: 0.24rem;
  }

  p:last-child {
    font-size: 0.64rem;
  }
}
</style>
