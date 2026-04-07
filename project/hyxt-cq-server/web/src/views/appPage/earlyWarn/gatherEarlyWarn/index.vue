<template>
  <div>
    <a-spin tip="加载中..." :spinning="spinning">
      <a-row class="action_row">
        <div class="lt">
          <a-space>
            <common-select
              v-model:value="queryFrom.labId"
              :url="userAuthLab()"
              :config="{
                placeholder: '请选择试验室'
              }"
              @change="getEarlyWarnList()"
            />
            <a-range-picker
              v-model:value="dateRangeValue"
              :placeholder="['开始时间', '结束时间']"
              style="width: 298px"
              @change="changeRangeValue"
            />
            <a-select
              ref="select"
              v-model:value="queryFrom.status"
              style="width: 180px"
              placeholder="请选择状态"
              @change="statusChange"
            >
              <a-select-option value="">全部状态</a-select-option>
              <a-select-option value="PENDING">待处理</a-select-option>
              <a-select-option value="HANDLED">已处理</a-select-option>
              <a-select-option value="REJECTED">已退回</a-select-option>
              <a-select-option
                v-if="
                  ($route.meta.auths as any)
                    .map((item) => {
                      return item.code
                    })
                    .indexOf('alarms::analysis:deleted::visible') != -1
                "
                value="DELETED"
              >
                已删除
              </a-select-option>
            </a-select>
          </a-space>
        </div>
        <div class="rt">
          <a-space>
            <a-button
              v-auth="'alarms::collect::analysis'"
              type="primary"
              @click="visibleAnalyse = true"
            >
              立即分析
            </a-button>
          </a-space>
        </div>
      </a-row>
      <a-table
        :data-source="dataSource"
        :columns="columns"
        bordered
        size="small"
        :row-selection="rowSelection"
        :pagination="pagination"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'handle'">
            <a-space>
              <a-button
                v-if="record.status == '已处理'"
                size="small"
                type="primary"
                @click="openDisposeDetModel(record)"
              >
                查看方案
              </a-button>

              <a-button
                v-if="record.status == '待处理' || record.status == '被退回'"
                v-auth="'alarms::analysis:scheme::add'"
                size="small"
                type="primary"
                @click="openDisposeModel(record)"
              >
                处理
              </a-button>

              <a-button
                v-if="record.status == '已处理'"
                v-auth="'alarms::analysis:scheme::reject'"
                size="small"
                @click="rollbackRow(record)"
              >
                退回
              </a-button>

              <a-button
                v-if="record.status != '已删除'"
                v-auth="'alarms::analysis::del'"
                size="small"
                danger
                @click="delTableRow(record)"
              >
                强制删除
              </a-button>

              <a-button size="small" @click="showLog(record.id)">日志</a-button>
            </a-space>
          </template>
          <template v-if="column.key === 'createdAt'">
            <span>{{ formatDate(record.createdAt) }}</span>
          </template>
          <template v-if="column.key === 'categoryCode'">
            <span>{{ eqmTypeDict[record.categoryCode] }}</span>
          </template>
          <template v-if="column.key === 'lab'">
            {{ record.lab.name }}
          </template>
          <template v-if="column.key === 'org'">
            {{ record.org.name }}
          </template>
          <template v-if="column.key === 'startedAt'">
            <span>{{ formatDate(record.startedAt) }}至 {{ formatDate(record.endedAt) }}</span>
          </template>
          <template v-if="column.key === 'rank'">
            <a-tag v-if="record.rank === 'WARN'" color="warning">黄色示警</a-tag>
            <a-tag v-else-if="record.rank === 'SEVERE'" color="error">红色示警</a-tag>
          </template>
        </template>
      </a-table>

      <a-modal
        v-model:visible="visibleAnalyse"
        width="550px"
        :centered="true"
        title="示警分析"
        :mask-closable="false"
        @ok="analyseSubmit"
      >
        <a-form
          ref="analyseFormRef"
          :model="analyseForm"
          name="basic"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 18 }"
          autocomplete="off"
        >
          <a-form-item
            label="试验室"
            name="labId"
            :rules="[{ required: true, message: '请选择试验室!' }]"
          >
            <common-select
              v-model:value="analyseForm.labId"
              :url="userAuthLab()"
              :config="{
                placeholder: '请选择试验室'
              }"
              @change="getEarlyWarnList()"
            />
          </a-form-item>
          <a-form-item
            label="时间范围"
            name="startedAt"
            :rules="[{ required: true, message: '请选择时间范围!' }]"
          >
            <a-range-picker
              :placeholder="['开始日期', '结束日期']"
              style="width: 398px"
              @change="changeAnalyseTime"
            />
          </a-form-item>
        </a-form>
      </a-modal>

      <WarnDispose
        :id="handleWarnId"
        v-model:visible="visibleDisposeFrom"
        :is-details="isDetails"
        :echo="echoDispose"
        :type="disposeType"
        @callBack="getEarlyWarnList"
      />

      <WarnSendBack
        :id="handleWarnId"
        v-model:visible="visibleRollbackForm"
        :type="disposeType"
        @callBack="getEarlyWarnList"
      />

      <WarnDelete
        :id="handleWarnId"
        v-model:visible="visibleDeleteForm"
        :type="disposeType"
        @callBack="getEarlyWarnList"
      />

      <Log ref="log" />
    </a-spin>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, toRaw, nextTick, computed, h } from "vue"
