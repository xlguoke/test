<template>
  <div
    class="ring-legend"
    :class="{
      'overflow-y-auto': legendData.length > 4
    }"
  >
    <div v-for="(item, index) in legendData" :key="index" class="ring-legend-item">
      <div class="ring-legend-icon" :style="`background:${item.color}`"></div>
      <div class="w-[2rem]">{{ item.name }}</div>
      <div class="w-[1.2rem]">{{ item.value }}台</div>
      <div class="w-[0.8rem]">{{ item.ratio }}%</div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { PropType, computed } from "vue"
import { defaultChartOptions } from ".."

// 定义组件属性
const props = defineProps({
  data: {
    type: Array as PropType<
      Array<{
        name: string
        value: number
      }>
    >,
    required: true
  }
})

const legendData = computed(() => {
  const data = props.data
  const total = data.reduce((acc: number, curr: any) => acc + curr.value, 0)
  return data.map((item, index) => ({
    ...item,
    ratio: ((item.value / total) * 100).toFixed(0),
    color: defaultChartOptions.color[index % defaultChartOptions.color.length]
  }))
})
</script>

<style lang="less" scoped>
.ring-legend {
  position: absolute;
  top: 4.4rem;
  left: 0.24rem;
  right: 0.24rem;
  display: flex;
  flex-wrap: wrap;
  max-height: 1.96rem;
  gap: 0.16rem;
  justify-content: center;

  .ring-legend-icon {
    width: 0.16rem;
    height: 0.16rem;
  }

  .ring-legend-item {
    display: flex;
    align-items: center;
    font-size: 0.28rem;
    gap: 0.16rem;
    color: #fff;
  }
}
</style>
