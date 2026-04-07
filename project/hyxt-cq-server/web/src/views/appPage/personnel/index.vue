<template>
  <a-spin :spinning="spinning" tip="Loading...">
    <div class="query-form-wrap">
      <a-space>
        <common-select
          v-if="userInfo.type != 'ORG'"
          v-model:value="queryFrom.registerOrgId"
          :url="orgList()"
          placeholder="请选择检测机构"
          :config="{
            keyword: 'orgName',
            httpSearch: true
          }"
        />
        <a-input-search
          v-model:value="queryFrom.key"
          style="width: 350px"
          placeholder="请输入人员姓名/证件编号/检测证书编号查询"
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
      size="small"
      bordered
      row-key="id"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key == 'handle'">
          <a-space>
            <!-- 行业类型账户 -->
            <a-button
              v-auth="'person::industry::view'"
              type="primary"
              size="small"
              @click="goDetail(record)"
            >
              查看
            </a-button>
            <!-- 机构类型账户 -->
            <a-button
              v-auth="'person::org::view'"
              type="primary"
              size="small"
              @click="openDetail(record.id)"
            >
              查看
            </a-button>
          </a-space>
        </template>
      </template>
    </a-table>

    <Detail ref="detail" :key="updateKey" />
  </a-spin>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, inject, nextTick } from "vue"
import { getPageList, personParType } from "@/api/personnel.api"
import { orgList } from "@/api/commonSelect.api"
import type { btnsType } from "@/type/common/common"
import type { TableColumnType, PaginationProps } from "ant-design-vue"
import CommonSelect from "@/components/commonSelect/index.vue"
import Detail from "./components/Detail.vue"
import userStore from "@/stores/userInfo"
const { userInfo } = userStore()

const spinning = ref<boolean>(false)

const queryFrom = reactive({
  registerOrgId: userInfo.type == "ORG" ? userInfo.orgId : "",
  key: ""
})

onMounted(() => {
  getDataSource()
})

// 表格列
const columns = reactive<TableColumnType[]>([
  {
    dataIndex: "index",
    key: "index",
    width: 50,
    align: "center",
    customRender: ({ index }) => {
      return index + 1
    }
  },
  {
    title: "姓名",
    dataIndex: "name",
    key: "name",
    width: 100
  },
  {
    title: "性别",
    dataIndex: "gender",
    key: "gender",
    customRender: ({ text }) => {
      return text == "1" ? "男" : "女"
    }
  },
  // {
  //   title: "证件编号",
  //   dataIndex: "idNum",
  //   key: "idNum"
  // },
  {
    title: "注册机构",
    dataIndex: "registerOrgName",
    key: "registerOrgName"
  },
  {
    title: "证书类型",
    dataIndex: "certsType",
    key: "certsType"
  },
  {
    title: "检测证书编号",
    dataIndex: "certsNo",
    key: "certsNo"
  }
  // {
  //   title: "操作",
  //   dataIndex: "handle",
  //   key: "handle",
  //   width: 80
  // }
])
const dataSource = ref<personParType[]>([])
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
  const param = {
    current: pagination.current,
    size: pagination.pageSize,
    ...queryFrom
  }
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

// 批量操作按钮
const btnsList = reactive<btnsType[]>([
  {
    btnName: "同步人员信息",
    authCode: "*",
    syncType: "PERSON",
    click: () => {
      getDataSource(true)
    }
  }
])

// 查看详情 - 跳转部平台
const goDetail = (row: personParType) => {
  window.open(
    `${import.meta.env.VITE_PART_API}/PCWeb/OrgQuery/PersonDetails?cardNo=${row.idNum}&personName=${
      row.name
    }`,
    "_blank"
  )
}

// 查看详情 - 本地查看
const detail = ref()
const updateKey = ref<number>()
const openDetail = (rowId: string) => {
  updateKey.value = new Date().getTime()
  nextTick(() => {
    detail.value.openModal(rowId)
  })
}
</script>

<style scoped lang="less"></style>
