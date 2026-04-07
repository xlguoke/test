<template>
  <ComCard hide-title>
    <div class="sample-statistics">
      <div class="sample-statistics-item">
        <div class="sample-statistics-icon count1"></div>
        <div class="sample-statistics-info">
          <div class="sample-statistics-count">{{ data?.eqCount || 0 }}</div>
          <div class="sample-statistics-title">设备总数（台）</div>
        </div>
      </div>
      <div class="sample-statistics-item">
        <div class="sample-statistics-icon count2"></div>
        <div class="sample-statistics-info">
          <div class="sample-statistics-count">{{ data?.egressCount || 0 }}</div>
          <div class="sample-statistics-title">外出设备（台）</div>
        </div>
      </div>
      <div class="sample-statistics-item">
        <div class="sample-statistics-icon count3"></div>
        <div class="sample-statistics-info">
          <div class="sample-statistics-count">{{ data?.count || 0 }}</div>
          <div class="sample-statistics-title">存留设备（台）</div>
        </div>
      </div>
      <div class="sample-statistics-item">
        <div class="sample-statistics-icon count4"></div>
        <div class="sample-statistics-info">
          <div class="sample-statistics-count">{{ data?.sendCheckCount || 0 }}</div>
          <div class="sample-statistics-title">送检设备（台）</div>
        </div>
      </div>
    </div>
  </ComCard>
</template>
<script lang="ts" setup>
import { deviceStatistics } from "@/api/outRoom.api"
import ComCard from "@/components/ComCard.vue"
import { numAnimate, numberToCurrencyNo } from "@/utils/screenUtils"
import { ref } from "vue"

const props = defineProps<{
  labId: string
}>()

// 样品梳理数据
const data = ref<Record<string, any>>({
  count: 0,
  egressCount: 0,
  eqCount: 0,
  sendCheckCount: 0
})

const getData = () => {
  deviceStatistics(props.labId).then((res) => {
    if (res.code === 20000) {
      console.log("res", res)

      numAnimate(data.value, res.data, (callBackData) => {
        data.value = {
          count: numberToCurrencyNo(callBackData.count),
          egressCount: numberToCurrencyNo(callBackData.egressCount),
          eqCount: numberToCurrencyNo(callBackData.eqCount),
          sendCheckCount: numberToCurrencyNo(callBackData.sendCheckCount)
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
.sample-statistics {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0 0.22rem;

  .sample-statistics-item {
    width: 24%;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #0ee7e5;
  }

  .sample-statistics-title {
    font-size: 0.14rem;
    line-height: 0.2rem;
    color: #92add4;
  }

  .sample-statistics-count {
    font-size: 0.36rem;
    line-height: 0.44rem;
    margin-top: 0.1rem;
    font-weight: bold;
    margin-bottom: 0.08rem;
  }

  .sample-statistics-icon {
    width: 0.85rem;
    height: 0.97rem;
    margin-right: 0.24rem;

    &.count1 {
      background: url("@/assets/images/outroom/outroom-h1.png") no-repeat center/100% 100%;
    }
    &.count2 {
      background: url("@/assets/images/outroom/outroom-h2.png") no-repeat center/100% 100%;
    }
    &.count3 {
      background: url("@/assets/images/outroom/outroom-h3.png") no-repeat center/100% 100%;
    }
    &.count4 {
      background: url("@/assets/images/outroom/outroom-h4.png") no-repeat center/100% 100%;
    }
  }
}
</style>
