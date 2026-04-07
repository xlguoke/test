<template>
  <a-spin tip="加载中..." :spinning="spinning">
    <div>
      <a-row class="action_row">
        <div class="lt">
          <a-input-group compact style="width: 380px">
            <a-select v-model:value="queryForm.name" style="width: 100px">
              <a-select-option value="">全部</a-select-option>
              <a-select-option value="kind">任务类型</a-select-option>
              <a-select-option value="owner">发起人</a-select-option>
              <a-select-option value="phone">发起人电话</a-select-option>
              <a-select-option value="org">发起人机构</a-select-option>
            </a-select>
            <a-input-search
              v-model:value="queryForm.value"
              placeholder="请输入..."
              enter-button
              style="width: 220px"
              @search="onSearch"
            />
          </a-input-group>
        </div>
      </a-row>
      <a-table
        :data-source="dataSource"
        :columns="columns"
        bordered
        size="small"
        :pagination="pagination"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'handle'">
            <a-space>
              <a-button
                v-if="record.state == 'REJECTED'"
                v-auth="'act::assignment::notify'"
                size="small"
                type="primary"
                @click="sendMessage(record)"
              >
                发送短信
              </a-button>

              <a-button
                v-if="record.state == 'APPROVED' && record.kind == 'ORG_REG'"
                v-auth="'act::assignment::createAccoun'"
                size="small"
                @click="createAccount(record)"
              >
                创建账号
              </a-button>

              <a-button size="small" type="primary" @click="openCheckDetails(record)">
                查看
              </a-button>
              <a-button size="small" @click="showLog(record)">日志</a-button>
            </a-space>
          </template>
          <template v-if="column.key === 'assignedAt'">
            <span>{{ formatDate(record.assignedAt) }}</span>
          </template>
          <template v-if="column.key === 'applicant'">{{ record.applicant.name }}</template>
          <template v-if="column.key === 'phone'">{{ record.applicant.phone }}</template>
          <template v-if="column.key === 'orgName'">{{ record.applicant.orgName }}</template>

          <template v-if="column.key === 'category'">
            <a-tag v-if="record.category == 'audits'" color="blue">审批</a-tag>
            <a-tag v-else-if="record.category == 'todo'" color="green">待办</a-tag>
          </template>

          <template v-if="column.key === 'state'">
            <a-tag v-if="record.state == 'APPROVED'" color="green">通过</a-tag>
            <a-tag v-else color="orange">不通过</a-tag>
          </template>

          <template v-if="column.key === 'opinion'">
            <a-tooltip placement="left" :title="record.opinion" arrow-point-at-center>
              <p class="text_css">
                {{ record.opinion }}
              </p>
            </a-tooltip>
          </template>
        </template>
      </a-table>
    </div>
    <auditDetails :id="sleApplyId" v-model:visible="visibleAuditDetails" :kind="auditKind" />
    <Log ref="log" />
  </a-spin>
</template>
<script lang="ts" setup>
import { getCheckFinishListAPI, sendMessageAPI, orgCreateAccountAPI } from "@/api/infoCheck.api"
import { message } from "ant-design-vue"
import type { checkPendingQuery } from "@/type/api/infoCheck.api"
import { ref, onMounted } from "vue"
import { formatDate } from "@/assets/js/common"
import { getAlterBaseInfo } from "@/api/laboratory.api"

import Log from "@/components/log/index.vue"

import auditDetails from "../components/AuditDetails.vue"

let sleApplyId = ref("")
let visibleAuditDetails = ref(false)
let auditKind = ref("")

let spinning = ref(false)

let queryForm = ref<checkPendingQuery>({
  current: 1,
  size: 10,
  category: "audits",
  name: "",
  value: ""
})
let pagination = ref({
  size: "small",
  showTotal: (total: number) => `共 ${total} 条数据`,
  showQuickJumper: true,
  showSizeChanger: true,
  total: 0,
  pageSizeOptions: ["10", "20", "50", "100"],
  onChange: (page: number, pageSize: number) => {
    queryForm.value.current = page
    queryForm.value.size = pageSize
    getCheckPendingList()
  }
})
onMounted(() => {
  getCheckPendingList()
})
const sendMessage = async (row) => {
  spinning.value = true
  try {
    let res = await sendMessageAPI(row.taskId)
    message.success(res.msg || "操作成功")
  } catch (error) {
    // alert(error)
    spinning.value = false
  }
  spinning.value = false
}
const createAccount = async (row) => {
  spinning.value = true
  try {
    let res = await orgCreateAccountAPI(row.id)
    message.success(res.msg || "操作成功")
  } catch (error) {
    // alert(error)
    spinning.value = false
  }
  spinning.value = false
}
// 日志
const log = ref()
const showLog = async (row) => {
  if (row.kind == "AMEND") {
    //查变更日志，先要拿申请变更id 获取试验室id
    let res: any = await getAlterBaseInfo(row.id)
    log.value.openModal(res.preChangeData.id)
  } else {
    log.value.openModal(row.id)
  }
}

const onSearch = () => {
  getCheckPendingList()
}

const getCheckPendingList = async () => {
  spinning.value = true
  try {
    let res: any = await getCheckFinishListAPI(queryForm.value)
    spinning.value = false
    pagination.value.total = res.total
    dataSource.value = res.records
  } catch {
    spinning.value = false
  }
}

const openCheckDetails = (item: any) => {
  sleApplyId.value = item.id
  auditKind.value = item.kind
  visibleAuditDetails.value = true
}

let dataSource = ref([])

let columns = [
  {
    title: "申请名称",
    dataIndex: "name",
    key: "name"
  },
  {
    title: "申请类型",
    dataIndex: "category",
    key: "category"
  },
  {
    title: "申请信息",
    dataIndex: "description",
    key: "description"
  },
  {
    title: "机构名称",
    dataIndex: "orgName",
    key: "orgName"
  },
  {
    title: "申请人",
    dataIndex: "applicant",
    key: "applicant"
  },
  {
    title: "联系电话",
    dataIndex: "phone",
    key: "phone"
  },
  {
    title: "申请时间",
    dataIndex: "assignedAt",
    key: "assignedAt"
  },
  {
    title: "审核结果",
    dataIndex: "state",
    key: "state"
  },
  {
    title: "审核意见",
    dataIndex: "opinion",
    key: "opinion"
  },
  {
    title: "操作",
    key: "handle"
  }
]
</script>
<style lang="less" scoped>
.action_row {
  row-gap: 0px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
}
.text_css {
  width: 200px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
  cursor: pointer;
}
</style>
