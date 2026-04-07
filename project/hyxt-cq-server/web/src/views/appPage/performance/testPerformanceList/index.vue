<template>
  <a-spin :spinning="spinning" tip="Loading...">
    <div class="query-form-wrap">
      <a-space>
        <a-select v-model:value="queryFrom.external" allow-clear placeholder="项目所在">
          <a-select-option value="true">市外</a-select-option>
          <a-select-option value="false">市内</a-select-option>
        </a-select>
        <a-select v-model:value="queryFrom.status" allow-clear placeholder="请选择状态">
          <a-select-option v-for="(k, v) in pType" :key="v" :value="v">{{ k }}</a-select-option>
        </a-select>
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
          v-model:value="queryFrom.q"
          style="width: 280px"
          placeholder="请输入委托单位/项目名称查询"
          enter-button
          @search="getDataSource(true)"
        />
      </a-space>
      <handle-btns v-if="isCheck" :datas="btnsList" />
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
            <a-button type="primary" size="small" @click="goDetail('业绩详情', record.id, false)">
              详情
            </a-button>
            <template v-if="record.projectType == 'WATERWAY'">
              <a-button type="primary" size="small" @click="showLog(record.id)">日志</a-button>
              <!-- 行业 -->
              <a-button
                v-if="record.status == 'NORMAL' || record.status == 'DONT_AUDIT'"
                v-auth="'achievement::test::update-mandatory'"
                type="primary"
                size="small"
                @click="goDetail('业绩变更', record.id, true, true)"
              >
                强制变更
              </a-button>
              <a-button
                v-if="record.status == 'LOGOUT'"
                v-auth="'achievement::test::restore-mandatory'"
                type="primary"
                size="small"
                @click="recover(record.id, true)"
              >
                强制恢复
              </a-button>
              <a-button
                v-if="record.status == 'NORMAL' || record.status == 'DONT_AUDIT'"
                v-auth="'achievement::test::logout-mandatory'"
                type="danger"
                size="small"
                @click="logout(record.id, true)"
              >
                强制注销
              </a-button>

              <!-- 机构 -->
              <a-button
                v-if="
                  record.status == 'WAIT_PUBLISH' ||
                  record.status == 'DONT_AUDIT' ||
                  record.status == 'FAILING' ||
                  record.status == 'NORMAL'
                "
                v-auth="'achievement::test::update'"
                type="primary"
                size="small"
                @click="
                  goDetail(
                    `业绩${
                      record.status == 'WAIT_PUBLISH' || record.status == 'FAILING'
                        ? '编辑'
                        : '变更'
                    }`,
                    record.id,
                    true
                  )
                "
              >
                {{
                  record.status == "WAIT_PUBLISH" || record.status == "FAILING" ? "编辑" : "变更"
                }}
              </a-button>
              <a-button
                v-if="record.status == 'WAIT_PUBLISH'"
                v-auth="'achievement::test::publish'"
                type="primary"
                size="small"
                @click="publish(record.id)"
              >
                发布
              </a-button>
              <a-button
                v-if="record.status == 'LOGOUT'"
                v-auth="'achievement::test::restore'"
                type="primary"
                size="small"
                @click="recover(record.id, false)"
              >
                恢复
              </a-button>
              <a-button
                v-if="record.status == 'DONT_AUDIT' || record.status == 'NORMAL'"
                v-auth="'achievement::test::logout'"
                type="danger"
                size="small"
                @click="logout(record.id, false)"
              >
                注销
              </a-button>
              <a-button
                v-if="record.status == 'WAIT_PUBLISH'"
                v-auth="'achievement::test::delete'"
                type="danger"
                size="small"
                @click="delRow(record.id)"
              >
                删除
              </a-button>
            </template>
          </a-space>
        </template>
      </template>
    </a-table>

    <Detail ref="detail" :key="detailKey" @update-list="getDataSource" />
    <Log ref="log" />
  </a-spin>
</template>

<script setup lang="ts">
import { ExclamationCircleOutlined } from "@ant-design/icons-vue"
import { useRouter } from "vue-router"
import { reactive, ref, createVNode, onMounted, nextTick, inject, provide } from "vue"
import { Modal, message } from "ant-design-vue"
import {
  testPageList,
  testPublishApi,
  testLogoutApi,
  testRestoreApi,
  testDelApi,
  checkApi,
  achievementSync
} from "@/api/performance.api"
import { testDataItemType } from "@/type/api/performance.api"

import type { btnsType } from "@/type/common/common"
import type { TableColumnType, PaginationProps } from "ant-design-vue"
import Log from "@/components/log/index.vue"
import CommonSelect from "@/components/commonSelect/index.vue"
import Detail from "./components/Detail.vue"
import { queryParType } from "@/type/api/performance.api"
import { orgList } from "@/api/commonSelect.api"
import userStore from "@/stores/userInfo"
const { userInfo } = userStore()
const router = useRouter()

const spinning = ref<boolean>(false)

// 查询条件
const queryFrom = reactive({
  external: null,
  status: null,
  orgId: "",
  q: ""
})

