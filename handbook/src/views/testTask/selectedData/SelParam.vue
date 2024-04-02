<script lang="ts" setup>
import { onMounted } from 'vue'
import { findParams } from 'custodian'
import useSelData from './useSelData'
import SelDataList from '@/components/selDataList/index.vue'

const {
  selType,
  loading,
  route,
  dataList,
  selectedRows,
  onSearch,
  confirmSelected,
} = useSelData()

onMounted(() => {
  selType.value = 'checkbox'
  getDatas()
})

async function getDatas() {
  loading.value = true
  const testItemId = route.query.testItemId as string
  const sampleId = route.query.sampleId as string
  const res = await findParams(testItemId, sampleId)
  dataList.value = res.map(d => ({
    ...d,
    name: d.name || d.displayName,
  }))
  loading.value = false
}
</script>

<template>
  <div class="show-title-bar">
    <TitleBar />

    <SelDataList
      placeholder="请输入参数名称查询"
      :type="selType"
      :selected-rows="selectedRows"
      :data-list="dataList"
      @search="onSearch"
      @confirm="confirmSelected"
    />
  </div>
</template>

<style lang="less" scoped></style>
