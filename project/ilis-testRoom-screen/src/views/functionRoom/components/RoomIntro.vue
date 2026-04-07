<!-- 功能室简介 -->
<template>
  <div class="content-wrap flex-column">
    <RoomCard title="功能室信息" class="flex-h-1">
      <ul v-if="labInfo.overview" class="content font-ys">
        <li v-for="(d, i) in overviews" :key="i">{{ d }}</li>
      </ul>
    </RoomCard>
    <RoomCard title="责任人信息" class="flex-h-1">
      <ul v-if="labInfo.otherLiabilityPersons" class="content person">
        <li v-for="(d, i) in persons" :key="i">{{ d }}</li>
      </ul>
    </RoomCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { storeToRefs } from "pinia"
import { functionRoomStore } from "@/store/functionRoom"
import RoomCard from "./RoomCard.vue"

const { labInfo } = storeToRefs(functionRoomStore())

const overviews = computed(() => {
  const val = labInfo.value.overview
  return val ? val.split("\n") : []
})

const persons = computed(() => {
  const val = labInfo.value.otherLiabilityPersons || ""
  return val ? val.split("\n") : []
})
</script>

<style scoped lang="less">
.content {
  padding: 0.3rem;
  height: calc(100% - 0.7rem);
  box-sizing: border-box;
  overflow-y: auto;
  line-height: 0.44rem;
  li {
    min-height: 0.32rem;
  }
  &.font-ys {
    font-size: 0.36rem;
    letter-spacing: 0.12em;
  }
  &.person {
    font-weight: 600;
    font-size: 0.28rem;
    color: #84a7d4;
  }
}
</style>
