<template>
  <div class="flex flex-col justify-between">
    <div>
      <span class="bg-[#40E7D5]/80 rounded-[2px] p-[4px] text-[12px] leading-[12px] inline-block">
        实时
      </span>
      <span class="ml-10 text-[16px]">{{ title }}</span>
    </div>
    <div class="flex gap-12">
      <div v-for="(d, i) in countArr" :key="i" class="count-item">
        <span>{{ d }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue"

const props = defineProps<{
  title: string
  count: number
}>()

const countArr = ref<string[]>([])
watch(
  () => props.count,
  (n) => {
    const arr = parseInt(`${n}`).toString().split("")
    if (arr.length < 5) {
      arr.unshift(...Array(5 - arr.length).fill("0"))
    }
    countArr.value = arr
  },
  {
    immediate: true
  }
)
</script>

<style scoped lang="less">
.count-item {
  width: 0.98rem;
  height: 1.1rem;
  line-height: 1.1rem;
  text-align: center;
  font-size: 30px;
  font-weight: bold;
  border: 1px solid rgba(64, 231, 214, 0.1);
  background: rgba(64, 231, 213, 0.1);
  color: #80fff1;
  span {
    background: linear-gradient(180deg, #fff 0%, #40e7d5 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-fill-color: transparent;
  }
}
</style>
