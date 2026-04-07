<template>
  <iframe
    v-if="url?.endsWith('.pdf')"
    width="100%"
    height="100%"
    :src="url?.endsWith('.pdf') ? `/ilis2/plug-in/pdfjs/web/viewer.html?file=${url}` : url"
    frameborder="0"
  />
  <div v-else class="tips">
    传入的文件不是pdf文件，无法预览！
  </div>
</template>

<script setup lang="ts">
defineProps<{
  url: string
}>()
</script>

<style lang="less" scoped>
.tips {
  color: rgb(54, 141, 255);
  font-size: 0.24rem;
}
</style>
