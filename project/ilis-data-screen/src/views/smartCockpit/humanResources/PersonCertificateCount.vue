<template>
  <FrameBox :loading="loading">
    <template #title>
      <FrameTitle>人员资质</FrameTitle>
    </template>
    <div v-if="!loading" class="h-full max-h-700 gap-60 overflow-y-auto py-60">
      <div v-for="(item, index) in personCount" :key="item.name" class="w-full">
        <div class="w-full flex items-center justify-start gap-77 mb-60">
          <div
            class="w-237 h-237 border-2 border-solid bg-[#40E7D5]/10 flex items-center justify-center"
            style="
              border-image-source: radial-gradient(
                65% 65%,
                transparent 0px,
                transparent 100%,
                #69f0b7 100%
              );
              border-image-slice: 1;
            "
          >
            <img :src="person1Icon" alt="person1" class="w-140 h-140" />
          </div>
          <div>
            <div class="text-[0.72rem] text-white font-bold mb-36">{{ item.numMain || 0 }}</div>
            <div class="text-[#B4DBD6] text-[0.36rem] font-bold">{{ item.name }}</div>
          </div>
        </div>
        <div
          v-if="index !== personCount.length - 1"
          class="w-full h-3 bg-[linear-gradient(270deg,_rgba(64,_231,_213,_0.2)_0%,_#40E7D5_100%)] mb-60"
        ></div>
      </div>
      <!-- <div class="w-full flex items-center justify-start gap-77">
        <div
          class="w-237 h-237 border-2 border-solid bg-[#FFD15C]/10 flex items-center justify-center"
          style="
            border-image-source: radial-gradient(
              65% 65%,
              transparent 0px,
              transparent 100%,
              #eaff74 100%
            );
            border-image-slice: 1;
          "
        >
          <img :src="person2Icon" alt="person2" class="w-140 h-140" />
        </div>
        <div>
          <div class="text-[0.72rem] text-white font-bold mb-36">12</div>
          <div class="text-[#E7DDC5] text-[0.36rem] font-bold">注册岩土工程师</div>
        </div>
      </div> -->
      <div
        v-if="!loading && personCount?.length === 0"
        class="flex flex-col h-full items-center text-[#B4DBD6]"
      >
        <img src="@/assets/images/smartCockpit/no-data.svg" class="w-280 h-280" />
        暂无数据
      </div>
    </div>
  </FrameBox>
</template>
<script setup lang="ts">
import person1Icon from "@/assets/images/smartCockpit/person1Icon.svg"
// import person2Icon from "@/assets/images/smartCockpit/person2Icon.svg"
import { useAutoRequestHooks } from "@/hooks/useAutoRequestHooks"
import { ref } from "vue"
import request from "@/utils/request.js"

const loading = ref(false)

const personCount = ref<Record<string, any>[]>([])

useAutoRequestHooks({
  loading: loading,
  api: () =>
    request({
      url: "/api/dashboard/sgjc/hr/qualification",
      method: "get"
    }),
  query: ref({}),
  setData: ({ data, code }) => {
    if (code === 20000) {
      personCount.value = data
    }
  }
})
</script>
