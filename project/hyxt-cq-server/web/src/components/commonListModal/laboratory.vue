<template>
  <BaseModal
    :key="modalKey"
    v-model:visible="mvisible"
    :title="title"
    :selected="selected"
    :query-form="queryForm"
    :query-columns="queryColumns"
    :datas="dataSource"
    :type="type"
    :auto-close="autoClose"
    @ok="okModal"
  />
</template>

<script setup lang="ts">
import { reactive, ref, watch } from "vue"
import { getLaboratoryAPI, getUserLaboratoryAPI } from "@/api/laboratory.api"
import type { LaboratoryEditBaseParams } from "@/type/api/fieldLaboratory.api"
import BaseModal from "./components/baseModal.vue"
import type { queryType } from "./components/baseModal"
import type { TableColumnType } from "ant-design-vue"

const props = defineProps({
  visible: Boolean,
  selected: Array,
  // 选择类型
  type: {
    type: String,
    default: "checkbox"
  },
  title: {
    type: String,
    default: "试验室列表"
  },
  // 是否获取用户已授权的试验室
  isAuth: {
    type: Boolean,
    default: true
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
      getDatas()
    }
    mvisible.value = val
  }
)
watch(mvisible, (val) => {
  !val && emit("update:visible", false)
})

// 搜索条件
const queryForm = reactive<queryType[]>([
  {
    label: "试验室名称",
    value: "name",
    type: "input"
  }
])
// 表格列信息
const queryColumns = reactive<TableColumnType[]>([
  {
    title: "试验室名称",
    dataIndex: "name",
    key: "name"
  },
  {
    title: "试验室类型",
    dataIndex: "type",
    key: "type"
  },
  {
    title: "状态",
    dataIndex: "status",
    key: "status"
  }
])

// 获取数据列表
const dataSource = ref<LaboratoryEditBaseParams[]>([])
const getDatas = () => {
  if (props.isAuth) {
    getUserLaboratoryAPI().then((res) => {
      dataSource.value = res || []
    })
  } else {
    getLaboratoryAPI({
      size: 999,
      current: 1,
      classification: ""
    }).then((res) => {
      dataSource.value = res.records || []
    })
  }
}

const okModal = (list) => {
  emit("update:selected", list)
  emit("confirm", list)
  if (props.autoClose) {
    emit("update:visible", false)
  }
}
</script>

<style></style>
