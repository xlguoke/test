<template>
  <FrameBox>
    <template #title>
      <FrameTitle>现场检测室</FrameTitle>
    </template>
    <div class="w-full h-full flex-1 flex gap-60 pt-20">
      <MonitorVideo :play-config="playConfig" />
    </div>
  </FrameBox>
</template>
<script setup lang="ts">
import { getPlayLabs, IVideoConfig } from "@/api/smartCockpit.test.api"
import FrameBox from "@/components/smartCockpit/FrameBox.vue"
import FrameTitle from "@/components/smartCockpit/FrameTitle.vue"
import MonitorVideo from "@/components/smartCockpit/MonitorVideo.vue"
import { ref } from "vue"

const playConfig = ref<IVideoConfig>()

async function getVideoUrl() {
  const data = await getPlayLabs("EQ")
  playConfig.value = data?.data?.[0]
}
getVideoUrl()
</script>
