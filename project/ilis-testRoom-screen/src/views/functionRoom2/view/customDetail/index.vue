<template>
  <div class="content">
    <div v-if="fileList?.length" class="h-full">
      <div v-if="viewType === 'img'" class="gap-3">
        <img
          v-for="(file, index) in fileList"
          :key="file.id"
          :src="file?.url"
          class="file"
          alt=""
          @click="handlePreviewImages(index)"
        />
      </div>
      <PreView v-else-if="viewType === 'pdf'" :data="fileList[0]"></PreView>
      <FIleList v-else :data="(fileList as any)"></FIleList>
    </div>
    <van-empty v-else description="暂无数据" :image="emptyImage" />
  </div>
</template>

<script setup lang="ts">
import { getScreenCustomInfo } from "@/api/functionRoom2.api"
import { onMounted, ref } from "vue"
import { useRoute } from "vue-router"
import emptyImage from "@/assets/images/functionRoom2/empty.svg"
import { message } from "ant-design-vue"
import PreView from "../deviceDetail/components/PreView.vue"
import FIleList from "../deviceDetail/components/FIleList.vue"
import { showImagePreview } from "vant"

interface FileDTO {
  id: string
  folderId: string
  mainEntityId: string
  name: string
  attachmentId: string
  url: string
  createDate: number
}

const route = useRoute()
const imgTypes = ["png", "jpg", "jpeg"]

const fileList = ref<FileDTO[]>([])

const viewType = ref<"img" | "fileList" | "pdf">("img")

function fileType(name) {
  return name.split(".").pop().toLowerCase()
}

async function getData() {
  const id = route.query.id as string
  const res = await getScreenCustomInfo({ customScreenId: id })
  if (res.code === 20000) {
    fileList.value = res.data || []
    if (fileList.value.every((d) => imgTypes.includes(fileType(d.name)))) {
      viewType.value = "img"
    } else if (fileList.value.length === 1 && fileType(fileList.value[0].name) === "pdf") {
      viewType.value = "pdf"
    } else {
      viewType.value = "fileList"
    }
  } else {
    message.error(res.message || "系统异常，请稍后重试或联系系统管理员")
  }
}

function handlePreviewImages(index: number) {
  showImagePreview({
    images: fileList.value.map((d) => d.url),
    startPosition: index,
    vertical: true
  })
}

onMounted(() => {
  getData()
})
</script>

<style lang="less" scoped>
.content {
  height: 98%;
  box-sizing: border-box;
  overflow-y: auto;
  .file {
    display: block;
    margin-bottom: 0.2rem;
    width: 100%;
    height: auto;
  }
}
</style>
