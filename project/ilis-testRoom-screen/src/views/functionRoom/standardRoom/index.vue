<template>
  <RoomTabs :static-tabs="staticTabs" />
</template>

<script setup lang="ts">
import { RoomTabs, EqList } from "../components"
import BaseInfo from "./components/BaseInfo.vue"

const staticTabs = [
  { title: "基本信息", key: "BaseInfo", component: BaseInfo },
  { title: "标准物质", key: "EqList", component: EqList }
]
</script>
