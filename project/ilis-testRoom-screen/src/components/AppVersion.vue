<template>
  <div class="app-version">
    <span v-if="apkVersion" @click="checkUpdate">{{ apkVersion }} /&nbsp;</span>
    <span>{{ webVersion }}</span>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import { androidTools } from "@/utils/AndroidTools"
import packageJSON from "../../package.json"

const apkVersion = ref()

const webVersion = ref(packageJSON.version)

function checkUpdate() {
  androidTools.checkUpdate()
}

onMounted(() => {
  apkVersion.value = androidTools.getAppVersion()
})
</script>

<style lang="less" scoped>
.app-version {
  font-size: 12px;
  color: #49557c;
  position: fixed;
  bottom: 8px;
  left: 8px;
  z-index: 200;
}
</style>
