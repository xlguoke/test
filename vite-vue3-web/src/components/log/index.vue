<template>
  <a-modal
    v-model:visible="visible"
    title="日志"
    :mask-closable="false"
    :keyboard="false"
    cancel-text="关闭"
    width="70%"
    @ok="handleOk"
  >
    <a-spin :spinning="spinning" tip="Loading...">
      <a-table
        :data-source="dataList"
        bordered
        size="small"
        :columns="columns"
        :pagination="pagination"
      />
    </a-spin>
  </a-modal>
</template>

<script setup lang="ts">
import { reactive, ref, inject } from "vue"
import { message } from "ant-design-vue"
import type { TableColumnsType, PaginationProps } from "ant-design-vue"
import { formatDate } from "@/utils"
const spinning = ref<boolean>(false)
const visible = ref<boolean>(false)
const dataId = ref()
const openModal = (id?: string) => {
  if (!id) {
    return message.warning("请传入数据id")
  }
  dataId.value = id
  visible.value = true
  getLogList()
}

defineExpose({
  openModal
})

// 分页
const commonPagination = reactive(inject("commonPagination") as PaginationProps)
const pagination = reactive<PaginationProps>({
  ...commonPagination,
  onChange: (page: number, pageSize: number) => {
    pagination.current = page
    pagination.pageSize = pageSize
    getLogList()
  }
})

const columns = reactive<TableColumnsType>([
  {
    title: "事项名称",
    dataIndex: "title",
    key: "title"
  },
  {
    title: "操作机构",
    dataIndex: "org",
    key: "org"
  },
  {
    title: "操作名称",
    dataIndex: "subject",
    key: "subject"
  },
  {
    title: "操作人",
    dataIndex: "operator",
    key: "operator"
  },
  {
    title: "操作时间",
    dataIndex: "operatedAt",
    key: "operatedAt",
    customRender: ({ text }) => {
      return text ? formatDate(text) : ""
    }
  },
  {
    title: "内容",
    dataIndex: "content",
    key: "content"
  }
])

const dataList = ref([])
const getLogList = () => {
  spinning.value = true
  // logListApi(dataId.value)
  //   .then(res => {
  //     spinning.value = false
  //     dataList.value = res.record || res || []
  //   })
  //   .catch(() => {
  //     spinning.value = false
  //   })
}

const handleOk = () => {
  visible.value = false
}
</script>

<style></style>
