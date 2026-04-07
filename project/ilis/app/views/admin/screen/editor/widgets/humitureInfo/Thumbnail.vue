<template>
  <div>
    <div class=" font-bold">
      温湿度信息
    </div>
    <div class="w-full bg-[#f5f5f5]" draggable>
      <img :src="block1" alt="">
    </div>
  </div>
</template>

<script lang="ts" setup>
const block1 = new URL('~/views/admin/screen/editor/assets/image/block-TH.png', import.meta.url).href
</script>
