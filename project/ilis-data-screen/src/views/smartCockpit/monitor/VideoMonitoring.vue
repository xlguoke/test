<template>
  <FrameBox>
    <template #title>
      <FrameTitle>视频实时监控</FrameTitle>
    </template>

    <div class="flex h-full gap-50 pt-20">
      <div class="w-full h-full flex-1 flex gap-60 pt-42">
        <MonitorVideo :play-config="playConfig1" class="flex-1" />
        <MonitorVideo :play-config="playConfig2" class="flex-1" />
      </div>
    </div>
  </FrameBox>
</template>

<script setup lang="ts">
import MonitorVideo from "@/components/smartCockpit/MonitorVideo.vue"
import { ref } from "vue"
import { getPlayLabs, IVideoConfig } from "@/api/smartCockpit.test.api"

const playConfig1 = ref<IVideoConfig>()
const playConfig2 = ref<IVideoConfig>()

async function getVideoUrl() {
  const data = await getPlayLabs("BUILDING")
  playConfig1.value = data?.data?.find((i) => i.model === "1")
  playConfig2.value = data?.data?.find((i) => i.model === "2")
}
getVideoUrl()
</script>

<style></style>
