<template>
  <a-spin :spinning="spinning" tip="Loading...">
    <div class="query-form-wrap">
      <a-space>
        <dict-code
          v-model:value="queryFrom.projectTypeCode"
          code="org::level::major"
          allow-clear
          placeholder="请选择工程类型"
          @change="
            ({ option }) => {
              queryFrom.projectType = option ? option.name : ''
              queryFrom.levelType = ''
            }
          "
        />
        <dict-code
          v-model:value="queryFrom.levelType"
          :code="queryFrom.projectTypeCode"
          allow-clear
          placeholder="请选择等级类型"
        />
        <a-input-search
          v-model:value="queryFrom.orgName"
          placeholder="请输入机构名称"
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
      :row-selection="rowSelection"
      size="small"
      bordered
      row-key="id"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key == 'handle'">
          <a-space>
            <a-button type="primary" size="small" @click="goDetail(record.id)">详情</a-button>
            <a-button
              v-if="record.status == 'LOGOUT'"
              type="primary"
              size="small"
              @click="recover(record.id)"
            >
              启用
            </a-button>
            <a-button
              v-if="record.status == 'NORMAL' || record.status == 'UNREGISTERED'"
              type="danger"
              size="small"
              @click="logout(record.id)"
            >
              注销
            </a-button>
          </a-space>
        </template>
      </template>
    </a-table>
  </a-spin>
</template>

<script setup lang="ts">
import { ExclamationCircleOutlined } from "@ant-design/icons-vue"
import { reactive, ref, createVNode, onMounted, inject } from "vue"
import { Modal, message } from "ant-design-vue"
import { useRouter } from "vue-router"
import { getPageList, logoutMandatory, restore, exportExcelAPI } from "@/api/organization.api"
import { orgInfoType } from "@/type/api/organization.api"
import type { btnsType, ObjectString } from "@/type/common/common"
import type { TableColumnType, PaginationProps } from "ant-design-vue"
import DictCode from "@/components/dictCode/index.vue"

const router = useRouter()
const spinning = ref<boolean>(false)

// 查询条件
const queryFrom = reactive({
  projectTypeCode: "",
  projectType: "",
  levelType: "",
  orgName: ""
})

// 机构状态 （UNREGISTERED-未注册，NORMAL-正常，LOGOUT-注销，LOGOUT_APP-注销申请中）
const statusObj: ObjectString = {
  UNREGISTERED: "未注册",
  NORMAL: "正常",
  LOGOUT: "已注销",
  LOGOUT_APP: "注销申请中"
}

// 表格列
const columns = reactive<TableColumnType[]>([
  {
    title: "",
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
    dataIndex: "name",
    key: "name"
  },
  {
    title: "所在省（市）",
    dataIndex: "province",
    key: "province"
  },
  {
    title: "所在市（区）",
    dataIndex: "city",
    key: "city"
  },
  {
    title: "等级类型",
    dataIndex: "qualify",
    key: "qualify"
  },
  {
    title: "检测证书编号",
    dataIndex: "qualifyNo",
    key: "qualifyNo"
  },
  {
    title: "机构性质",
    dataIndex: "orgNature",
    key: "orgNature"
  },
  {
    title: "机构状态",
    dataIndex: "status",
    key: "status",
    customRender: ({ text }) => {
      return statusObj[text]
    }
  },
  {
    title: "操作",
    dataIndex: "handle",
    key: "handle",
    width: 100
  }
])

// 数据加载
onMounted(() => {
  getDataSource()
})
const dataSource = ref<orgInfoType[]>([])
const getDataSource = (flag?: boolean) => {
  if (flag) {
    pagination.current = 1
  }
  const params = {
    ...queryFrom,
    current: pagination.current,
    size: pagination.pageSize
  }
  spinning.value = true
  getPageList(params)
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
    ...queryFrom,
    current: pagination.current,
    size: pagination.pageSize
  }
  spinning.value = true
  exportExcelAPI(params)
    .then((data: any) => {
      const url = window.URL.createObjectURL(data)
      const elink = document.createElement("a")
      elink.href = url
      elink.target = "_self" // 当前也 target打开新页面
      elink.setAttribute("download", "机构列表Excel导出.xlsx")
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

// 行选择
const selectedRowKey = ref<string[]>([])
const rowSelection = ref({
  type: "radio",
  onChange: (selectedRowKeys: string[]) => {
    selectedRowKey.value = selectedRowKeys
  }
})

// 批量操作按钮
const btnsList = reactive<btnsType[]>([
  {
    btnName: "导出Excel",
    authCode: "org::export",
    click: () => {
      exportExcel()
    }
  },
  {
    btnName: "更新同步",
    authCode: "org::org::sync",
    syncType: "ORG",
    click: () => {
      getDataSource(true)
    }
  }
  // {
  //   btnName: "部系统机构详情",
  //   authCode: "*",
  //   click: () => {
  //     let rowId = selectedRowKey.value[0]
  //     if (!rowId) {
  //       message.warning("请选择需要查看的数据")
  //       return
  //     }
  //     goDetailPart(rowId)
  //   }
  // }
])

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

// 查看详情 - 跳转部平台
const goDetailPart = (rowId: string) => {
  const href = import.meta.env.VITE_PART_API
  window.open(`${href}/PCWeb/OrgQuery/OrgDetail?id=${rowId}`, "_blank")
}
// 查看详情 - 跳转详情页
const goDetail = (rowId: string) => {
  router.push({
    path: "/organizationInfo",
    query: {
      id: rowId
    }
  })
}
// 强制注销
const logout = (rowId: string) => {
  // 行业账号提示
  openConfirm("您确定要强制注销该机构？", "注销后该机构所有账号均无法登录系统").then(() => {
    logoutMandatory(rowId).then(() => {
      message.success("已注销")
      getDataSource()
    })
  })
}
// 强制恢复
const recover = (rowId: string) => {
  openConfirm(
    "您确定要恢复该机构的账号？",
    "恢复后该机构的所有账号将正常使用，之前被禁用用户仍无法登录"
  ).then(() => {
    restore(rowId).then(() => {
      message.success("已恢复")
      getDataSource()
    })
  })
}
</script>

<style scoped lang="less"></style>
