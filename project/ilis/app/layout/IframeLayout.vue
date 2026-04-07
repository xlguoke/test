<!-- iframe布局,对原Ilis系统适配的布局 -->
<template>
  <AppProvider>
    <a-layout class="h-full !bg-[var(--colorBgContainer)]">
      <a-layout-header class="w-full flex justify-between items-center !pr-2 !pl-6 border-b border-[var(--colorSplit)] !bg-[var(--colorPrimary)]">
        <Logo />
        <div class="flex-1 w-0">
          <Transition name="header-menu">
            <HeaderMenuList v-if="showHeaderMenu" />
          </Transition>
        </div>
        <MenuSearch class="mr-2" />
        <a-space>
          <Actions />
          <Acount />
        </a-space>
      </a-layout-header>
      <a-layout class="!bg-[var(--colorBgContainer)]">
        <div class="w-full h-full flex flex-col">
          <div class="flex-1 h-0 flex">
            <Transition name="side-menu">
              <SideMenuList v-if="showSideMenu" class=" z-10" />
            </Transition>
            <Transition name="side-menu">
              <SideSubMenuList v-if="showSideSubMenu" />
            </Transition>
            <div class="flex-1 h-full flex flex-col transition-all">
              <div class="border-b border-[var(--colorBorder)] !bg-[var(--colorBgContainer)] pt-1 shadow-md">
                <NavTagList />
              </div>
              <div class="h-0 flex-1 !bg-[var(--colorBgLayout)]">
                <IframeContent />
              </div>
              <Copyright />
            </div>
          </div>
        </div>
      </a-layout>
    </a-layout>
  </AppProvider>
</template>

<script setup lang="ts">
import type { ILayoutParams } from './types/ILayoutParams'
import { useMenuStore } from '~/store/menuStore'
import { useThemeStore } from '~/store/themeStore'
import { EMenuLayoutMode } from '~/system/settings/ThemeSettingEntity'
import { useHelpSystem } from './compasobles/useHelpSystem'
import { useTabs } from './compasobles/useTabs'
import Acount from './components/Acount.vue'
import Actions from './components/Actions.vue'
import Copyright from './components/Copyright.vue'
import HeaderMenuList from './components/HeaderMenuList.vue'
import IframeContent from './components/IframeContent.vue'
import Logo from './components/Logo.vue'
import MenuSearch from './components/MenuSearch.vue'
import NavTagList from './components/NavTagList.vue'
import SideMenuList from './components/SideMenuList.vue'
import SideSubMenuList from './components/SideSubMenuList.vue'
import '~/utils/topDialogHelper'

const props = defineProps<{
  params: ILayoutParams
}>()

useThemeSync()

const { themeConfig } = storeToRefs(useThemeStore())

const { selectedMenu, selectedSubMenu } = storeToRefs(useMenuStore())

const { userId } = useThemeStore()

const { addTabs } = useTabs()

const { init, handleClickHelp } = useHelpSystem(props.params)

init()

provide('handleClickHelp', handleClickHelp)

top!.addTabs = addTabs

const showHeaderMenu = computed(() =>
  [
    EMenuLayoutMode.HORIZONTAL,
    EMenuLayoutMode.HORIZONTAL_VERTICAL,
    EMenuLayoutMode.HORIZONTAL_VERTICAL_DOUBLE,
  ].includes(themeConfig.value?.[userId]?.menuLayoutMode),
)

const showSideMenu = computed(() => {
  return ([
    EMenuLayoutMode.VERTICAL,
    EMenuLayoutMode.VERTICAL_DOUBLE,
  ].includes(themeConfig.value?.[userId]?.menuLayoutMode))
  || ([
    EMenuLayoutMode.HORIZONTAL_VERTICAL,
    EMenuLayoutMode.HORIZONTAL_VERTICAL_DOUBLE,
  ].includes(themeConfig.value?.[userId]?.menuLayoutMode)
  && selectedMenu.value?.data?.subFunctions?.length)
})

