<template>
  <div class="date-filter">
    <span
      v-for="item in dateList"
      :key="item.value"
      :class="{
        active: item.value === value
      }"
      @click="onSelect(item)"
    >
      {{ item.label }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { FilterSection } from "@/api/commandCenterScreen.api"
import { computed, ref } from "vue"

const props = defineProps({
  value: {
    type: String,
    default: "全部"
  }
})

const emits = defineEmits(["onSelect", "update:value"])

const dateList = ref([
  { label: "全部", value: FilterSection.全部 },
  { label: "近一年", value: FilterSection.近一年 },
  { label: "近一月", value: FilterSection.近一月 }
])

const value = computed(() => props.value)

function onSelect(item: { label: string; value: string }) {
  if (item.value === props.value) {
    return
  }

  emits("update:value", item.value)
  emits("onSelect", item)
}
</script>

<style lang="less" scoped>
.date-filter {
  position: absolute;
  top: 0.16rem;
  right: 0.24rem;
  display: flex;
  gap: 0.32rem;
  z-index: 10;

  span {
    color: #b4c0cc;
    cursor: pointer;

    &.active,
    &:hover {
      color: #fff;
    }
  }
}
</style>