const pType = {
  WAIT_PUBLISH: "等待发布",
  UPDATE_APP: "变更待审核",
  DONT_AUDIT: "无需审核",
  LOGOUT: "注销"
  // FAILING: "审核未通过",
  // WAIT_AUDIT: "待审核",
  // NORMAL: "已审核"
}

provide("pType", pType)

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
    dataIndex: "orgName",
    key: "orgName"
  },
  {
    title: "工程类型",
    dataIndex: "projectType",
    key: "projectType",
    customRender: ({ text }) => {
      return text == "LANDWAY" ? "公路工程" : "水运工程"
    }
  },
  {
    title: "项目所在",
    dataIndex: "external",
    key: "external",
    customRender: ({ text }) => {
      return text ? "市外" : "市内"
    }
  },
  {
    title: "项目名称",
    dataIndex: "projectName",
    key: "projectName"
  },
  {
    title: "委托人名称",
    dataIndex: "consignUnit",
    key: "consignUnit"
  },
  {
    title: "委托类型",
    dataIndex: "testCategory",
    key: "testCategory"
  },
  {
    title: "业绩来源",
    dataIndex: "dataFrom",
    key: "dataFrom"
  },
  {
    title: "业绩状态",
    dataIndex: "status",
    key: "status",
    customRender: ({ text }) => {
      return pType[text]
    }
  },
  {
    title: "操作",
    dataIndex: "handle",
    key: "handle",
    width: 150
  }
])

// 数据加载
onMounted(() => {
  getDataSource()
})

// 申报承诺书上传情况检查
const checkCommitment = () => {
  return new Promise((resolve, reject) => {
    if (userInfo.type != "ORG") return resolve("")
    checkApi(userInfo.orgId).then((res) => {
      if (res) return resolve("")
      Modal.confirm({
        title: "提示",
        icon: createVNode(ExclamationCircleOutlined),
        content: "检测到未上传业绩申报承诺书，无法进行业绩申报",
        okText: "前往上传",
        cancelText: "关闭",
        onOk() {
          router.push({ path: "/letterOfCommitment" })
          reject()
        },
        onCancel() {
          reject()
        }
      })
    })
  })
}

const isCheck = ref<boolean>(false)
const dataSource = ref<testDataItemType[]>([])
const getDataSource = async (flag?: boolean) => {
  if (!isCheck.value) {
    await checkCommitment()
    isCheck.value = true
  }
  if (flag) {
    pagination.current = 1
  }
  const params: queryParType = {
    ...queryFrom,
    current: pagination.current,
    size: pagination.pageSize
  }
  spinning.value = true
  testPageList(params)
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

// 分页
const commonPagination = reactive(inject("commonPagination") as PaginationProps)
const pagination = reactive<PaginationProps>({
  ...commonPagination,
  onChange: (page, pageSize) => {
    pagination.current = page
    pagination.pageSize = pageSize
    getDataSource()
  }
})

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

// 操作按钮
const btnsList = reactive<btnsType[]>([
  {
    btnName: "新增",
    authCode: "achievement::test::create",
    click: () => {
      goDetail("业绩新增", "", true)
    }
  },
  {
    btnName: "同步",
    authCode: "*",
    loading: false,
    click: function () {
      this.loading = true
      achievementSync()
        .then(() => {
          this.loading = false
          message.success("同步成功")
          getDataSource(true)
        })
        .catch(() => {
          this.loading = false
        })
    }
  }
])

// 新增、编辑、详情
const detailKey = ref<number>()
const detail = ref()
const goDetail = (title: string, rowId: string, isEdit: boolean, isForce?: boolean) => {
  detailKey.value = new Date().getTime()
  nextTick(() => {
    detail.value.openModal(title, rowId, isEdit, isForce)
  })
}

// 日志
const log = ref()
const showLog = (id: string) => {
  log.value.openModal(id)
}

// 发布
const publish = (rowId: string) => {
  openConfirm("您确定要发布该条业绩？", "发布后，当前业绩不可删除").then(() => {
    testPublishApi(rowId).then((res) => {
      if (!res) return
      message.success("发布成功")
      getDataSource()
    })
  })
}

// 注销
const logout = (rowId: string, isForce: boolean) => {
  // 行业账号提示
  openConfirm(
    `您确定要${isForce ? "强制" : ""}注销该条业绩？`,
    "注销后，当前业绩不可在门户网站查询"
  ).then(() => {
    testLogoutApi(rowId).then(() => {
      message.success("已注销")
      getDataSource()
    })
  })
}

// 恢复
const recover = (rowId: string, isForce: boolean) => {
  openConfirm(
    `您确定要${isForce ? "强制" : ""}恢复该条业绩？`,
    "恢复后，当前业绩可在门户网站查询"
  ).then(() => {
    testRestoreApi(rowId).then(() => {
      message.success("已恢复")
      getDataSource()
    })
  })
}

// 删除
const delRow = (rowId: string) => {
  openConfirm("您确定要删除该条业绩？", "删除后，业绩信息将彻底抹除").then(() => {
    testDelApi(rowId).then(() => {
      message.success("已删除")
      getDataSource()
    })
  })
}
</script>

<style scoped lang="less"></style>
