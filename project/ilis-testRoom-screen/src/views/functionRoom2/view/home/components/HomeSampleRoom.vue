<template>
  <!-- 样品室 -->
  <Container
    :title="`${hiddenTitle ? '' : '样品信息'}`"
    sub-title
    link-text="查看详情"
    link="/functionRoom2/sampleRoomDetail"
  >
    <CommonStatistics :datas="statisticsData" />
  </Container>
</template>
<script lang="ts" setup>
import Container from "../../../components/Container.vue"
import CommonStatistics from "@/views/functionRoom2/components/CommonStatistics.vue"
import { ref } from "vue"
import { storeToRefs } from "pinia"
import { functionRoom2Store } from "@/store/functionRoom2"
import { sampleRoomStatisticsApi } from "@/api/functionRoom2.api"

defineProps<{
  hiddenTitle?: boolean
}>()

const { labData } = storeToRefs(functionRoom2Store())

const statisticsData = ref([
  { title: "库存总数", count: 0, key: "total" },
  { title: "今日出库数（组）", count: 0, key: "todayOut" },
  { title: "今日入库数（组）", count: 0, key: "todayIn" }
])

async function getData() {
  const res = await sampleRoomStatisticsApi(labData.value.info.id)
  if (res.code === 20000) {
    statisticsData.value.forEach((d) => {
      d.count = res.data[d.key] || 0
    })
  }
}

getData()
</script>
