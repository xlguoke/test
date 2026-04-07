<template>
  <div class="content-wrap flex-column">
    <RoomCard :title="data.title" class="flex-h-1">
      <div class="content">
        <img :src="file?.url" class="file" alt="" />
      </div>
    </RoomCard>
  </div>
</template>

<script setup lang="ts">
import { onMounted, toRefs, ref } from "vue"
import { getCustomLabScreenCInfo } from "@/api/testRoom.api"
import RoomCard from "./RoomCard.vue"
interface TabDTO {
  title: string
  key: string
  mainEntityId?: string
}
interface FileDTO {
  id: string
  folderId: string
  mainEntityId: string
  name: string
  attachmentId: string
  url: string
  createDate: number
}
const props = defineProps<{ data: TabDTO }>()
const { data } = toRefs(props)
const imgTypes = ["png", "jpg", "jpeg"]
const file = ref<FileDTO>()
onMounted(() => {
  getData()
})

function getData() {
  const key = data.value.key || ""
  getCustomLabScreenCInfo({ customScreenId: key }).then((res) => {
    if (res.code === 20000) {
      const files = res.data || []
      const imgs = files.filter((d) => imgTypes.includes(fileType(d.name)))
      if (imgs.length > 0) {
        const sortImgs = imgs.sort((a, b) => b.createDate - a.createDate)
        file.value = sortImgs[0]
      }
    }
  })
}

function fileType(name) {
  return name.split(".").pop().toLowerCase()
}

defineExpose({
  refreshData: getData
})
</script>

<style scoped lang="less">
.content {
  padding: 0.3rem;
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
