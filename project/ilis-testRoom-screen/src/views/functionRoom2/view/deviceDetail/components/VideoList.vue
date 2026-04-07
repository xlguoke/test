<template>
  <div v-if="data?.length" class="video-list">
    <div v-for="item in data" :key="item.id" class="contain">
      <CommonVideo :desc="item.name" :src="item.url"></CommonVideo>
    </div>
  </div>
  <van-empty v-else description="暂无数据" :image="emptyImage" />
</template>

<script setup lang="ts">
import { ManualEntity } from "@/views/deviceSmallScreen/workingManual/ManualEntity"
import CommonVideo from "@/views/functionRoom2/components/CommonVideo.vue"
import emptyImage from "@/assets/images/functionRoom2/empty.svg"

defineProps<{ data: ManualEntity[] }>()
</script>

<style lang="less" scoped>
.video-list {
  padding: 0.36rem 0;
  display: flex;
  flex-wrap: wrap;
  .contain {
    margin-bottom: 24px;
    width: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
