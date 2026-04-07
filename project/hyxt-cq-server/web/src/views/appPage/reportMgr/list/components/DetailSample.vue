<template>
  <div>
    <a-table :data-source="sampleList" :columns="columns" size="small" bordered :pagination="false">
      <template #bodyCell="{ column, record, index }">
        <template v-if="column.key == 'handle'">
          <a-space>
            <template v-if="!disabled">
              <a-button type="link" primary size="small" @click="edit(record, index)">
                编辑
              </a-button>
              <a-button type="link" danger size="small" @click="del(index)">删除</a-button>
            </template>
            <a-button v-else type="link" primary size="small" @click="edit(record, index)">
              查看
            </a-button>
          </a-space>
        </template>
      </template>
    </a-table>
    <a-button v-if="!disabled" type="link" primary style="margin-top: 10px" @click="addSample">
      <plus-outlined />
      添加样品
    </a-button>
    <DetailSampleForm ref="detailSampleForm" :key="formKey" @save="addSampleRow" />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, nextTick, watch } from "vue"
import type { TableColumnType } from "ant-design-vue"
import { PlusOutlined } from "@ant-design/icons-vue"
import DetailSampleForm from "./DetailSampleForm.vue"
import type { samplesType } from "@/type/api/report.api"

const props = defineProps(["samples", "disabled"])
const emit = defineEmits(["update:samples"])

const columns = reactive<TableColumnType[]>([
  {
    title: "样品名称/检测项目",
    dataIndex: "name",
    key: "name"
  },
  {
    title: "样品编号",
    dataIndex: "sn",
    key: "sn"
  },
  {
    title: "规格型号",
    dataIndex: "specification",
    key: "specification"
  },
  {
    title: "工程部位/用途",
    dataIndex: "projectPartOrUse",
    key: "projectPartOrUse"
  },
  {
    title: "检测参数",
    dataIndex: "testItems",
    key: "testItems"
  },
  {
    title: "样品数量",
    dataIndex: "amount",
    key: "amount"
  },
  {
    title: "操作",
    dataIndex: "handle",
    key: "handle",
    width: 100
  }
])

const sampleList = ref<samplesType[]>(props.samples)
watch(
  () => props.samples,
  (list) => {
    sampleList.value = list
  }
)

// 添加
const editInd = ref<number>(-1)
const formKey = ref<number>(0)
const detailSampleForm = ref()
const addSample = () => {
  formKey.value = new Date().getTime()
  editInd.value = -1
  nextTick(() => {
    detailSampleForm.value.openModal(null, props.disabled)
  })
}

const addSampleRow = (row: samplesType) => {
  if (editInd.value === -1) {
    sampleList.value.push(row)
  } else {
    sampleList.value.splice(editInd.value, 1, row)
  }
  emit("update:samples", sampleList.value)
}

// 编辑
const edit = (row: samplesType, ind: number) => {
  formKey.value = new Date().getTime()
  editInd.value = ind
  nextTick(() => {
    detailSampleForm.value.openModal(row, props.disabled)
  })
}

// 删除
const del = (ind: number) => {
  sampleList.value.splice(ind, 1)
}
</script>

<style></style>
