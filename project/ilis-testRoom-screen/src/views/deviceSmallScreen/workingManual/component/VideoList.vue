<template>
  <div class="video-list">
    <CustomeVideo
      v-for="item in data"
      :key="item.id"
      :desc="item.name"
      :src="item.url"
    ></CustomeVideo>
  </div>
</template>

<script setup lang="ts">
import CustomeVideo from "../../component/CustomeVideo.vue"
import { ManualEntity } from "../ManualEntity"

defineProps<{ data: ManualEntity[] }>()
</script>

<style lang="less" scoped>
.video-list {
  margin-top: 40px;
  display: flex;
  flex-wrap: wrap;
  margin-left: -40px;
  > div {
    margin-left: 40px;
    margin-bottom: 40px;
  }
}
</style>
