<template>
  <a-menu
    v-model:openKeys="openKeys"
    v-model:selectedKeys="selectedKeys"
    mode="inline"
    class="side-bar-menu"
  >
    <Menu :tree-data="menuTree"></Menu>
  </a-menu>
</template>
<script setup lang="ts">
import { ref, watch } from "vue"
import { useRoute } from "vue-router"
import Menu from "./Menu.vue"
import menuStore from "@/stores/menuTree"
import { storeToRefs } from "pinia"
const { menuTree, addRoutes } = storeToRefs(menuStore())
const route = useRoute()

const openKeys = ref<string[]>(addRoutes.value.map((d: any) => d.path))
const selectedKeys = ref<string[]>([route.path])
watch(route, () => {
  selectedKeys.value = [route.path]
})
</script>

<style lang="less"></style>
