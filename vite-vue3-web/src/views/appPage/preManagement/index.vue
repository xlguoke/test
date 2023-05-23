<template>
  <div class="page-wrap">
    {{ title }}
    <WEditor v-model:value="val" />
  </div>
</template>

<script setup lang="ts" name="PreManagement">
import { ref } from "vue"
import WEditor from "@/components/WEditor/index.vue"
const title = ref("来样预约管理")
const val = ref("来样预约管理")
</script>

<style scoped lang="less"></style>
