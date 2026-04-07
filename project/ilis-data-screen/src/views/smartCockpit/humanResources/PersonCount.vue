<template>
  <FrameBox :loading="loading">
    <template #title>
      <FrameTitle>人员概况</FrameTitle>
    </template>
    <div v-if="!loading" class="flex w-full h-full">
      <div class="flex-1 flex flex-col items-center justify-center">
        <div
          class="flex flex-col items-center justify-center w-585 h-585 bg-no-repeat bg-center bg-cover"
          :style="{ backgroundImage: `url(${personCountBg})` }"
        >
          <div
            class="flex flex-col items-center justify-center w-521 h-521 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,_rgba(43,142,243,0)_81%,_rgba(43,142,243,0.2)_100%)]"
          >
            <div class="flex items-center justify-center rounded-full bg-[#40E7D5] w-465 h-465">
              <div
                class="flex flex-col items-center justify-center w-425 h-425 bg-[#010d07] rounded-full"
              >
                <div class="font-bold text-[1rem]">{{ totalCount }}</div>
                <div class="text-32">总人数</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex-1 flex flex-col items-start justify-center gap-90">
        <div
          v-for="item in countData"
          :key="item.label"
          class="flex items-center justify-center gap-40"
        >
          <FrameIcon class="w-170 h-170" :icon="item.icon"></FrameIcon>
          <div class="flex items-center gap-20">
            <div class="text-36 text-[#B4DBD6] w-[3rem]">{{ item.label }}</div>
            <div class="text-[0.48rem] font-bold text-[#fff]">
              {{ ((item.value / totalCount) * 100).toFixed(1) }}%
            </div>
          </div>
        </div>
      </div>
    </div>
  </FrameBox>
</template>
<script setup lang="ts">
import FrameIcon from "@/components/smartCockpit/FrameIcon.vue"
import personCountBg from "@/assets/images/smartCockpit/personCountBg.svg"
import icon1 from "@/assets/images/smartCockpit/newlyPersonIcon.svg"
import icon2 from "@/assets/images/smartCockpit/yjsIcon.svg"
import icon3 from "@/assets/images/smartCockpit/certIcon.svg"
import { ref } from "vue"
import FrameBox from "@/components/smartCockpit/FrameBox.vue"
import FrameTitle from "@/components/smartCockpit/FrameTitle.vue"
import request from "@/utils/request.js"
import { useAutoRequestHooks } from "@/hooks/useAutoRequestHooks"

const loading = ref(false)

const totalCount = ref(0)

const countData = ref([
  {
    label: "副高级及以上",
    value: 0,
    icon: icon1
  },
  {
    label: "硕士及以上",
    value: 0,
    icon: icon2
  },
  {
    label: "持证人数",
    value: 0,
    icon: icon3
  }
])

useAutoRequestHooks({
  loading: loading,
  api: () =>
    request({
      url: "/api/dashboard/sgjc/hr/overview",
      method: "get"
    }),
  query: ref({}),
  setData: ({ data, code }) => {
    if (code === 20000) {
      totalCount.value = data?.find((item: any) => item.name === "人员总数")?.numMain || 0
      const dimission = data?.find((item: any) => item.name === "副高级及以上")?.numMain || 0
      const retirement = data?.find((item: any) => item.name === "硕士及以上")?.numMain || 0
      const newly = data?.find((item: any) => item.name === "持证人数")?.numMain || 0
      countData.value = [
        {
          label: "副高级及以上",
          value: dimission,
          icon: icon1
        },
        {
          label: "硕士及以上",
          value: retirement,
          icon: icon2
        },
        {
          label: "持证人数",
          value: newly,
          icon: icon3
        }
      ]
    }
  }
})
</script>
