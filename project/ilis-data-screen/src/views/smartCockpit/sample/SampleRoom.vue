<template>
  <FrameBox :loading="loading">
    <template #title>
      <FrameTitle>样品室</FrameTitle>
    </template>
    <div class="h-full pt-42 flex gap-60">
      <MonitorVideo :play-config="playConfig1" class="flex-1" />
      <MonitorVideo :play-config="playConfig2" class="flex-1" />
    </div>
  </FrameBox>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { getPlayLabs, IVideoConfig } from "@/api/smartCockpit.test.api"
import MonitorVideo from "@/components/smartCockpit/MonitorVideo.vue"

const loading = ref(false)

const playConfig1 = ref<IVideoConfig>()
const playConfig2 = ref<IVideoConfig>()

async function getVideoUrl() {
  const data = await getPlayLabs("CONSIGN")
  playConfig1.value = data?.data?.find((i) => i.model === "1")
  playConfig2.value = data?.data?.find((i) => i.model === "2")
}
getVideoUrl()
</script>
