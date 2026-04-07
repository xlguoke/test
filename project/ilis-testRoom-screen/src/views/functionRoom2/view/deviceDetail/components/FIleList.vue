<template>
  <div v-if="data?.length" class="file-list">
    <div v-for="item in data" :key="item.id" class="file-item" @click="handleOpen(item)">
      <img src="@/assets/images/functionRoom2/fileImg.svg" alt="" />
      <div class="file-name">{{ item.name }}</div>
    </div>
    <van-popup v-model:show="showCenter" round :style="{ width: '90%', height: '90%' }" closeable>
      <div class="title"></div>
      <div style="height: calc(100% - 0.6rem)">
        <PreView v-if="currentData && showCenter" class="content" :data="currentData"></PreView>
      </div>
    </van-popup>
  </div>
  <van-empty v-else description="暂无数据" :image="emptyImage" />
</template>

<script setup lang="ts">
import { ref } from "vue"
import PreView from "./PreView.vue"
import { showImagePreview } from "vant"
import { ManualEntity } from "@/views/deviceSmallScreen/workingManual/ManualEntity"
import emptyImage from "@/assets/images/functionRoom2/empty.svg"

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
  display: flex;
  flex-wrap: wrap;
  padding: 0.36rem 0;
  .file-item {
    margin-bottom: 24px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    width: 33.33%;
    display: flex;
    align-items: center;
    justify-content: center;
    img {
      width: 196px;
      height: 196px;
      margin-bottom: 0.16rem;
    }
    .file-name {
      max-width: 2rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: #224059;
      font-size: 0.24rem;
      text-align: center;
    }
  }
}
.title {
  height: 0.6rem;
  background-color: linear-gradient(180deg, #97a6b2 0%, #697f90 100%);
}
</style>
