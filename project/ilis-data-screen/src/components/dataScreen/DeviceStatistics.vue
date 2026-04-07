<template>
  <ComCard title="设备统计">
    <div class="device-statistics-card">
      <div class="device-statistics">
        <div class="device-statistics-item-box left">
          <div class="device-statistics-item">
            <div class="device-statistics-icon one"></div>
            <div class="device-statistics-info">
              <p>正常</p>
              <div>{{ data?.["正常"] }}</div>
            </div>
          </div>
          <div class="device-statistics-item">
            <div class="device-statistics-icon three"></div>
            <div class="device-statistics-info">
              <p>停用</p>
              <div>{{ data?.["停用"] }}</div>
            </div>
          </div>
        </div>
        <div class="device-statistics-circle">
          <div>{{ data?.["设备总计"] }}</div>
          <p>设备总计</p>
        </div>
        <div class="device-statistics-item-box right">
          <div class="device-statistics-item">
            <div class="device-statistics-info">
              <p>待检</p>
              <div>{{ data?.["待检"] }}</div>
            </div>
            <div class="device-statistics-icon two"></div>
          </div>
          <div class="device-statistics-item">
            <div class="device-statistics-info">
              <p>报废</p>
              <div>{{ data?.["报废"] }}</div>
            </div>
            <div class="device-statistics-icon four"></div>
          </div>
        </div>
      </div>
    </div>
  </ComCard>
</template>
<script lang="ts" setup>
import { deviceStatistics } from "@/api/dataScreen.api"
import ComCard from "@/components/ComCard.vue"
import { numAnimate, numberToCurrencyNo } from "@/utils/screenUtils"
import { ref } from "vue"

// 设备统计数据
const data = ref({
  设备总计: "0",
  正常: "0",
  待检: "0",
  停用: "0",
  报废: "0"
})

const getData = () => {
  deviceStatistics().then((res) => {
    if (res.code === 20000) {
      const obj = {}
      res.data.forEach((d) => {
        obj[d.name] = d.numMain
      })
      numAnimate(data.value, obj, (data) => {
        data.value = {
          设备总计: numberToCurrencyNo(data.设备总计),
          正常: numberToCurrencyNo(data.正常),
          待检: numberToCurrencyNo(data.待检),
          停用: numberToCurrencyNo(data.停用),
          报废: numberToCurrencyNo(data.报废)
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
.device-statistics-card {
  height: 100%;
  display: flex;
  align-items: center;
}

.device-statistics {
  display: flex;
  align-items: center;
  width: 100%;

  .device-statistics-circle {
    width: 1.3rem;
    height: 1.3rem;
    background: url("@/assets/images/dataScreen/sbtj-circle.png") no-repeat center/100% 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    z-index: 10;
    margin-top: -0.02rem;
    margin-left: -0.02rem;

    div {
      font-size: 0.24rem;
      font-weight: bold;
      color: #fff;
    }

    p {
      margin-top: 0.12rem;
      font-size: 0.14rem;
      color: #c6dcea;
    }
  }

  .device-statistics-item-box {
    height: 100%;
    flex: 1;
    width: 0;
    .device-statistics-item {
      border-image-width: 0.45rem;
      height: 0.84rem;
      display: flex;
      align-items: center;
      justify-content: space-around;
      box-sizing: border-box;
    }
    &.left {
      margin-right: -0.3rem;
      .device-statistics-item {
        &:first-child {
          margin-bottom: 0.08rem;
          border-image-source: url("@/assets/images/dataScreen/sbtj-bg-1.png");
          border-image-slice: 38 58 46 1 fill;
        }
        &:last-child {
          border-image-source: url("@/assets/images/dataScreen/sbtj-bg-3.png");
          border-image-slice: 38 58 46 1 fill;
        }
      }
      .device-statistics-info {
        margin-right: 0.5rem;
      }
    }
    &.right {
      margin-left: -0.3rem;
      .device-statistics-item {
        &:first-child {
          margin-bottom: 0.08rem;
          border-image-source: url("@/assets/images/dataScreen/sbtj-bg-2.png");
          border-image-slice: 38 1 46 58 fill;
        }
        &:last-child {
          border-image-source: url("@/assets/images/dataScreen/sbtj-bg-4.png");
          border-image-slice: 38 1 46 58 fill;
        }
      }
      .device-statistics-info {
        margin-left: 0.5rem;
      }
    }
  }

  .device-statistics-info {
    p {
      color: #c6dcea;
      font-size: 0.14rem;
    }

    div {
      color: #ffffff;
      font-size: 0.18rem;
      margin-top: 0.12rem;
      font-weight: bold;
    }
  }

  .device-statistics-icon {
    width: 0.54rem;
    height: 0.42rem;

    &.one {
      background: url("@/assets/images/dataScreen/sbtj-1.png") no-repeat center/100% 100%;
    }

    &.two {
      background: url("@/assets/images/dataScreen/sbtj-2.png") no-repeat center/100% 100%;
    }

    &.three {
      background: url("@/assets/images/dataScreen/sbtj-3.png") no-repeat center/100% 100%;
    }

    &.four {
      background: url("@/assets/images/dataScreen/sbtj-4.png") no-repeat center/100% 100%;
    }
  }
}
</style>
