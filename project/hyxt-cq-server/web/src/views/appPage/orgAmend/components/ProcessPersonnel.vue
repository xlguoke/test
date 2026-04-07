<template>
  <a-modal
    v-model:visible="visible"
    title="选择流程人员"
    :mask-closable="false"
    :keyboard="false"
    cancel-text="关闭"
    width="800px"
    @ok="handleOk"
  >
    <div class="detail-content">
      <div class="detail-title">节点类型</div>
      <a-radio-group v-model:value="nodeType" :options="nodeTypeOpt" />
      <div class="detail-title" style="margin-top: 20px">节点人员</div>
      <a-table
        row-key="id"
        :data-source="dataSource"
        :columns="columns"
        :loading="loading"
        size="small"
        bordered
        :row-selection="rowSelection"
        :custom-row="customRow"
        :pagination="false"
        :scroll="{ y: '45vh' }"
      ></a-table>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { NODE_TYPE, NODE_TYPE_DICT, columns } from ".."
import { ProcessPersonnelData, ProcessPeople } from "@/type/api/orgAmend.api"
import { getOrgUsersAPI } from "@/api/system.api"
import { message } from "ant-design-vue"

const emits = defineEmits<{
  (e: "confirm", data: ProcessPeople): void
}>()

const loading = ref(false)
const visible = ref(false)
const nodeType = ref<NODE_TYPE>(NODE_TYPE.REVIEW)
const dataSource = ref<ProcessPersonnelData[]>([])
const selectedRowKeys = ref<string[]>([])
const selectedRows = ref<ProcessPersonnelData[]>([])

const nodeTypeOpt = NODE_TYPE_DICT.filter((d) => d.value !== NODE_TYPE.EXECUTION)

const rowSelection = computed(() => ({
  type: "radio",
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: string[], rows: ProcessPersonnelData[]) => {
    selectedRowKeys.value = keys
    selectedRows.value = rows
  }
}))

function customRow(record: ProcessPersonnelData) {
  return {
    onClick: () => {
      selectedRowKeys.value = [record.id]
      selectedRows.value = [record]
    }
  }
}

/**
 * 打开弹窗
 * @param orgId 机构ID
 * @param userIds 已选人员ID
 * @param editUser 当前编辑的人员
 */
const openModal = (orgId: string, userIds: string[], editUser?: ProcessPeople) => {
  dataSource.value = []
  selectedRows.value = []
  if (editUser) {
    selectedRowKeys.value = [editUser.orgPersonId]
    nodeType.value = editUser.type
  } else {
    selectedRowKeys.value = []
    nodeType.value = NODE_TYPE.REVIEW
  }
  visible.value = true
  getDatas(orgId, userIds, editUser)
}
defineExpose({
  openModal
})

const getDatas = async (orgId: string, userIds: string[], editUser?: ProcessPeople) => {
  loading.value = true
  try {
    const res = await getOrgUsersAPI({
      orgId
    })
    const list = res || []
    dataSource.value = list.filter(
      (d) => !userIds.includes(d.id) || (editUser && d.id === editUser.orgPersonId)
    )
    if (editUser) {
      selectedRows.value = [list.find((d) => d.id === editUser.orgPersonId)]
    }
  } finally {
    loading.value = false
  }
}

const handleOk = () => {
  if (selectedRows.value.length === 0) {
    message.warning("请选择节点人员")
    return
  }
  const datas = selectedRows.value.map((d) => {
    return {
      /** 流程人员ID */
      orgPersonId: d.id,
      /** 流程人员名称 */
      orgPersonName: d.name,
      /** 流程人员类型 */
      type: nodeType.value
    }
  })
  emits("confirm", datas[0])
  visible.value = false
}
</script>

<style scoped lang="less">
.detail-content {
  min-height: 45vh;
}
</style>