const showSideSubMenu = computed(() => {
  return ([
    EMenuLayoutMode.HORIZONTAL_VERTICAL_DOUBLE,
  ].includes(themeConfig.value?.[userId]?.menuLayoutMode)
  && selectedSubMenu.value?.data?.subFunctions?.length)
|| ([
  EMenuLayoutMode.VERTICAL_DOUBLE,
].includes(themeConfig.value?.[userId]?.menuLayoutMode)
&& selectedMenu.value?.data?.subFunctions?.length)
})

/** # 挂载各种脚本，以满足对历史页面的兼容 */
async function mountScripts() {
  await AnyDriverHelper.createLinkByUrl(`${import.meta.env.VITE_ILIS_BASE}/plug-in/assets/css/common.css`)
  await AnyDriverHelper.createScriptByUrl(`${import.meta.env.VITE_ILIS_BASE}/plug-in-ui/hplus/js/jquery.min.js`)
  await AnyDriverHelper.createScriptByUrl(`${import.meta.env.VITE_ILIS_BASE}/plug-in-ui/hplus/js/bootstrap.min.js`)
  await AnyDriverHelper.createScriptByUrl(`${import.meta.env.VITE_ILIS_BASE}/plug-in-ui/hplus/js/plugins/metisMenu/jquery.metisMenu.js`)
  await AnyDriverHelper.createScriptByUrl(`${import.meta.env.VITE_ILIS_BASE}/plug-in-ui/hplus/js/plugins/slimscroll/jquery.slimscroll.min.js`)
  await AnyDriverHelper.createScriptByUrl(`${import.meta.env.VITE_ILIS_BASE}/plug-in-ui/hplus/js/plugins/layer/layer.min.js`)
  await AnyDriverHelper.createScriptByUrl(`${import.meta.env.VITE_ILIS_BASE}/plug-in/base64/base64.js`)
  await AnyDriverHelper.createScriptByUrl(`${import.meta.env.VITE_ILIS_BASE}/plug-in-ui/hplus/js/hplus.js`)
  await AnyDriverHelper.createScriptByUrl(`${import.meta.env.VITE_ILIS_BASE}/plug-in/hplus/jquery-smartMenu.js`)
  await AnyDriverHelper.createScriptByUrl(`${import.meta.env.VITE_ILIS_BASE}/plug-in/hplus/contabs.js`)
  await AnyDriverHelper.createScriptByUrl(`${import.meta.env.VITE_ILIS_BASE}/plug-in-ui/hplus/js/plugins/pace/pace.min.js`)
  await AnyDriverHelper.createScriptByUrl(`${import.meta.env.VITE_ILIS_BASE}/plug-in-ui/hplus/js/plugins/sweetalert/sweetalert.min.js`)
  await AnyDriverHelper.createScriptByUrl(`${import.meta.env.VITE_ILIS_BASE}/plug-in/jquery-plugs/storage/jquery.storageapi.min.js`)
  await AnyDriverHelper.createScriptByUrl(`${import.meta.env.VITE_ILIS_BASE}/webpage/com/hitek/demo/udr/udrClientPrint.js`)
  await AnyDriverHelper.createScriptByUrl(`${import.meta.env.VITE_ILIS_BASE}/plug-in/assets/js/common.js`)
  await AnyDriverHelper.createScriptByUrl('https://auth.qdm123.com/Content/js/HitekPlugins/HitekSystemTracking.js', { async: true })
}

onMounted(() => {
  mountScripts()
})
</script>

<style scoped>
.side-menu-enter-from,
.side-menu-leave-to {
  transform: translateX(-100%);
}
.side-menu-enter-active,
.side-menu-leave-active {
  transition: all 0.3s ease;
}

.header-menu-enter-from,
.header-menu-leave-to {
  transform: translateY(-100%);
}
.header-menu-enter-active,
.header-menu-leave-active {
  transition: all 0.3s ease;
}
</style>
