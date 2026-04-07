<template>
  <a-spin :spinning="spinning" tip="Loading...">
    <div class="query-form-wrap">
      <a-space>
        <common-select
          v-if="userInfo.type != 'ORG'"
          v-model:value="queryFrom.orgId"
          :url="orgList()"
          placeholder="请选择检测机构"
          :config="{
            keyword: 'orgName',
            httpSearch: true
          }"
        />
        <a-input-search
          v-model:value="queryFrom.keyword"
          style="width: 400px"
          placeholder="输入设备编号/设备名称/标准设备名称/生产厂家查询"
          enter-button
          @search="getDataSource(true)"
        />
      </a-space>
      <HandleBtns :datas="btnsList" />
      <!-- <a-upload
        :custom-request="customRequest"
        :show-upload-list="false"
        name="file"
        accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      >
        <a-button v-if="!props.details">导入</a-button>
      </a-upload> -->
    </div>

    <a-table
      :data-source="dataSource"
      :columns="columns"
      :pagination="pagination"
      :row-selection="rowSelection"
      size="small"
      bordered
      row-key="id"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key == 'handle'">
          <a-space>
            <a-button
              v-auth="'equipment::getFullInfo'"
              type="primary"
              size="small"
              @click="goDetail(record.id)"
            >
              详情
            </a-button>
            <a-button
              v-auth="'equipment::edit'"
              type="primary"
              size="small"
              @click="goEdit(record)"
            >
              编辑
            </a-button>
            <a-button
              v-auth="'equipment::edit'"
              type="primary"
              danger
              size="small"
              @click="handleDelete([record.id])"
            >
              删除
            </a-button>
          </a-space>
        </template>
      </template>
    </a-table>

    <Detail ref="detail" />
    <AddEdit ref="addEditRef" @load="getDataSource" />
    <ImportModel ref="importModelRef" @success-ok="getDataSource" />
  </a-spin>
</template>

<script setup lang="ts">
import { ExclamationCircleOutlined } from "@ant-design/icons-vue"
import { reactive, ref, createVNode, onMounted, inject } from "vue"
import { message, Modal } from "ant-design-vue"
import Detail from "./components/Detail.vue"
import AddEdit from "./components/AddEdit.vue"
import { deleteEquipment, getPageList } from "@/api/equipment.api"
import { orgList } from "@/api/commonSelect.api"
import CommonSelect from "@/components/commonSelect/index.vue"
import ImportModel from "./components/ImportModel.vue"
import type { btnsType } from "@/type/common/common"
import type { TableColumnType, PaginationProps } from "ant-design-vue"
import userStore from "@/stores/userInfo"
const { userInfo } = userStore()

const spinning = ref<boolean>(false)
const queryFrom = reactive({
  keyword: "",
  orgId: ""
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
    title: "设备编号",
    dataIndex: "sn",
    key: "sn",
    customCell: (record) => {
      return { style: { "white-space": "pre" } }
    }
  },
  {
    title: "设备名称",
    dataIndex: "name",
    key: "name"
  },
  {
    title: "生产厂家",
    dataIndex: "manufacturer",
    key: "manufacturer"
  },
  {
    title: "规格型号",
    dataIndex: "specification",
    key: "specification"
  },
  {
    title: "精准度",
    dataIndex: "accuracy",
    key: "accuracy"
  },
  {
    title: "设备使用状态",
    dataIndex: "useStatus",
    key: "useStatus"
  },
  {
    title: "操作",
    dataIndex: "handle",
    key: "handle",
    width: 180
  }
])
const dataSource = ref([])
// 选中的行
const selectedRows = ref<any[]>([])
const selectedRowKeys = ref<string[]>([])
// 行选择
const rowSelection = {
  selectedRowKeys,
  onChange: (_selectedRowKeys: string[], _selectedRows: any[]) => {
    selectedRows.value = _selectedRows
    selectedRowKeys.value = _selectedRowKeys
  }
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

// 新增/编辑弹窗
const addEditRef = ref()
// 导入弹窗
const importModelRef = ref()

// 批量操作按钮
const btnsList = reactive<btnsType[]>([
  {
    btnName: "新增",
    authCode: "equipment::edit",
    click: () => {
      addEditRef.value.openModal()
    }
  },
  {
    btnName: "导入",
    authCode: "equipment::edit",
    click: () => {
      importModelRef.value.openModel()
    }
  },
  {
    btnName: "批量删除",
    authCode: "equipment::edit",
    click: () => {
      handleBatchDelete()
    }
  }
  // {
  //   btnName: "更新同步",
  //   authCode: "*",
  //   syncType: "EQUIPMENT",
  //   click: () => {
  //     getDataSource(true)
  //   }
  // }
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
const detail = ref()
const goDetail = (rowId: string) => {
  detail.value.openModal(rowId)
}

// 编辑
const goEdit = (row: any) => {
  addEditRef.value.openModal(row)
}

// 批量删除
function handleBatchDelete() {
  const keys = selectedRowKeys.value
  if (!keys || keys.length === 0) {
    message.warning("请选择要删除的设备")
    return
  }
  handleDelete(keys)
}

// 删除
function handleDelete(idss: string[]) {
  Modal.confirm({
    title: "确认删除吗？",
    icon: createVNode(ExclamationCircleOutlined),
    centered: true,
    onOk() {
      spinning.value = true
      deleteEquipment(idss)
        .then(() => {
          getDataSource(true)
          message.success("删除成功")
        })
        .finally(() => {
          spinning.value = false
        })
    }
  })
}
</script>

<style scoped lang="less"></style>
