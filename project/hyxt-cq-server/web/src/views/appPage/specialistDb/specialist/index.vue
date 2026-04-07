<template>
  <a-spin :spinning="spinning" tip="Loading...">
    <div class="query-form-wrap">
      <a-space>
        <DictCode
          v-model:value="queryFrom.highway"
          code="expert::major::highway"
          multiple
          placeholder="请选择申报公路专业"
        />
        <DictCode
          v-model:value="queryFrom.water"
          code="expert::major::water"
          multiple
          placeholder="请选择申报水运专业"
        />
        <a-select v-model:value="queryFrom.status" allow-clear placeholder="请选择状态">
          <a-select-option value="FREE">待选择</a-select-option>
          <a-select-option value="BUSY">已选择</a-select-option>
          <a-select-option value="INELIGIBLE">已删除</a-select-option>
        </a-select>
        <a-input-search
          v-model:value="queryFrom.q"
          placeholder="请输入专家姓名查询"
          enter-button
          @search="getDataSource(true)"
        />
      </a-space>
      <handle-btns :datas="btnsList" />
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
            <a-button type="primary" size="small" @click="goDetail('详情', record.id, false)">
              详情
            </a-button>
            <a-button
              v-if="record.status !== 'INELIGIBLE'"
              v-auth="'expert::expert::update'"
              type="primary"
              size="small"
              @click="goDetail('编辑', record.id, true)"
            >
              编辑
            </a-button>
            <a-button type="primary" size="small" @click="showLog(record.id)">日志</a-button>
            <a-button type="primary" size="small" @click="showRecord(record.id)">选择记录</a-button>
            <a-button
              v-if="record.status === 'INELIGIBLE'"
              v-auth="'expert::expert::restore'"
              type="primary"
              size="small"
              @click="restore(record.id)"
            >
              恢复
            </a-button>
            <a-button
              v-if="record.status === 'FREE'"
              v-auth="'expert::expert::delete'"
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

    <Detail ref="detail" :key="detailKey" @updateList="getDataSource(true)" />
    <!-- 日志 -->
    <Log ref="log" />
    <!-- 选择记录 -->
    <SelectRecord ref="selectRecord" />
    <!-- 导入 -->
    <a-modal
      v-model:visible="visible"
      title="导入"
      cancel-text="关闭"
      :mask-closable="false"
      :keyboard="false"
      width="60%"
      @ok="visible = false"
    >
      <p style="margin-bottom: 10px">
        <span class="error">提示：</span>
        <span target="_blank" class="blue" @click="downloadByNameOrUrl('专家导入模板.xlsx')">
          导入格式表下载
        </span>
      </p>
      <span>导入数据：</span>
      <UploadFile
        :before-upload="beforeUpload"
        :config="{
          hideFileList: true,
          loading: importLoading
        }"
      />

      <div style="min-height: 200px">
        <template v-if="importFailList.length > 0">
          <p style="margin: 20px 0 5px">导入失败，错误信息如下，请调整后重新上传：</p>
          <a-table
            :data-source="importFailList"
            :columns="failColumns"
            :pagination="false"
            bordered
            size="small"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key == 'message'">
                <span class="error">{{ record[column.key] }}</span>
              </template>
            </template>
          </a-table>
        </template>
      </div>
    </a-modal>
  </a-spin>
</template>

<script setup lang="ts">
import { ExclamationCircleOutlined } from "@ant-design/icons-vue"
import { reactive, ref, createVNode, onMounted, nextTick, inject } from "vue"
import { Modal, message } from "ant-design-vue"
import { getPageList, delById, importApi, restoreApi } from "@/api/specialistDb.api"
import { dataItemType } from "@/type/api/specialistDb.api"

import type { btnsType } from "@/type/common/common"
import type { TableColumnType, PaginationProps } from "ant-design-vue"
import Log from "@/components/log/index.vue"
import DictCode from "@/components/dictCode/index.vue"
import UploadFile from "@/components/uploadFile/index.vue"
import Detail from "./components/Detail.vue"
import SelectRecord from "./components/SelectRecord.vue"
import { downloadByNameOrUrl } from "@/config/minio.config"

const spinning = ref<boolean>(false)

// 查询条件
const queryFrom = reactive({
  water: [],
  highway: [],
  status: null,
  q: ""
})

// 类型
const statusObj = {
  FREE: "待选择",
  BUSY: "已选择",
  INELIGIBLE: "已删除"
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
    title: "专家姓名",
    dataIndex: "name",
    key: "name"
  },
  {
    title: "身份证",
    dataIndex: "idCard",
    key: "idCard"
  },
  {
    title: "申报公路专业",
    dataIndex: "highwayDeclare",
    key: "highwayDeclare"
  },
  {
    title: "申报水运专业",
    dataIndex: "waterDeclare",
    key: "waterDeclare"
  },
  {
    title: "状态",
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
    width: 150
  }
])

// 数据加载
onMounted(() => {
  getDataSource()
})
const dataSource = ref<dataItemType[]>([])
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
    authCode: "expert::expert::create",
    click: () => {
      goDetail("新增", "", true)
    }
  },
  {
    btnName: "导入",
    authCode: "expert::expert::import",
    click: () => {
      importFailList.value = []
      importLoading.value = false
      visible.value = true
    }
  }
])

// 导入失败数据展示列信息
const failColumns = reactive([
  {
    title: "专家姓名",
    dataIndex: "name",
    key: "name"
  },
  {
    title: "身份证",
    dataIndex: "idCard",
    key: "idCard"
  },
  {
    title: "行号",
    dataIndex: "line",
    key: "line"
  },
  {
    title: "失败原因",
    dataIndex: "message",
    key: "message"
  }
])

// 导入
const visible = ref<boolean>(false)
const importLoading = ref<boolean>(false)
const importFailList = ref([])
const beforeUpload = (fileList) => {
  importLoading.value = true
  importApi({
    file: fileList[0]
  })
    .then((res: any) => {
      if (res.completed) {
        message.success("导入成功")
        visible.value = false
        getDataSource()
      } else {
        message.error("导入失败")
        importLoading.value = false
        importFailList.value = res.msg
      }
    })
    .catch(() => {
      importLoading.value = false
    })
  return false
}

// 新增、编辑、详情
const detailKey = ref<number>()
const detail = ref()
const goDetail = (title: string, rowId: string, isEdit: boolean) => {
  detailKey.value = new Date().getTime()
  nextTick(() => {
    detail.value.openModal(title, rowId, isEdit)
  })
}

const log = ref()
const showLog = (id: string) => {
  log.value.openModal(id)
}

// 选择记录
const selectRecord = ref()
const showRecord = (id: string) => {
  selectRecord.value.openModal(id)
}

// 恢复
const restore = (rowId: string) => {
  openConfirm("是否确认恢复该专家信息？", "恢复之后专家状态将为待选择，可参与活动抽选").then(() => {
    restoreApi(rowId).then((res) => {
      message.success("已恢复")
      getDataSource()
    })
  })
}

// 删除
const delRow = (rowId: string) => {
  openConfirm("是否确认删除该专家信息？", "删除之后专家状态将为已删除，无法参与活动抽选").then(
    () => {
      delById(rowId).then((res) => {
        message.success("已删除")
        getDataSource()
      })
    }
  )
}
</script>

<style scoped lang="less"></style>
