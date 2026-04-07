<template>
  <a-modal
    v-if="selProjectVisible"
    v-model:visible="selProjectVisible"
    width="800px"
    title="选择工程项目"
  >
    <a-spin tip="加载中..." :spinning="spinning">
      <a-input-search
        v-model:value="queryFrom.q"
        placeholder="请选择项目查询"
        enter-button
        style="width: 250px; margin-bottom: 15px"
        @search="getProjectData"
      />
      <a-table
        :data-source="dataSource"
        :columns="queryColumns"
        bordered
        size="small"
        row-key="id"
        :custom-row="customRow"
        :row-selection="rowSelection"
        :pagination="pagination"
      />
    </a-spin>
    <p style="color: #579357; margin-top: 10px">
      *
      若当前检测机构未查找到公路工程项目信息时，请联系建设单位在“重庆市公路建设市场监督管理系统”中完善工程项目合同段中的试验检测信息！
    </p>
    <p style="color: #579357; margin-top: 10px">
      *
      若当前检测机构未查找到水运工程项目信息时，请联系建设单位在本系统中“工程项目管理”菜单中新增水运工程项目，并将当前及参与该项目的检测机构录入到项目信息中，待提交审核并由工程项目监督机构审核通过后，对应检测机构便可进行工地试验室备案！
    </p>
    <template #footer>
      <a-button @click="selProjectVisible = false">取消</a-button>
      <a-button type="primary" @click="selOk">确定</a-button>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, nextTick } from "vue"
import type { TableColumnType } from "ant-design-vue"
import { getStateProjectAPI } from "@/api/laboratory.api"
import { getDetail } from "@/api/organization.api"

let spinning = ref(false)
let selProjectVisible = ref(false)
let pagination = ref(false)
// let pagination = ref({
//   size: "small",
//   showTotal: (total) => `共 ${total} 条数据`,
//   showQuickJumper: true,
//   showSizeChanger: true,
//   total: 0,
//   pageSizeOptions: ["10", "20", "50", "100"],
//   onChange: (page, pageSize) => {
//     queryFrom.value.current = page
//     queryFrom.value.size = pageSize
//     getProjectData()
//   }
// })

let queryFrom = ref({
  q: "",
  //  agencyName: "",
  businessLicenseRegistrationNumber: "",
  current: 1,
  size: 99999
})

const emit = defineEmits(["confirmOk"])

let selectedRowKeys = ref<string[]>([])
let selectedRows = ref<any>([])

let rowSelection = {
  type: "radio",
  selectedRowKeys: selectedRowKeys,
  onChange: (keys, rows) => {
    selectedRowKeys.value = keys
    selectedRows.value = rows
    console.log("selectedRowKeys: ", keys)
    console.log("selectedRows: ", rows)
  }
}
let customRow = (row, key) => {
  return {
    onClick: () => {
      selectedRowKeys.value = [row.id]
      selectedRows.value = [row]
    }
  }
}
const selOk = () => {
  emit("confirmOk", selectedRows.value)
  selProjectVisible.value = false
}

let openModal = async (data, orgId) => {
  //  queryFrom.value.agencyName = qName
  selProjectVisible.value = true
  spinning.value = true

  let res = await getDetail(orgId)
  queryFrom.value.businessLicenseRegistrationNumber = res.businessLicenseRegistrationNumber
  await getProjectData()

  if (data.length) {
    let row = dataSource.value.filter((it: any) => {
      return it.id == data[0].id
    })
    if (row.length) {
      selectedRowKeys.value = [row[0].id]
      selectedRows.value = row
    }
  } else {
    selectedRowKeys.value = []
    selectedRows.value = []
  }
  spinning.value = false
}

const queryColumns = reactive<TableColumnType[]>([
  {
    title: "项目名称",
    dataIndex: "name",
    key: "name",
    width: 250
  },
  {
    title: "工程类型",
    dataIndex: "kind",
    key: "kind",
    customRender: ({ text }) => {
      return text == "LANDWAY" ? "公路工程" : "水运工程"
    },
    width: 90
  },
  {
    title: "建设单位",
    dataIndex: "constructor",
    key: "constructor",
    customRender: ({ text }) => {
      return text.name
    },
    width: 200
  },
  {
    title: "项目状态",
    dataIndex: "state",
    key: "state",
    width: 80
  }
])

// 获取数据列表
// onMounted(() => {})

const dataSource = ref<any>([])
const getProjectData = async () => {
  let res = await getStateProjectAPI(queryFrom.value)
  // pagination.value.total = res.total
  dataSource.value = res.records
  // dataSource.value = res.records.filter((it) => {
  //   //过滤出已审核的工程项目数据才能进行选择
  //   return it.auditStatus == "APPROVED"
  // })
}

defineExpose({
  openModal
})
</script>

<style></style>
