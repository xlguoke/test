<template>
  <a-dropdown>
    <a-input-search
      v-model:value="searchText"
      placeholder="搜索菜单"
      style="width: 200px"
    />
    <template #overlay>
      <a-menu v-if="filteredMenuList?.length">
        <a-menu-item
          v-for="item in filteredMenuList"
          :key="item?.data?.id"
          :title="item?.data?.functionName"
          @click="setActiveMenu(item)"
        >
          {{ item?.data?.functionName }}
        </a-menu-item>
      </a-menu>
      <a-empty v-else />
    </template>
  </a-dropdown>
</template>

<script lang="ts" setup>
import type { TransformMenuTree } from '../api'
import { useMenuStore } from '~/store/menuStore'

const { setActiveMenu } = useMenuStore()

const { menuList } = storeToRefs(useMenuStore())

const searchText = ref('')

/** # 扁平化菜单, 过滤出没有子菜单的项(叶子节点) */
const concatMenuList = computed(() => {
  const treeList: TransformMenuTree[] = []
  function _getChildren(data: TransformMenuTree) {
    if (data?.children?.length) {
      treeList.push(...data?.children)
      data?.children?.forEach(i => _getChildren(i))
    }
  }
  menuList.value?.forEach(i => _getChildren(i))
  return treeList?.filter(i => !i?.children?.length)
})

/** # 过滤出包含搜索文本的菜单项 */
const filteredMenuList = computed(() => {
  if (!searchText.value)
    return []
  return concatMenuList.value?.filter(i => i?.data?.functionName?.includes(searchText.value))
})
</script>
