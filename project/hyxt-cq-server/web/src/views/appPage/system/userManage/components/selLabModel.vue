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
import { reactive, ref, watch, toRefs } from "vue"
import { getUserLaboratoryAuthCan } from "@/api/system.api"
import type { LaboratoryEditBaseParams } from "@/type/api/fieldLaboratory.api"
import BaseModal from "@/components/commonListModal/components/baseModal.vue"
import { type queryType } from "@/components/commonListModal/components/baseModal.d"
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
  orgId: {
    type: String,
    default: ""
  },
  autoClose: Boolean
})
const emit = defineEmits(["update:selected", "update:visible", "confirm"])

const mvisible = ref<boolean>(props.visible)
const { orgId } = toRefs(props) //父组件参数
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
watch(orgId, (val) => {
  val && getDatas()
})

// 搜索条件
const queryForm = reactive<queryType[]>([
  {
    label: "请输入试验室/现场检测项目名称",
    value: "name",
    type: "input"
  }
])
// 表格列信息
const queryColumns = reactive<TableColumnType[]>([
  {
    title: "试验室/现场检测项目名称",
    dataIndex: "name",
    key: "name"
  },
  {
    title: "授权对象类别",
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
  getUserLaboratoryAuthCan(orgId.value).then((res) => {
    dataSource.value = res || []
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
