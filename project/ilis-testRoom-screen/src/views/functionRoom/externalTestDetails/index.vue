<template>
  <div class="content-wrap flex-column">
    <RoomCard title="" class="flex-column flex-h-1">
      <RoomSearch
        v-model="search.quickQry"
        placeholder="请输入设备名称、设备编号查询"
        @search="searchTask"
      />

      <div class="data-list-scroll flex-1">
        <ul class="task-list">
          <li
            v-for="(d, i) in taskDatas"
            :key="d.id"
            :class="`task-item ${checkInd === i ? 'active' : ''}`"
            @click="selectedTask(i)"
          >
            <p class="sample-name font-ys">
              <span class="label">{{ d.testSampleDisplayName }}</span>
              <span style="letter-spacing: 0">{{ d.periodCode || d.testObjectCode }}</span>
            </p>

            <van-row class="sample-info">
              <van-col span="12">
                <span class="label">设备编号：</span>
                {{ d.equipmentSn }}
              </van-col>
              <van-col span="12">
                <span class="label">量程：</span>
                {{ d.eqRange || "--" }}
              </van-col>
              <van-col span="12">
                <span class="label">出厂编号：</span>
                {{ d.factorySn || "--" }}
              </van-col>
              <van-col span="12">
                <span class="label">所属部门：</span>
                {{ d.departName || "--" }}
              </van-col>
              <van-col span="12">
                <span class="label">管理人员：</span>
                {{ d.managerUser }}
              </van-col>
              <van-col span="12">
                <span class="label">规格型号：</span>
                {{ d.standard || "--" }}
              </van-col>
              <van-col span="12">
                <span class="label">精度：</span>
                {{ d.accuracy || "--" }}
              </van-col>
              <van-col span="12">
                <span class="label">设备状态：</span>
                {{ d.status || "--" }}
              </van-col>
              <van-col span="12">
                <span class="label">下次检校日期：</span>
                {{ d.nextCheckDate ? formatDate(d.nextCheckDate, 1) : "--" }}
              </van-col>
            </van-row>
          </li>
          <li v-if="taskDatas.length === 0" class="no-data">暂无数据</li>
          <li v-else-if="taskDatas.length === total" style="text-align: center; line-height: 1rem">
            到底啦~
          </li>
        </ul>
      </div>
    </RoomCard>
    <div class="foot-btns">
      <div class="btn back font-ys" @click="back">返回</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, inject } from "vue"
import { message } from "ant-design-vue"
import { useRouter, useRoute } from "vue-router"
import { RoomCard, RoomSearch } from "../components"
import { getExternalInspectionList } from "@/api/externalTestRoom.api"
import { formatDate } from "@/utils/utils"

const router = useRouter()
const route = useRoute()
onMounted(() => {
  getTestTaskData()
})

const loading = ref(inject("loading") as boolean)

// 搜索任务
const searchTask = () => {
  taskDatas.value = []
  search.value.page = 1
  search.value.quickQry = search.value.quickQry.trim()
  checkInd.value = -1
  getTestTaskData()
}

// 获取任务列表
const checkInd = ref(-1)
const search: any = ref({
  quickQry: "",
  page: 1,
  size: 99999,
  queryType: route.query.type,
  labId: route.query.labId
})

const total = ref(0)
const taskDatas = ref<any>([])
const getTestTaskData = async () => {
  loading.value = true
  let res = await getExternalInspectionList(search.value)
  loading.value = false
  if (res.code === 20000) {
    const list = res.data.rows || []
    taskDatas.value.push(...list)
    total.value = res.data.count
  } else {
    message.error(res.message || "系统异常，请稍后重试")
  }
}

// 选择任务
const selectedTask = (ind) => {
  checkInd.value = ind
}

// 返回
const back = () => {
  router.go(-1)
}
</script>
