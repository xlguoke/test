<template>
  <div class="common-tabs">
    <CommonButton
      v-for="(v, i) in tabs"
      :key="v.value"
      :type="activeTab === i ? 'primary' : undefined"
      @click="changeTab(v, i)"
    >
      {{ v.label }}
    </CommonButton>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import CommonButton from "./CommonButton.vue"

interface TabData {
  label: string
  value: string | number
}

const props = defineProps<{
  /** 默认选中的tab索引 */
  activeInd?: number
  /** 标签列表 */
  tabs: TabData[]
}>()

const emits = defineEmits<{
  (e: "change", item: TabData, ind: number): void
}>()

const activeTab = ref(props.activeInd || 0)

function changeTab(item: TabData, ind: number) {
  activeTab.value = ind
  emits("change", item, ind)
}
</script>

<style scoped lang="less">
.common-tabs {
  display: flex;
  flex-wrap: wrap;
  column-gap: 0.24rem;
  margin-bottom: 0.24rem;

  .btn:not(.primary) {
    color: #0066ec;
    cursor: pointer;
    transition: 0.2s;
  }
}
</style>
