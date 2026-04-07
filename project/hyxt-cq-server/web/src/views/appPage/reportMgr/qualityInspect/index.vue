<template>
  <a-spin :spinning="spinning" tip="Loading...">
    <div class="query-form-wrap">
      <a-space>
        <a-range-picker v-model:value="signDate" style="width: 230px" @change="changeSignDate" />
        <a-select v-model:value="queryFrom.status" allow-clear placeholder="请选择报告状态">
          <a-select-option v-for="(k, v) in statusObj" :key="v" :value="v">{{ k }}</a-select-option>
        </a-select>
        <common-select
          v-if="userInfo.type != 'ORG'"
          v-model:value="queryFrom.agencyId"
          :url="orgList()"
          placeholder="请选择检测机构"
          :config="{
            keyword: 'orgName',
            httpSearch: true
          }"
          @change="orgChange"
        />
        <common-select
          v-model:value="queryFrom.labId"
          :url="
            queryFrom.agencyId
              ? '/labs?user-labs&currentUserOrgId=' + queryFrom.agencyId
              : '/labs?user-labs'
          "
          :config="{
            placeholder: '请选择试验室/现场检测项目'
          }"
        />
        <a-input-search
          v-model:value="queryFrom.q"
          style="width: 280px"
          placeholder="输入报告编号/工程项目查询"
          enter-button
          @search="getDataSource(true)"
        />
      </a-space>

      <a-space>
        <a-button v-auth="'report::inspection::export'" @click="exportExcel">导出Excel</a-button>
      </a-space>
    </div>

    <a-table
      :data-source="dataSource"
      :columns="columns"
      :pagination="pagination"
      size="small"
      :scroll="{ x: 1200 }"
      bordered
      row-key="id"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key == 'handle'">
          <a-space>
            <a-button type="primary" size="small" @click="goDetail(record.id)">详情</a-button>
            <a-button type="primary" size="small" @click="showLog(record.id)">日志</a-button>
          </a-space>
        </template>
      </template>
    </a-table>

    <Detail ref="detail" :key="detailKey" />
    <Log ref="log" />
  </a-spin>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, nextTick, inject } from "vue"
import dayjs from "dayjs"
import { getPageList, exportExcelAPI } from "@/api/reportMgr.api"
import { orgList, userAuthLab } from "@/api/commonSelect.api"
import type { TableColumnType, PaginationProps } from "ant-design-vue"
import Log from "@/components/log/index.vue"
import CommonSelect from "@/components/commonSelect/index.vue"
import Detail from "../list/components/Detail.vue"
import { formatDate } from "@/assets/js/common"
import userStore from "@/stores/userInfo"
const { userInfo } = userStore()

const spinning = ref<boolean>(false)
const queryFrom = reactive({
  pagination: "",
  kind: "INSPECTION",
  agencyId: "",
  labId: "",
  startedAt: "",
  endedAt: "",
  status: null,
  q: ""
})
// 签发日期
const signDate = ref([])
const changeSignDate = (e: any) => {
  if (!e) {
    queryFrom.startedAt = ""
    queryFrom.endedAt = ""
  } else {
    queryFrom.startedAt = dayjs(e[0]).format("YYYY-MM-DD")
    queryFrom.endedAt = dayjs(e[1]).format("YYYY-MM-DD")
  }
}
const statusObj = {
  normal: "正常",
  canceled: "已注销",
  lack_pdf: "未上传报告"
}
const orgChange = (v) => {
  queryFrom.labId = ""
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
    title: "机构名称",
    dataIndex: "testOrg",
    key: "testOrg",
    fixed: "left",
    width: 180
  },
  {
    title: "试验室/现场检测项目名称",
    dataIndex: "laboratory",
    key: "laboratory",
    width: 180
  },
  {
    title: "报告编号",
    dataIndex: "sn",
    key: "sn"
  },
  {
    title: "工程项目",
    dataIndex: "project",
    key: "project"
  },
  {
    title: "签发时间",
    dataIndex: "signDate",
    key: "signDate",
    customRender: ({ text }) => (text ? formatDate(text) : "")
  },
  // {
  //   title: "验证码",
  //   dataIndex: "queryCode",
  //   key: "queryCode"
  // },
  {
    title: "防伪码",
    dataIndex: "securityCode",
    key: "securityCode"
  },
  {
    title: "数据来源",
    dataIndex: "sourceFrom",
    key: "sourceFrom"
  },
  {
    title: "是否合格",
    dataIndex: "isQualified",
    key: "isQualified",
    customRender: ({ text }) => {
      if (text === undefined) return "-"
      return text === null ? "不判定" : text ? "合格" : "不合格"
    }
  },
  {
    title: "报告状态",
    dataIndex: "status",
    key: "status"
  },
  {
    title: "操作",
    dataIndex: "handle",
    key: "handle",
    fixed: "right",
    width: 120
  }
])
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

onMounted(() => {
  getDataSource()
})

const dataSource = ref([])
const getDataSource = (flag?: boolean) => {
  if (flag) {
    pagination.current = 1
  }
  const param = {
    current: pagination.current,
    size: pagination.pageSize,
    ...queryFrom
  }
  param.agencyId = param.agencyId || ""
  param.labId = param.labId || ""
  param.status = param.status || null
  spinning.value = true
  getPageList(param)
    .then((res: any) => {
      spinning.value = false
      if (!res) return
      dataSource.value = res.records || []
      pagination.total = res.total
    })
    .catch(() => {
      spinning.value = false
    })
}

const exportExcel = () => {
  const params = {
    current: pagination.current,
    size: pagination.pageSize,
    ...queryFrom
  }
  spinning.value = true
  exportExcelAPI(params)
    .then((data: any) => {
      const url = window.URL.createObjectURL(data)
      const elink = document.createElement("a")
      elink.href = url
      elink.target = "_self" // 当前也 target打开新页面
      elink.setAttribute("download", "质量监督抽检报告Excel导出.xlsx")
      elink.style.display = "none"
      document.body.appendChild(elink)
      elink.click()
      document.body.removeChild(elink)
      spinning.value = false
    })
    .catch(() => {
      spinning.value = false
    })
}

// 详情
const detailKey = ref<number>()
const detail = ref()
const goDetail = (rowId?: string) => {
  detailKey.value = new Date().getTime()
  nextTick(() => {
    detail.value.openModal("报告详情", rowId, false)
  })
}

//  日志
const log = ref()
const showLog = (id: string) => {
  log.value.openModal(id)
}

// 处理方案
// const handleScheme = ref()
// const showHandleScheme = (id) => {
//   handleScheme.value.openModal()
// }
</script>

<style scoped lang="less"></style>
