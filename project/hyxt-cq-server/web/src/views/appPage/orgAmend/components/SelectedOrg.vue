<template>
  <BaseModal
    :key="modalKey"
    v-model:visible="visible"
    title="请选择检测机构"
    width="80%"
    :selected="selected"
    :query-form="queryForm"
    :query-columns="queryColumns"
    :http-option="{
      url: '/org/amend/org-pagination'
    }"
    is-pagination
    type="radio"
    @ok="okModal"
  />
</template>

<script setup lang="ts">
import { reactive, ref } from "vue"
import BaseModal from "@/components/commonListModal/components/baseModal.vue"
import type { queryType } from "@/components/commonListModal/components/baseModal"
import { type TableColumnType } from "ant-design-vue"

const emit = defineEmits(["confirm"])

const visible = ref<boolean>(false)
const modalKey = ref(100000)
const selected = ref<any[]>([])

// 业绩关联人员搜索条件
const queryForm = reactive<queryType[]>([
  {
    label: "机构名称",
    value: "q",
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
    title: "所在省（市）",
    dataIndex: "province",
    key: "province"
  },
  {
    title: "所在市（区）",
    dataIndex: "city",
    key: "city"
  },
  {
    title: "等级类型",
    dataIndex: "qualify",
    key: "qualify"
  },
  {
    title: "检测证书编号",
    dataIndex: "qualifyNo",
    key: "qualifyNo"
  },
  {
    title: "机构性质",
    dataIndex: "orgNature",
    key: "orgNature"
  }
])

const openModal = (selId?: string) => {
  visible.value = true
  modalKey.value++

  if (selId) {
    selected.value = [{ id: selId }]
  }
}

const okModal = (list) => {
  visible.value = false
  emit("confirm", list[0])
}

defineExpose({
  openModal
})
</script>

<style></style>
