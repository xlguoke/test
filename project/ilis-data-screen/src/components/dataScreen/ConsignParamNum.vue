<template>
  <ComCard
    v-model:checked="filterValue"
    :title="title"
    :filter-options="filterOptions"
    @select="getData"
  >
    <ul class="consign-param-num">
      <li v-for="(d, i) in data" :key="d.id" class="item">
        <p class="param-info">
          NO.{{ i + 1 }} {{ d?.chartDataKey }}：
          <span class="fr">{{ d?.chartDataValue }}个</span>
        </p>
        <div class="bar"><p class="bar-thumb" :style="`width: ${d?.scale}%`"></p></div>
      </li>
    </ul>
  </ComCard>
</template>
<script lang="ts" setup>
import { rankedListParam } from "@/api/dataScreen.api"
import ComCard from "@/components/ComCard.vue"
import { useDataScreenHooks } from "@/hooks/useDataScreenHooks"
import { computed, ref } from "vue"

// 委托参数数量排行
interface paramsType {
  id: string
  chartDataKey: string
  chartDataValue: number
  scale: number
}

const data = ref<paramsType[]>([])

const { unitCode, filterOptions, filterValue } = useDataScreenHooks()

const title = computed(() => {
  return unitCode.value === "ztlq" ? "室内委托参数排行" : "委托参数数量排行"
})

const getData = () => {
  rankedListParam(filterValue.value).then((res) => {
    if (res.code === 20000) {
      const list = res.data.data || []
      if (list.length === 0) return
      const maxItem = list[0]
      for (let i = 0; i < list.length; i++) {
        list[i].scale = (list[i].chartDataValue / maxItem.chartDataValue) * 100
      }
      list.length = 5
      data.value = list
    }
  })
}

getData()

defineExpose({
  getData
})
</script>
<style lang="less" scoped>
.consign-param-num {
  margin: 0 10px;
  height: 100%;
  overflow-y: hidden;
  font-size: 0.14rem;
  display: flex;
  flex-direction: column;
  justify-content: center;

  .param-info {
    font-size: 0.12rem;

    span {
      color: #c9cdd4;
    }
  }

  .item {
    padding: 0.06rem 0;
    &:first-child .bar .bar-thumb {
      background: linear-gradient(to right, #f3bc52, #f39052);
    }
  }

  .bar {
    margin-top: 0.12rem;
    width: 100%;
    height: 0.06rem;
    border-radius: 0.05rem;
    background-color: #364267;
    .bar-thumb {
      border-radius: 0.05rem;
      width: 0;
      height: 100%;
      background: linear-gradient(to right, #7ce9ff, #4aa2ff);
      transition: 0.2s;
    }
  }
}
</style>
