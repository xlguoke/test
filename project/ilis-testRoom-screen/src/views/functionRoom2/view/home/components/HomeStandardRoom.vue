<template>
  <!-- 标养室 -->
  <Container
    :title="hiddenTitle ? '' : '样品库存信息'"
    sub-title
    link-text="查看详情"
    link="/functionRoom2/standardRoomDetail"
  >
    <CommonStatistics :datas="statisticsData" />
  </Container>
</template>
<script lang="ts" setup>
import { standardRoomStatisticsApi } from "@/api/functionRoom2.api"
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
  { title: "标养中总数", count: 0, key: "allCount" },
  { title: "今日到期数", count: 0, key: "todayCount" },
  { title: "当日出库数(组)", count: 0, key: "outCount" },
  { title: "当日入库数(组)", count: 0, key: "inCount" }
])

async function getData() {
  const res = await standardRoomStatisticsApi(labData.value.info.id)
  if (res.code === 20000) {
    statisticsData.value.forEach((d) => {
      d.count = res.data[d.key] || 0
    })
  }
}

getData()
</script>
