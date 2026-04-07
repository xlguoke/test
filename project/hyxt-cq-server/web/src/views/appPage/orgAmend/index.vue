<template>
  <a-spin :spinning="spinning" tip="Loading...">
    <div class="query-form-wrap">
      <a-space>
        <a-select
          v-model:value="queryFrom.status"
          allow-clear
          placeholder="请选择状态"
          @change="onSearch"
        >
          <a-select-option v-for="item in NODE_STATUS_DICT" :key="item.value" :value="item.value">
            {{ item.label }}
          </a-select-option>
        </a-select>
        <a-range-picker
          v-model:value="queryFrom.createDate"
          value-format="YYYY-MM-DD"
          :placeholder="['创建开始时间', '创建结束时间']"
          @change="onSearch"
        />
        <a-input-search
          v-model:value="queryFrom.q"
          style="width: 300px"
          placeholder="请输入机构名称"
          enter-button
          allow-clear
          @search="onSearch"
        />
      </a-space>
      <HandleBtns :datas="btnsList" />
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
            <!-- 系统管理员不允许发起机构信息变更 -->
            <template v-if="!isAdmin">
              <a-button
                v-if="record.status === NODE_STATUS.IN_FILLING"
                v-auth="'org::amend::edit'"
                type="primary"
                size="small"
                @click="handleSubmit(record.id)"
              >
                提交
              </a-button>
              <a-button
                v-if="record.status === NODE_STATUS.IN_FILLING"
                v-auth="'org::amend::edit'"
                type="primary"
                size="small"
                @click="handleEdit(record.id)"
              >
                编辑
              </a-button>
              <a-button
                v-if="record.status === NODE_STATUS.PENDING_EXECUTION"
                v-auth="'org::amend::edit'"
                type="primary"
                size="small"
                @click="handleCompleted(record.id)"
              >
                办结
              </a-button>
              <a-button
                v-if="record.status === NODE_STATUS.IN_FILLING"
                v-auth="'org::amend::edit'"
                type="danger"
                size="small"
                @click="deleteRow(record.id)"
              >
                删除
              </a-button>
            </template>
            <a-button
              v-if="isAdmin || record.status !== NODE_STATUS.IN_FILLING"
              v-auth="'org::amend::edit'"
              type="primary"
              size="small"
              @click="handleDetail(record.id)"
            >
              详情
            </a-button>
            <a-button type="primary" size="small" @click="showLog(record.id)">日志</a-button>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 详情 -->
    <Detail ref="detailRef" @confirm="getDataSource" />
    <!-- 办结 -->
    <ConfirmCompleted ref="confirmCompletedRef" @confirm="getDataSource" />
    <!-- 日志 -->
    <Log ref="logRef" />
  </a-spin>
</template>

<script setup lang="ts">
import dayjs from "dayjs"
import { reactive, ref, createVNode, onMounted, inject, computed } from "vue"
import { message, Modal } from "ant-design-vue"
import { ExclamationCircleOutlined } from "@ant-design/icons-vue"
import type { TableColumnType, PaginationProps } from "ant-design-vue"
import type { btnsType } from "@/type/common/common"
import { ListParam } from "@/type/api/orgAmend.api"
import { deleteApi, exportApi, pageListApi, submitApi } from "@/api/orgAmend.api"
import { downloadFile } from "@/assets/js/common"
import { NODE_STATUS, NODE_STATUS_DICT } from "."
import Detail from "./components/Detail.vue"
import ConfirmCompleted from "./components/ConfirmCompleted.vue"
import Log from "@/components/log/index.vue"

import userStores from "@/stores/userInfo"

const { userInfo } = userStores()

const spinning = ref<boolean>(false)
const queryFrom = reactive<ListParam>({
  status: null,
  q: ""
})
const isAdmin = computed(() => {
  return userInfo.type === "SYS"
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
    title: "机构名称",
    dataIndex: "orgName",
    key: "orgName"
  },
  {
    title: "变更内容",
    dataIndex: "amendContent",
    key: "amendContent",
    customRender: ({ text }) => {
      return text ? text.join("、") : ""
    }
  },
  {
    title: "创建人",
    dataIndex: "creator",
    key: "creator"
  },
  {
    title: "创建日期",
    dataIndex: "createdAt",
    key: "createdAt",
    customRender: ({ text }) => {
      return text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : ""
    }
  },
  {
    title: "状态",
    dataIndex: "status",
    key: "status",
    customRender: ({ text }) => {
      return NODE_STATUS_DICT.find((item) => item.value === text)?.label
    }
  },
  {
    title: "操作",
    dataIndex: "handle",
    key: "handle"
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

/**
 * 查询
 */
function onSearch() {
  pagination.current = 1
  getDataSource()
}

/**
 * 列表查询参数
 */
function initQuery() {
  const param: ListParam = {
    current: pagination.current,
    size: pagination.pageSize,
    ...queryFrom,
    status: queryFrom.status || ""
  }
  if (param.createDate && param.createDate.length > 0) {
    param.createAtStart = param.createDate[0]
    param.createAtEnd = param.createDate[1]
  }
  delete param.createDate
  return param
}

/**
 * 列表数据
 */
const getDataSource = () => {
  const param: ListParam = initQuery()
  spinning.value = true
  pageListApi(param)
    .then((res: any) => {
      spinning.value = false
      dataSource.value = res.records || []
      pagination.total = res.total
    })
    .catch(() => {
      spinning.value = false
    })
}

const detailRef = ref()
const exportLoading = ref(false)

// 批量操作按钮
const btnsList = reactive<btnsType[]>([
  {
    btnName: "新增",
    authCode: "org::amend::edit",
    isHide: isAdmin,
    click: () => {
      detailRef.value.openModal()
    }
  },
  {
    btnName: "导出Excel",
    authCode: "org::amend::export",
    loading: exportLoading,
    click: async () => {
      try {
        exportLoading.value = true
        const data = await exportApi(initQuery())
        const d = dayjs(Date.now()).format("YYYY-MM-DD HH:mm:ss")
        downloadFile(data, `机构变更-${d.replace(" ", "_").replace(/\:/g, "")}.xlsx`)
      } finally {
        setTimeout(() => {
          exportLoading.value = false
        }, 1000)
      }
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

// 查看详情
function handleDetail(rowId: string) {
  detailRef.value.openModal(rowId, true)
}

/** 编辑 */
function handleEdit(rowId: string) {
  detailRef.value.openModal(rowId)
}

/**
 * 办结
 */
const confirmCompletedRef = ref()
function handleCompleted(rowId: string) {
  confirmCompletedRef.value.openModal(rowId)
}

/**
 * 提交
 */
function handleSubmit(rowId: string) {
  openConfirm("确定提交该数据吗？").then(() => {
    spinning.value = true
    submitApi(rowId)
      .then(() => {
        message.success("提交成功")
        getDataSource()
      })
      .catch(() => {
        spinning.value = false
      })
  })
}

// 删除
function deleteRow(rowId: string) {
  openConfirm("确定删除该数据吗？").then(() => {
    spinning.value = true
    deleteApi(rowId)
      .then(() => {
        message.success("删除成功")
        getDataSource()
      })
      .catch(() => {
        spinning.value = false
      })
  })
}

// 日志
const logRef = ref()
const showLog = (id: string) => {
  logRef.value.openModal(id)
}
</script>

<style scoped lang="less"></style>
