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
              <a-button size="small" type="primary" @click="openCheckDetails(record)">
                查看
              </a-button>
              <a-button size="small" type="primary" @click="openCheckModal(record)">
                <template v-if="record.kind === 'ORG_AMEND_REVIEW'">阅示</template>
                <template v-else-if="record.kind === 'ORG_AMEND_PROCESSING'">阅处</template>
                <template v-else>审核</template>
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
        </template>
      </a-table>
    </div>
    <handleAudit ref="handleAuditRef" @audit-ok="handleApprovedOk" />
    <auditDetails :id="sleApplyId" v-model:visible="visibleAuditDetails" :kind="auditKind" />
    <Log ref="log" />
  </a-spin>
</template>
<script lang="ts" setup>
import { getCheckPendingListAPI } from "@/api/infoCheck.api"
import { getAlterBaseInfo } from "@/api/laboratory.api"
import type { checkPendingQuery } from "@/type/api/infoCheck.api"
import { ref, onMounted } from "vue"
import { formatDate } from "@/assets/js/common"
import Log from "@/components/log/index.vue"
import handleAudit from "../components/HandlAudit.vue"
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
    let res: any = await getCheckPendingListAPI(queryForm.value)
    spinning.value = false
    pagination.value.total = res.total
    dataSource.value = res.records
  } catch {
    spinning.value = false
  }
}
let handleAuditRef = ref()

// 审批
const openCheckModal = (item: any) => {
  // checkVisible.value = true
  handleAuditRef.value.openModel(item)
}
// let checkVisible = ref(false)
const handleApprovedOk = async () => {
  // handleAuditRef.value.openModel(dataItem.value)
  getCheckPendingList()
}

// 工地试验室审核数据类型
// const labAuditType = ["KEEP", "AMEND", "DELAY", "REVOKE"]
const openCheckDetails = async (item: any) => {
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
</style>
