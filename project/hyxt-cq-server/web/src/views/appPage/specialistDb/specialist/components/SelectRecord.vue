<template>
  <a-modal
    v-model:visible="visible"
    title="选择记录"
    :mask-closable="false"
    :keyboard="false"
    width="75%"
  >
    <template #footer>
      <a-button @click="visible = false">关闭</a-button>
    </template>
    <a-table
      :data-source="dataSource"
      :columns="columns"
      :pagination="pagination"
      size="small"
      bordered
      row-key="id"
      :scroll="{ x: 1000 }"
    ></a-table>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, inject } from "vue"
import { actRecordApi } from "@/api/specialistDb.api"
import type { TableColumnType, PaginationProps } from "ant-design-vue"
import { formatDate } from "@/assets/js/common"

const spinning = ref<boolean>(false)
const visible = ref<boolean>(false)
const dataId = ref<string>("")
const openModal = (id: string) => {
  visible.value = true
  dataId.value = id
  id && getDataSource()
}

defineExpose({
  openModal
})

// 类型
const statusObj = {
  UNCOMPLETED: "待开始",
  COMPLETED: "已结束"
}
// 表格列
const columns = reactive<TableColumnType[]>([
  {
    title: "",
    dataIndex: "index",
    key: "index",
    width: 50,
    align: "center",
    fixed: "left",
    customRender: ({ index }) => {
      return index + 1
    }
  },
  {
    title: "选择机构",
    dataIndex: "org",
    key: "org"
  },
  {
    title: "活动名称",
    dataIndex: "activeName",
    key: "activeName"
  },
  {
    title: "活动状态",
    dataIndex: "status",
    key: "status",
    customRender: ({ text }) => {
      return statusObj[text]
    }
  },
  {
    title: "活动开始时间",
    dataIndex: "startTime",
    key: "startTime",
    customRender: ({ text }) => {
      return text ? formatDate(text) : ""
    }
  },
  {
    title: "活动结束时间",
    dataIndex: "endTime",
    key: "endTime",
    customRender: ({ text }) => {
      return text ? formatDate(text) : ""
    }
  },
  {
    title: "选择时间",
    dataIndex: "selectedTime",
    key: "selectedTime",
    customRender: ({ text }) => {
      return text ? formatDate(text) : ""
    }
  },
  {
    title: "评价",
    dataIndex: "score",
    key: "score"
  },
  {
    title: "备注",
    dataIndex: "scoreRemark",
    key: "scoreRemark"
  }
])
// 分页
const commonPagination = reactive(inject("commonPagination") as PaginationProps)
const pagination = reactive<PaginationProps>({
  ...commonPagination,
  onChange: (page: number, pageSize: number) => {
    pagination.current = page
    pagination.pageSize = pageSize
    getDataSource()
  }
})
const dataSource = ref([])
const getDataSource = () => {
  spinning.value = true
  actRecordApi(dataId.value)
    .then((res: any) => {
      spinning.value = false
      if (!res) return
      dataSource.value = res.records || []
      pagination.total = res.total
    })
    .catch(() => {
      spinning.value = false
    })
}
</script>

<style lang="less" scoped></style>
