<template>
  <!-- 留样室 -->
  <Container
    :title="`${hiddenTitle ? '' : '留样信息'}`"
    sub-title
    link-text="查看详情"
    link="/functionRoom2/sampleStorageRoomDetail"
  >
    <CommonStatistics :datas="statisticsData" />
  </Container>
</template>
<script lang="ts" setup>
import { sampleStorageRoomStatisticsApi } from "@/api/functionRoom2.api"
import Container from "../../../components/Container.vue"
import CommonStatistics from "@/views/functionRoom2/components/CommonStatistics.vue"
import { ref } from "vue"
import { storeToRefs } from "pinia"
import { functionRoom2Store } from "@/store/functionRoom2"

defineProps<{
  hiddenTitle?: boolean
}>()

const { labData } = storeToRefs(functionRoom2Store())

const statisticsData = ref([
  { title: "留样总数", count: 0, key: "total" },
  { title: "7日即将到期数", count: 0, key: "sevenDayExpire" },
  { title: "已到期数", count: 0, key: "expired" }
])

async function getData() {
  const res = await sampleStorageRoomStatisticsApi(labData.value.info.id)
  if (res.code === 20000) {
    statisticsData.value.forEach((d) => {
      d.count = res.data[d.key] || 0
    })
  }
}

getData()
</script>
