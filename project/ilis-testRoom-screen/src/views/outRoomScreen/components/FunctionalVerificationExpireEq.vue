<template>
  <ComCard title="期间核查到期、即将到期设备展示" is-long>
    <div class="task-list-wrap">
      <ul class="task-list">
        <li class="tr thead">
          <p>设备名称</p>
          <p>设备编号</p>
          <p>计划核查日期</p>
          <p>剩余天数</p>
          <p>状态</p>
        </li>
      </ul>
      <div id="functionalVerificationExpireEq" class="task-scroll-box">
        <ul :class="`task-list scroll-box ${moveTask ? 'startMove' : ''}`">
          <li v-for="d in data" :key="d.id" class="tr sp">
            <p :title="d?.name">{{ d?.name }}</p>
            <p :title="d?.equipmentSn">{{ d?.equipmentSn }}</p>
            <p :title="formatDate(d?.planDate)">{{ formatDate(d?.planDate) }}</p>
            <p :title="getDays(d.planDate)">{{ getDays(d.planDate) }}</p>
            <p :title="typeDict[d?.type]?.text" :style="{ color: typeDict[d?.type]?.color }">
              {{ typeDict[d?.type]?.text }}
            </p>
          </li>
        </ul>
      </div>
    </div>
  </ComCard>
</template>
<script lang="ts" setup>
import { inspect } from "@/api/outRoom.api"
import ComCard from "@/components/ComCard.vue"
import { autoPlayData } from "@/utils/screenUtils"
import { formatDate } from "@/utils/utils"
import { ref } from "vue"
const props = defineProps<{
  labId: string
}>()
// 当日在检任务
const data = ref<any>([])

const moveTask = ref(false)

const taskTimer = ref()

const typeDict = {
  2: {
    text: "即将到期",
    color: "#FF9A2E"
  },
  3: {
    text: "到期",
    color: "#FF6666"
  }
}

function getDays(planDate) {
  if (!planDate) {
    return "-"
  }
  // 计算时间差
  const time = new Date(planDate).getTime() - new Date().getTime()
  if (time < 0) {
    return "-"
  }
  // 将时间戳转为天数
  return Math.floor(time / (24 * 3600 * 1000)).toString()
}

const getData = () => {
  inspect(props.labId).then((res) => {
    if (res.code !== 20000) return
    let list = res.data || []
    for (let i = 0; i < list.length; i++) {
      list[i].index = i + 1
    }
    data.value = list
    autoPlayData({
      domId: "functionalVerificationExpireEq",
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
@taskItemH: 0.31rem;
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
  display: flex;
  flex-direction: column;
  gap: 0.08rem;
  &.startMove {
    transition: 0.5s ease-out;
    transform: translateY(-@taskItemH - 0.08rem);
  }
  .thead {
    color: #1890ff;
  }
  .tr {
    height: @taskItemH;
    display: flex;
    align-items: center;
    font-size: 0.14rem;
    gap: 0.16rem;
    &.sp {
      background: linear-gradient(
        90deg,
        rgba(16, 40, 73, 0) -2%,
        rgba(0, 102, 236, 0.2706) 51%,
        rgba(16, 40, 73, 0) 100%
      );
      box-sizing: border-box;
      border: 2px solid;
      border-image: linear-gradient(
          90deg,
          rgba(93, 144, 194, 0) 2%,
          rgba(0, 102, 236, 0.27) 50%,
          rgba(93, 144, 194, 0) 100%
        )
        2;
    }
    p {
      margin: 0 0.05rem;
      flex: 1;
      width: 0;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
}
</style>
