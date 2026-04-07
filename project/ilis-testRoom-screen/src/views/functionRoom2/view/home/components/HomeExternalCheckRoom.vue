<template>
  <!-- 外检室 -->
  <Container
    :title="`${hiddenTitle ? '' : '设备信息'}`"
    sub-title
    link-text="查看详情"
    link="/functionRoom2/externalCheckRoomDetail"
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
import { externalCheckRoomStatisticsApi } from "@/api/functionRoom2.api"

defineProps<{
  hiddenTitle?: boolean
}>()

const { labData } = storeToRefs(functionRoom2Store())

const statisticsData = ref([
  { title: "设备总数", count: 0, key: "eqCount" },
  { title: "留存数", count: 0, key: "count" },
  { title: "外出数", count: 0, key: "egressCount" },
  { title: "超期数", count: 0, key: "egressOverCount" }
])

async function getData() {
  const res = await externalCheckRoomStatisticsApi(labData.value.info.id)
  if (res.code === 20000) {
    statisticsData.value.forEach((d) => {
      d.count = res.data[d.key] || 0
    })
  }
}

getData()
</script>
