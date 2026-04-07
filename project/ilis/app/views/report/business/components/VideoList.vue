<template>
  <div class="flex">
    <div v-if="videos.length > 0" class="w-[150px] pr-2 mr-2 overflow-auto">
      <div
        v-for="(item, index) in videos" :key="index"
        class="rounded-md p-2 mb-2 bg-gray-200 cursor-pointer relative overflow-hidden"
        :class="`${index === showIndex ? 'bg-blue-200' : ''}`"
        @click="showIndex = index"
      >
        <h4 class="font-bold mb-0">
          {{ item.labName }}
        </h4>
        <p>{{ item.equName }}</p>
        <p class="leading-tight">
          {{ item.startDate }} ~
          {{ item.endDate }}
        </p>
        <div
          v-if="!item.videoUrl"
          class="absolute right-0 top-0 px-2 py-1 rounded-bl-md bg-gray-500/50"
          @click="emits('reDownload', index, item)"
        >
          <ReloadOutlined style="color: #fff" />
        </div>
      </div>
    </div>
    <div v-if="videos.length > 0" class="flex-1 h-[400px] bg-black">
      <video v-if="video?.videoUrl" controls autoplay class="w-full h-full">
        <source :src="video?.videoUrl" type="video/mp4">
        您的浏览器不支持视频播放。
      </video>
      <div v-else class="h-full text-white flex flex-col justify-center items-center">
        <span class="mb-2">视频获取失败</span>
        <a-button type="link" class="hover:opacity-80" @click="emits('reDownload', showIndex, video)">
          <ReloadOutlined style="color: #fff" />
          <span class="text-white">重新获取</span>
        </a-button>
      </div>
    </div>
    <div v-if="videos.length === 0" class="flex justify-center items-center w-full h-[400px]">
      <a-empty :image="emptyImg" />
    </div>
  </div>
</template>

<script setup lang='ts'>
import type { VideoData } from '../api'
import { ReloadOutlined } from '@ant-design/icons-vue'

const props = defineProps<{
  videos: VideoData[]
}>()
const emits = defineEmits<{
  (e: 'reDownload', index: number, video: VideoData): void
}>()

const emptyImg = new URL('~/assets/img/no-data.svg', import.meta.url).href
const showIndex = ref(0)
const video = computed<VideoData>(() => props.videos[showIndex.value])
</script>

<style scoped>
p{
  margin: 0;
}
</style>
