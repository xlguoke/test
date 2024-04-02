<script lang="ts" setup>
import { onMounted } from 'vue'
import { ProjectQuery, countProjects, findProjects } from 'custodian'
import { message } from 'ant-design-vue'
import useSelData from './useSelData'
import SelDataList from '@/components/selDataList/index.vue'

const { id } = defineProps<{ id: string }>()
const { total, dataList, selectedRows, loading, confirmSelected } = useSelData()
const query = new ProjectQuery()

function initSelectedItems() {
  if (!id)
    return
  selectedRows.value.push({ id, name: '' })
}

onMounted(() => {
  query.size = 50
  initSelectedItems()
  getCount()
  getDatas()
})

// 查询总条数
async function getCount() {
  const count = await countProjects(query)
  total.value = count
}

async function getDatas(flag?: boolean) {
  loading.value = true

  if (flag)
    query.page++
  else query.page = 1

  try {
    const res = await findProjects(query)

    if (flag)
      dataList.value.push(...res)
    else dataList.value = res
  }
  catch (err) {
    console.error(err)
    message.error('获取数据失败')
  }

  loading.value = false
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
      placeholder="请输入项目名称查询"
      :selected-rows="selectedRows"
      :data-list="dataList"
      @load="getDatas(true)"
      @search="onSearch"
      @confirm="confirmSelected"
    />
  </div>
</template>

<style lang="less" scoped></style>
