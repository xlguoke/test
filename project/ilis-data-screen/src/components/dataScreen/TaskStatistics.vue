<template>
  <ComCard
    v-model:checked="filterValue"
    title="检测任务数据统计"
    :filter-options="filterOptions"
    @select="getData"
  >
    <ul class="statistics">
      <li class="statistics-item">
        <div class="statistics-item-box one">{{ numberToCurrencyNo(data?.["检测总数"]) }}</div>
        <p class="title">检测总数</p>
      </li>
      <li class="statistics-item">
        <div class="statistics-item-box two">{{ numberToCurrencyNo(data?.["待检测"]) }}</div>
        <p class="title">待检测</p>
      </li>
      <li class="statistics-item">
        <div class="statistics-item-box three">{{ numberToCurrencyNo(data?.["在检测"]) }}</div>
        <p class="title">在检测</p>
      </li>
      <li class="statistics-item">
        <div class="statistics-item-box four">{{ numberToCurrencyNo(data?.["完成数"]) }}</div>
        <p class="title">完成数</p>
      </li>
    </ul>
  </ComCard>
</template>
<script lang="ts" setup>
import { testTaskStatistics } from "@/api/dataScreen.api"
import ComCard from "@/components/ComCard.vue"
import { useDataScreenHooks } from "@/hooks/useDataScreenHooks"
import { numAnimate, numberToCurrencyNo } from "@/utils/screenUtils"
import { ref } from "vue"

// 检测任务统计
const data = ref({
  检测总数: "0",
  待检测: "0",
  在检测: "0",
  完成数: "0"
})

const { filterOptions, filterValue } = useDataScreenHooks()

const getData = () => {
  testTaskStatistics(filterValue.value).then((res) => {
    if (res.code === 20000) {
      const obj = {}
      res.data.forEach((d) => {
        obj[d.name] = d.numMain
      })
      numAnimate(data.value, obj, (numData) => {
        data.value = {
          检测总数: numData.检测总数,
          待检测: numData.待检测,
          在检测: numData.在检测,
          完成数: numData.完成数
        }
      })
    }
  })
}

getData()

defineExpose({
  getData
})
</script>
<style lang="less" scoped>
.statistics {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  height: 100%;

  .statistics-item {
    text-align: center;

    .title {
      color: #c6dcea;
      text-shadow: 0px 0px 2px #2d8cf0;
      font-size: 0.14rem;
      margin-top: 0.12rem;
    }
  }

  .statistics-item-box {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 0.94rem;
    height: 0.94rem;
    color: #fff;
    font-size: 0.24rem;
    font-weight: bold;

    &.one {
      background: url("@/assets/images/dataScreen/jcrwsjtj-1.png") no-repeat center/100% 100%;
    }

    &.two {
      background: url("@/assets/images/dataScreen/jcrwsjtj-2.png") no-repeat center/100% 100%;
    }

    &.three {
      background: url("@/assets/images/dataScreen/jcrwsjtj-3.png") no-repeat center/100% 100%;
    }

    &.four {
      background: url("@/assets/images/dataScreen/jcrwsjtj-4.png") no-repeat center/100% 100%;
    }
  }
}
</style>
