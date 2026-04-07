<template>
  <div style="height: 100%">
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
                queryFrom.projectType = option ? option[0].name : ''
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
            style="width: 300px"
            placeholder="请输入机构名称"
            enter-button
            @search="getDataSource(true)"
          />
        </a-space>
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
              <a-button
                v-if="record.id"
                type="primary"
                size="small"
                @click="goDetail(record.orgId)"
              >
                查看
              </a-button>
              <span v-else>-</span>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, inject } from "vue"
import { commitmentPageList, commitmentDetail } from "@/api/performance.api"
import { commitmentQueryType, commitmentListType } from "@/type/api/performance.api"
import type { TableColumnType, PaginationProps } from "ant-design-vue"
import { previewPDF } from "@/assets/js/common"
import DictCode from "@/components/dictCode/index.vue"
import { getMinioFileUrl } from "@/config/minio.config"

const spinning = ref<boolean>(false)

// 查询条件
const queryFrom = reactive({
  projectTypeCode: "",
  projectType: "",
  levelType: "",
  orgName: ""
})

// 表格列
const columns = reactive<TableColumnType[]>([
  {
    title: "",
    dataIndex: "index",
    key: "index",
    width: 50,
    align: "center",
    customRender: ({ text, record, index }) => {
      return index + 1
    }
  },
  {
    title: "机构名称",
    dataIndex: "orgName",
    key: "orgName"
  },
  {
    title: "所在省（市）",
    dataIndex: "orgProvince",
    key: "orgProvince"
  },
  {
    title: "所在市（区）",
    dataIndex: "orgCity",
    key: "orgCity"
  },
  {
    title: "等级类型",
    dataIndex: "qualify",
    key: "qualify"
  },
  {
    title: "检测证书编号",
    dataIndex: "certNo",
    key: "certNo"
  },
  {
    title: "机构性质",
    dataIndex: "orgNature",
    key: "orgNature"
  },
  {
    title: "承诺书",
    dataIndex: "id",
    key: "id",
    customRender: ({ text }) => {
      return text ? "已上传" : "未上传"
    }
  },
  {
    title: "操作",
    dataIndex: "handle",
    key: "handle",
    width: 80
  }
])

// 数据加载
onMounted(() => {
  getDataSource()
})

const dataSource = ref<commitmentListType[]>([])
const getDataSource = (flag?: boolean) => {
  if (flag) {
    pagination.current = 1
  }
  const params: commitmentQueryType = {
    ...queryFrom,
    current: pagination.current,
    size: pagination.pageSize
  }
  spinning.value = true
  commitmentPageList(params)
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
  onChange: (page: number, pageSize: number) => {
    pagination.current = page
    pagination.pageSize = pageSize
    getDataSource()
  }
})

const goDetail = (rowId: string) => {
  console.log("🚀 ~ file: list.vue:175 ~ goDetail ~ rowId", rowId)
  commitmentDetail(rowId).then(async (res: any) => {
    if (!res) return
    const url = await getMinioFileUrl(res.url)
    previewPDF(url)
  })
}
</script>

<style scoped lang="less">
.upload-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  .upload-con {
    height: 360px;
    text-align: center;
  }
  .upload-status {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 30px;
    font-size: 24px;
    color: @error_color;
    &.finish {
      color: @success_color;
      .icon-chenggong {
        font-size: 66px;
      }
    }
    .icon-file-pdf {
      border: 1px solid #ddd;
      border-radius: 50%;
      padding: 16px;
      font-size: 40px;
    }
    span {
      margin-left: 20px;
      font-weight: 600;
    }
  }
  .upload-hint {
    margin-top: 30px;
    line-height: 20px;
    text-align: left;
  }
}
</style>
