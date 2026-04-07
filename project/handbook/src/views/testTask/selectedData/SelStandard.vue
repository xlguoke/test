<script lang="ts" setup>
import { onMounted } from 'vue'
import { CriterionQuery, countCriteria, findCriteria } from 'custodian'
import useSelData from './useSelData'
import SelDataList from '@/components/selDataList/index.vue'

const {
  selType,
  loading,
  total,
  dataList,
  selectedRows,
  confirmSelected,
  initSelectedItems,
} = useSelData()

const query = new CriterionQuery()

onMounted(() => {
  selType.value = 'checkbox'
  query.size = 50
  initSelectedItems()
  getCount()
  getDatas()
})

async function getDatas(flag?: boolean) {
  loading.value = true

  if (flag)
    query.page++
  else query.page = 1

  const res = await findCriteria(query)
  const list = res.map(d => ({
    ...d,
    id: d.standardId,
    name: d.publishCode ? `${d.standardName}（${d.publishCode}）` : d.standardName,
  }))

  if (flag)
    dataList.value.push(...list)
  else dataList.value = list

  loading.value = false
}

async function getCount() {
  const count = await countCriteria(query)
  total.value = count
}

let keyword = ''
function onSearch(q: string) {
  query.fuzzy = q
  if (keyword !== q)
    getCount()
  keyword = q
  getDatas()
}
</script>

<template>
  <div class="show-title-bar">
    <TitleBar />

    <SelDataList
      placeholder="请输入规程名称或颁布号查询"
      :type="selType"
      :selected-rows="selectedRows"
      :data-list="dataList"
      @load="getDatas(true)"
      @search="onSearch"
      @confirm="confirmSelected"
    />
  </div>
</template>

<style lang="less" scoped></style>
