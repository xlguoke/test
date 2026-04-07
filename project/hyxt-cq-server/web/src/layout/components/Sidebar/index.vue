<template>
  <a-menu v-model:openKeys="openKeys" v-model:selectedKeys="selectedKeys" mode="inline">
    <Menu :tree-data="menuTree"></Menu>
  </a-menu>
</template>
<script setup lang="ts">
import { ref, watch } from "vue"
import { useRoute } from "vue-router"
import Menu from "./Menu.vue"
import menuStore from "@/stores/menuTree"
import { storeToRefs } from "pinia"
const { menuTree } = storeToRefs(menuStore())
const route = useRoute()

const openKeys = ref<string[]>([route.meta.pid as string])
const selectedKeys = ref<string[]>([route.path])
watch(route, () => {
  openKeys.value = [route.meta.pid as string]
  selectedKeys.value = [route.path]
})
</script>

<style lang="less"></style>
