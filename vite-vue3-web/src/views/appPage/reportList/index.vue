<template>
  <div>{{ title }}</div>
</template>

<script setup lang="ts" name="ReportList">
import { ref, reactive, inject } from "vue"
import { PaginationProps } from "ant-design-vue"
const title = ref("报告进度管理")

// 分页
const commonPagination = reactive(inject("commonPagination") as PaginationProps)
const pagination = reactive<PaginationProps>({
  ...commonPagination,
  onChange: (page: number, pageSize: number) => {
    pagination.current = page
    pagination.pageSize = pageSize
    getTableData()
  }
})

const getTableData = () => {
  console.log("getData")
}
</script>

<style scoped lang="scss"></style>
