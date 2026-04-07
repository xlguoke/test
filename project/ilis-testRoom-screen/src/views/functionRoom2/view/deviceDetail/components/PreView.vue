<template>
  <iframe
    v-if="data.url?.endsWith('.pdf')"
    width="100%"
    height="100%"
    :src="data.url?.endsWith('.pdf') ? `./pdfjs/web/viewer.html?file=${data.url}` : data.url"
    frameborder="0"
  />
  <div v-else class="tips">传入的文件不是pdf文件，无法预览！</div>
</template>

<script setup lang="ts">
defineProps<{
  data: any
}>()

const isDev = process.env.NODE_ENV === "development"
</script>

<style lang="less" scoped>
.tips {
  color: rgb(54, 141, 255);
  font-size: 0.24rem;
}
</style>
