<template>
  <template v-for="item in props.treeData" :key="item.key">
    <template v-if="item.children && item.children.length">
      <a-sub-menu :key="item.id">
        <template #icon><i :class="'iconfont ' + item.icon"></i></template>
        <template #title>{{ item.name }}</template>
        <Menu :key="item.id" :tree-data="item.children"></Menu>
      </a-sub-menu>
    </template>
    <template v-else>
      <a-menu-item v-if="item.type != 3" :key="item.path" @click="menuClick(item)">
        <template v-if="item.icon && item.pid == 'ROOT'" #icon>
          <i :class="'iconfont ' + item.icon"></i>
        </template>
        <span>{{ item.name }}</span>
      </a-menu-item>
    </template>
  </template>
</template>
<script lang="ts" setup>
import type { MenuTreeType } from "@/type/store/menu"
import { useRouter } from "vue-router"

let router = useRouter()
const props = defineProps({
  treeData: Object
})
const menuClick = (op: MenuTreeType): void => {
  // let exist = existTags.value.filter(item => {   //查找打开的tags中是否有本次打开的菜单
  //     if (item.id == op.id) {
  //         return item
  //     }
  // })

  // if (exist.length) {  //如果包含有则直接打开
  //     router.push(exist[0].path)
  // } else {    //否则往existTags中添加一列
  //     existTags.value.push(op)
  //     router.push(op.path)
  // }

  // menuStore().$patch((state) => {
  //     state.currentView = op
  // })

  router.push(op.path)
}
</script>
<style lang="less">
// .el-menu-item i,
// .el-sub-menu i {
//     font-size: 22px;
//     margin-right: 3px;
// }

// .el-menu-item.is-active {
//     color: @theme_color;
//     border-left: 3px solid @theme_color;
//     background: #e6f0fd;
// }

// .el-menu {
//     height: 100%;
//     border-right-color: @border1_color;
// }
</style>
