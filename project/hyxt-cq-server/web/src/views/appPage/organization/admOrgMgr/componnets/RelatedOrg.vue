<template>
  <a-modal
    v-model:visible="visible"
    title="管理检测机构"
    :mask-closable="false"
    :keyboard="false"
    :confirm-loading="saveLoading"
    cancel-text="关闭"
    width="1000px"
    @ok="handleOk"
  >
    <p style="margin-bottom: 5px; color: red">
      注：当前单位为行业主管部门时，需配置其管理的检测机构；配置后可查看检测机构的人员、设备、业绩和所有试验室及其报告信息（含母体）等信息。
    </p>
    <a-transfer
      v-model:target-keys="targetKeys"
      :data-source="dataSource"
      :row-key="(record: AdmRelationType) => record.id"
      show-search
      :filter-option="(inputValue: string, item: AdmRelationType) => item.name.indexOf(inputValue) !== -1"
      :show-select-all="false"
      :loading="spinning"
    >
      <template
        #children="{
          direction,
          filteredItems,
          selectedKeys,
          disabled: listDisabled,
          onItemSelectAll,
          onItemSelect
        }"
      >
        <a-table
          :row-selection="
            getRowSelection({
              selectedKeys,
              onItemSelectAll,
              onItemSelect
            })
          "
          :columns="direction === 'left' ? leftColumns : rightColumns"
          :data-source="filteredItems"
          :pagination="false"
          size="small"
          :scroll="{ y: scrollHeight }"
          :custom-row="
            ({ key, disabled: itemDisabled }: CustomRowType) => ({
              onClick: () => {
                if (itemDisabled || listDisabled) return
                onItemSelect(key, !selectedKeys.includes(key))
              }
            })
          "
        />
      </template>
    </a-transfer>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import { getAdmOrgRelations, saveAdmOrgRelations } from "@/api/organization.api"
import type { AdmRelationType } from "@/type/api/organization.api"
import { message } from "ant-design-vue"
const visible = ref(false)
const scrollHeight = ref(300)

let unitInfo: any = null
const openModal = (info: any) => {
  visible.value = true
  info.id && getDatas(info.id)
  unitInfo = info
}
defineExpose({
  openModal
})
const emit = defineEmits(["updateList"])

onMounted(() => {
  scrollHeight.value = (window.innerHeight || document.body.clientHeight) - 450
})

const leftColumns = [
  {
    dataIndex: "name",
    title: "待选机构"
  }
]
const rightColumns = [
  {
    dataIndex: "name",
    title: "已选机构"
  }
]
const spinning = ref(false)
const dataSource = ref<AdmRelationType[]>([])
const getDatas = (id: string) => {
  spinning.value = true
  getAdmOrgRelations(id)
    .then((res: any) => {
      const checkedData = res.filter((d: AdmRelationType) => d.supervised)
      targetKeys.value = checkedData.map((d: AdmRelationType) => d.id)
      dataSource.value = res
      spinning.value = false
    })
    .catch(() => {
      spinning.value = false
    })
}

interface CustomRowType {
  key: any
  disabled: any
}
interface RowselectionsType {
  selectedKeys: string[]
  onItemSelectAll: any
  onItemSelect: any
}
const targetKeys = ref<string[]>([])
const getRowSelection = ({ selectedKeys, onItemSelectAll, onItemSelect }: RowselectionsType) => {
  return {
    onSelectAll(selected: boolean, selectedRows: Record<string, string | boolean>[]) {
      const treeSelectedKeys = selectedRows.filter((item) => !item.disabled).map(({ key }) => key)
      onItemSelectAll(treeSelectedKeys, selected)
    },
    onSelect({ key }: Record<string, string>, selected: boolean) {
      onItemSelect(key, selected)
    },
    selectedRowKeys: selectedKeys
  }
}

const saveLoading = ref(false)
const handleOk = () => {
  saveLoading.value = true
  saveAdmOrgRelations({
    agencies: targetKeys.value,
    id: unitInfo.id,
    name: unitInfo.name
  })
    .then(() => {
      saveLoading.value = false
      message.success("设置成功")
      emit("updateList")
      visible.value = false
    })
    .catch(() => {
      saveLoading.value = false
    })
}
</script>

<style></style>