import {
  getGatherListAPI,
  getGatherAnalysisAPI,
  getEarlyWarningProcessAPI
} from "@/api/earlyWarn.api"
import { projectPages, userAuthLab } from "@/api/commonSelect.api"
import { getDictDataAPI } from "@/api/common.api"
import { Modal, message } from "ant-design-vue"
import { formatDate } from "@/assets/js/common"
import CommonSelect from "@/components/commonSelect/index.vue"
import dayjs, { Dayjs } from "dayjs"
import Log from "@/components/log/index.vue"

import WarnDispose from "../components/WarnDispose.vue"
import WarnSendBack from "../components/WarnSendBack.vue"
import WarnDelete from "../components/WarnDelete.vue"

onMounted(async () => {
  await getEqmTypeDict()
  await getEarlyWarnList()
})
const isDetails = ref(false)
const visibleDisposeFrom = ref<boolean>(false)
const visibleAnalyse = ref<boolean>(false)
const visibleDeleteForm = ref(false)
let visibleRollbackForm = ref(false)
let spinning = ref(false)
let dateRangeValue = ref<[Dayjs, Dayjs]>()
let handleWarnId = ref("")

let analyseFormRef = ref()

let eqmTypeDict: any = ref({})

let disposeType = ref("Analysis.Collect") //预警类型

const getEqmTypeDict = async () => {
  let res: any = await getDictDataAPI("collectEqClasses")
  res.dict.forEach((item) => {
    eqmTypeDict.value[item.code] = item.name
  })
  return Promise.resolve()
}

const changeRangeValue = (v) => {
  console.log(v)
  queryFrom.value.startedAt = v ? v[0].format("YYYY-MM-DD") : null
  queryFrom.value.endedAt = v ? v[1].format("YYYY-MM-DD") : null
  getEarlyWarnList()
}
const changeAnalyseTime = (v) => {
  analyseForm.value.startedAt = v ? v[0].format("YYYY-MM-DD") : null
  analyseForm.value.endedAt = v ? v[1].format("YYYY-MM-DD") : null
}

// 日志
const log = ref()
const showLog = (rowId: string) => {
  log.value.openModal(rowId)
}

