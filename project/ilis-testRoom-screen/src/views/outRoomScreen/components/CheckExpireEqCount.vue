<template>
  <ComCard title="检校到期设备统计">
    <div class="sample-statistics">
      <div class="sample-statistics-item">
        <div class="sample-statistics-icon one"></div>
        <div class="sample-statistics-info">
          <div class="sample-statistics-count">{{ data?.["即将到期"] }}</div>
          <div class="sample-statistics-title">即将到期数（台）</div>
        </div>
      </div>

      <CheckExpireEq ref="box7" :lab-id="labId"></CheckExpireEq>
    </div>
  </ComCard>
</template>
<script lang="ts" setup>
import { checkStatistics } from "@/api/outRoom.api"
import ComCard from "@/components/ComCard.vue"
import { numAnimate, numberToCurrencyNo } from "@/utils/screenUtils"
import CheckExpireEq from "./CheckExpireEq.vue"
import { ref } from "vue"
const props = defineProps<{
  labId: string
}>()
// 样品梳理数据
const data = ref({
  即将到期: "0",
  已到期: "0"
})

const typeDict = {
  2: {
    text: "即将到期",
    color: "#FF9A2E"
  },
  3: {
    text: "已到期",
    color: "#FF6666"
  }
}

const box7 = ref()

const getData = () => {
  box7.value?.getData()

  checkStatistics(props.labId).then((res) => {
    if (res.code === 20000 && res.data?.length) {
      const obj = {}
      res.data.forEach((d) => {
        obj[typeDict[d.type]?.text] = d.count
      })
      console.log("obj", obj)

      numAnimate(data.value, obj, (data) => {
        data.value = {
          即将到期: numberToCurrencyNo(data["即将到期"]),
          已到期: numberToCurrencyNo(data["已到期"])
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
  flex-direction: column;
  // padding: 0 0.22rem;

  .sample-statistics-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 0.26rem;
    background: linear-gradient(270deg, rgba(0, 102, 236, 0) 0%, rgba(0, 102, 236, 0.1) 100%);

    &:first-child {
      color: #f68844;
    }
    &:last-child {
      color: #ff6666;
    }
  }

  .sample-statistics-info {
    color: #f68844;
    text-align: right;
  }

  .sample-statistics-title {
    font-size: 0.14rem;
    line-height: 0.2rem;
    text-align: right;
  }

  .sample-statistics-count {
    font-size: 0.36rem;
    line-height: 0.44rem;
    margin-top: 0.1rem;
    font-weight: bold;
    margin-bottom: 0.08rem;
    padding-right: 0.08rem;
  }

  .sample-statistics-icon {
    width: 0.98rem;
    height: 0.98rem;
    margin-right: 0.24rem;

    &.one {
      background: url("@/assets/images/outroom/outroom-2.png") no-repeat center/100% 100%;
    }

    &.two {
      background: url("@/assets/images/outroom/outroom-1.png") no-repeat center/100% 100%;
    }
  }
}
</style>
