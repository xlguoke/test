<template>
  <FrameBox :loading="loading">
    <template #title>
      <FrameTitle>环境设备实时在线情况</FrameTitle>
    </template>
    <div class="h-full flex-1 flex items-center justify-center gap-90">
      <div
        v-for="item in countData"
        :key="item.label"
        class="flex-1 flex flex-col items-center justify-center"
      >
        <div
          class="flex flex-col items-center justify-center w-515 h-515 bg-no-repeat bg-center bg-cover"
          :style="{ backgroundImage: `url(${personCountBg})` }"
        >
          <div
            class="flex flex-col items-center justify-center w-458 h-458 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,_rgba(43,142,243,0)_81%,_rgba(43,142,243,0.2)_100%)]"
          >
            <div
              class="flex items-center justify-center rounded-full w-409 h-409"
              :class="{
                'bg-[#40E7D5]': item.label === '在线数量',
                'bg-[#FFD15C]': item.label === '离线数量'
              }"
            >
              <div
                class="flex flex-col items-center justify-center w-369 h-369 bg-[#010d07] rounded-full"
              >
                <div class="font-bold text-[1rem]">{{ item.value }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="text-32 mt-85">{{ item.label }}</div>
      </div>
    </div>
  </FrameBox>
</template>

<script setup lang="ts">
import { ref } from "vue"
import FrameBox from "@/components/smartCockpit/FrameBox.vue"
import FrameTitle from "@/components/smartCockpit/FrameTitle.vue"
import { useAutoRequestHooks } from "@/hooks/useAutoRequestHooks"
import request from "@/utils/request.js"
import personCountBg from "@/assets/images/smartCockpit/personCountBg.svg"

const countData = ref([
  {
    label: "在线数量",
    value: 0
  },
  {
    label: "离线数量",
    value: 0
  }
])

const loading = ref(false)

useAutoRequestHooks({
  loading: loading,
  api: () =>
    request({
      url: "/api/humiture/dashbord/online/statistics",
      method: "get"
    }),
  query: ref({}),
  setData: ({ data, code }) => {
    if (code === 20000) {
      countData.value[0].value = data?.[0]?.["在线数量"]
      countData.value[1].value = data?.[1]?.["离线数量"]
    }
  }
})
</script>
