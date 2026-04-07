<template>
  <div class="flex h-full gap-60">
    <div class="flex flex-1 flex-col gap-60">
      <!-- 各类材料完成数量统计top20 -->
      <MaterialStatistics class="flex-1" />

      <div class="flex flex-1 gap-60 h-0">
        <!-- 生产商-不合格率TOP10 -->
        <ManufacturerFailureTop10 />

        <!-- 生产商-稳定性排行TOP5 -->
        <ManufacturerStabilityTop5 />
      </div>
    </div>

    <FrameBox class="flex-1"></FrameBox>

    <div class="flex flex-1 gap-60">
      <div class="flex flex-1 flex-col gap-60">
        <!-- 检测指标散点图 -->
        <TestIndex class="flex-1" />

        <FrameBox class="flex-1">
          <template #title>
            <FrameTitle>试验室</FrameTitle>
          </template>

          <div class="w-full h-full flex-1 flex gap-60 pt-60">
            <MonitorVideo :play-config="playConfig1" class="flex-1" />
            <MonitorVideo :play-config="playConfig2" class="flex-1" />
          </div>
        </FrameBox>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import FrameBox from "@/components/smartCockpit/FrameBox.vue"
import MaterialStatistics from "./MaterialStatistics.vue"
import TestIndex from "./TestIndex.vue"
import ManufacturerFailureTop10 from "./ManufacturerFailureTop10.vue"
import ManufacturerStabilityTop5 from "./ManufacturerStabilityTop5.vue"
import MonitorVideo from "@/components/smartCockpit/MonitorVideo.vue"
import { ref } from "vue"
import { getPlayLabs, IVideoConfig } from "@/api/smartCockpit.test.api"

const playConfig1 = ref<IVideoConfig>()
const playConfig2 = ref<IVideoConfig>()

async function getVideoUrl() {
  const data = await getPlayLabs("TEST")
  playConfig1.value = data?.data?.find((i) => i.model === "1")
  playConfig2.value = data?.data?.find((i) => i.model === "2")
}
getVideoUrl()
</script>
