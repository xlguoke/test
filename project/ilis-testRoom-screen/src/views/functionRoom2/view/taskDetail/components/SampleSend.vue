<template>
  <div>
    <CommonTitle>
      <template #icon>
        <img
          style="width: 100%; height: 100%"
          src="@/assets/images/functionRoom2/taskIcon.png"
          alt=""
        />
      </template>
      智能送样管理
    </CommonTitle>

    <Container>
      <van-skeleton :row="9" :loading="loading">
        <div v-if="list.length" class="list">
          <div v-for="item in showMore ? list : list.slice(0, 3)" :key="item.taskId" class="item">
            <SampleSendCard
              :lab-id="labId"
              :data="item"
              is-simple
              @change="getList"
            ></SampleSendCard>
          </div>
        </div>
        <van-empty v-else description="暂无数据" :image="emptyImage" />
      </van-skeleton>
      <div v-if="list?.length > 3" class="showMore" @click="showMore = !showMore">
        {{ showMore ? "收起" : "查看更多" }}
        <van-icon name="arrow-down" />
      </div>
    </Container>
  </div>
</template>
<script lang="ts" setup>
import { ref } from "vue"
import Container from "../../../components/Container.vue"
import { getSampleSendTaskByTestTask } from "@/api/functionRoom2.api"
import { ITask } from "@/interface/ITask"
import emptyImage from "@/assets/images/functionRoom2/empty.svg"
import SampleSendCard from "../../sampleSend/SampleSendCard.vue"
import CommonTitle from "@/views/functionRoom2/components/CommonTitle.vue"
import { useSampleSentStatus } from "@/utils/useSampleSentStatus"

const props = defineProps<{
  labId: string
  taskId: string
}>()

const list = ref<ITask[]>([])

const loading = ref(false)

const showMore = ref(false)

async function getList() {
  loading.value = true
  const { code, data } = await getSampleSendTaskByTestTask({
    labId: props.labId,
    taskId: props.taskId
  }).finally(() => {
    loading.value = false
  })
  if (code === 20000) {
    list.value = data
    useSampleSentStatus(list)
  }
}

getList()
</script>
<style lang="less" scoped>
.item:not(:first-child) {
  border-top: 1px solid #ffffff;
  padding-top: 0.32rem;
  margin-top: 0.32rem;
}
.showMore {
  margin-top: 0.32rem;
  color: #0066ec;
  text-align: center;
}
</style>
