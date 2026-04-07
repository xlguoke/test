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
              v-auth="'report::info'"
              type="primary"
              size="small"
              @click="goDetail('报告详情', record.id, false, 'edit')"
            >
              详情
            </a-button>
            <a-button type="primary" size="small" @click="showLog(record.id)">日志</a-button>
            <!-- 行业 -->
            <a-button
              v-if="record.status == '正常'"
              v-auth="'report::modify-mandatory'"
              type="primary"
              size="small"
              @click="goDetail('报告上报', record.id, true, 'edit', true)"
            >
              强制编辑
            </a-button>
            <a-button
              v-if="record.status == '已注销'"
              v-auth="'report::recover-mandatory'"
              type="primary"
              size="small"
              @click="recover(record.id, true)"
            >
              强制恢复
            </a-button>
            <a-button
              v-if="record.status == '正常'"
              v-auth="'report::cancel-mandatory'"
              type="danger"
              size="small"
              @click="logout(record.id, true)"
            >
              强制注销
            </a-button>
            <!-- 机构 -->
            <a-button
              v-if="record.status == '正常' || record.status == '未上传报告'"
              v-auth="'report::modify'"
              type="primary"
              size="small"
              @click="goDetail('报告编辑', record.id, true, 'edit')"
            >
              编辑
            </a-button>
            <a-button
              v-if="record.status == '正常'"
              v-auth="'report::amend'"
              type="primary"
              size="small"
              @click="goDetail('报告更正', record.id, true, 'amend')"
            >
              更正
            </a-button>

            <a-button
              v-if="record.status == '已注销'"
              v-auth="'report::recover'"
              type="primary"
              size="small"
              @click="recover(record.id)"
            >
              恢复
            </a-button>
            <a-button
              v-if="record.status == '正常'"
              v-auth="'report::cancel'"
              type="danger"
              size="small"
              @click="logout(record.id)"
            >
              注销
            </a-button>
            <a-button v-auth="'report::del'" type="danger" size="small" @click="delRow(record.id)">
              删除
            </a-button>
          </a-space>
        </template>
      </template>
    </a-table>

    <Detail ref="detail" :key="detailKey" @update-list="getDataSource" />
    <Log ref="log" />

    <!-- 机构账户显示 -->
    <template v-if="true">
      <!-- 导入类型选择 -->
      <a-modal
        v-model:visible="visibleExport"
        title="请选择导入内容"
        :mask-closable="false"
        :keyboard="false"
        :footer="null"
        width="300px"
      >
        <div style="padding: 30px">
          <a-button type="primary" block @click="exportReport('info')">报告信息</a-button>
          <a-button type="primary" block style="margin-top: 15px" @click="exportReport('file')">
            报告文件
          </a-button>
        </div>
      </a-modal>

      <!-- 设置防伪码下载数量 -->
      <a-modal
        v-model:visible="visibleSecurityCode"
        title="下载数量"
        :mask-closable="false"
        :keyboard="false"
        width="300px"
        @ok="setDownloadNum"
      >
        <a-input-number
          v-model:value="downloadNum"
          :controls="false"
          :min="1"
          :precision="0"
          style="width: 100%"
        />
      </a-modal>

      <ImportReport ref="importReport" :key="importKey" @update-list="getDataSource" />
    </template>
  </a-spin>
</template>

<script setup lang="ts">
import { ExclamationCircleOutlined } from "@ant-design/icons-vue"
import { reactive, ref, createVNode, onMounted, inject, nextTick } from "vue"
import { Modal, message } from "ant-design-vue"
import dayjs from "dayjs"
import type { TableColumnType, PaginationProps } from "ant-design-vue"
import {
  getPageList,
  delApi,
  cancelApi,
  recoverApi,
  forceCancelApi,
  forceRecoverApi,
  downloadQrCode,
  exportExcelAPI
} from "@/api/reportMgr.api"
import { orgList, userAuthLab } from "@/api/commonSelect.api"
import CommonSelect from "@/components/commonSelect/index.vue"
import type { reportListType } from "@/type/api/report.api"
import type { btnsType } from "@/type/common/common"
import Log from "@/components/log/index.vue"
import Detail from "./components/Detail.vue"
import ImportReport from "./components/ImportReport.vue"
import { formatDate, downloadFile } from "@/assets/js/common"
import userStore from "@/stores/userInfo"
const { userInfo } = userStore()

