<template>
  <div class="custome-video">
    <div class="video_box" :class="isFull ? 'playing' : ''">
      <div v-if="isFull" class="un_full" @click.stop="isFull = false">
        <FullscreenExitOutlined />
      </div>
      <video
        ref="video"
        :key="key"
        :src="src"
        preload="auto"
        webkit-playsinline="true"
        controls
        playsinline
        x5-video-player-type="h5"
        x5-video-player-fullscreen="true"
        x5-video-orientation="portraint"
        @pause="isPlaying = false"
        @play="
          () => {
            isPlaying = true
            isFull = true
          }
        "
      />
    </div>
    <div v-show="showDesc" class="desc">{{ desc }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { FullscreenExitOutlined } from "@ant-design/icons-vue"

const props = defineProps<{
  src: string
  desc?: string
}>()

const video = ref<HTMLVideoElement>()

const isPlaying = ref(false)

const isFull = ref(false)

const key = ref(Date.now())

/**
 * 是否显示描述-仅在视频暂停且有描述文本时显示
 */
const showDesc = computed(() => {
  return props.desc && !isPlaying.value
})

// function handleClick() {
//   if (!video.value) return
//   if (video.value.paused) {
//     video.value.play()
//   } else {
//     video.value.pause()
//   }
// }
</script>

<style lang="less" scoped>
.custome-video {
  position: relative;
  border: 1px solid #0067ff;
  width: 450px;
  height: 290px;
  .video_box {
    width: 100%;
    height: 100%;
  }
  video {
    width: 100%;
    height: 100%;
    object-fit: contain;
    background-color: #000;
    z-index: -1;
  }
  video::-webkit-media-controls-fullscreen-button {
    display: none;
  }
  .desc {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.5);
    color: #fff;
    padding: 10px;
    font-size: 28px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .un_full {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: start;
    justify-content: center;
    color: #fff;
    z-index: 999;
    :deep(svg) {
      width: 100% !important;
      height: 100% !important;
    }
  }
}

.playing {
  position: fixed;
  z-index: 9;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
}
</style>
