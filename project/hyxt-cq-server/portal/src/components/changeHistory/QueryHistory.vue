<template>
  <a-spin :spinning="spinning">
    <div style="height: 100%">
      <a-timeline>
        <template v-for="d in datas" :key="d.id">
          <a-timeline-item>
            <p class="detail-title">{{ d.way }}</p>
            <p class="time">{{ d.queryTime }}</p>
          </a-timeline-item>
        </template>
      </a-timeline>
    </div>
  </a-spin>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue"
import { queryCountApi } from "@/api/home.api"
import dayjs from "dayjs"
const spinning = ref(false)
const props = defineProps({
  reportId: {
    type: String,
    default: ""
  }
})
onMounted(() => {
  getDataSource()
})

watch(
  () => props.reportId,
  () => {
    getDataSource()
  }
)

const datas = ref<
  {
    way: string
    queryTime: string
  }[]
>([])
const getDataSource = () => {
  spinning.value = true
  queryCountApi(props.reportId).then((res) => {
    spinning.value = false
    if (!res) return
    res.forEach((item) => {
      item.queryTime = dayjs(item.queryTime).format("YYYY-MM-DD HH:mm:ss")
    })
    datas.value = res.reverse()
  })
}
</script>

<style lang="less" scoped>
.ant-timeline-item-content {
  .detail-title,
  .time {
    margin: 0;
  }
}
</style>
