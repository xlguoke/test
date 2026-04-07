<template>
  <ComCard :title="title" is-long>
    <div class="task-list-wrap">
      <!-- 四川路桥 -->
      <template v-if="unitCode === 'ztlq'">
        <ul class="task-list">
          <li class="tr thead">
            <p class="order">序号</p>
            <p>任务编号</p>
            <p>样品名称</p>
            <p style="flex: 1.5">检测参数</p>
            <p>委托日期</p>
          </li>
        </ul>
        <div id="taskScroll" class="task-scroll-box">
          <ul :class="`task-list scroll-box ${moveTask ? 'startMove' : ''}`">
            <li v-for="d in data" :key="d.id" class="tr">
              <p class="order">{{ d.index }}</p>
              <p :title="d?.taskCode">{{ d?.taskCode }}</p>
              <p :title="d?.sampleName">{{ d?.sampleName }}</p>
              <p :title="d?.paramName" style="flex: 1.5">{{ d?.paramName }}</p>
              <p>
                {{ d.startTime ? formatDate(d.startTime, 1) : "--" }}
              </p>
            </li>
          </ul>
        </div>
      </template>
      <!-- 其他单位 -->
      <template v-else>
        <ul class="task-list">
          <li class="tr thead">
            <p class="order">序号</p>
            <p>任务编号</p>
            <p>样品编号</p>
            <p>样品名称</p>
            <p style="flex: 1.5">检测参数</p>
            <p>检测人员</p>
            <p style="min-width: 1.5rem">开始时间</p>
          </li>
        </ul>
        <div id="taskScroll" class="task-scroll-box">
          <ul :class="`task-list scroll-box ${moveTask ? 'startMove' : ''}`">
            <li v-for="d in data" :key="d.id" class="tr">
              <p class="order">{{ d.index }}</p>
              <p :title="d?.taskCode">{{ d?.taskCode }}</p>
              <p :title="d?.sampleCode">{{ d?.sampleCode }}</p>
              <p :title="d?.sampleName">{{ d?.sampleName }}</p>
              <p :title="d?.paramName" style="flex: 1.5">{{ d?.paramName }}</p>
              <p :title="d?.tester">{{ d?.tester }}</p>
              <p style="min-width: 1.5rem">
                {{ d.startTime ? formatDate(d.startTime, 2) : "--" }}
              </p>
            </li>
          </ul>
        </div>
      </template>
    </div>
  </ComCard>
</template>
<script lang="ts" setup>
import { testingTask } from "@/api/dataScreen.api"
import ComCard from "@/components/ComCard.vue"
import { useUnitDataHooks } from "@/hooks/useUnitDataHooks"
import { autoPlayData } from "@/utils/screenUtils"
import { formatDate } from "@/utils/utils"
import { computed, ref } from "vue"

const { unitCode } = useUnitDataHooks()

const title = computed(() => {
  return unitCode.value === "ztlq" ? "室内在检任务统计" : "在检任务统计"
})

// 当日在检任务
const data = ref<any>([])

const moveTask = ref(false)

const taskTimer = ref()

const getData = () => {
  testingTask().then((res) => {
    if (res.code !== 20000) return
    let list = res.data || []
    for (let i = 0; i < list.length; i++) {
      list[i].index = i + 1
    }
    data.value = list
    autoPlayData({
      domId: "taskScroll",
      datas: data,
      isMove: moveTask,
      timer: taskTimer
    })
  })
}

getData()

defineExpose({
  getData
})
</script>
<style lang="less" scoped>
@taskItemH: 0.49rem;
.task-scroll-box {
  height: calc(100% - @taskItemH);
  overflow: hidden;
}
.task-list-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.task-list {
  font-size: 0.14rem;
  &.startMove {
    transition: 0.5s ease-out;
    transform: translateY(-@taskItemH);
  }
  .thead {
    color: #1890ff;
  }
  .tr {
    line-height: @taskItemH;
    display: flex;
    p {
      margin: 0 0.05rem;
      flex: 1;
      width: 0;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    p.order {
      flex: inherit;
      width: 0.6rem;
      text-align: center;
    }
    p.status {
      flex: inherit;
      width: 0.6rem;
      color: #1890ff;
    }
    p.orange {
      color: #ffac20;
    }
  }
}
</style>
