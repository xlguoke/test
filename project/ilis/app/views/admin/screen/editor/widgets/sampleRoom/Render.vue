<template>
  <div class="w-full">
    <img :src="block1" alt="">
  </div>
</template>

<script lang="ts" setup>
const block1 = new URL('~/views/admin/screen/editor/assets/image/block-sampleroom.png', import.meta.url).href
</script>
