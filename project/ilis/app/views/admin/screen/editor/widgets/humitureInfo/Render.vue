<template>
  <div class="w-full">
    <img class="w-full" :src="block1" alt="">
  </div>
</template>

<script lang="ts" setup>
const block1 = new URL('~/views/admin/screen/editor/assets/image/block-TH.png', import.meta.url).href
</script>
