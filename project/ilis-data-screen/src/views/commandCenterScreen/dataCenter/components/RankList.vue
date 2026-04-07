<template>
  <div class="rank-list">
    <div class="flex flex-col w-full h-full overflow-auto px-16">
      <div v-for="(item, index) in dataSource" :key="index" class="rank-list-item">
        <div class="flex justify-between">
          <span class="text-white text-[0.12rem]">NO.{{ index + 1 }} {{ item.label }}</span>
          <span class="text-[0.12rem]" style="color: #c9cdd4">
            <NumberScroll :value="item.value" />
            个
          </span>
        </div>
        <div class="rank-list-bar">
          <div class="rank-list-process" :style="`width: ${item.process}%;`"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type PropType, computed } from "vue"
import NumberScroll from "./NumberScroll.vue"

export interface RankListItem {
  label: string
  value: number
  process: number
}

const props = defineProps({
  dataSource: {
    type: Array as PropType<RankListItem[]>,
    default: () => []
  }
})

const dataSource = computed(() => props.dataSource)
</script>

<style lang="less" scoped>
.rank-list {
  width: 100%;
  height: 100%;
  padding: 0.48rem 0 0.16rem 0;

  .rank-list-item {
    margin-top: 0.13rem;

    &:first-child {
      .rank-list-process {
        background: linear-gradient(90deg, #f3bc52 0%, #f39052 99%);
      }
    }
  }

  .rank-list-bar {
    height: 0.06rem;
    width: 100%;
    border-radius: 0.1rem;
    position: relative;
    background: rgba(54, 66, 103, 0.7);
    overflow: hidden;
    margin-top: 0.06rem;
  }

  .rank-list-process {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 0%;
    background: linear-gradient(90deg, rgba(124, 233, 255, 0.4) 0%, #4aa2ff 99%);
    transition: all 1.5s;
  }
}
</style>
