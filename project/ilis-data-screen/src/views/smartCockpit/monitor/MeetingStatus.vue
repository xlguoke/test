<template>
  <FrameBox :loading="loading">
    <template #title>
      <FrameTitle
        v-model:checked="meetingFilterOptionsVal"
        :options="meetingFilterOptions"
        @on-select="init"
      >
        > 会议状态
      </FrameTitle>
    </template>
    <div class="flex justify-around items-center h-full text-center">
      <div v-for="item in todayMeetionStatistics" :key="item.title">
        <div
          class="size-[3rem] p-[0.3rem] rounded-full leading-[1.8rem] text-[0.6rem]"
          style="
            background: radial-gradient(
              50% 50% at 50% 50%,
              rgba(43, 142, 243, 0) 81%,
              rgba(43, 142, 243, 0.2) 100%
            );
          "
        >
          <div
            class="size-full border-[0.3rem] border-solid rounded-full text-center"
            :style="`border-color: ${item.color}`"
          >
            {{ item.value }}
          </div>
        </div>
        <div class="mt-30 text-[0.4rem]">{{ item.title }}</div>
      </div>
    </div>
  </FrameBox>
</template>

<script setup lang="ts">
import { useAutoRequestHooks } from "@/hooks/useAutoRequestHooks"
import request from "@/utils/request.js"
import { ref } from "vue"

const loading = ref(false)
const meetingFilterOptionsVal = ref(4)
const meetingFilterOptions = ref([
  {
    label: "今日",
    value: 4
  },
  {
    label: "近一周",
    value: 3
  }
])
// 本日会议统计
const todayMeetionStatistics = ref([
  { title: "已预订", value: 0, color: "#28BC59", key: "total" },
  { title: "进行中", value: 0, color: "#FFD15C", key: "underway" },
  { title: "未开始", value: 0, color: "#2D9BFC", key: "wait" },
  { title: "已结束", value: 0, color: "#BAD1E1", key: "end" }
])

const baseApi =
  "https://fdl.scsgjc.com:11443/webroot/service/publish/13b1777b-7c8d-4cd3-8f31-ad7f769ffdfe"
const init = useAutoRequestHooks({
  loading,
  api: () =>
    request({
      url: `${baseApi}/meeting/status`,
      method: "post",
      headers: {
        Authorization: "AppCode d10e7546-c635-4d9c-a751-84d62a28f245"
      },
      data: {
        params: [
          {
            name: "type",
            value: meetingFilterOptionsVal.value
          }
        ]
      }
    }),
  setData: (res) => {
    if (!res.data) return
    const data = res.data[0] || {}
    todayMeetionStatistics.value.forEach((item) => {
      item.value = data[item.key] || 0
    })
  }
})
</script>

<style></style>
