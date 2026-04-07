<!-- 海康威视H5播放器 -->
<template>
  <FrameBorderBox :bordered="true">
    <div class="flex w-full">
      <HikvisionH5Player
        class="flex-1"
        :play-url="playUrl"
        :msg="playErrorMsg"
        style="width: 0px"
      ></HikvisionH5Player>
      <div v-if="playList.length > 1" class="video-tab w-240 ml-16 h-full overflow-y-auto">
        <div
          v-for="item in playList"
          :key="item.id"
          :class="{
            active: item.id === playId
          }"
          :title="item.label"
          class="video-tab-item"
          @click="getPlayUrl(item.id)"
        >
          <div class="video-tab-text">
            {{ item.label }}
          </div>
        </div>
      </div>
    </div>
  </FrameBorderBox>
</template>

<script setup lang="ts">
import { getLabVideoConfigData, IVideoConfig } from "@/api/smartCockpit.test.api"
import FrameBorderBox from "@/components/smartCockpit/FrameBorderBox.vue"
import HikvisionH5Player from "@/components/HikvisionPlayer.vue"
import { computed, defineProps, PropType, ref, watch } from "vue"

const props = defineProps({
  // 播放配置
  playConfig: {
    required: true,
    type: Object as PropType<IVideoConfig>,
    default: () => ({})
  }
})

const playErrorMsg = ref("")

const playId = ref("")

const playUrl = ref("")

const playList = computed(() => {
  const data = props.playConfig || {}
  const labConfigIds = data.labConfigId ? data.labConfigId.split(",") : []
  const labConfigNames = data.labConfigName ? data.labConfigName.split(",") : []

  return labConfigIds.map((id, index) => ({
    id,
    label: labConfigNames[index]
  }))
})

async function getPlayUrl(id: string) {
  playId.value = id

  const res = await getLabVideoConfigData(id).catch((err) => {
    playErrorMsg.value = err.message || "获取视频数据失败"
  })
  playUrl.value = res?.data?.data?.url || ""
}

watch(
  () => props.playConfig,
  async (val) => {
    if (val) {
      if (playList.value.length > 0) {
        getPlayUrl(playList.value[0].id)
      }
    }
  },
  { deep: true, immediate: true }
)
</script>

<style lang="less" scoped>
.video-tab {
  background: rgba(51, 179, 164, 0.1);

  .video-tab-item {
    font-size: 0.28rem;
    color: #fff;
    cursor: pointer;
    border: 1px solid transparent;
    padding: 0.2rem 0.16rem;

    &.active,
    &:hover {
      background: linear-gradient(270deg, rgba(51, 179, 164, 0) 0%, #33b3a4 99%);
      border: 1px solid;
      border-right: 0;
      border-image: linear-gradient(270deg, rgba(51, 179, 164, 0) 0%, #00ffe1 100%) 1;
    }
  }

  .video-tab-text {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }
}
</style>
