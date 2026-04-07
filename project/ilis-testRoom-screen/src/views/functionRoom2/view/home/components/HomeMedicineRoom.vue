<template>
  <!-- 药品室 -->
  <Container
    :title="`${hiddenTitle ? '' : '药品信息'}`"
    sub-title
    link-text="查看详情"
    link="/functionRoom2/medicineRoomDetail"
  >
    <CommonStatistics :datas="statisticsData" />
  </Container>
</template>
<script lang="ts" setup>
import Container from "../../../components/Container.vue"
import CommonStatistics from "@/views/functionRoom2/components/CommonStatistics.vue"
import { ref } from "vue"
import { chemicalRoomStatisticsApi } from "@/api/functionRoom2.api"

defineProps<{
  hiddenTitle?: boolean
}>()

const statisticsData = ref([{ title: "药品总数", count: 0, key: "all" }])

async function getData() {
  const res = await chemicalRoomStatisticsApi()
  if (res.code === 20000) {
    statisticsData.value.forEach((d) => {
      d.count = res.data[d.key] || 0
    })
  }
}

getData()
</script>
