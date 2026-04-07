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
import BaseModal from "./components/baseModal.vue"
import { getPageList, getPageListByType } from "@/api/organization.api"
import type { queryType } from "./components/baseModal"
import type { TableColumnType } from "ant-design-vue"

const props = defineProps({
  visible: Boolean,
  selected: Array,
  // 机构列表类型: all-所有  adm-行管  org-机构
  orgType: {
    type: String,
    default: "org"
  },
  // 选择类型
  type: {
    type: String,
    default: "checkbox"
  },
  title: {
    type: String,
    default: "机构列表"
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
      getDataSource()
    }
    mvisible.value = val
  }
)
watch(mvisible, (val) => {
  !val && emit("update:visible", false)
})

interface orgType {
  id: string
  orgName: string
}

// 业绩关联人员搜索条件
const queryForm = reactive<queryType[]>([
  {
    label: "机构名称",
    value: "name",
    type: "input"
  }
])
// 业绩关联人员表格列信息
const queryColumns = reactive<TableColumnType[]>([
  {
    title: "机构名称",
    dataIndex: "name",
    key: "name"
  },
  {
    title: "机构类型",
    dataIndex: "orgType",
    key: "orgType"
  },
  {
    title: "机构性质",
    dataIndex: "orgNature",
    key: "orgNature"
  }
])

const dataSource = ref<orgType[]>([])
const getDataSource = () => {
  if (props.orgType === "all") {
    getPageList({
      current: 1,
      size: 999
    }).then((res: any) => {
      dataSource.value = res.records || []
    })
  } else {
    getPageListByType(props.orgType).then((res: any) => {
      dataSource.value = res || res.records || []
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
