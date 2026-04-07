<template>
  <a-spin :spinning="spinning" tip="Loading...">
    <div class="query-form-wrap">
      <a-space>
        <common-select
          v-model:value="queryFrom.projectId"
          :url="projectPages()"
          :config="{
            placeholder: '请选择工程项目'
          }"
          @change="
            () => {
              queryFrom.laboratoryId = ''
            }
          "
        />
        <common-select
          v-model:value="queryFrom.laboratoryId"
          :url="userAuthLab(queryFrom.projectId)"
          :config="{
            placeholder: '请选择试验室'
          }"
          @change="changeLab"
        />
        <a-range-picker
          v-model:value="queryFrom.date"
          style="min-width: 220px"
          value-format="YYYY-MM-DD"
        />
        <a-select
          v-model:value="queryFrom.isQualified"
          allow-clear
          placeholder="是否合格"
          style="min-width: 100px"
        >
          <a-select-option value="true">是</a-select-option>
          <a-select-option value="false">否</a-select-option>
        </a-select>
        <a-select
          v-model:value="queryFrom.deleted"
          allow-clear
          placeholder="是否删除"
          style="min-width: 100px"
        >
          <a-select-option value="true">是</a-select-option>
          <a-select-option value="false">否</a-select-option>
        </a-select>
        <a-input-search
          v-model:value="queryFrom.eqSn"
          placeholder="请输入设备编号查询"
          enter-button
          @search="getDataSource(true)"
        />
      </a-space>
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
            <a-button
              v-show="!record.deleted"
              v-auth="'collect::data::view'"
              type="primary"
              size="small"
              @click="editRow(record)"
            >
              详情
            </a-button>
            <a-button
              v-auth="'collect::data::view::log'"
              type="primary"
              size="small"
              @click="showLog(record.id)"
            >
              日志
            </a-button>

            <a-button
              v-auth="'collect::data::physics::delete'"
              type="primary"
              danger
              size="small"
              @click="delRow(record.id, true)"
            >
              强制删除
            </a-button>

            <a-button
              v-show="!record.deleted"
              v-auth="'collect::data::delete'"
              type="primary"
              danger
              size="small"
              @click="delRow(record.id, false)"
            >
              删除
            </a-button>
          </a-space>
        </template>
      </template>
    </a-table>

    <Detail ref="detail" :key="updateKey" @update-list="getDataSource" />

    <Log ref="log" />

    <a-modal
      v-model:visible="visible"
      title="删除采集数据"
      :mask-closable="false"
      :keyboard="false"
      :comfirm-loading="loading"
      width="900px"
      @ok="confirmDel"
    >
      <a-form ref="formRef" :model="delForm" :label-col="{ span: 5 }" :wrapper-col="{ span: 16 }">
        <a-form-item
          label="删除原因"
          name="deleteCode"
          :rules="[{ required: true, message: '请选择删除原因' }]"
        >
          <DictCode
            v-model:value="delForm.deleteCode"
            code="collect::data::delType"
            placeholder="请选择删除原因"
            @change="
              () => {
                delForm.deleteDesc = delForm.deleteCode + '，'
              }
            "
          />
        </a-form-item>
        <a-form-item
          label="删除描述"
          name="deleteDesc"
          :rules="[{ required: true, message: '请输入删除描述' }]"
        >
          <a-textarea
            v-model:value="delForm.deleteDesc"
            :auto-size="{ minRows: 6, maxRows: 15 }"
            placeholder="请输入删除描述"
          ></a-textarea>
        </a-form-item>
      </a-form>
    </a-modal>
  </a-spin>
</template>

<script setup lang="ts">
import { ExclamationCircleOutlined } from "@ant-design/icons-vue"
import { reactive, ref, createVNode, onMounted, nextTick, inject } from "vue"
import { Modal, FormInstance, message } from "ant-design-vue"
import type { TableColumnType, PaginationProps } from "ant-design-vue"
import { testPageList, testDelAPI, testDelAPIForce } from "@/api/dataMonitoring.api"
import type { testDataItemType, testQueryParType } from "@/type/api/dataMonitoring.api"
import { projectPages, userAuthLab } from "@/api/commonSelect.api"
import Log from "@/components/log/index.vue"
import DictCode from "@/components/dictCode/index.vue"
import CommonSelect from "@/components/commonSelect/index.vue"
import Detail from "./components/Detail.vue"
import { formatDate } from "@/assets/js/common"

