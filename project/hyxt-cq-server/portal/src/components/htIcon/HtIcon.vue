<template>
  <a-image
    :src="getAssetsFile(name)"
    :style="{width: `${size || 16}px`, height: `${size || 16}px`}"
    :preview="false"
  />
</template>    
<script setup lang="ts">
import { ref } from "vue";
import { getAssetsFile } from "@/assets/js/utils";

const props = defineProps(["name", "size"]);

</script>
<style lang="less" scoped>

</style>