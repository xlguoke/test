<template>
  <div v-if="showLabList.length" class="test-video">
    <div class="test-video-nav">
      <template v-for="item in showLabList" :key="item.url">
        <div
          class="test-video-btn"
          :class="{
            active: selectedVideo && selectedVideo.url === item.url
          }"
          :title="item.name"
          @click="onSelectVideo(item)"
        >
          {{ item.name }}
        </div>
      </template>
      <div v-if="showMoreBtn" class="test-video-btn" @click="moreVisible = !moreVisible">
        {{ moreVisible ? "收起更多" : "更多" }}
      </div>
    </div>

    <div v-if="moreVisible" class="test-video-more flex flex-col">
      <div class="flex-1 flex gap-32 flex-wrap">
        <template v-for="item in companyVideoList" :key="item.url">
          <div
            class="test-video-btn"
            :class="{
              active: selectedVideo && selectedVideo.url === item.url
            }"
            :title="item.name"
            @click="onSelectVideo(item)"
          >
            {{ item.name }}
          </div>
        </template>
      </div>
    </div>

    <div class="flex-1 h-0" style="border: solid 1px #40e7d5">
      <video
        v-if="playUrl"
        :key="playUrl"
        ref="videoRef"
        class="h-full w-full"
        loop
        autoplay
        :controls="true"
        style="object-fit: cover"
      >
        <source :src="playUrl" type="video/mp4" />
      </video>
    </div>

    <div class="test-video-tl"></div>
    <div class="test-video-tr"></div>
    <div class="test-video-bl"></div>
    <div class="test-video-br"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { useUnitDataHooks } from "@/hooks/useUnitDataHooks"
import { getPublicityVideo, PublicityVideoDTO } from "@/api/common.api"

const { unitCode } = useUnitDataHooks()

const companyVideoList = ref<PublicityVideoDTO[]>([])

const selectedVideo = ref<PublicityVideoDTO>()

const playUrl = ref("")

const moreVisible = ref(false)

const showLabList = computed(() => {
  if (companyVideoList.value.length > 6) {
    return companyVideoList.value.slice(0, 5)
  }
  return companyVideoList.value
})

const showMoreBtn = computed(() => companyVideoList.value.length > 6)

async function onSelectVideo(item: PublicityVideoDTO) {
  selectedVideo.value = item
  moreVisible.value = false

  playUrl.value = item.url
  console.log(playUrl.value)
}

async function init() {
  const rows = await getPublicityVideo(unitCode.value)

  companyVideoList.value = rows

  if (rows.length) {
    onSelectVideo(companyVideoList.value[0])
  }
}

init()
</script>

<style lang="less" scoped>
.test-video-o {
  content: "";
  background: #40e7d5;
  display: block;
  position: absolute;
}

.test-video {
  height: 100%;
  border: 2px solid rgba(64, 231, 213, 0.4);
  padding: 0.32rem;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.32rem;

  .test-video-more {
    position: absolute;
    top: 2.06rem;
    left: 0.32rem;
    bottom: 0.32rem;
    right: 0.32rem;
    background: rgba(64, 231, 213, 0.2);
    padding: 0.32rem;
    z-index: 100;
    overflow-y: auto;

    .test-video-btn {
      width: 3.2rem;
      height: 1rem;
      font-size: 0.38rem;
      line-height: 1rem;
    }
  }

  .test-video-nav {
    display: flex;
    gap: 0.2rem;
    min-height: 0.56rem;
  }

  .test-video-btn {
    width: 16.66%;
    color: #4cb8b0;
    background: rgba(11, 255, 255, 0.1);
    box-sizing: border-box;
    border: 2px solid rgba(64, 231, 213, 0.3);
    font-size: 0.52rem;
    font-weight: bold;
    cursor: pointer;
    height: 1.42rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding: 0 0.24rem;
    line-height: 1.4rem;
    text-align: center;

    &.active,
    &:hover {
      background: linear-gradient(
        270deg,
        rgba(11, 255, 255, 0.102) 0%,
        rgba(11, 255, 255, 0.6) 100%
      );
      box-sizing: border-box;
      border: 2px solid;
      border-image: linear-gradient(270deg, rgba(11, 255, 255, 0) 0%, #0bffff 100%) 4;
      font-variation-settings: "opsz" auto;
      font-feature-settings: "kern" on;
      color: rgba(11, 255, 255, 0.9804);
    }
  }

  .test-video-tl {
    position: absolute;
    left: -2px;
    top: -2px;

    &::before {
      .test-video-o;
      width: 0.3rem;
      height: 2px;
    }

    &::after {
      .test-video-o;
      height: 0.3rem;
      width: 2px;
    }
  }

  .test-video-tr {
    position: absolute;
    right: -2px;
    top: -2px;

    &::before {
      .test-video-o;
      width: 0.3rem;
      height: 2px;
      right: 0;
      top: 0;
    }

    &::after {
      .test-video-o;
      height: 0.3rem;
      width: 2px;
      right: 0;
      top: 0;
    }
  }

  .test-video-bl {
    position: absolute;
    left: -2px;
    bottom: -2px;

    &::before {
      .test-video-o;
      width: 0.3rem;
      height: 2px;
      left: 0;
      bottom: 0;
    }

    &::after {
      .test-video-o;
      height: 0.3rem;
      width: 2px;
      left: 0;
      bottom: 0;
    }
  }

  .test-video-br {
    position: absolute;
    right: -2px;
    bottom: -2px;

    &::before {
      .test-video-o;
      width: 0.3rem;
      height: 2px;
      right: 0;
      bottom: 0;
    }

    &::after {
      .test-video-o;
      height: 0.3rem;
      width: 2px;
      right: 0;
      bottom: 0;
    }
  }
}
</style>
<style lang="less">
.test-video-popover {
  max-width: 8rem;
  min-width: 4.5rem;

  .ant-popover-arrow::after,
  .ant-popover-arrow::before {
    display: none;
  }

  .ant-popover-inner {
    background: rgba(13, 46, 43, 0.8);
    border-radius: 0;
    padding: 0;
    border: 1px solid rgba(64, 231, 213, 0.4);
  }

  .ant-popover-inner-content {
    color: rgba(11, 255, 255, 0.9804);
  }
}

.test-video-popover-ul {
  margin-bottom: 0;

  li {
    padding: 0.16rem 0.16rem;
    font-size: 0.36rem;
    cursor: pointer;

    &:hover {
      background: linear-gradient(
        270deg,
        rgba(11, 255, 255, 0.102) 0%,
        rgba(11, 255, 255, 0.6) 100%
      );
      box-sizing: border-box;
      font-variation-settings: "opsz" auto;
      font-feature-settings: "kern" on;
      color: rgba(11, 255, 255, 0.9804);
    }
  }
}
</style>
