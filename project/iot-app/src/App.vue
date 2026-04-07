<template>
  <VanConfigProvider :theme-vars="themeVars">
    <div id="layout" class="layout">
      <NavBar />
      <router-view v-slot="{ Component, route }">
        <section class="app-wrapper text-14">
          <keep-alive :include="keepAliveRouteNames">
            <component :is="Component" :key="route.name" />
          </keep-alive>
        </section>
      </router-view>
      <TabBar />
    </div>
  </VanConfigProvider>
</template>

<script setup lang="ts">
// import { storeToRefs } from 'pinia'
import useAppStore from '@/stores/modules/app'
import useRouteCache from '@/stores/modules/routeCache'
import useAutoThemeSwitcher from '@/hooks/useAutoThemeSwitcher'
import type { ConfigProviderThemeVars } from 'vant'

setToastDefaultOptions({
  teleport: '#layout',
})
setDialogDefaultOptions({
  teleport: '#layout',
})
setToastDefaultOptions('loading', {
  forbidClick: true,
  message: '加载中...',
  duration: 0,
})

useHead({
  title: 'Vue3 Vant Mobile',
  meta: [
    {
      name: 'description',
      content: 'Vue + Vite H5 Starter Template',
    },
    {
      name: 'theme-color',
      content: () => isDark.value ? '#00aba9' : '#ffffff',
    },
  ],
  link: [
    {
      rel: 'icon',
      type: 'image/svg+xml',
      href: () => preferredDark.value ? '/favicon-dark.svg' : '/favicon.svg',
    },
  ],
})

const appStore = useAppStore()
// const { mode } = storeToRefs(appStore)

const { initializeThemeSwitcher } = useAutoThemeSwitcher(appStore)

const keepAliveRouteNames = computed(() => {
  return useRouteCache().routeCaches as string[]
})

/**
 * # 样式定制
 * 建议仅设置纯样式相关,如需设置具体尺寸,请在var.less中用px单位书写(否则易出现样式兼容问题)
 */
const themeVars = ref<Record<string, any> & ConfigProviderThemeVars>({
  primaryColor: '#244F9B',
  fontBold: 700,
  textColor: '#224059',
  stepperBackground: '#fff',
  stepperButtonDisabledColor: '#fff',
  emptyDescriptionColor: '#224059',
  navBarBackground: 'tansparent',
  cellBackground: 'tansparent',
  cellActiveColor: 'rgba(181, 221, 230,.7)',
  cellBorderColor: '#97B7D1',
  cellRightIconColor: '#5B7489',
  cellGroupBackground: 'linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.2) 100%)',
  searchBackground: 'rgba(255, 255, 255, 0.3)',
  searchContentBackground: 'rgba(255, 255, 255, 0.3)',
  fieldPlaceholderTextColor: '#5B7489',
  buttonDefaultColor: '#224059',
  buttonDefaultBackground: 'linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0) 100%)',
  buttonDefaultBorderColor: '#fff',
  buttonPrimaryBorderColor: '#0066ec',
  buttonPlainBackground: 'linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0) 100%)',
  listTextColor: '#224059',
  uploaderIconColor: '#fff',
  uploaderUploadBackground: 'transparent',
  radioBorderColor: '#fff',
  checkboxBorderColor: '#fff',
  dialogBackground: 'linear-gradient(180deg, #97a6b2 0%, #6a8091 100%)',
  dialogHasTitleMessageTextColor: '#fff',
  popupBackground: 'linear-gradient(180deg, #97a6b2 0%, #6a8091 100%)',
  popupCloseIconColor: '#fff',
  pickerBackground: 'transparent',
  pickerMaskColor: '#fff',
  pickerConfirmActionColor: '#fff',
  pickerCancelActionColor: '#fff',
  pickerOptionTextColor: '#fff',
  pickerGroupBackground: 'transparent',
  pullRefreshHeadTextColor: '#5B7489',
  tabsNavBackground: 'transparent',
  tabTextColor: '#fff',
  tabActiveTextColor: '#fff',
  overlayBackground: 'rgba(34, 64, 89, 0.9)',
  calendarBackground: 'transparent',
  treeSelectContentBackground: 'transparent',
  treeSelectNavBackground: 'transparent',
})

onMounted(() => {
  initializeThemeSwitcher()
  toggleDark(false)
})
</script>

<style scoped>
.app-wrapper {
  width: 100%;
  position: relative;
  height: 100%;
  flex: 1;
  height: 0;
  overflow: auto;
}
.layout {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  color: #224059;
  font-size: 14px;
  line-height: 16px;
  font-family: Source Han Sans;
  /* background-color: #e4e8f7;
   background-image: radial-gradient(closest-side, rgba(120, 178, 255, 0.7), rgba(120, 178, 255, 0)),
    radial-gradient(closest-side, rgba(220, 255, 213, 0.4), rgba(220, 255, 213, 0)),
    radial-gradient(closest-side, rgba(120, 178, 255, 0.6), rgba(120, 178, 255, 0)),
    radial-gradient(closest-side, rgba(244, 255, 120, 0.3), rgba(244, 255, 120, 0)),
    radial-gradient(closest-side, rgba(244, 255, 120, 0.3), rgba(244, 255, 120, 0));
  background-size:
    30vmax 30vmax,
    60vmax 60vmax,
    90vmax 90vmax,
    40vmax 40vmax,
    40vmax 40vmax;
  background-position:
    -80vmax -80vmax,
    60vmax -30vmax,
    10vmax 10vmax,
    -30vmax -10vmax,
    50vmax 50vmax;
  background-repeat: no-repeat;
  animation: 15s movement linear infinite;

  &::after {
    display: block;
    width: 100%;
    height: 100%;

    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }  */
}
</style>
