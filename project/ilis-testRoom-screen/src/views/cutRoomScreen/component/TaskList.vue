<template>
  <div class="task-list">
    <TableTitle>试验室待检任务列表</TableTitle>
    <div ref="container" class="container">
      <CustomTable
        :key="tableKey"
        :data-source="data"
        :columns="columns"
        :pagination="false"
        :scroll="{
          y: getY()
        }"
      ></CustomTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import TableTitle from "./TableTitle.vue"
import CustomTable from "./CustomTable.vue"
import { onMounted, ref } from "vue"
import { TaskEntity } from ".."

defineProps<{
  data: TaskEntity[]
}>()
const container = ref<HTMLElement>()

const tableKey = ref(0)
const columns = ref([
  {
    title: "样品编号",
    dataIndex: "testObjectCode",
    key: "testObjectCode",
    ellipsis: true
  },
  {
    title: "样品名称",
    dataIndex: "testSampleDisplayName",
    key: "testSampleDisplayName",
    ellipsis: true
  },
  {
    title: "检测人员",
    dataIndex: "testUser",
    key: "testUser",
    ellipsis: true
  },
  {
    title: "检测参数",
    dataIndex: "testTaskParamDisplayNames",
    key: "testTaskParamDisplayNames",
    ellipsis: true
  }
])

function getY() {
  return (container.value?.clientHeight && container.value?.clientHeight - 80) ?? 300
}
onMounted(() => {
  setTimeout(() => {
    tableKey.value++
  }, 500)
})
</script>

<style lang="less" scoped>
.task-list {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 24px;
  border: 1px solid #032c6c;
  background: rgba(8, 107, 237, 0.1);
  .container {
    flex: 1;
    height: 0;
  }
}
</style>
