<template>
  <a-spin :spinning="spinning" tip="Loading...">
    <div class="query-form-wrap">
      <a-space>
        <a-input-search
          v-model:value="queryFrom.q"
          style="width: 280px; margin-right: 50px"
          placeholder="请输入关键字查询"
          enter-button
          @search="getDataSource(true)"
        />
        <a-checkbox v-model:checked="queryFrom.onlyOwn" @change="getDataSource(true)">
          只显示自己咨询的
        </a-checkbox>
      </a-space>
      <a-button v-auth="'technical-exchange::top::create'" @click="add">提问</a-button>
    </div>

    <a-table
      :data-source="dataSource"
      :columns="columns"
      :pagination="pagination"
      size="small"
      bordered
      row-key="id"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key == 'handle'">
          <a-space>
            <a-button type="primary" size="small" @click="goDetail(record.id)">详情</a-button>
            <a-button
              v-auth="'technical-exchange::top::delete'"
              type="danger"
              size="small"
              @click="delRow(record.id)"
            >
              删除
            </a-button>
          </a-space>
        </template>
      </template>
    </a-table>

    <Add ref="addRef" :key="addKey" @update-list="getDataSource" />
    <Detail ref="detail" :key="detailKey" @update-list="getDataSource" />
  </a-spin>
</template>

<script setup lang="ts">
import { ExclamationCircleOutlined } from "@ant-design/icons-vue"
import { reactive, ref, createVNode, onMounted, inject, nextTick } from "vue"
import { Modal, message } from "ant-design-vue"
import Add from "./components/Add.vue"
import Detail from "./components/Detail.vue"
import { getPageList, delById } from "@/api/technicalExchange.api"
import type { TableColumnType, PaginationProps } from "ant-design-vue"
import { formatDate } from "@/assets/js/common"

const spinning = ref<boolean>(false)
const queryFrom = reactive({
  onlyOwn: false,
  q: ""
})

onMounted(() => {
  getDataSource()
})

// 表格列
const columns = reactive<TableColumnType[]>([
  {
    dataIndex: "index",
    key: "index",
    width: 50,
    align: "center",
    customRender: ({ index }) => {
      return index + 1
    }
  },
  {
    title: "咨询标题",
    dataIndex: "title",
    key: "title"
  },
  {
    title: "咨询内容",
    dataIndex: "content",
    key: "content"
  },
  {
    title: "咨询单位",
    dataIndex: "unitName",
    key: "unitName"
  },
  {
    title: "咨询时间",
    dataIndex: "createdAt",
    key: "createdAt",
    customRender: ({ text }) => {
      return text ? formatDate(text, 2) : ""
    }
  },
  {
    title: "回复",
    dataIndex: "replyNumber",
    key: "replyNumber"
  },
  {
    title: "是否解决",
    dataIndex: "solved",
    key: "solved",
    customRender: ({ text }) => {
      return text ? "是" : "否"
    }
  },
  {
    title: "操作",
    dataIndex: "handle",
    key: "handle",
    width: 80
  }
])
const dataSource = ref([])
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
      dataSource.value = res.records || []
      pagination.total = res.total
    })
    .catch(() => {
      spinning.value = false
    })
}

// 提问
const addRef = ref()
const addKey = ref()
const add = () => {
  addKey.value = new Date().getTime()
  nextTick(() => {
    addRef.value.openModal()
  })
}

//  确认弹窗
const openConfirm = (title: string, content?: string) => {
  return new Promise((resolve) => {
    Modal.confirm({
      title,
      content,
      icon: createVNode(ExclamationCircleOutlined),
      onOk() {
        resolve("")
      }
    })
  })
}

// 查看详情
const detail = ref()
const detailKey = ref()
const goDetail = (rowId: string) => {
  detailKey.value = new Date().getTime()
  nextTick(() => {
    detail.value.openModal(rowId)
  })
}

// 删除
const delRow = (rowId: string) => {
  openConfirm("确认删除这条数据？", "确认删除系统将该技术交流下所有回复信息一同删除").then(() => {
    delById(rowId).then(() => {
      message.success("已删除")
      getDataSource()
    })
  })
}
</script>

<style scoped lang="less"></style>
