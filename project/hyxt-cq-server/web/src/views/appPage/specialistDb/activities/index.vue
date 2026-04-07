<template>
  <a-spin :spinning="spinning" tip="Loading...">
    <div class="query-form-wrap">
      <a-space>
        <a-select v-model:value="queryFrom.status" allow-clear placeholder="活动状态">
          <a-select-option value="UNCOMPLETED">待开始</a-select-option>
          <a-select-option value="COMPLETED">已结束</a-select-option>
        </a-select>
        <a-input-search
          v-model:value="queryFrom.q"
          placeholder="请输入专家名称/活动名称/活动单位查询"
          enter-button
          style="width: 350px"
          @search="getDataSource(true)"
        />
      </a-space>
      <a-button v-auth="'expert::activity::create'" @click="goDetail('新增', '', true)">
        新增
      </a-button>
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
            <a-button type="primary" size="small" @click="goDetail('详情', record.id, false)">
              详情
            </a-button>
            <a-button type="primary" size="small" @click="showLog(record.id)">日志</a-button>
            <a-button
              v-auth="'expert::activity::update'"
              type="primary"
              size="small"
              @click="goDetail('编辑', record.id, true)"
            >
              编辑
            </a-button>
            <a-button
              v-if="record.status == 'COMPLETED'"
              v-auth="'expert::activity::evaluation'"
              type="primary"
              size="small"
              @click="goEvaluate(record.id)"
            >
              评价
            </a-button>
            <a-button
              v-auth="'expert::activity::delete'"
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

    <Detail ref="detail" :key="detailKey" @updateList="getDataSource(true)" />
    <Evaluate ref="evaluate" :key="evaluateKey" @updateList="getDataSource(true)" />
    <Log ref="log" />
  </a-spin>
</template>

<script setup lang="ts">
import { ExclamationCircleOutlined } from "@ant-design/icons-vue"
import { reactive, ref, createVNode, onMounted, nextTick, inject } from "vue"
import { Modal, message } from "ant-design-vue"
import type { TableColumnType, PaginationProps } from "ant-design-vue"
import { actPageList, actDelById } from "@/api/specialistDb.api"
import { dataItemType } from "@/type/api/performance.api"
import Log from "@/components/log/index.vue"
import Detail from "./components/Detail.vue"
import Evaluate from "./components/Evaluate.vue"
import { formatDate } from "@/assets/js/common"

const spinning = ref<boolean>(false)

// 查询条件
const queryFrom = reactive({
  status: null,
  q: ""
})

// 表格列
const columns = reactive<TableColumnType[]>([
  {
    title: "",
    dataIndex: "index",
    key: "index",
    width: 50,
    align: "center",
    customRender: ({ index }) => {
      return index + 1
    }
  },
  {
    title: "活动名称",
    dataIndex: "name",
    key: "name"
  },
  {
    title: "活动单位",
    dataIndex: "org",
    key: "org"
  },
  {
    title: "活动时间",
    dataIndex: "startTime",
    key: "startTime",
    customRender: ({ text, record }) => {
      return text ? formatDate(text) + " 至 " + formatDate(record.endTime) : ""
    }
  },
  {
    title: "活动地址",
    dataIndex: "address",
    key: "address"
  },
  {
    title: "专家组长",
    dataIndex: "leaders",
    key: "leaders"
  },
  {
    title: "专家组员",
    dataIndex: "members",
    key: "members"
  },
  {
    title: "活动状态",
    dataIndex: "status",
    key: "status",
    customRender: ({ text }) => {
      let statusName = ""
      if (text == "UNCOMPLETED") {
        statusName = "待开始"
      } else if (text == "COMPLETED") {
        statusName = "已结束"
      }
      return statusName
    }
  },
  {
    title: "操作",
    dataIndex: "handle",
    key: "handle",
    width: 150
  }
])

// 数据加载
onMounted(() => {
  getDataSource()
})
const dataSource = ref<dataItemType[]>([])
const getDataSource = (flag?: boolean) => {
  if (flag) {
    pagination.current = 1
  }
  const params = {
    ...queryFrom,
    current: pagination.current,
    size: pagination.pageSize
  }
  spinning.value = true
  actPageList(params)
    .then((res: any) => {
      spinning.value = false
      dataSource.value = res.records || []
      pagination.total = res.total
    })
    .catch(() => {
      spinning.value = false
    })
}

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

//  确认弹窗
const openConfirm = (title: string, content?: string) => {
  return new Promise((resolve) => {
    Modal.confirm({
      title,
      content,
      icon: createVNode(ExclamationCircleOutlined),
      onOk() {
        resolve("")
      },
      class: "test"
    })
  })
}

// 新增、编辑、详情
const detailKey = ref<number>()
const detail = ref()
const goDetail = (title: string, rowId: string, isEdit: boolean) => {
  detailKey.value = new Date().getTime()
  nextTick(() => {
    detail.value.openModal(title, rowId, isEdit)
  })
}

const log = ref()
const showLog = (id: string) => {
  log.value.openModal(id)
}

// 评价
const evaluate = ref()
const evaluateKey = ref()
const goEvaluate = (id: string) => {
  evaluateKey.value = new Date().getTime()
  nextTick(() => {
    evaluate.value.openModal(id)
  })
}

// 删除
const delRow = (rowId: string) => {
  openConfirm("是否确认删除活动信息？", "删除之后将抹除所有专家与此活动相关的历史记录").then(() => {
    actDelById(rowId).then((res) => {
      message.success("已删除")
      getDataSource()
    })
  })
}
</script>

<style scoped lang="less"></style>
