<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Spin } from 'ant-design-vue'
import { findSections } from 'custodian'
import type { Section } from 'custodian'
import SelTree from '@/components/selTree/index.vue'

const route = useRoute()

const loading = ref(false)
const selectedKeys = ref<string[]>([])
const treeData = ref<Section[]>([])
const fieldNames = {
  title: 'unitProjectName',
  key: 'id',
  children: 'children',
}

async function getDatas() {
  loading.value = true
  const projectId = route.query.projectId as string
  const projectName = route.query.projectName as string
  const res = await findSections(projectId)
  const item = {
    id: projectId,
    unitProjectName: projectName,
    belongsId: '',
    unitProjectType: '',
    levelCode: '',
    levelCodeLength: -1,
    children: res,
  }
  treeData.value = [item]
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
        parent-is-check
        placeholder="请选择工程划分"
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
