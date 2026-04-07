<template>
  <div class="filter-box">
    <!-- <slot name="title">{{ dateFilterTitle }}：</slot> -->
    <div>
      <div v-if="displayOptions.length" class="frame-title-filter">
        <div
          v-for="(item, index) in displayOptions"
          :key="index"
          :class="{
            active: item.value === currentValue
          }"
          @click="onSelect(item.value)"
        >
          {{ item.label }}
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { FilterDateType } from "@/api/smartCockpit.test.api"
import { ref, defineProps, computed, watch } from "vue"

interface FilterOption {
  label: string
  value: FilterDateType
  hidden?: boolean
}

const props = withDefaults(
  defineProps<{
    dateFilterTitle: string
    filterOptions: FilterOption[]
    currentValue: FilterDateType
  }>(),
  {
    filterOptions: () => [],
    dateFilterTitle: "日期筛选",
    currentValue: FilterDateType.周
  }
)

const currentValue = ref(props.currentValue)
watch(
  () => props.currentValue,
  (val) => {
    currentValue.value = val
  }
)
const emits = defineEmits(["changeDateFilter"])

// 过滤选项
const displayOptions = computed(() => props.filterOptions.filter((item) => !item.hidden))

function onSelect(option: any) {
  console.log("changeDateFilter")
  currentValue.value = option
  // 通知父组件更新数据
  emits("changeDateFilter", option)
}
</script>
<style lang="less" scoped>
.frame-title-filter {
  height: 0.66rem;
  display: flex;
  align-items: center;
  background: rgba(76, 184, 176, 0.1);
  border: 1px solid #4cb8b0;

  & > div {
    font-family: Source Han Sans;
    font-size: 0.36rem;
    font-weight: 500;
    font-variation-settings: "opsz" auto;
    color: #ffffff;
    padding: 0 0.28rem;
    cursor: pointer;
    color: #73cbc5;
    height: 100%;
    display: flex;
    align-items: center;

    &.active,
    &:hover {
      background: #4cb8b0;
      color: #fff;
    }
    &.disabled {
      cursor: not-allowed;
    }
  }
}
.filter-box {
  display: flex;
  justify-content: start;
  gap: 0.5rem;
}
</style>
