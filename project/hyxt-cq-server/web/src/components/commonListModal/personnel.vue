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
    :http-option="httpOption"
    :is-pagination="isPagination"
    @ok="okModal"
  />
</template>

<script setup lang="ts">
import { reactive, ref, watch, PropType } from "vue"
import { getPageList, getDataListUrl, personParType } from "@/api/personnel.api"
import BaseModal from "./components/baseModal.vue"
import type { queryType, DataType, HttpOptionType } from "./components/baseModal"
import type { TableColumnType } from "ant-design-vue"
import userStore from "@/stores/userInfo"
const { userInfo } = userStore()

const props = defineProps({
  visible: Boolean,
  selected: {
    type: Array as PropType<any[]>,
    default: () => []
  },
  // 选择类型
  type: {
    type: String,
    default: "checkbox"
  },
  title: {
    type: String,
    default: "人员列表"
  },
  orgId: {
    type: String,
    default: ""
  },
  isPagination: Boolean,
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
      getPersonnelDatas()
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
    value: props.isPagination ? "key" : "name",
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
    dataIndex: "idNum",
    key: "idNum"
  },
  {
    title: "职称",
    dataIndex: "jobTitle",
    key: "jobTitle"
  },
  {
    title: "职务",
    dataIndex: "duties",
    key: "duties"
  }
])

const httpOption: HttpOptionType = {
  url: getDataListUrl()
}

// 获取数据列表
const dataSource = ref<DataType[]>([])
const getPersonnelDatas = async () => {
  if (props.isPagination) return
  const orgId = props.orgId ? props.orgId : userInfo.type == "ORG" ? userInfo.orgId : ""
  let res: any = null
  if (!props.isPagination) {
    res = await getPageList({
      current: 1,
      size: 999,
      registerOrgId: orgId
    })
  }
  if (!res) return
  dataSource.value = res.records || []
}

const okModal = (list: personParType[]) => {
  emit("update:selected", list)
  emit("confirm", list)
  if (props.autoClose) {
    emit("update:visible", false)
  }
}
</script>

<style></style>
