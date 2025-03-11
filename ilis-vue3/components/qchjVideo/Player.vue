<template>
  <div class="wapper relative w-full h-full">
    <div class="tips absolute z-20 top-0 left-0 right-0 flex flex-wrap items-center gap-x-10  bg-black/70 text-white px-4">
      <div class=" whitespace-nowrap">
        <span>功能室名称：</span>
        <span>{{ data.labName }}</span>
      </div>
      <div class=" whitespace-nowrap">
        <span>试验时间：</span>
        <span>{{ data.startDate }} ~ {{ data.endDate }}</span>
      </div>
      <div class=" whitespace-nowrap">
        <span>温度（℃）：</span>
        <span>{{ data.temperatureValue || '--' }}</span>
      </div>
      <div class=" whitespace-nowrap">
        <span>湿度（%RH）：</span>
        <span>{{ data.humidityValue || '--' }}</span>
      </div>
    </div>
    <WvpLiveVideo :data="data" is-play />
  </div>
</template>

<script lang="ts" setup>
import WvpLiveVideo from '../WvpLiveVideo.vue'
import type { IVideoEntity } from '.'

defineProps<{
  data: IVideoEntity
}>()
</script>
