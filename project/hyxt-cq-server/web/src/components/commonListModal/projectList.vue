<template>
  <BaseModal
    :key="modalKey"
    v-model:visible="mvisible"
    title="项目列表"
    :selected="selected"
    :query-form="queryForm"
    :query-columns="queryColumns"
    :type="type"
    :auto-close="autoClose"
    :datas="dataSource"
    @ok="okModal"
  />
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from "vue"
import BaseModal from "./components/baseModal.vue"
import type { queryType, DataType } from "./components/baseModal"
import type { TableColumnType } from "ant-design-vue"
import { getProjectAPI, getUserProjectAPI } from "@/api/laboratory.api"

const props = defineProps({
  visible: Boolean,
  selected: {
    type: Array,
    default: () => []
  },
  // 选择类型
  type: {
    type: String,
    default: "checkbox"
  },
  autoClose: Boolean,
  isAuth: {
    type: Boolean,
    default: true
  }
})
let StandardEqPagination = ref({
  size: "small",
  showTotal: (total) => `共 ${total} 条数据  `,
  showQuickJumper: false,
  showSizeChanger: false,
  total: 0,
  pageSizeOptions: ["10", "20", "50", "100"]
})

const emit = defineEmits(["update:selected", "update:visible", "confirm"])

const mvisible = ref<boolean>(props.visible)
const modalKey = ref("")
watch(
  () => props.visible,
  (val) => {
    if (val) {
      modalKey.value = new Date().getTime() + ""
    }
    mvisible.value = val
  }
)
watch(mvisible, (val) => {
  !val && emit("update:visible", false)
})

// 业绩关联人员搜索条件
const queryForm = reactive<queryType[]>([
  {
    label: "项目名称",
    value: "name",
    type: "input"
  }
])
const queryColumns = reactive<TableColumnType[]>([
  {
    title: "项目名称",
    dataIndex: "name",
    key: "name"
  },
  {
    title: "工程类型",
    dataIndex: "kind",
    key: "kind",
    customRender: ({ text }) => {
      return text == "LANDWAY" ? "公路工程" : "水运工程"
    }
  },
  {
    title: "建设单位",
    dataIndex: "constructor",
    key: "constructor",
    customRender: ({ text }) => {
      return text.name
    }
  },
  {
    title: "项目状态",
    dataIndex: "state",
    key: "state"
  }
])

// 获取数据列表
onMounted(() => {
  getProjectData()
})
const dataSource = ref<DataType[]>([])
const getProjectData = async () => {
  let list = []
  if (props.isAuth) {
    let res = await getUserProjectAPI()
    list = res || []
  } else {
    let res = await getProjectAPI({
      current: 1,
      size: 999
    })
    list = res.records || res || []
  }
  list = list.filter((d: any) => !d.closed)
  dataSource.value = list
}

const okModal = (list: any) => {
  emit("update:selected", list)
  emit("confirm", list)
  if (props.autoClose) {
    emit("update:visible", false)
  }
}
</script>

<style></style>
