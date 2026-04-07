<template>
  <div class="task-detail">
    <!-- 展示内容 -->
    <TaskDetail :data="data" :lab-id="labId"></TaskDetail>
    <TaskBaseInfo :data="data" :lab-id="labId" class="block"></TaskBaseInfo>
    <SampleSend
      v-if="showSampleSend"
      :lab-id="labId"
      :task-id="data.taskId"
      class="block"
    ></SampleSend>
    <ParameterStandard :data="data"></ParameterStandard>
    <!-- <van-back-top /> -->
    <div class="btn_box">
      <img
        src="@/assets/images/functionRoom2/video_btn.svg"
        @click="
          router.push({
            path: '/functionRoom2/deviceDetail',
            query: {
              ids: list?.map((i) => i.id)?.join(','),
              target: '1',
              type: '0',
              back: 1
            }
          })
        "
      />
      <!-- 暂时隐藏查看委托 -->
      <!-- <img
        src="@/assets/images/functionRoom2/detail_btn.svg"
        @click="
          router.push({
            path: '/functionRoom2/consignDetail',
            query: {
              id: data.consignId
            }
          })
        "
      /> -->
    </div>
  </div>
</template>
<script lang="ts" setup>
import TaskDetail from "./components/TaskDetail.vue"
import TaskBaseInfo from "./components/TaskBaseInfo.vue"
import ParameterStandard from "./components/ParameterStandard.vue"
import { useRouter } from "vue-router"
import { ITask } from "@/interface/ITask"
import { computed, inject, ref, toRefs } from "vue"
import { getLabEq } from "@/api/functionRoom2.api"
import { useStore } from "@/store"
import { parseAddressToObj } from "@/utils/utils"
import SampleSend from "./components/SampleSend.vue"

const { screenConfig } = toRefs(useStore())
const showSampleSend = inject("showSampleSend")

const labId = computed(() => {
  if (!screenConfig.value.url) return ""
  const query = parseAddressToObj(screenConfig.value.url)
  return query.labId || ""
})

const router = useRouter()

const data = JSON.parse(router.currentRoute.value.query?.data as any) as ITask

const list = ref<any>([])

async function getList() {
  const { code, data } = await getLabEq(labId.value)
  if (code === 20000) {
    list.value = data
  }
}

getList()
</script>
<style lang="less" scoped>
.task-detail {
  padding-bottom: 200px;
  .btn_box {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: flex-end;
    padding-bottom: 45px;
    img {
      width: 160px;
      height: 160px;
    }
    img + img {
      margin-left: 45px;
    }
  }
}
.block {
  margin-bottom: 40px;
}
</style>
