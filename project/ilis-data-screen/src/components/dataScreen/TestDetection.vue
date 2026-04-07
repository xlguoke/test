<template>
  <ComCard title="试验检测" is-long>
    <div class="test-list-wrap">
      <div class="test-count">
        <div class="item">
          <div class="title">累计完成</div>
          <div class="num">{{ countData?.allCount }}</div>
        </div>
        <div class="item">
          <div class="title">今日完成</div>
          <div class="num">{{ countData?.todayCount }}</div>
        </div>
        <div class="item">
          <div class="title">本周完成</div>
          <div class="num">{{ countData?.weekCount }}</div>
        </div>
        <div class="item">
          <div class="title">本月完成</div>
          <div class="num">{{ countData?.monthCount }}</div>
        </div>
      </div>
      <div id="testScroll" class="test-scroll-box">
        <div :class="['test-list', 'scroll-box', move ? 'startMove' : '']">
          <div v-for="d in listData" :key="d.id" class="tr">
            <div class="tag">{{ d.submitter }}</div>
            <div class="desc">
              {{ `出具了${d.sampleName}实验报告` }}
            </div>
            <div class="time">
              {{ d.submitTime }}
              <!-- {{ d.startTime ? formatDate(d.startTime, 2) : "--" }} -->
            </div>
          </div>
        </div>
      </div>
    </div>
  </ComCard>
</template>
<script lang="ts" setup>
import { lastReport, submitedReportStat } from "@/api/dataScreen.api"
import ComCard from "@/components/ComCard.vue"
import { autoPlayData, numAnimate, numberToCurrencyNo } from "@/utils/screenUtils"
import { formatDate } from "@/utils/utils"
import { ref } from "vue"

// 列表数据
const listData = ref<any>([])

// 统计数据
const countData = ref({
  allCount: "0",
  todayCount: "0",
  weekCount: "0",
  monthCount: "0"
})

const move = ref(false)

const taskTimer = ref()

async function getListData() {
  const { data, code } = await lastReport()
  if (code !== 20000) return
  let list = data || []
  for (let i = 0; i < list.length; i++) {
    list[i].index = i + 1
  }
  listData.value = list
  autoPlayData({
    domId: "testScroll",
    datas: listData,
    isMove: move,
    timer: taskTimer
  })
}

async function getCountData() {
  const { data: res, code } = await submitedReportStat()
  if (code !== 20000) return
  numAnimate(countData.value, res, (data) => {
    countData.value = {
      allCount: numberToCurrencyNo(data.allCount),
      todayCount: numberToCurrencyNo(data.todayCount),
      weekCount: numberToCurrencyNo(data.weekCount),
      monthCount: numberToCurrencyNo(data.monthCount)
    }
  })
}

const getData = () => {
  getCountData()
  getListData()
}

getData()

defineExpose({
  getData
})
</script>
<style lang="less" scoped>
@taskItemH: 0.35rem;
.test-scroll-box {
  height: calc(100%);
  overflow: hidden;
}
.test-list-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.test-count {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.16rem;
  .item {
    width: 0.8rem;
    height: 0.68rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 0.14rem;
    background: url("@/assets/images/dataScreen/pedestal.png") no-repeat center/100% 100%;
    .num {
      font-family: "YSFont";
    }
  }
}

.test-list {
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
    font-size: 0.12rem;
    gap: 0.16rem;
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

    .tag {
      color: #ffd15c;
      display: inline-block;
      padding: 0.02rem 0.08rem;
      border-radius: 2px;
      background: rgba(255, 209, 92, 0.05);
      box-sizing: border-box;
      border: 1px solid rgba(255, 209, 92, 0.13);
    }
    .desc {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}
</style>