const spinning = ref<boolean>(false)
const queryFrom = reactive({
  projectId: "",
  laboratoryId: "",
  deleted: null,
  isQualified: null,
  eqSn: "",
  collectTimeStart: "",
  collectTimeEnd: "",
  date: []
})

onMounted(() => {
  getDataSource()
})

// 修改试验室
const changeLab = ({ option }) => {
  if (!queryFrom.projectId || queryFrom.projectId != option.projectId) {
    queryFrom.projectId = option.projectId
  }
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
    title: "设备类型",
    dataIndex: "eqType",
    key: "eqType"
  },
  {
    title: "试验室名称",
    dataIndex: "laboratoryName",
    key: "laboratoryName"
  },
  {
    title: "设备编号",
    dataIndex: "eqSn",
    key: "eqSn"
  },
  {
    title: "规格型号",
    dataIndex: "eqModel",
    key: "eqModel"
  },
  {
    title: "数据类型",
    dataIndex: "collectType",
    key: "collectType"
  },
  {
    title: "采集时间",
    dataIndex: "collectTime",
    key: "collectTime",
    customRender: ({ text }) => {
      return text ? formatDate(text) : ""
    }
  },
  {
    title: "是否合格",
    dataIndex: "isQualified",
    key: "isQualified",
    customRender: ({ text }) => {
      return text ? "是" : "否"
    }
  },
  {
    title: "是否删除",
    dataIndex: "deleted",
    key: "deleted",
    customRender: ({ text }) => {
      return text ? "是" : "否"
    }
  },
  {
    title: "操作",
    dataIndex: "handle",
    key: "handle",
    width: 120,
    fixed: "right"
  }
])
const dataSource = ref<testDataItemType[]>([])
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
  const param: testQueryParType = {
    current: pagination.current,
    size: pagination.pageSize,
    ...queryFrom
  }
  if (queryFrom.date && queryFrom.date.length) {
    param.collectTimeStart = queryFrom.date[0]
    param.collectTimeEnd = queryFrom.date[1]
  }
  delete param.date
  spinning.value = true
  testPageList(param)
    .then((res: any) => {
      spinning.value = false
      if (!res) return
      dataSource.value = res.records
      pagination.total = res.total
    })
    .catch(() => {
      spinning.value = false
    })
}

//  确认弹窗
const openConfirm = (title: string, content: string) => {
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

const detail = ref()
const updateKey = ref()
// 保存-编辑
const editRow = (obj: testDataItemType) => {
  updateKey.value = new Date().getTime()
  nextTick(() => {
    detail.value.openModal(obj.id, obj.collectItemId)
  })
}

// 日志
const log = ref()
const showLog = (rowId: string) => {
  log.value.openModal(rowId)
}

const visible = ref<boolean>(false)
const delForm = ref({
  id: "",
  deleteCode: "",
  deleteDesc: ""
})
// 删除
const delRow = (rowId: string, isForce: boolean) => {
  delForm.value = {
    id: "",
    deleteCode: "",
    deleteDesc: ""
  }
  delForm.value.id = rowId
  visible.value = true
  isDelForce.value = isForce
}
// 确认删除
const loading = ref<boolean>(false)
const isDelForce = ref<boolean>(false)
const formRef = ref<FormInstance>()
const confirmDel = async () => {
  await (formRef.value as FormInstance)?.validateFields()
  loading.value = true
  if (isDelForce.value) {
    await testDelAPIForce(delForm.value)
  } else {
    await testDelAPI(delForm.value)
  }
  message.success("删除成功")
  visible.value = false
  getDataSource()
}
</script>

<style scoped lang="less"></style>
