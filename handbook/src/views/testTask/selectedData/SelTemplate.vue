<script lang="ts" setup>
import { onMounted } from 'vue'
import { findTemplates } from 'custodian'
import useSelData from './useSelData'
import SelDataList from '@/components/selDataList/index.vue'

const { id } = defineProps<{ id: string }>()

const { loading, dataList, selectedRows, onSearch, confirmSelected } = useSelData()

function initSelectedItems() {
  if (!id)
    return
  selectedRows.value.push({ id, name: '' })
}

onMounted(() => {
  initSelectedItems()
  getDatas()
})

async function getDatas() {
  loading.value = true
  const res = await findTemplates()
  dataList.value = res
  loading.value = false
}
</script>

<template>
  <div class="show-title-bar">
    <TitleBar />

    <SelDataList
      placeholder="请输入模板名称查询"
      :selected-rows="selectedRows"
      :data-list="dataList"
      @search="onSearch"
      @confirm="confirmSelected"
    />
  </div>
</template>

<style lang="less" scoped></style>
