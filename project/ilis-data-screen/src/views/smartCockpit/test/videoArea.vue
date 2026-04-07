<template>
  <div class="test-video">
    <div class="test-video-nav">
      <template v-for="item in showLabList" :key="item.id">
        <a-popover
          v-if="item.labConfigList.length > 1"
          placement="bottom"
          overlay-class-name="test-video-popover"
        >
          <template #content>
            <ul class="test-video-popover-ul">
              <li
                v-for="item2 in item.labConfigList"
                :key="item2.id"
                @click="onSelectVideo(item, item2)"
              >
                <span class="font-2" :title="item2.equName">{{ item2.equName }}</span>
              </li>
            </ul>
          </template>
          <div
            :key="item.id"
            class="test-video-btn"
            :class="{
              active: selectedLab && selectedLab.id === item.id
            }"
            :title="item.name"
          >
            {{ item.name }}
          </div>
        </a-popover>
        <div
          v-else
          :key="item.id"
          class="test-video-btn"
          :class="{
            active: selectedLab && selectedLab.id === item.id
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
        <template v-for="item in labList" :key="item.id">
          <a-popover
            v-if="item.labConfigList.length > 1"
            placement="bottom"
            overlay-class-name="test-video-popover"
          >
            <template #content>
              <ul class="test-video-popover-ul">
                <li
                  v-for="item2 in item.labConfigList"
                  :key="item2.id"
                  @click="onSelectVideo(item, item2)"
                >
                  <span class="font-2" :title="item2.equName">{{ item2.equName }}</span>
                </li>
              </ul>
            </template>
            <div
              :key="item.id"
              class="test-video-btn"
              :class="{
                active: selectedLab && selectedLab.id === item.id
              }"
              :title="item.name"
            >
              {{ item.name }}
            </div>
          </a-popover>
          <div
            v-else
            :key="item.id"
            class="test-video-btn"
            :class="{
              active: selectedLab && selectedLab.id === item.id
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
      <HikvisionH5Player :play-url="playUrl" :msg="playErrorMsg" />
    </div>

    <div class="test-video-tl"></div>
    <div class="test-video-tr"></div>
    <div class="test-video-bl"></div>
    <div class="test-video-br"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import HikvisionH5Player from "@/components/HikvisionPlayer.vue"
import {
  getLabVideoConfigData,
  getLabVideoConfigList,
  LabVideoConfigDTO
} from "@/api/smartCockpit.test.api"

const labList = ref<LabVideoConfigDTO[]>([])

const selectedLab = ref<LabVideoConfigDTO>()

const playUrl = ref("")

const playErrorMsg = ref("")

const moreVisible = ref(false)

const showLabList = computed(() => {
  if (labList.value.length > 6) {
    return labList.value.slice(0, 5)
  }
  return labList.value
})

const showMoreBtn = computed(() => labList.value.length > 6)

async function onSelectVideo(item: LabVideoConfigDTO, labConfigItem?: any) {
  selectedLab.value = item
  moreVisible.value = false

  if (!labConfigItem) {
    playUrl.value = await getPlayUrl(item.labConfigList[0])
  } else {
    playUrl.value = await getPlayUrl(labConfigItem)
  }

  console.log(playUrl.value)
}

async function getPlayUrl(labConfigItem) {
  const res = await getLabVideoConfigData(labConfigItem.id).catch((err) => {
    playErrorMsg.value = err.message || "获取视频数据失败"
  })

  if (res) {
    return res.data.data.url
  }

  return ""
}

async function initLabList() {
  const res = await getLabVideoConfigList()
  const data = res.data.rows.filter((i: LabVideoConfigDTO) => i.labConfigList.length > 0)

  labList.value = data

  if (data.length) {
    onSelectVideo(data[0])
  }
}

initLabList()
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
