<template>
  <van-list
    v-model:loading="loading"
    :finished="finished"
    finished-text="没有更多了"
    @load="getList"
  >
    <Container v-for="item in dataSource" :key="item.id" class="item">
      <EqOutApplyCard :lab-id="labId" :data="item"></EqOutApplyCard>
    </Container>
  </van-list>
</template>

<script setup lang="ts">
import { ref } from "vue"
import EqOutApplyCard from "./components/EqOutApplyCard.vue"
import { getEqOutApplyList, type EqOutApplyData } from "@/api/functionRoom2.api"
import Container from "../../components/Container.vue"
import { message } from "ant-design-vue"
import { useRoute } from "vue-router"

const route = useRoute()
const loading = ref(false)
const finished = ref(false)
const dataSource = ref<EqOutApplyData[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const labId = ref(route.query.labId as string)

async function getList() {
  const query = {
    page: page.value,
    size: size.value,
    labId: labId.value
  }
  loading.value = true
  const { data, code, msg } = await getEqOutApplyList(query)
  if (code === 20000) {
    dataSource.value = [...dataSource.value, ...data.rows]
    total.value = data.total
    page.value += 1
    if (data.total <= dataSource.value.length) finished.value = true
  } else {
    finished.value = true
    message.error(msg || "获取数据失败")
  }
  loading.value = false
}
</script>

<style></style>
