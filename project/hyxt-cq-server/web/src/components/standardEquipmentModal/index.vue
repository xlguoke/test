<template>
  <a-modal
    v-model:visible="visible"
    title="选择标准设备"
    :mask-closable="false"
    :keyboard="false"
    width="600px"
    @ok="handleSave"
  >
    <div class="search">
      <a-input
        v-model:value="searchText"
        style="width: 200px"
        placeholder="请输入设备名称查询"
        allow-clear
        @keypress.enter="handleSearch"
      />
      <a-button type="primary" @click="handleSearch">查询</a-button>
    </div>
    <a-table
      v-if="filteredData.length > 0"
      :data-source="filteredData"
      :columns="columns"
      :loading="loading"
      :row-selection="rowSelection"
      :custom-row="handleCustomRow"
      :scroll="{ y: '50vh' }"
      size="small"
      bordered
      row-key="id"
    ></a-table>
    <div v-else-if="!loading && dataList.length > 0" class="no-result">
      <a-empty description="没有找到匹配的设备" />
    </div>
    <div v-else-if="!loading && dataList.length === 0" class="no-result">
      <a-empty description="暂无设备数据" />
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { getStandardEquipments } from "@/api/equipment.api"
import { message } from "ant-design-vue"
import { reactive, ref, PropType } from "vue"

interface DataItem {
  id: string
  name: string
}

const props = defineProps({
  type: {
    type: String as PropType<"checkbox" | "radio">,
    default: "checkbox"
  }
})
const emits = defineEmits(["onSelected"])

const visible = ref(false)
const loading = ref(false)
const searchText = ref("")
const originalDataList = ref<DataItem[]>([])
const dataList = ref<DataItem[]>([])
const selectedRowKeys = ref<string[]>([])
const selectedRows = ref<DataItem[]>([])
// 搜索过滤后的数据源
const filteredData = ref<DataItem[]>([])

function handleFilter() {
  let filterList: any[] = []
  if (!searchText.value.trim()) {
    filterList = [...dataList.value]
  } else {
    const keyword = searchText.value.toLowerCase().trim()
    filterList = dataList.value.filter((item) => {
      // 搜索设备名称字段
      return [item.name].some((field) => {
        return field && field.toLowerCase().includes(keyword)
      })
    })
  }
  if (props.type === "radio") {
    const item = filterList.find((d) => d.id === selectedRowKeys.value[0])
    if (!item && selectedRows.value.length > 0) {
      filterList.unshift(selectedRows.value[0])
    }
  }

  filteredData.value = [...filterList]
}

// 重置选择状态
function resetSelection() {
  selectedRowKeys.value = []
  selectedRows.value = []
}

const rowSelection = reactive({
  type: props.type,
  selectedRowKeys: selectedRowKeys,
  onChange: (_selectedRowKeys, _selectedRows) => {
    selectedRowKeys.value = _selectedRowKeys
    selectedRows.value = _selectedRows
  }
})

// 点击行选中处理
function handleCustomRow(record: any) {
  return {
    onClick: () => {
      if (props.type === "radio") {
        selectedRowKeys.value = [record.id]
        selectedRows.value = [record]
        return
      }
      const index = selectedRowKeys.value.indexOf(record.id)
      if (index === -1) {
        // 未选中，添加到选中列表
        selectedRowKeys.value = [...selectedRowKeys.value, record.id]
        selectedRows.value = [...selectedRows.value, record]
      } else {
        // 已选中，从选中列表移除
        selectedRowKeys.value = selectedRowKeys.value.filter((id) => id !== record.id)
        selectedRows.value = selectedRows.value.filter((row) => row.id !== record.id)
      }
    }
  }
}

const columns = reactive([
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
    dataIndex: "name",
    key: "name",
    title: "设备名称"
  }
])

function openModal() {
  visible.value = true
  loading.value = true
  searchText.value = ""
  resetSelection()

  getStandardEquipments()
    .then((res) => {
      originalDataList.value = res || []
      dataList.value = JSON.parse(JSON.stringify(originalDataList.value))
      filteredData.value = JSON.parse(JSON.stringify(dataList.value))
      loading.value = false
    })
    .catch(() => {
      originalDataList.value = []
      dataList.value = []
      loading.value = false
    })
}

function closeModal() {
  visible.value = false
  searchText.value = ""
  resetSelection()
}

function handleSearch() {
  handleFilter()
}

function handleSave() {
  if (selectedRows.value.length === 0) {
    message.error("请选择设备")
    return
  }
  emits("onSelected", selectedRows.value)
  closeModal()
}

defineExpose({
  openModal
})
</script>

<style scoped>
.search {
  display: flex;
  column-gap: 8px;
  margin-bottom: 8px;
}

.no-result {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  margin: 20px 0;
}
</style>
