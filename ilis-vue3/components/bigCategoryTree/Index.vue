<template>
  <a-flex vertical class="h-full">
    <a-flex class="pb-4" align="center">
      检测参数版本：
      <a-select v-model:value="paramVersionId" class="flex-1" @change="onChangeVersion">
        <a-select-option v-for="item in paramVersionList" :key="item.id" :value="item.id">
          {{ item.versionName }}
        </a-select-option>
      </a-select>
    </a-flex>
    <div class="flex-1 overflow-auto">
      <a-spin :spinning="treeLoading" tip="加载中...">
        <a-tree
          v-model:expanded-keys="expandedKeys"
          :selected-keys="selectedKeys"
          show-line
          block-node
          :tree-data="treeData"
          :field-names="{
            title: 'name',
            key: 'id',
          }"
          @select="onSelectTreeNode"
        >
          <template #switcherIcon="{ expanded }">
            <FolderOpenFilled v-if="expanded" class="text-[#0066ec] text-lg" />
            <FolderFilled v-else class="text-[#0066ec] text-lg" />
          </template>
        </a-tree>
      </a-spin>
    </div>
  </a-flex>
</template>

<script setup lang='ts'>
import { FolderFilled, FolderOpenFilled } from '@ant-design/icons-vue'
import type { BigCategoryTreeEntity, ParamVersionEntity } from './api.ts'
import { getBigCategory, getParamVersionList } from './api.ts'

const emits = defineEmits(['change'])

const expandedKeys = ref([])

const treeData = ref<BigCategoryTreeEntity[]>([])

const paramVersionList = ref<ParamVersionEntity[]>([])

const bigCategoryId = ref<string>()

const paramVersionId = ref<string>()

const selectedKeys = computed(() => bigCategoryId.value ? [bigCategoryId.value] : [])

const treeLoading = ref(false)

watch(() => bigCategoryId.value, () => {
  emits('change', {
    bigCategoryId: bigCategoryId.value,
    paramVersionId: paramVersionId.value,
  })
})

watch(() => paramVersionId.value, () => {
  emits('change', {
    bigCategoryId: bigCategoryId.value,
    paramVersionId: paramVersionId.value,
  })
})

function onSelectTreeNode(key, item) {
  const node = item.node

  if (node.id !== '8888-8888-8888' && key.length > 0) {
    bigCategoryId.value = key[0]
  }

  if (node.children && node.children.length > 0 && !expandedKeys.value.includes(node.id)) {
    expandedKeys.value.push(node.id)
  }
}

async function initBigCategoryTree() {
  treeLoading.value = true
  const res = await getBigCategory({
    paramVersionId: paramVersionId.value,
  }).finally(() => {
    treeLoading.value = false
  })
  const data = res.data

  treeData.value = data
  expandedKeys.value = defaultExpandAllKeys(data)
}

function defaultExpandAllKeys(treeData: BigCategoryTreeEntity[]) {
  let result = []

  for (let i = 0; i < treeData.length; i++) {
    const item = treeData[i]
    result.push(item.id)

    if (item.children && item.children.length > 0) {
      result = result.concat(defaultExpandAllKeys(item.children))
    }
  }

  return result
}

async function initParamVersionList() {
  const res = await getParamVersionList()
  const data = res.data

  if (data.attributes.paramVersion.id) {
    paramVersionId.value = data.attributes.paramVersion.id
  }

  paramVersionList.value = data.obj

  await initBigCategoryTree()
}

async function onChangeVersion() {
  bigCategoryId.value = undefined

  initBigCategoryTree()
}
initParamVersionList()
</script>
