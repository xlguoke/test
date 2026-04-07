<template>
  <div class="wapper relative w-full h-full">
    <div class="tips absolute z-20 top-0 left-0 right-0 flex flex-wrap items-center gap-x-10  bg-black/70 text-white px-4">
      <div class=" whitespace-nowrap">
        <span>时间：</span>
        <span>{{ data.startDate }} ~ {{ data.endDate }}</span>
      </div>
    </div>

    <!-- 海康威视H5播放 -->
    <HikvisionPlayer
      v-if="isHikvisionVideo"
      :is-back-play="true"
      :play-url="hikvisionPlayUrl"
      :msg="hikvisionPlayMsg"
      :back-play-start-time="data.startDate"
      :back-play-end-time="data.endDate"
    />
    <!-- WVP播放 -->
    <WvpLiveVideo v-else :data="data" is-play />
  </div>
</template>

<script lang="ts" setup>
import type { SampleVideoEntity } from './api.ts'
import HikvisionPlayer from '~/components/HikvisionPlayer.vue'
import { getTestHiKvisionPlayback } from '~/components/qchjVideo/api.ts'
import WvpLiveVideo from '~/components/WvpLiveVideo.vue'

const props = defineProps<{
  data: SampleVideoEntity
}>()

const isHikvisionVideo = computed(() => props.data.equType === 'HKICLabColumn')

const hikvisionPlayUrl = ref('')

const hikvisionPlayMsg = ref('')

watch(props.data, async (data) => {
  if (data) {
    if (isHikvisionVideo.value) {
      const res = await getTestHiKvisionPlayback({
        id: data.id,
        startTime: data.startDate,
        endTime: data.endDate,
      })

      hikvisionPlayMsg.value = ''

      if (res.data.code !== '10001') {
        hikvisionPlayUrl.value = res.data.data.url
      }
      else {
        hikvisionPlayMsg.value = res.data.msg
      }
    }
  }
}, {
  immediate: true,
  deep: true,
})
</script>
