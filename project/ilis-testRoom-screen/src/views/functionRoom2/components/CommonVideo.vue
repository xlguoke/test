<template>
  <div class="custome-video">
    <div class="video_box" :class="isFull ? 'playing' : ''">
      <div v-if="isFull" class="un_full" @click.stop="handleClickUnFull()">
        <FullscreenExitOutlined />
      </div>
      <video
        ref="video"
        :key="key"
        :src="src"
        preload="auto"
        webkit-playsinline="true"
        disableremoteplayback="true"
        controls
        controlslist="nofullscreen noremoteplayback nodownload"
        playsinline
        x5-video-player-type="h5"
        x5-video-player-fullscreen="false"
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

function handleClickUnFull() {
  isFull.value = false
  video.value?.pause()
}
</script>

<style lang="less" scoped>
.custome-video {
  position: relative;
  width: 3.08rem;
  height: 2.46rem;
  padding: 0.08rem;
  border: 2px solid #ffffff;
  border-radius: 0.08rem;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.2) 100%);
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .video_box {
    width: 100%;
    flex: 1;
    border-radius: 0.08rem;
    overflow: hidden;
    margin-bottom: 0.08rem;
  }
  video {
    width: 100%;
    height: 100%;
    object-fit: contain;
    background-color: #000;
    z-index: -1;
    border-radius: 0.08rem;
    overflow: hidden;
    border: 1px solid #000;
  }
  video::-webkit-media-controls-fullscreen-button {
    display: none;
  }
  .desc {
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .un_full {
    position: absolute;
    top: 0.2rem;
    right: 0.2rem;
    width: 0.4rem;
    height: 0.4rem;
    display: flex;
    align-items: start;
    justify-content: center;
    color: #fff;
    z-index: 999;
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
