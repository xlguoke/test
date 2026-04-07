<template>
  <a-spin tip="加载中..." :spinning="spinning">
    <div>
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
              <a-button size="small" type="primary" @click="openCheckModal(record)">
                查看资料
              </a-button>
            </a-space>
          </template>
          <template v-if="column.key === 'applicationTime'">
            <span>{{ formatDate(record.applicationTime) }}</span>
          </template>
          <template v-if="column.key === 'completeTime'">
            <span>{{ formatDate(record.completeTime) }}</span>
          </template>
        </template>
      </a-table>

      <a-modal
        v-model:visible="visible"
        title="资料详情"
        :mask-closable="false"
        :keyboard="false"
        width="70%"
      >
        <MaterialAlter v-if="visible" :alter-id="alterId" :details="true" />
        <template #footer>
          <a-button @click="visible = false">关闭</a-button>
        </template>
      </a-modal>
    </div>
  </a-spin>
</template>
<script lang="ts" setup>
import { getRecordAlterLogsAPI } from "@/api/laboratory.api"
import type { checkPendingQuery } from "@/type/api/infoCheck.api"
import { ref, onMounted, toRefs } from "vue"
import { formatDate } from "@/assets/js/common"
import MaterialAlter from "./materialAlter.vue"

let spinning = ref(false)

let visible = ref(false)
let props = defineProps({
  labId: {
    type: String,
    required: true
  }
})

const { labId } = toRefs(props) //父组件参数

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

const getCheckPendingList = async () => {
  spinning.value = true
  try {
    let res: any = await getRecordAlterLogsAPI(labId.value)
    spinning.value = false
    pagination.value.total = res.total
    dataSource.value = res.records
  } catch {
    spinning.value = false
  }
}
let handleAuditRef = ref()

let alterId = ref("")
// 审批
const openCheckModal = (item: any) => {
  alterId.value = item.applyId
  visible.value = true
}

let dataSource = ref([])

let columns = [
  {
    title: "变更内容",
    dataIndex: "amendContent",
    key: "amendContent"
  },
  {
    title: "提交人员",
    dataIndex: "applicant",
    key: "applicant"
  },
  {
    title: "提交时间",
    dataIndex: "applicationTime",
    key: "applicationTime"
  },
  {
    title: "建设单位审核人",
    dataIndex: "pcmAuditor",
    key: "pcmAuditor"
  },
  {
    title: "监督机构审核人",
    dataIndex: "pscAuditor",
    key: "pscAuditor"
  },
  {
    title: "通过时间",
    dataIndex: "completeTime",
    key: "completeTime"
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
