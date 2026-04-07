<template>
  <div class="dataRangetable_wrap">
    <div>
      <p class="tle">质量监督报告-数据范围权限：</p>
      <a-alert
        style="margin-bottom: 10px"
        message="注意：“若未勾选以下权限则只能查看当前单位为委托单位的抽检报告！”"
        type="info"
        show-icon
      />
      <a-table
        :data-source="dataSource1"
        :columns="columns"
        size="small"
        :row-selection="rowSelection"
        row-key="id"
        bordered
        :pagination="false"
      />
    </div>
    <div>
      <p class="tle">工程项目监督机构-数据范围权限：</p>
      <a-alert
        style="margin-bottom: 10px"
        message="注意：“若未勾选以下权限则只能查看当前用户自己审核的工地/中心试验室及其报告！”"
        type="info"
        show-icon
      />
      <a-table
        :data-source="dataSource2"
        :columns="columns"
        :row-selection="rowSelForProject"
        class="radio-table"
        size="small"
        row-key="id"
        bordered
        :pagination="false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"

interface DataType {
  checked?: boolean
  id: string
  name: string
  code: string
  description: string
}

let selectedRowKeys = ref<string[]>([])
let selectedRows = ref<DataType[]>([])
let rowSelection = {
  selectedRowKeys: selectedRowKeys,
  onChange: (keys: string[], rows: DataType[]) => {
    selectedRowKeys.value = keys
    selectedRows.value = rows
  }
}

let selRowKeysForProject = ref<string[]>([])
let selRowsForProject = ref<DataType[]>([])
let rowSelForProject = {
  selectedRowKeys: selRowKeysForProject,
  onChange: (keys: string[], rows: DataType[]) => {
    let key: string[] = []
    let row: DataType[] = []
    if (keys.length > 0) {
      key = [keys[keys.length - 1]]
      row = [rows[rows.length - 1]]
    }
    selRowKeysForProject.value = key
    selRowsForProject.value = row
  }
}
const columns = ref([
  {
    title: "权限名称",
    dataIndex: "name",
    key: "name"
  },
  {
    title: "权限编码",
    dataIndex: "code",
    key: "code"
  },
  {
    title: "权限描述",
    dataIndex: "description",
    key: "description"
  }
])

const dataSource1 = ref<DataType[]>([
  {
    id: "1600725600312324098",
    name: "查看全部质量监督抽检报告",
    description: "拥有该权限,能查看全部监督抽检报告. 否则只能查看当前单位为委托单位的抽检报告",
    code: "report::inspection::extend"
  }
])
const dataSource2 = ref<DataType[]>([
  {
    id: "1658423390592851970",
    name: "区县范围",
    description: "该权限能查看所有区县级项目的工地/中心试验室信息及其出具的报告",
    code: "psa::district::view"
  },
  {
    id: "1658423183893356545",
    name: "本监管机构范围",
    description: "该权限能查看本单位监督的工地/中心试验室信息及其出具的报告数据",
    code: "psa::bureau::view"
  },
  {
    id: "1658423892210638849",
    name: "省市范围",
    description: "该权限能查看全市所有项目的工地/中心试验室信息及其出具的报告",
    code: "psa::province::view"
  }
])

// 默认选中
const initSelected = (qualityAuths: DataType[], projectAuths: DataType[]) => {
  if (qualityAuths && qualityAuths.length > 0) {
    selectedRows.value = qualityAuths
    selectedRowKeys.value = qualityAuths.map((d) => d.id)
  } else {
    selectedRows.value = []
    selectedRowKeys.value = []
  }
  if (projectAuths && projectAuths.length > 0) {
    selRowsForProject.value = projectAuths
    selRowKeysForProject.value = projectAuths.map((d) => d.id)
  } else {
    selRowsForProject.value = []
    selRowKeysForProject.value = []
  }
}

/**
 * 获取选中的数据
 * @return Object
 * @return Object.quality 质量监督报告
 * @return Object.project 工程项目监督机构
 */
const saveData = () => {
  return {
    quality: selectedRowKeys.value,
    project: selRowKeysForProject.value
  }
}

defineExpose({ saveData, initSelected })
</script>

<style lang="less">
.dataRangetable_wrap {
  .tle {
    padding: 10px 0px;
    font-size: 14px;
    font-weight: 900;
  }
  .radio-table {
    .ant-table-selection-column .ant-table-selection {
      display: none !important;
    }
  }
}
</style>
