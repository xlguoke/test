<template>
  <a-pagination
    v-model:current="localPageNum"
    :total="totalCount"
    show-less-items
    show-quick-jumper
    :show-size-changer="false"
  />
</template>
<script lang="ts" setup>
import { ref, watch } from "vue"

const props = withDefaults(
  defineProps<{
    totalCount: number | string
    pageNum: number | string
  }>(),
  { pageNum: 1, totalNum: 10 }
)

// 创建本地变量并初始化为 prop 值
const localPageNum = ref(props.pageNum)

// 监听 prop 变化，同步到本地变量（处理父组件主动修改页码的情况）
watch(
  () => props.pageNum,
  (newVal) => {
    localPageNum.value = newVal
  }
)

// 监听本地变量变化，触发自定义事件通知父组件
watch(localPageNum, (newVal) => {
  emit("update:pageNum", newVal)
})

// 定义要触发的事件
const emit = defineEmits(["update:pageNum"])
</script>
<style scoped lang="less"></style>
