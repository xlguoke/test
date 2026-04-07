<template>
  <ComCard
    v-model:checked="filterValue"
    title="样品统计"
    :filter-options="filterOptions"
    @select="getData"
  >
    <div class="sample-statistics">
      <div class="sample-statistics-item">
        <div class="sample-statistics-icon one"></div>
        <div class="sample-statistics-info">
          <div class="sample-statistics-title">全部样品</div>
          <div class="sample-statistics-count">{{ numberToCurrencyNo(data?.["全部样品"]) }}</div>
        </div>
      </div>
      <div class="sample-statistics-item">
        <div class="sample-statistics-icon two"></div>
        <div class="sample-statistics-info">
          <div class="sample-statistics-title">在检样品</div>
          <div class="sample-statistics-count">{{ numberToCurrencyNo(data?.["在检样品"]) }}</div>
        </div>
      </div>
      <div class="sample-statistics-item">
        <div class="sample-statistics-icon three"></div>
        <div class="sample-statistics-info">
          <div class="sample-statistics-title">留样样品</div>
          <div class="sample-statistics-count">{{ numberToCurrencyNo(data?.["留样样品"]) }}</div>
        </div>
      </div>
      <div class="sample-statistics-item">
        <div class="sample-statistics-icon four"></div>
        <div class="sample-statistics-info">
          <div class="sample-statistics-title">待检样品</div>
          <div class="sample-statistics-count">{{ numberToCurrencyNo(data?.["待检样品"]) }}</div>
        </div>
      </div>
    </div>
  </ComCard>
</template>
<script lang="ts" setup>
import { sampleStatistics } from "@/api/dataScreen.api"
import ComCard from "@/components/ComCard.vue"
import { useDataScreenHooks } from "@/hooks/useDataScreenHooks"
import { numAnimate, numberToCurrencyNo } from "@/utils/screenUtils"
import { ref } from "vue"

// 样品梳理数据
const data = ref({
  全部样品: "0",
  在检样品: "0",
  留样样品: "0",
  待检样品: "0"
})

const { filterOptions, filterValue } = useDataScreenHooks()

const getData = () => {
  sampleStatistics(filterValue.value).then((res) => {
    if (res.code === 20000) {
      const obj = {}
      res.data.forEach((d) => {
        obj[d.name] = d.numMain
      })
      numAnimate(data.value, obj, (numData) => {
        data.value = {
          全部样品: numData["全部样品"],
          在检样品: numData["在检样品"],
          留样样品: numData["留样样品"],
          待检样品: numData["待检样品"]
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
  flex-wrap: wrap;
  height: 100%;
  padding: 0 0.22rem;

  .sample-statistics-item {
    width: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .sample-statistics-title {
    font-size: 0.14rem;
    color: #c6dcea;
  }

  .sample-statistics-count {
    font-size: 0.24rem;
    margin-top: 0.1rem;
    font-weight: bold;
    color: #fff;
  }

  .sample-statistics-icon {
    width: 0.86rem;
    height: 0.86rem;
    margin-right: 0.24rem;

    &.one {
      background: url("@/assets/images/dataScreen/ypsltj-1.png") no-repeat center/100% 100%;
    }

    &.two {
      background: url("@/assets/images/dataScreen/ypsltj-2.png") no-repeat center/100% 100%;
    }

    &.three {
      background: url("@/assets/images/dataScreen/ypsltj-3.png") no-repeat center/100% 100%;
    }

    &.four {
      background: url("@/assets/images/dataScreen/ypsltj-4.png") no-repeat center/100% 100%;
    }
  }
}
</style>
