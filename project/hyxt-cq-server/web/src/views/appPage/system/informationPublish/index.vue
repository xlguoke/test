<template>
  <a-spin :spinning="spinning" tip="Loading...">
    <div class="information-list">
      <div class="query-form-wrap">
        <a-space>
          <a-select v-model:value="queryFrom.type" allow-clear placeholder="选择类型查询">
            <a-select-option v-for="news in newsType" :key="news.type" :value="news.type">
              {{ news.title }}
            </a-select-option>
          </a-select>
          <a-input-search
            v-model:value="queryFrom.title"
            placeholder="请输入标题查询"
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
              <a-button
                v-auth="'cms::news::update'"
                type="primary"
                size="small"
                @click="editRow(record.id)"
              >
                编辑
              </a-button>
              <a-button
                v-if="record.hide"
                v-auth="'cms::news::hide'"
                type="primary"
                size="small"
                @click="showRow(record.id)"
              >
                取消隐藏
              </a-button>
              <a-button
                v-else
                v-auth="'cms::news::hide'"
                type="primary"
                size="small"
                @click="hideRow(record.id)"
              >
                隐藏
              </a-button>
              <a-button
                v-auth="'cms::news::delete'"
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

      <Detail ref="detail" :key="updateKey" :news-type="newsType" :update-list="getDataSource" />

      <a-card v-if="showTempleUpload" title="上传模板文件">
        <p>仅开发模式显示，上传到2.66</p>
        <br />
        <UploadFile
          v-model:value="templateFiles"
          :config="{
            multiple: false,
            bucketUri: 'template'
          }"
        />
        <a-input v-for="d in templateFiles" :key="d.url" v-model:value="d.url" />
      </a-card>
    </div>
  </a-spin>
</template>

<script setup lang="ts">
import { ExclamationCircleOutlined } from "@ant-design/icons-vue"
import { reactive, ref, createVNode, onMounted, nextTick, inject } from "vue"
import { Modal, message } from "ant-design-vue"
import { getOrgPageList, delById, showOrHide } from "@/api/information.api"
import type { dataItemType } from "@/type/api/information.api"
import type { TableColumnType, PaginationProps } from "ant-design-vue"
import { formatDate } from "@/assets/js/common"
import Detail from "./components/Detail.vue"
import UploadFile from "@/components/uploadFile/index.vue"

const templateFiles = ref<any>([])
const showTempleUpload = ref(import.meta.env.MODE === "dev")

const queryFrom = reactive({
  type: null,
  title: ""
})

// 信息类型
// {
//     title: "成果展示",
//     type: "ACHIEVEMENT",
// }
const newsType = reactive([
  {
    title: "要闻",
    type: "BRIEFING"
  },
  {
    title: "公告信息",
    type: "NOTICE"
  },
  {
    title: "新闻信息",
    type: "NEWS"
  },
  {
    title: "政策文件",
    type: "POLICY"
  },
  {
    title: "常见问题",
    type: "PROBLEM"
  },
  {
    title: "用户手册",
    type: "MANUAL"
  }
])

onMounted(() => {
  getDataSource()
})

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
    title: "标题",
    dataIndex: "title",
    key: "title",
    width: 200
  },
  {
    title: "发布日期",
    dataIndex: "publishDate",
    key: "publishDate",
    customRender: ({ text }) => {
      return text ? formatDate(text) : ""
    }
  },
  {
    title: "类别",
    dataIndex: "type",
    key: "type",
    customRender: ({ text }) => {
      return newsType.find((d) => d.type == text)?.title || ""
    }
  },
  {
    title: "是否置顶",
    dataIndex: "isTop",
    key: "isTop",
    width: 80,
    customRender: ({ text }) => {
      return text ? "是" : "否"
    }
  },
  {
    title: "置顶截至日期",
    dataIndex: "topExpirationDate",
    key: "topExpirationDate",
    customRender: ({ text }) => {
      return text ? formatDate(text) : ""
    }
  },
  // {
  //   title: "是否站内新闻",
  //   dataIndex: "isInWebsite",
  //   key: "isInWebsite",
  //   customRender: ({ text }) => {
  //     return text ? "是" : "否";
  //   },
  // },
  {
    title: "浏览次数",
    dataIndex: "flowRate",
    key: "flowRate"
  },
  {
    title: "状态",
    dataIndex: "hide",
    key: "hide",
    customRender: ({ text }) => {
      return text ? "隐藏" : "正常"
    }
  },
  {
    title: "操作",
    dataIndex: "handle",
    key: "handle",
    align: "center",
    width: 140,
    fixed: "right"
  }
])
const dataSource = ref<dataItemType[]>([])
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

const spinning = ref(false)
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
  getOrgPageList(param)
    .then((res: any) => {
      spinning.value = false
      if (!res) return
      dataSource.value = res.records
      pagination.total = res.total
    })
    .catch(() => {
      spinning.value = false
    })
}

// 批量操作按钮
const btnsList = reactive([
  {
    btnName: "新增",
    authCode: "cms::news::create",
    click: () => {
      editRow("")
    }
  }
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
      }
    })
  })
}

const detail = ref()
const updateKey = ref("")
// 保存-编辑
const editRow = (rowId: string) => {
  updateKey.value = new Date().getTime() + ""
  nextTick(() => {
    detail.value.openModal(rowId)
  })
}

// 隐藏
const hideRow = (rowId: string) => {
  openConfirm("确认隐藏这条数据吗？", "隐藏后该数据将不再门户展示").then(() => {
    showOrHide(rowId).then(() => {
      message.success("已隐藏")
      getDataSource()
    })
  })
}

// 取消隐藏
const showRow = (rowId: string) => {
  openConfirm("确认取消隐藏这条数据吗？", "取消隐藏后该数据将在门户展示").then(() => {
    showOrHide(rowId).then(() => {
      message.success("已取消隐藏")
      getDataSource()
    })
  })
}

// 删除
const delRow = (rowId: string) => {
  openConfirm("确认删除这条数据吗？").then(() => {
    delById(rowId).then(() => {
      message.success("删除成功")
      getDataSource()
    })
  })
}
</script>

<style scoped lang="less"></style>
