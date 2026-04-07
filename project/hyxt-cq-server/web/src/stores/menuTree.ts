import { defineStore } from "pinia"
import type { MenuTreeType } from "@/type/store/menu"

export default defineStore("menu", {
  state() {
    return {
      menuTree: [] as Array<MenuTreeType> //菜单树
      // existTags: [] ,    //当前已打开过的页面集合
      // currentView: {}    //当前使用视图
    }
  },
  // 所有数据持久化
  // persist: true,
  // 持久化存储插件其他配置
  persist: {
    // 修改存储中使用的键名称，默认为当前 Store的 id
    // key: 'existTags',
    // 修改为 sessionStorage，默认为 localStorage
    // storage: window.sessionStorage,
    // 部分持久化状态的点符号路径数组，[]意味着没有状态被持久化(默认为undefined，持久化整个状态)
    paths: ["menuTree"]
  }
})
