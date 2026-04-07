<template>
  <ComCard title="人员统计">
    <div class="person-statistics">
      <div class="person-statistics-circle">
        <div>{{ data?.["人员总数"] }}</div>
        <span>人员总数</span>
      </div>
      <div class="person-statistics-right">
        <div class="person-statistics-bar one">
          <span class="person-statistics-title">试验检测师数</span>
          <span class="person-statistics-count">
            {{ data?.["试验检测师"] }}
          </span>
        </div>
        <div class="person-statistics-bar two">
          <span class="person-statistics-title">助理试验检测师数</span>
          <span class="person-statistics-count">
            {{ data?.["助理试验检测师"] }}
          </span>
        </div>
        <div class="person-statistics-bar three">
          <span class="person-statistics-title">高工数</span>
          <span class="person-statistics-count">{{ data?.["高工数"] }}</span>
        </div>
      </div>
    </div>
  </ComCard>
</template>
<script lang="ts" setup>
import { personStatistics } from "@/api/dataScreen.api"
import ComCard from "@/components/ComCard.vue"
import { numAnimate, numberToCurrencyNo } from "@/utils/screenUtils"
import { ref } from "vue"

// 人员统计数据
const data = ref({
  人员总数: "0",
  试验检测师: "0",
  助理试验检测师: "0",
  高工数: "0"
})

const getData = () => {
  personStatistics().then((res) => {
    if (res.code === 20000) {
      const obj = {}
      res.data.forEach((d) => {
        obj[d.name] = d.numMain
      })
      numAnimate(data.value, obj, (data) => {
        data.value = {
          人员总数: numberToCurrencyNo(data.人员总数),
          试验检测师: numberToCurrencyNo(data.试验检测师),
          助理试验检测师: numberToCurrencyNo(data.助理试验检测师),
          高工数: numberToCurrencyNo(data.高工数)
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
.person-statistics {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0 3%;

  .person-statistics-circle {
    width: 1.6rem;
    height: 1.6rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: url("@/assets/images/dataScreen/rytj-circle.png") no-repeat center/100% 100%;

    div {
      font-size: 0.32rem;
      font-weight: bold;
      color: #fff;
    }

    span {
      font-size: 0.14rem;
      color: #c6dcea;
      margin-top: 0.12rem;
    }
  }

  .person-statistics-right {
    flex: 1;
    width: 0;
    display: flex;
    flex-direction: column;
    row-gap: 0.08rem;
    margin-left: -0.4rem;
  }

  .person-statistics-title {
    font-size: 0.14rem;
    color: #c6dcea;
  }

  .person-statistics-count {
    font-size: 0.24rem;
    color: #fff;
    font-weight: bold;
  }

  .person-statistics-bar {
    padding-right: 0.18rem;
    padding-left: 0.8rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 0.48rem;
    box-sizing: border-box;

    &.one {
      border-image-source: url("@/assets/images/dataScreen/rytj-bar-1.png");
      border-image-slice: 24 0 24 64 fill;
      border-image-width: 0.25rem 0 0.24rem 0.64rem;
    }

    &.two {
      border-image-source: url("@/assets/images/dataScreen/rytj-bar-2.png");
      border-image-slice: 24 0 24 64 fill;
      border-image-width: 0.25rem 0 0.24rem 0.64rem;
    }

    &.three {
      border-image-source: url("@/assets/images/dataScreen/rytj-bar-3.png");
      border-image-slice: 24 0 24 64 fill;
      border-image-width: 0.25rem 0 0.24rem 0.64rem;
    }
  }
}
</style>
