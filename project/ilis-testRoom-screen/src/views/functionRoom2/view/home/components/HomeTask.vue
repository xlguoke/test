<template>
  <Container title="任务" link="/functionRoom2/taskList" link-text="查看更多">
    <van-skeleton :row="9" :loading="loading">
      <div v-if="list.length" class="list">
        <div v-for="item in list" :key="item.taskId" class="item">
          <TaskCard :lab-id="labId" :data="item" is-show-un-finish @change="getList"></TaskCard>
        </div>
      </div>
      <van-empty v-else description="暂无数据" :image="emptyImage" />
    </van-skeleton>
  </Container>
</template>
<script lang="ts" setup>
import { ref } from "vue"
import Container from "../../../components/Container.vue"
import TaskCard from "../../taskDetail/components/TaskCard.vue"
import { getLabTaskPage } from "@/api/functionRoom2.api"
import { LaboratoryTaskStatus } from "../../taskDetail"
import { ITask } from "@/interface/ITask"
import emptyImage from "@/assets/images/functionRoom2/empty.svg"

const porps = defineProps<{
  labId: string
}>()

const list = ref<ITask[]>([])

const loading = ref(false)

async function getList() {
  loading.value = true
  const { code, data } = await getLabTaskPage({
    page: 1,
    size: 3,
    labId: porps.labId,
    taskStatus: LaboratoryTaskStatus.TESTING
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
