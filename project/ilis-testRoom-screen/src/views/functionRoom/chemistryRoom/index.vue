<template>
  <RoomTabs :static-tabs="staticTabs" />
</template>

<script setup lang="ts">
import { RoomTabs } from "../components"
import BaseInfo from "./components/BaseInfo.vue"
import List from "./components/List.vue"

const staticTabs = [
  { title: "基本信息", key: "BaseInfo", component: BaseInfo },
  { title: "化学药品", key: "List", component: List }
]
</script>
