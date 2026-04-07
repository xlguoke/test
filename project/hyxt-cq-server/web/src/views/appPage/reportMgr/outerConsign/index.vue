<template>
  <a-spin :spinning="spinning" tip="Loading...">
    <div class="query-form-wrap">
      <a-space>
        <a-range-picker v-model:value="signDate" style="width: 230px" @change="changeSignDate" />
        <common-select
          v-if="userInfo.type != 'ORG'"
          v-model:value="queryFrom.agencyId"
          :url="orgList()"
          placeholder="请选择机构"
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
            placeholder: '请选择试验室/现场检测项目名称'
          }"
        />
        <a-input-search
          v-model:value="queryFrom.q"
          style="width: 320px"
          placeholder="输入检测机构/报告编号/工程项目查询"
          enter-button
          @search="getDataSource(true)"
        />
      </a-space>

      <!-- 机构账户才显示 -->
      <handle-btns :datas="btnsList" />
    </div>

    <a-table
      :data-source="dataSource"
      :columns="columns"
      :pagination="pagination"
      size="small"
      bordered
      row-key="id"
      :scroll="{ x: 1200 }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key == 'handle'">
          <a-space>
            <a-button
              v-auth="'subcontractReport::info'"
              type="primary"
              size="small"
              @click="goDetail('报告详情', record.relationRid, false)"
            >
              详情
            </a-button>
            <a-button type="primary" size="small" @click="showLog(record.relationRid)">
              日志
            </a-button>
            <!-- 行业 -->
            <!-- <a-button
              v-auth="'subcontractReport::modify-mandatory'"
              type="primary"
              size="small"
              @click="goDetail('报告上报', record.id, true, true)"
            >
              强制编辑
            </a-button> -->
            <!-- 机构 -->
            <!-- <a-button
              v-auth="'subcontractReport::modify'"
              type="primary"
              size="small"
              @click="goDetail('报告编辑', record.id, true, false)"
            >
              编辑
            </a-button> -->
            <a-button
              v-auth="'subcontractReport::del'"
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

    <Detail ref="detail" :key="detailKey" page="4" @update-list="getDataSource" />

    <AddModel ref="addModelRef" @successOk="getDataSource()" />

    <ImportModel ref="importModelRef" @successOk="getDataSource()" />

    <Log ref="log" />
  </a-spin>
</template>

<script setup lang="ts">
import { ExclamationCircleOutlined } from "@ant-design/icons-vue"
import { reactive, ref, createVNode, onMounted, inject, nextTick } from "vue"
import { Modal, message } from "ant-design-vue"
import dayjs from "dayjs"
import { getPageList, delOuterReportAPI, exportExcelAPI } from "@/api/reportMgr.api"
import { orgList, userAuthLab } from "@/api/commonSelect.api"
import type { btnsType } from "@/type/common/common"
import type { TableColumnType, PaginationProps } from "ant-design-vue"
import Log from "@/components/log/index.vue"
import CommonSelect from "@/components/commonSelect/index.vue"
import Detail from "../list/components/Detail.vue"
import ImportReport from "../list/components/ImportReport.vue"
import { formatDate } from "@/assets/js/common"
import userStore from "@/stores/userInfo"
import AddModel from "./components/addModel.vue"
import ImportModel from "./components/importModel.vue"
const { userInfo } = userStore()

const spinning = ref<boolean>(false)
const queryFrom = reactive({
  pagination: "",
  kind: "OUTSOURCED",
  agencyId: "",
  labId: "",
  startedAt: "",
  endedAt: "",
  q: ""
})

const orgChange = () => {
  queryFrom.labId = ""
}

let addModelRef = ref()
let importModelRef = ref()

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
// const statusObj = {
//   normal: "正常",
//   canceled: "已注销",
//   lack_pdf: "未上传报告"
// }
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
    title: "是否合格",
    dataIndex: "isQualified",
    key: "isQualified",
    customRender: ({ text }) => (text ? "是" : "否")
  },
  {
    title: "报告状态",
    dataIndex: "status",
    key: "status"
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
  {
    title: "检测机构",
    dataIndex: "testLaboratory",
    key: "testLaboratory"
  },
  {
    title: "委托编号",
    dataIndex: "consignSn",
    key: "consignSn"
  },
  {
    title: "操作",
    dataIndex: "handle",
    key: "handle",
    fixed: "right",
    width: 180
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

const btnsList = reactive<btnsType[]>([
  {
    btnName: "导出Excel",
    authCode: "subcontractReport::export",
    click: () => {
      exportExcel()
    }
  },
  {
    btnName: "新增",
    authCode: "subcontractReport::add",
    click: () => {
      openAddModel()
    }
  },

  {
    btnName: "导入",
    authCode: "subcontractReport::import",
    click: () => {
      openImportModel()
    }
  }
])

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
      elink.setAttribute("download", "外委报告Excel导出.xlsx")
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

const openAddModel = () => {
  addModelRef.value.openModel()
}
const openImportModel = () => {
  importModelRef.value.openModel()
}
// 详情
const detailKey = ref<number>()
const detail = ref()
const goDetail = (title: string, rowId: string, isEdit: boolean, isForce?: boolean) => {
  detailKey.value = new Date().getTime()
  nextTick(() => {
    detail.value.openModal(title, rowId, isEdit, isForce)
  })
}

//  日志
const log = ref()
const showLog = (id: string) => {
  log.value.openModal(id)
}

// // 注销-强制注销
// const logout = (rowId: string, isForce?: boolean) => {
//   openConfirm(
//     `您确定要${isForce ? "强制" : ""}注销该份报告？`,
//     "注销后，门户端查询结果报告的状态将变为已注销"
//   ).then(() => {
//     if (isForce) {
//       forceCancelApi(rowId).then(() => {
//         message.success("已注销")
//         getDataSource()
//       })
//     } else {
//       cancelApi(rowId).then(() => {
//         message.success("已注销")
//         getDataSource()
//       })
//     }
//   })
// }
// // 恢复强制恢复
// const recover = (rowId: string, isForce?: boolean) => {
//   openConfirm(
//     `您确定要${isForce ? "强制" : ""}恢复该份报告？`,
//     "恢复后，门户端查询结果报告的状态将恢复为正常"
//   ).then(() => {
//     if (isForce) {
//       forceRecoverApi(rowId).then(() => {
//         message.success("已恢复")
//         getDataSource()
//       })
//     } else {
//       recoverApi(rowId).then(() => {
//         message.success("已恢复")
//         getDataSource()
//       })
//     }
//   })
// }

// 删除
const delRow = (rowId: string) => {
  openConfirm("提示", "您确定要删除该份报告？").then(() => {
    delOuterReportAPI(rowId).then(() => {
      message.success("删除成功")
      getDataSource()
    })
  })
}
</script>

<style scoped lang="less">
.ant-space {
  flex-wrap: wrap;
}
</style>
