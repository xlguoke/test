<template>
  <Container
    title="设备外出申请管理"
    link="/functionRoom2/eqOutApply"
    :query="{ labId }"
    link-text="查看更多"
  >
    <van-skeleton :row="9" :loading="loading">
      <div v-if="list.length" class="list">
        <div v-for="item in list" :key="item.id" class="item">
          <EqOutApplyCard :lab-id="labId" :data="item" @change="getList"></EqOutApplyCard>
        </div>
      </div>
      <van-empty v-else description="暂无数据" :image="emptyImage" />
    </van-skeleton>
  </Container>
</template>
<script lang="ts" setup>
import { ref } from "vue"
import Container from "../../../components/Container.vue"
import EqOutApplyCard from "../../eqOutApply/components/EqOutApplyCard.vue"
import { getEqOutApplyList, type EqOutApplyData } from "@/api/functionRoom2.api"
import emptyImage from "@/assets/images/functionRoom2/empty.svg"

const porps = defineProps<{
  labId: string
}>()

const list = ref<EqOutApplyData[]>([])

const loading = ref(false)

async function getList() {
  loading.value = true
  const { code, data } = await getEqOutApplyList({
    page: 1,
    size: 3,
    labId: porps.labId
  }).finally(() => {
    loading.value = false
  })
  if (code === 20000) {
    list.value = data.rows
  }
}

getList()
</script>
<style lang="less" scoped>
.item {
  border-top: 1px solid #ffffff;
  padding-top: 0.32rem;
  margin-top: 0.32rem;
}
</style>
