<template>
  <a-spin :spinning="spinning" tip="Loading...">
    <div class="query-form-wrap">
      <a-space>
        <a-date-picker
          v-model:value="queryFrom.annual"
          picker="year"
          value-format="YYYY"
          @change="getDataSource(true)"
        />
        <a-input-search
          v-model:value="queryFrom.q"
          style="width: 300px"
          placeholder="请输入人员姓名/证据号码查询"
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
            <a-button type="primary" size="small" @click="showLog(record.id)">日志</a-button>
            <a-button
              v-auth="'further::education::update'"
              type="primary"
              size="small"
              @click="editRow(record.id)"
            >
              编辑
            </a-button>
            <a-button
              v-auth="'further::education::delete'"
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

    <Detail ref="detail" :key="updateKey" @update-list="getDataSource" />
    <ImportModal ref="importModal" :key="importKey" @update-list="getDataSource" />
    <Log ref="log" />
  </a-spin>
</template>

<script setup lang="ts">
import { ExclamationCircleOutlined } from "@ant-design/icons-vue"
import { reactive, ref, createVNode, onMounted, nextTick, inject } from "vue"
import { Modal, message } from "ant-design-vue"
import type { TableColumnType, PaginationProps } from "ant-design-vue"
import dayjs from "dayjs"
import Detail from "./components/Detail.vue"
import ImportModal from "./components/ImportModal.vue"
import { pageListApi, deleteApi } from "@/api/continuingEducationHours.api"
import Log from "@/components/log/index.vue"

const spinning = ref<boolean>(false)
const queryFrom = reactive({
  annual: "",
  q: ""
})

onMounted(() => {
  getDataSource()
})

// 表格列
const columns = reactive<TableColumnType[]>([
  {
    title: "序号",
    dataIndex: "index",
    width: 50,
    customRender: function ({ index }) {
      return index + 1
    }
  },
  {
    title: "姓名",
    dataIndex: "orgPersonName",
    key: "orgPersonName"
  },
  {
    title: "证件号码",
    dataIndex: "idNum",
    key: "idNum"
  },
  {
    title: "培训项目",
    dataIndex: "trainItem",
    key: "trainItem"
  },
  {
    title: "培训地点",
    dataIndex: "trainLocation",
    key: "trainLocation"
  },
  {
    title: "年度",
    dataIndex: "annual",
    key: "annual"
  },
  {
    title: "培训时间",
    dataIndex: "trainTime",
    key: "trainTime"
  },
  {
    title: "学时",
    dataIndex: "hours",
    key: "hours"
  },
  {
    title: "备注",
    dataIndex: "remark",
    key: "remark"
  },
  {
    title: "操作",
    dataIndex: "handle",
    key: "handle",
    align: "center"
  }
])
const dataSource = ref<any[]>([])
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
  pageListApi(param)
    .then((res: any) => {
      const list = res.records || []
      spinning.value = false
      for (let i = 0; i < list.length; i++) {
        list[i].trainTime =
          dayjs(list[i].trainTime).format("YYYY-MM-DD") +
          " 至 " +
          dayjs(list[i].trainTimeEnd).format("YYYY-MM-DD")
      }
      dataSource.value = list
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
    authCode: "further::education::add",
    click: () => {
      editRow("")
    }
  },
  {
    btnName: "导入",
    authCode: "further::education::import",
    click: () => {
      importFun()
    }
  }
])

// 导入
const importModal = ref()
const importKey = ref("")
const importFun = () => {
  importKey.value = new Date().getTime() + ""
  nextTick(() => {
    importModal.value.openModal()
  })
}

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

// 删除
const delRow = (rowId: string) => {
  openConfirm("确认删除这条数据吗？").then(() => {
    deleteApi(rowId).then(() => {
      message.success("删除成功")
      getDataSource()
    })
  })
}

//  日志
const log = ref()
const showLog = (id: string) => {
  log.value.openModal(id)
}
</script>

<style scoped lang="less"></style>
