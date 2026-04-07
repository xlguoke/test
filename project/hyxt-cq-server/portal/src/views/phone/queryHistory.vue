<template>
  <div style="padding: 30px 15px">
    <QueryHistory :key="reportId" :report-id="reportId" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue"
import { useRoute } from "vue-router"
import QueryHistory from "@/components/changeHistory/QueryHistory.vue"

const route = useRoute()
const { reportId } = route.query as any

onMounted(() => {
  document.title = "查询记录"
})
</script>

<style></style>
