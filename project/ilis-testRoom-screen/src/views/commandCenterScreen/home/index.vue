<template>
  <Niceframe class="h-full w-full p-3" top-line>
    <div class="h-full w-full">
      <video v-if="videoSrc" ref="videoRef" class="h-full w-full" loop autoplay :controls="true">
        <source :src="videoSrc" type="video/mp4" />
      </video>
    </div>
  </Niceframe>
</template>

<script setup lang="ts">
import Niceframe from "../components/Niceframe.vue"
import { ref } from "vue"
import { getPublicityVideo } from "@/api/cabinet.api"
import { getUnitCode } from "@/utils/unit"

const unitCode = getUnitCode()

const videoSrc = ref("")

getPublicityVideo(unitCode).then((res) => {
  const rows = res._embedded["publicity-video"]

  if (rows.length > 0) {
    videoSrc.value = rows[0].url
  }
})
</script>
