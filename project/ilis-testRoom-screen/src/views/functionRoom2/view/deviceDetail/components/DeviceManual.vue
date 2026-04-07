<template>
  <div class="device-manual">
    <div class="tab">
      <CommonButton :class="{ btn: true, active: active === 0 }" @click="active = 0">
        视频
      </CommonButton>
      <CommonButton :class="{ btn: true, active: active === 1 }" @click="active = 1">
        文件
      </CommonButton>
    </div>
    <van-skeleton :row="5" class="line" :loading="loading" style="padding-top: 0.24rem">
      <VideoList v-show="active === 0" :data="videoList"></VideoList>
      <FIleList v-show="active === 1" :data="fileList"></FIleList>
    </van-skeleton>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue"
import { getDeviceManual } from "@/api/deviceSmallScreen.api"
import { ManualEntity } from "@/views/deviceSmallScreen/workingManual/ManualEntity"
import VideoList from "./VideoList.vue"
import FIleList from "./FIleList.vue"
import CommonButton from "@/views/functionRoom2/components/CommonButton.vue"

const props = defineProps<{
  id: string
  type?: string
}>()

const active = ref(0)

if (props.type) {
  active.value = Number(props.type)
}

const videoList = ref([] as ManualEntity[])

const fileList = ref([] as ManualEntity[])

const loading = ref(false)

watch(
  () => props.id,
  () => {
    getManual()
  }
)

async function getManual() {
  if (!props.id) return
  loading.value = true
  const { data, code } = (await getDeviceManual(props.id).finally(() => {
    loading.value = false
  })) as { data: ManualEntity[]; code: number }
  if (code === 20000) {
    videoList.value = []
    fileList.value = []
    // 根据url字段以.mp4结尾 拆分为视频和文件
    data.forEach((item) => {
      if (item.url.endsWith(".mp4") || item.url.endsWith(".asf")) {
        videoList.value.push(item)
      } else {
        fileList.value.push(item)
      }
    })
  }
}

getManual()
</script>

<style lang="less" scoped>
.tab {
  display: flex;
  .btn {
    & + .btn {
      margin-left: 0.24rem;
    }
    &.active {
      color: #fff;
      background: #0f6fff;
    }
  }
}
</style>
