<template>
  <div
    class="absolute inset-0  flex flex-col items-center justify-center text-[#D4D8DE] text-2xl font-bold z-10 transition-opacity duration-200  border-2 border-[#BDC5D1] border-dashed"
  >
    <PlusOutlined style="font-size: 100px;" />
    <div>
      您可以拖动上方文件或链接到此区域预览
    </div>
  </div>
</template>

<script lang="ts" setup>
import { PlusOutlined } from '@ant-design/icons-vue'
</script>
