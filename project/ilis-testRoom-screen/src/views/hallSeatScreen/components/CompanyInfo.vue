<template>
  <div class="company-info">
    <iframe :src="href" width="100%" height="100%" frameborder="0"></iframe>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"

const href = ref("")

const unitCode = localStorage.getItem("unitCode")
const rootUrl = window.location.origin
href.value = `${rootUrl}/-/inspect-report-hub/index.html?unitCode=${unitCode}&isThirdParty=1#/home`
;(window as any).backRouter = () => {
  const url = sessionStorage.getItem("webUrl") as string
  location.href = url
}
</script>

<style scoped lang="less">
.company-info {
  height: 100%;
  background-color: #fff;
  position: relative;
}
</style>
