<template>
  <ComCard title="样品标养">
    <div class="sample-standard-statistics">
      <div class="statistics-circle">
        <div>{{ data?.inMaintain }}</div>
        <span>养护中</span>
      </div>
      <div class="statistics-right">
        <div class="statistics-bar one">
          <span class="statistics-title">今日</span>
          <span class="statistics-count">
            {{ data?.expireToday }}
          </span>
        </div>
        <div class="statistics-bar two">
          <span class="statistics-title">3天</span>
          <span class="statistics-count">
            {{ data?.expire3Days }}
          </span>
        </div>
        <div class="statistics-bar three">
          <span class="statistics-title">7天</span>
          <span class="statistics-count">{{ data?.expire7Days }}</span>
        </div>
      </div>
      <!-- <div class="statistics-temperature">
        <div class="block">
          <img src="@/assets/images/dataScreen/temperature.png" alt="">
          <div class="data">
            <div class="num">{{ 26 }}</div>
            <div class="label">温度</div>
          </div>
        </div>
        <div class="block">
          <img src="@/assets/images/dataScreen/humidity.png" alt="">
          <div class="data">
            <div class="num">{{ 98 }}%</div>
            <div class="label">湿度</div>
          </div>
        </div>
      </div> -->
    </div>
  </ComCard>
</template>
<script lang="ts" setup>
import { periodStat } from "@/api/dataScreen.api"
import ComCard from "@/components/ComCard.vue"
import { numAnimate, numberToCurrencyNo } from "@/utils/screenUtils"
import { ref } from "vue"

// 统计数据
const data = ref({
  inMaintain: "0",
  expireToday: "0",
  expire3Days: "0",
  expire7Days: "0"
})

async function getData() {
  const { data: res, code } = await periodStat()
  if (code !== 20000) return
  numAnimate(data.value, res, (res2) => {
    data.value = {
      inMaintain: numberToCurrencyNo(res2.inMaintain),
      expireToday: numberToCurrencyNo(res2.expireToday),
      expire3Days: numberToCurrencyNo(res2.expire3Days),
      expire7Days: numberToCurrencyNo(res2.expire7Days)
    }
  })
}

getData()

defineExpose({
  getData
})
</script>
<style lang="less" scoped>
.sample-standard-statistics {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0 3%;

  .statistics-circle {
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
      font-family: "YSFont";
    }

    span {
      font-size: 0.14rem;
      color: #c6dcea;
      margin-top: 0.12rem;
    }
  }

  .statistics-right {
    flex: 1;
    width: 0;
    display: flex;
    flex-direction: column;
    row-gap: 0.08rem;
    margin-left: -0.4rem;
  }

  .statistics-temperature {
    display: flex;
    flex-direction: column;
    row-gap: 0.08rem;
    flex: 1;
    .block {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 0.76rem;
      padding: 0.18rem;
      margin-left: 0.2rem;
      background: url("@/assets/images/dataScreen/rect.png") no-repeat center/100% 100%;
      .data {
        flex: 1;
        .num {
          font-size: 0.24rem;
          font-family: "YSFont";
        }
        .label {
          font-size: 0.14rem;
        }
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }
    }
  }

  .statistics-title {
    font-size: 0.14rem;
    color: #c6dcea;
  }

  .statistics-count {
    font-size: 0.24rem;
    color: #fff;
    font-weight: bold;
    font-family: "YSFont";
  }

  .statistics-bar {
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
