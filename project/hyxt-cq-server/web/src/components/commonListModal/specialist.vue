<template>
  <BaseModal
    :key="modalKey"
    v-model:visible="mvisible"
    title="专家列表"
    :selected="selected"
    :query-form="queryForm"
    :query-columns="queryColumns"
    :datas="dataSource"
    :type="type"
    :auto-close="autoClose"
    row-key="expertId"
    @ok="okModal"
  />
</template>

<script setup lang="ts">
import { reactive, ref, watch } from "vue"
import { actSpecialist } from "@/api/specialistDb.api"
import type { recordParType } from "@/type/api/specialistDb.api"
import BaseModal from "./components/baseModal.vue"
import type { queryType } from "./components/baseModal"
import type { TableColumnType } from "ant-design-vue"

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
  params: {
    type: Object,
    default: () => ({})
  },
  disabledRows: {
    type: Array,
    default: () => []
  }
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
    dataIndex: "idCard",
    key: "idCard"
  },
  {
    title: "职称",
    dataIndex: "professional",
    key: "professional"
  },
  {
    title: "职务",
    dataIndex: "duty",
    key: "duty"
  }
])

// 获取数据列表
const dataSource = ref([])
const getPersonnelDatas = () => {
  actSpecialist(props.params as recordParType).then((res: any) => {
    let datas = res.records || res || []
    let selected = props.selected
    dataSource.value = datas.filter(
      (d) => selected.findIndex((v: any) => v.expertId == d.expertId) === -1
    )
  })
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
