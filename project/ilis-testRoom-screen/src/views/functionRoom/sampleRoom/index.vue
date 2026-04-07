<template>
  <RoomTabs :static-tabs="staticTabs" />
</template>

<script setup lang="ts">
import { RoomTabs, RoomIntro } from "../components"
import BaseInfo from "./components/BaseInfo.vue"
const staticTabs = [
  { title: "基本信息", key: "BaseInfo", component: BaseInfo },
  { title: "功能室简介", key: "RoomIntro", component: RoomIntro }
]
</script>
