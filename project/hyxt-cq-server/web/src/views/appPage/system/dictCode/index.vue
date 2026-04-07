<template>
  <a-spin :spinning="spinning" tip="Loading...">
    <div class="query-form-wrap">
      <a-space>
        <a-input-search
          v-model:value="queryFrom.keyword"
          placeholder="请输入关键字查询"
          enter-button
          @search="getDataSource(true)"
        />
      </a-space>
      <HandleBtns :datas="btnsList" />
    </div>

    <a-table
      :data-source="dataSource"
      :columns="columns"
      :pagination="pagination"
      children-column-name="dict"
      size="small"
      bordered
      row-key="id"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key == 'handle' && !record.categoryId">
          <a-space>
            <a-button type="primary" size="small" @click="editRow(record.id)">编辑</a-button>
            <a-button type="danger" size="small" @click="delRow(record.id)">删除</a-button>
          </a-space>
        </template>
      </template>
    </a-table>

    <Detail ref="detail" :key="updateKey" :update-list="getDataSource" />
  </a-spin>
</template>

<script setup lang="ts">
import { ExclamationCircleOutlined } from "@ant-design/icons-vue"
import { reactive, ref, createVNode, onMounted, nextTick, inject } from "vue"
import { Modal, message } from "ant-design-vue"
import { getPageList, delById, listType } from "@/api/dictCode.api"
import type { TableColumnType, PaginationProps } from "ant-design-vue"
import Detail from "./components/Detail.vue"

const spinning = ref<boolean>(false)
const queryFrom = reactive({
  keyword: ""
})

onMounted(() => {
  getDataSource()
})

// 表格列
const columns = reactive<TableColumnType[]>([
  {
    title: "字典名称",
    dataIndex: "name",
    key: "name"
  },
  {
    title: "字典编码",
    dataIndex: "code",
    key: "code"
  },
  {
    title: "操作",
    dataIndex: "handle",
    key: "handle",
    align: "center",
    width: 140,
    fixed: "right"
  }
])
const dataSource = ref<listType[]>([])
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
const getDataSource = (flag?: boolean) => {
  if (flag) {
    pagination.current = 1
  }
  const param = {
    current: pagination.current,
    size: pagination.pageSize,
    ...queryFrom
  }
  spinning.value = true
  getPageList(param)
    .then((res: any) => {
      spinning.value = false
      dataSource.value = res.records
      pagination.total = res.total
    })
    .catch(() => {
      spinning.value = false
    })
}

// 批量操作按钮
const btnsList = reactive([
  {
    btnName: "新增",
    authCode: "*",
    click: () => {
      editRow("")
    }
  }
])

//  确认弹窗
const openConfirm = (title: string) => {
  return new Promise((resolve) => {
    Modal.confirm({
      title,
      icon: createVNode(ExclamationCircleOutlined),
      onOk() {
        resolve("")
      }
    })
  })
}

const detail = ref()
const updateKey = ref("")
// 保存-编辑
const editRow = (rowId: string) => {
  updateKey.value = new Date().getTime() + ""
  nextTick(() => {
    detail.value.openModal(rowId)
  })
}

// 隐藏
// const triggerShow = (rowId: string) => {}

// 删除
const delRow = (rowId: string) => {
  openConfirm("确认删除这条数据吗？").then(() => {
    delById(rowId).then((res) => {
      if (!res) return
      message.success("删除成功")
      getDataSource()
    })
  })
}
</script>

<style scoped lang="less"></style>
