<template>
  <a-spin :spinning="spinning" tip="Loading...">
    <a-layout>
      <a-layout-sider width="240">
        <p class="eq-title">采集设备大类</p>
        <a-list size="small" :data-source="dictDatas" style="padding-right: 10px">
          <template #renderItem="{ item, index }">
            <a-list-item
              :class="`${index == eqKey ? 'active' : ''}`"
              @click="chooseEq(item.code, index)"
            >
              {{ item.name }}
            </a-list-item>
          </template>
        </a-list>
      </a-layout-sider>
      <a-layout-content style="background: #fff; padding-left: 10px">
        <div class="query-form-wrap">
          <a-space>
            <common-select
              v-model:value="queryFrom.projectId"
              :url="projectPages()"
              :config="{
                placeholder: '请选择工程项目'
              }"
              @change="
                () => {
                  queryFrom.labId = ''
                }
              "
            />
            <common-select
              v-model:value="queryFrom.labId"
              :url="userAuthLab(queryFrom.projectId)"
              :config="{
                placeholder: '请选择试验室'
              }"
              @change="changeLab"
            />
            <a-select v-model:value="queryFrom.dataType" placeholder="请选择状态">
              <a-select-option value>全部</a-select-option>
              <a-select-option value="true">已删除</a-select-option>
              <a-select-option value="false">正常</a-select-option>
            </a-select>
            <a-input-search
              v-model:value="queryFrom.equSn"
              placeholder="请输入设备编号查询"
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
                  v-auth="'collect::eq::view'"
                  type="primary"
                  size="small"
                  @click="editRow('设备详情', record.id, false)"
                >
                  详情
                </a-button>
                <a-button
                  v-if="!record.deleted"
                  v-auth="'collect::eq:update'"
                  type="primary"
                  size="small"
                  @click="editRow('编辑设备', record.id, true)"
                >
                  编辑
                </a-button>
                <a-button
                  v-if="!record.deleted"
                  v-auth="'collect::eq::delete'"
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
      </a-layout-content>
    </a-layout>

    <Detail ref="detail" :key="updateKey" :lab-info="labInfo" @update-list="getDataSource" />
  </a-spin>
</template>

<script setup lang="ts">
import { ExclamationCircleOutlined } from "@ant-design/icons-vue"
import { reactive, ref, createVNode, onMounted, nextTick, inject } from "vue"
import { Modal, message } from "ant-design-vue"
import { getPageList, delById } from "@/api/dataMonitoring.api"
import { getDetailByCode, listType } from "@/api/dictCode.api"
import { projectPages, userAuthLab } from "@/api/commonSelect.api"
import type { dataItemType, queryParType } from "@/type/api/dataMonitoring.api"
import type { TableColumnType, PaginationProps } from "ant-design-vue"
import CommonSelect from "@/components/commonSelect/index.vue"
import Detail from "./components/Detail.vue"

const spinning = ref<boolean>(false)
const queryFrom = reactive({
  categoryCode: "",
  projectId: "",
  labId: "",
  dataType: "",
  equSn: ""
})

const labInfo = reactive({
  labName: "",
  labId: ""
})

const dictDatas = ref<listType[]>([])
onMounted(async () => {
  await getDictDatas()
  getDataSource()
})

// 获取设备采集大类
const getDictDatas = () => {
  getDetailByCode("collectEqClasses").then((res: any) => {
    dictDatas.value = res.dict || []
  })
}

// 选择采集设备大类
const eqKey = ref<number>()
const chooseEq = (code: string, ind: number) => {
  eqKey.value = eqKey.value == ind ? -1 : ind
  queryFrom.categoryCode = eqKey.value == ind ? code : ""
  getDataSource(true)
}
// 修改试验室
const changeLab = ({ value, option }) => {
  labInfo.labName = value ? option.name : ""
  labInfo.labId = value ? option.id : ""
  if (!value) return
  if (!queryFrom.projectId || queryFrom.projectId != option.projectId) {
    queryFrom.projectId = option.projectId
  }
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
    title: "采集类型",
    dataIndex: "categoryCode",
    key: "categoryCode",
    customRender: ({ text }) => {
      const dict = dictDatas.value.find((d) => d.code == text) as listType
      return dict ? dict.name : ""
    }
  },
  {
    title: "设备编号(标识)",
    dataIndex: "equipmentSn",
    key: "equipmentSn"
  },
  {
    title: "规格型号",
    dataIndex: "model",
    key: "model"
  },
  {
    title: "所属试验室",
    dataIndex: "laboratoryName",
    key: "laboratoryName"
  },
  {
    title: "位置",
    dataIndex: "location",
    key: "location"
  },
  {
    title: "状态",
    dataIndex: "deleted",
    key: "deleted",
    customRender: ({ text }) => {
      return text ? "已删除" : "正常"
    }
  },
  {
    title: "备注",
    dataIndex: "remark",
    key: "remark"
  },
  {
    title: "操作",
    dataIndex: "handle",
    key: "handle",
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
const getDataSource = (flag?: boolean) => {
  if (flag) {
    pagination.current = 1
  }
  const param: queryParType = {
    current: pagination.current,
    size: pagination.pageSize,
    ...queryFrom
  }
  spinning.value = true
  getPageList(param)
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

const btnsList = reactive([
  {
    btnName: "新增",
    authCode: "collect::eq::add",
    click: () => {
      editRow("新增设备", "", true)
    }
  }
])

//  确认弹窗
const openConfirm = (title: string, content: string) => {
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
const updateKey = ref()
// 保存-编辑
const editRow = (title: string, rowId: string, isEdit: boolean) => {
  updateKey.value = new Date().getTime()
  nextTick(() => {
    detail.value.openModal(title, rowId, isEdit)
  })
}

// 删除
const delRow = (rowId: string) => {
  openConfirm("提示", "删除设备不会删除设备上传的数据，是否继续？").then(() => {
    delById(rowId).then(() => {
      message.success("删除成功")
      getDataSource()
    })
  })
}
</script>

<style scoped lang="less">
.eq-title {
  margin-right: 10px;
  margin-bottom: 10px;
  padding: 12px;
  font-size: 14px;
  background: #f5f5f5;
}
.ant-list-item {
  cursor: pointer;
  &:hover,
  &.active {
    background: #e5f0ff;
  }
}
</style>
