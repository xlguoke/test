<template>
  <div class="content-wrap flex-column">
    <RoomCard title="功能室信息" class="flex-column">
      <!-- 试验室信息 -->
      <RoomLabInfo :lab-info="labInfo" show-more />
    </RoomCard>
    <RoomCard title="功能室介绍" class="flex-column flex-h-1">
      <div class="flex-h-1 lab-overview">
        <ul v-if="labInfo.overview" class="text_wrap">
          <li v-for="(d, i) in overviews" :key="i">{{ d }}</li>
        </ul>
      </div>
      <div class="device-action">
        <span class="bg-btn" @click="changeTab('List')">化学药品</span>
        <span class="bg-btn" @click="changeTab('RiskInformation')">风险告知</span>
      </div>
    </RoomCard>
  </div>
</template>

<script setup lang="ts">
import { inject, computed } from "vue"
import { RoomCard, RoomLabInfo } from "../../components"
import { useBaseInfo } from "../../composables/useBaseInfo"
const { labInfo } = useBaseInfo()

const changeTab = inject("changeTab") as (key: string) => void

const overviews = computed(() => {
  const val = labInfo.value.overview
  return val ? val.split("\n") : []
})
</script>
<style lang="less" scoped>
.lab-overview {
  padding: 0;
  margin: 0.3rem 0.05rem;
  height: calc(100% - 1rem);
  overflow-y: auto;
  .text_wrap {
    padding: 0.5rem;
    text-align: center;
    font-size: 0.28rem;
    line-height: 0.45rem;
    color: #fff;
  }
}
</style>
