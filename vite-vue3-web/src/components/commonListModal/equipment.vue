<template>
  <BaseModal
    ref="baseModal"
    :key="modalKey"
    title="设备列表"
    :selected="selected"
    :query-form="queryForm"
    :query-columns="queryColumns"
    :datas="dataSource"
    :type="type"
    @ok="okModal"
  />
</template>

<script setup lang="ts">
import { reactive, ref, watch } from "vue"
import BaseModal from "./components/baseModal.vue"
import type { queryType, DataType } from "./components/baseModal"
import type { TableColumnType } from "ant-design-vue"

const props = defineProps({
  visible: Boolean,
  selected: {
    type: Array,
    default: (d: any) => {
      return d || []
    }
  },
  // 选择类型
  type: {
    type: String,
    default: "checkbox"
  },
  autoClose: Boolean
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
    label: "姓名",
    value: "name",
    type: "input"
  }
])
// 业绩关联人员表格列信息
const queryColumns = reactive<TableColumnType[]>([
  {
    title: "姓名",
    dataIndex: "name",
    key: "name"
  },
  {
    title: "身份证号",
    dataIndex: "name",
    key: "name"
  },
  {
    title: "职务",
    dataIndex: "name",
    key: "name"
  },
  {
    title: "职称",
    dataIndex: "name",
    key: "name"
  }
])

// 获取数据列表
// onMounted(() => {
//   getPersonnelDatas()
// })
const dataSource = ref<DataType[]>([
  { id: "1", name: "李四" },
  { id: "2", name: "张三" }
])
// const getPersonnelDatas = () => {}

const okModal = (list: any) => {
  emit("update:selected", list)
  emit("confirm", list)
  if (props.autoClose) {
    emit("update:visible", false)
  }
}
</script>

<style></style>
