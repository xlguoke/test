<template>
  <Container title="智能送样管理" link="/functionRoom2/sampleSendList" link-text="查看更多">
    <van-skeleton :row="9" :loading="loading">
      <div v-if="list.length" class="list">
        <div v-for="item in list" :key="item.taskId" class="item">
          <SampleSendCard
            :lab-id="labId"
            :data="item"
            is-show-un-finish
            @change="getList"
          ></SampleSendCard>
        </div>
      </div>
      <van-empty v-else description="暂无数据" :image="emptyImage" />
    </van-skeleton>
  </Container>
</template>
<script lang="ts" setup>
import { ref } from "vue"
import Container from "../../../components/Container.vue"
import { getSampleSendTaskPage } from "@/api/functionRoom2.api"
import { ITask } from "@/interface/ITask"
import emptyImage from "@/assets/images/functionRoom2/empty.svg"
import SampleSendCard from "../../sampleSend/SampleSendCard.vue"
import { useSampleSentStatus } from "@/utils/useSampleSentStatus"

const props = defineProps<{
  labId: string
}>()

const list = ref<ITask[]>([])

const loading = ref(false)

async function getList() {
  loading.value = true
  const data = await getSampleSendTaskPage({
    page: 1,
    size: 3,
    labId: props.labId
  }).finally(() => {
    loading.value = false
  })
  list.value = data.rows
  useSampleSentStatus(list)
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
