<template>
  <template v-for="item in props.treeData" :key="item.key">
    <template v-if="item.children && item.children.length && !item.hidden">
      <a-sub-menu :key="item.path">
        <template #icon><i :class="'iconfont ' + item.meta.icon"></i></template>
        <template #title>{{ item.meta.title }}</template>
        <Menu :key="item.id" :tree-data="item.children"></Menu>
      </a-sub-menu>
    </template>
    <template v-else>
      <a-menu-item v-if="!item.hidden" :key="item.path" @click="menuClick(item)">
        <template v-if="item.meta.icon" #icon>
          <i :class="'iconfont ' + item.meta.icon"></i>
        </template>
        <span>{{ item.meta.title }}</span>
      </a-menu-item>
    </template>
  </template>
</template>
<script lang="ts" setup>
import type { MenuTreeType } from "@/type/store/menu"
import { useRouter } from "vue-router"

let router = useRouter()
const props = defineProps({
  treeData: {
    type: Object,
    default: function (d: MenuTreeType[]) {
      return d || {}
    }
  }
})
const menuClick = (op: MenuTreeType): void => {
  router.push(op.path)
}
</script>
<style lang="less"></style>
