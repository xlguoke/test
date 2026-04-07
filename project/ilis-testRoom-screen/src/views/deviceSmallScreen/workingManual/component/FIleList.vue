<template>
  <div class="file-list">
    <div v-for="item in data" :key="item.id" class="file-item" @click="handleOpen(item)">
      <img src="@/assets/images/deviceSmallScreen/pfdFileImg.svg" alt="" />
      <div class="file-name">{{ item.name }}</div>
    </div>
    <van-popup v-model:show="showCenter" round :style="{ width: '90%', height: '90%' }" closeable>
      <div class="title"></div>
      <PreView v-if="currentData && showCenter" class="content" :data="currentData"></PreView>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { h, ref } from "vue"
import { ManualEntity } from "../ManualEntity"
import PreView from "./PreView.vue"
import { helper } from "echarts"
import { showImagePreview } from "vant"

const props = defineProps<{ data: ManualEntity[] }>()

const showCenter = ref(false)

const currentData = ref<ManualEntity>()

function isImage(url: string) {
  return (
    url.endsWith(".png") || url.endsWith(".jpeg") || url.endsWith(".jpg") || url.endsWith(".svg")
  )
}

function handleOpen(item: ManualEntity) {
  if (item.url.endsWith(".pdf")) {
    showCenter.value = true
    currentData.value = item
  } else if (isImage(item.url)) {
    const images = props.data.filter((item) => isImage(item.url))?.map((item) => item.url)
    const startPosition = images.findIndex((img) => img === item.url)
    showImagePreview({
      images: images,
      startPosition,
      vertical: true
    })
  } else {
    window.open(item.url)
  }
}
</script>

<style lang="less" scoped>
.file-list {
  margin-top: 40px;
  display: flex;
  flex-wrap: wrap;
  margin-left: -90px;
  .file-item {
    margin-bottom: 60px;
    margin-left: 90px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    max-width: 200px;
    img {
      width: 200px;
      height: 200px;
      margin-bottom: 16px;
    }
    .file-name {
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: rgb(54, 141, 255);
      font-size: 24px;
    }
  }
}
.title {
  height: 60px;
  background-color: #43b2d4;
}
.content {
  height: calc(100% - 60px);
}
</style>
