<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { findSamples } from 'custodian'
import { Spin } from 'ant-design-vue'
import type { SampleLeaf } from 'custodian'
import SelTree from '@/components/selTree/index.vue'

const route = useRoute()

const loading = ref(false)
const selectedKeys = ref<string[]>([])
const treeData = ref<SampleLeaf[]>([])
const fieldNames = {
  title: 'name',
  key: 'id',
  children: 'leaves',
}

async function getDatas() {
  loading.value = true
  const testItemId = route.query.testItemId as string
  const res = await findSamples(testItemId)
  treeData.value = res
  loading.value = false
}

function initSelectedItems() {
  const id = route.query.id as string
  if (!id)
    return
  selectedKeys.value = [id]
}

onMounted(() => {
  initSelectedItems()
  getDatas()
})
</script>

<template>
  <div class="show-title-bar sel-tree-warp">
    <TitleBar />

    <Spin :spinning="loading">
      <SelTree
        :datas="treeData"
        :field-names="fieldNames"
        :selected-keys="selectedKeys"
        placeholder="请选择样品"
      />
    </Spin>
  </div>
</template>

<style lang="less" scoped>
.sel-tree-warp {
  background-color: #fff;
  overflow: hidden;
}
</style>