const spinning = ref<boolean>(false)
const queryFrom = reactive({
  pagination: "",
  kind: "",
  agencyId: "",
  labId: "",
  startedAt: "",
  endedAt: "",
  status: null,
  q: ""
})
const orgChange = (v) => {
  queryFrom.labId = ""
}
// 签发日期
const signDate = ref([])
const changeSignDate = (e: Array<string>) => {
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
    title: "签发日期",
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
    width: 280
  }
])
const dataSource = ref<reportListType[]>([])
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
      dataSource.value = res.records || []
      pagination.total = res.total
    })
    .catch(() => {
      spinning.value = false
    })
}

const importKey = ref()
const btnsList = reactive<btnsType[]>([
  {
    btnName: "导出Excel",
    authCode: "report::export",
    click: () => {
      exportExcel()
    }
  },

  {
    btnName: "新增",
    authCode: "report::add",
    click: () => {
      goDetail("新增报告", "", true, "add")
    }
  },
  {
    btnName: "导入",
    authCode: "report::import",
    click: () => {
      importKey.value = new Date().getTime()
      nextTick(() => {
        visibleExport.value = true
      })
    }
  },
  {
    btnName: "下载防伪码",
    authCode: "report::security:downloadCode",
    loading: false,
    click: () => {
      downloadNum.value = 1
      visibleSecurityCode.value = true
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
      elink.setAttribute("download", "报告列表Excel导出.xlsx")
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

// 导入
const visibleExport = ref<boolean>(false)
const importReport = ref()
const exportReport = (type: string) => {
  visibleExport.value = false
  importReport.value.openModal(type)
}

// 下载防伪码
const visibleSecurityCode = ref<boolean>(false)
const downloadNum = ref<number>(1)
const setDownloadNum = () => {
  if (downloadNum.value <= 0) {
    return message.error("下载数量必须大于0")
  }
  visibleSecurityCode.value = false
  btnsList[2].loading = true
  downloadQrCode(downloadNum.value)
    .then((res) => {
      btnsList[2].loading = false
      if (!res) return
      downloadFile(res as any, "防伪二维码.zip")
    })
    .catch(() => {
      btnsList[2].loading = false
    })
}

// 新增、编辑、变更，详情
const detailKey = ref<number>()
const detail = ref()
const goDetail = (
  title: string,
  rowId: string,
  isDetail: boolean,
  type: string,
  isForce?: boolean
) => {
  detailKey.value = new Date().getTime()
  nextTick(() => {
    detail.value.openModal(title, rowId, isDetail, type, isForce)
  })
}

//  日志
const log = ref()
const showLog = (id: string) => {
  log.value.openModal(id)
}

// 注销-强制注销
const logout = (rowId: string, isForce?: boolean) => {
  openConfirm(
    `您确定要${isForce ? "强制" : ""}注销该份报告？`,
    "注销后，门户端查询结果报告的状态将变为已注销"
  ).then(() => {
    if (isForce) {
      forceCancelApi(rowId).then(() => {
        message.success("已注销")
        getDataSource()
      })
    } else {
      cancelApi(rowId).then(() => {
        message.success("已注销")
        getDataSource()
      })
    }
  })
}
// 恢复强制恢复
const recover = (rowId: string, isForce?: boolean) => {
  openConfirm(
    `您确定要${isForce ? "强制" : ""}恢复该份报告？`,
    "恢复后，门户端查询结果报告的状态将恢复为正常"
  ).then(() => {
    if (isForce) {
      forceRecoverApi(rowId).then(() => {
        message.success("已恢复")
        getDataSource()
      })
    } else {
      recoverApi(rowId).then(() => {
        message.success("已恢复")
        getDataSource()
      })
    }
  })
}

// 删除
const delRow = (rowId: string) => {
  openConfirm("您确定要删除该份报告？", "删除后，报告信息将彻底抹除").then(() => {
    delApi(rowId).then(() => {
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
