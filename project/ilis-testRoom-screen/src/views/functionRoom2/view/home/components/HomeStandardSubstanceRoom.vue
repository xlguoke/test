<template>
  <!-- 标准物质间 -->
  <Container
    :title="`${hiddenTitle ? '' : '标准物质信息'}`"
    sub-title
    link-text="查看详情"
    link="/functionRoom2/standardSubstanceRoomDetail"
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
import { standardSubstanceRoomStatisticsApi } from "@/api/functionRoom2.api"

defineProps<{
  hiddenTitle?: boolean
}>()

const { labData } = storeToRefs(functionRoom2Store())

const statisticsData = ref([
  { title: "物质类型总数", count: 0, key: "allCount" },
  { title: "近三月出库", count: 0, key: "outCount" },
  { title: "近三月入库", count: 0, key: "inCount" }
])

async function getData() {
  const res = await standardSubstanceRoomStatisticsApi(labData.value.info.id)
  if (res.code === 20000) {
    statisticsData.value.forEach((d) => {
      d.count = res.data[d.key] || 0
    })
  }
}

getData()
</script>
