import { defineStore } from "pinia"
import { deepCopy } from "@/utils"
import type { MenuTreeType } from "@/type/store/menu"
import menuTreeDatas from "@/router/modules/menuTreeDatas"

const modules = import.meta.glob("../views/**/*.vue")

export const loadView = (view: string) => {
  let res
  for (const path in modules) {
    const dir = path.split("views")[1]
    const viewDir = view.split("views")[1]
    if (dir === viewDir) {
      res = () => modules[path]()
    }
  }
  return res
}

export default defineStore("menu", {
  state() {
    return {
      menuTree: [] as Array<MenuTreeType>, //菜单树
      addRoutes: [] // 异步路由
    }
  },
  actions: {
    // 获取菜单数据
    getMenuDatas(): Array<MenuTreeType> {
      this.menuTree = menuTreeDatas
      return menuTreeDatas
    },
    // 根据菜单生成异步路由数据
    async getDynamicRoutes() {
      let menus = this.menuTree
      const routes = [] as any
      try {
        if (menus.length === 0) {
          menus = await this.getMenuDatas()
        }
        ;(function initRoute(menus) {
          for (let i = 0; i < menus.length; i++) {
            const m = deepCopy(menus[i])
            m.component = m.component ? loadView(m.component) : ""
            routes.push(m)
            if (m.children && m.children.length > 0) {
              initRoute(m.children)
              m.children = undefined
            }
          }
        })(menus)
        routes.push({
          path: "/:pathMatch(.*)",
          redirect: "/404",
          hidden: true
        })
        this.addRoutes = routes
        return Promise.resolve(routes)
      } catch (err) {
        return Promise.reject(err)
      }
    }
  }
})