let columns = [
  {
    title: "机构名称",
    dataIndex: "org",
    key: "org"
  },
  {
    title: "试验室/现场检测项目名称",
    dataIndex: "lab",
    key: "lab"
  },
  {
    title: "采集设备类型",
    dataIndex: "categoryCode",
    key: "categoryCode"
  },
  {
    title: "设备编号",
    dataIndex: "sn",
    key: "sn"
  },
  {
    title: "统计时间范围",
    dataIndex: "startedAt",
    key: "startedAt"
  },
  {
    title: "采集数量",
    dataIndex: "collectCount",
    key: "collectCount"
  },
  {
    title: "检测报告数量",
    dataIndex: "reportCount",
    key: "reportCount"
  },
  {
    title: "状态",
    dataIndex: "status",
    key: "status"
  },
  {
    title: "示警生成时间",
    dataIndex: "createdAt",
    key: "createdAt"
  },
  {
    title: "操作",
    key: "handle"
  }
]
let dataSource = ref([])

let analyseForm = ref({
  labId: "",
  startedAt: "",
  endedAt: ""
})

let queryFrom = ref({
  labId: "",
  current: 1,
  size: 10,
  name: "",
  status: "",
  startedAt: "",
  endedAt: "",
  includeDeleted: false
})

let pagination = ref({
  size: "small",
  showTotal: (total) => `共 ${total} 条数据`,
  showQuickJumper: true,
  showSizeChanger: true,
  total: 0,
  pageSizeOptions: ["10", "20", "50", "100"],
  onChange: (page, pageSize) => {
    queryFrom.value.current = page
    queryFrom.value.size = pageSize
    getEarlyWarnList()
  }
})
let selectedRowKeys = ref([])
let selectedRows = ref([])

let rowSelection = {
  selectedRowKeys: selectedRowKeys,
  onChange: (keys, rows) => {
    selectedRowKeys.value = keys
    selectedRows.value = rows
    console.log("selectedRowKeys: ", keys)
    console.log("selectedRows: ", rows)
  }
}

const delTableRow = (row) => {
  visibleDeleteForm.value = true
  handleWarnId.value = row.id
}
const rollbackRow = (row) => {
  visibleRollbackForm.value = true
  handleWarnId.value = row.id
}

const analyseSubmit = async () => {
  try {
    await analyseFormRef.value.validateFields()
    spinning.value = true
    let res = await getGatherAnalysisAPI(analyseForm.value)
    getEarlyWarnList()
    visibleAnalyse.value = false
    spinning.value = false

    Modal.success({
      title: "分析成功",
      content: h("div", {}, [
        h("p", `新增条数：${res.insertedRows}`),
        h("p", `被忽略条数：${res.duplicatedRows}`),
        h("p", `本次分析结果数量：${res.entrySize}`),
        h("p", `量能匹配比例：${res.ratio}`)
      ])
    })
  } catch (error) {
    console.error(error)
  }
}

//打开处理弹窗
const openDisposeModel = async (row) => {
  visibleDisposeFrom.value = true
  isDetails.value = false
  handleWarnId.value = row.id
}

const echoDispose: any = ref({})
//打开处理详情
const openDisposeDetModel = async (row) => {
  let res = await getEarlyWarningProcessAPI(row.id)
  res.attachments = JSON.parse(res.attachments)
  visibleDisposeFrom.value = true
  isDetails.value = true
  echoDispose.value = res
}
//获取示警数据
const getEarlyWarnList = () => {
  spinning.value = true
  getGatherListAPI(queryFrom.value)
    .then((res) => {
      dataSource.value = res.records
      spinning.value = false
      pagination.value.total = res.total
    })
    .catch(() => {
      spinning.value = false
    })
}
const statusChange = (v) => {
  v === "DELETED"
    ? (queryFrom.value.includeDeleted = true)
    : (queryFrom.value.includeDeleted = false)
  getEarlyWarnList()
}
</script>
<style lang="less" scoped>
.action_row {
  row-gap: 0px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
}
</style>
