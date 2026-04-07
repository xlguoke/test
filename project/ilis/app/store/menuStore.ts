import type { MenuTree, TransformMenuTree } from '~/layout/api'
import { defineStore } from 'pinia'
import { getMenuList, OpenType } from '~/layout/api'
import { useTabs } from '~/layout/compasobles/useTabs'

const { processUrl } = useTabs()

export const useMenuStore = defineStore('menu', {
  persist: import.meta.env.DEV,
  state: () => {
    return {
      menuList: [] as TransformMenuTree[],
      // 选中的一级菜单
      selectedMenu: undefined as TransformMenuTree | undefined,
      // 选中的二级菜单（仅在混合双列模式下生效）
      selectedSubMenu: undefined as TransformMenuTree | undefined,
      // 打开的菜单
      openMenus: [] as TransformMenuTree[],
      // 当前激活的菜单
      activeMenu: undefined as TransformMenuTree | undefined,
      // 固定的菜单
      fixedMenus: [] as TransformMenuTree[],
      // 是否全屏
      isFullscreen: false,
      // 刷新状态
      refreshFlag: false,
    }
  },
  actions: {
    /** # 获取用户功能树（菜单）并缓存 */
    async getMenuList() {
      function transformMenuList(menuList: MenuTree[]): TransformMenuTree[] {
        const menuByServer = menuList?.map(item => ({
          data: item,
          key: item.id,
          title: item.functionName,
          label: item.functionName,
          icon: item.functionIconStyle ? () => h('i', { class: `iconfont ${item.functionIconStyle} -translate-y-[1px]` }) : undefined,
          children: item.subFunctions?.length ? transformMenuList(item.subFunctions) : undefined,
        }))

        return menuByServer
      }

      const { data } = await getMenuList()
      data.obj?.unshift({
        id: '0',
        functionName: '首页',
        functionIconStyle: 'icon-shouye',
        subFunctions: [],
        functionUrl: 'homePageController.do?goHomePage',
        functionType: 0,
        functionLevel: 0,
      })
      this.menuList = transformMenuList(data.obj)
      if (!this.selectedMenu) {
        nextTick(() => {
          this.selectedMenu = this.menuList[0]
          this.setActiveMenu(this.menuList[0])
        })
      }
    },
    /** # 设置当前激活的菜单 */
    async setActiveMenu(menu?: TransformMenuTree) {
      if (!menu) {
        return
      }

      const newUrl = menu.data.functionUrl
      const opentype = menu.data.openType

      /**
       * # 判断URL是否需要处理 📝
       * 如果URL已经是绝对路径（以http开头），说明已经处理过，跳过processUrl
       * 这样可以避免重复处理（如addTabs已经处理过的情况）
       */
      if (newUrl?.startsWith('http')) {
        this.activeMenu = menu
        if (!this.openMenus?.some(i => i.data.id === menu.data.id)) {
          this.openMenus?.push(menu)
        }
        return
      }

      // 使用共享的URL处理逻辑
      const { url: processedUrl, shouldOpenExternally } = await processUrl(newUrl, opentype || OpenType.INSET)

      if (shouldOpenExternally) {
        window.open(processedUrl)
        return
      }

      menu.data.functionUrl = processedUrl
      this.activeMenu = menu
      if (!this.openMenus?.some(i => i.data.id === menu.data.id)) {
        this.openMenus?.push(menu)
      }
    },
    /** # 关闭菜单 */
    closeMenu(menu?: TransformMenuTree) {
      if (!menu) {
        return
      }
      const index = this.openMenus.findIndex(i => i.data.id === menu.data.id)
      if (index !== -1) {
        this.openMenus.splice(index, 1)
      }
      // 关闭的是当前激活的菜单时，将上一个菜单设置为激活菜单
      if (menu.data.id === this.activeMenu?.data.id) {
        this.activeMenu = this.openMenus[index - 1] || {}
      }
    },
    /** # 切换指定菜单的固定状态，添加或移除固定菜单列表 */
    toggleFix(menu?: TransformMenuTree) {
      if (!menu) {
        return
      }
      const index = this.fixedMenus.findIndex(i => i.data.id === menu.data.id)
      if (index !== -1) {
        this.fixedMenus.splice(index, 1)
      }
      else {
        this.fixedMenus.push(menu)
      }
    },
    /** # 检查菜单是否被固定 */
    isFixed(menu?: TransformMenuTree) {
      if (!menu) {
        return false
      }
      return this.fixedMenus.some(i => i.data.id === menu.data.id)
    },
    /** # 设置选中的一级菜单 */
    setSelectedMenu(menu?: TransformMenuTree) {
      this.selectedMenu = menu
    },
    /** # 设置选中的二级菜单 */
    setSelectedSubMenu(menu?: TransformMenuTree) {
      this.selectedSubMenu = menu
    },
    /** # 触发刷新当前激活的iframe */
    refreshActiveMenu() {
      this.refreshFlag = true
    },
    async resetStore() {
      await this.$reset()
    },
  },
})
