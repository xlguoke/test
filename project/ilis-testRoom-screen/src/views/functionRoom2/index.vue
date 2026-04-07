<template>
  <VanConfigProvider :theme-vars="themeVars">
    <div class="layout">
      <CommonHeader></CommonHeader>
      <CommonNavbar v-if="!whiteList.includes(router.currentRoute.value.path)"></CommonNavbar>
      <div :class="`body ${isOverflowVisible ? 'body-visible' : ''}`">
        <RouterView />
      </div>
      <ScreenFooter />
    </div>
  </VanConfigProvider>
</template>
<script lang="ts" setup>
import { ConfigProviderThemeVars, setDialogDefaultOptions, setToastDefaultOptions } from "vant"
import ScreenFooter from "./components/ScreenFooter.vue"
import { computed, onMounted, provide, ref } from "vue"
import { useRouter } from "vue-router"
import CommonNavbar from "./components/CommonNavbar.vue"
import CommonHeader from "./components/CommonHeader.vue"
import { getBusinessParam } from "@/api/functionRoom2.api"
import { functionRoom2Store } from "@/store/functionRoom2"
import { userStore } from "@/store/user"

setToastDefaultOptions({
  teleport: ".layout"
})
setDialogDefaultOptions({
  teleport: ".layout"
})
setToastDefaultOptions("loading", {
  forbidClick: true,
  message: "加载中...",
  duration: 0
})
const themeVars: ConfigProviderThemeVars = {
  primaryColor: "#244F9B",
  floatingBubbleSize: "0.6rem",
  // pickerTitleFontSize: "0.24rem"
  cellFontSize: "0.28rem",
  cellLineHeight: "0.28rem",
  cellVerticalPadding: "0.22rem",
  cellHorizontalPadding: "0.22rem",
  listTextFontSize: "0.24rem",
  loadingTextFontSize: "0.24rem",
  loadingSpinnerSize: "0.24rem",
  toastFontSize: "0.36rem",
  popupRoundRadius: "0.12rem",
  buttonRoundRadius: "0.12rem",
  popupCloseIconMargin: "0.2rem",
  popupCloseIconSize: "0.24rem",
  paddingMd: "0.24rem",
  emptyImageSize: "4rem",
  emptyDescriptionFontSize: "0.24rem",
  emptyDescriptionColor: "#224059",
  fontBold: 700,
  textColor: "#224059",
  stepperBackground: "#fff",
  stepperButtonDisabledColor: "#fff",
  navBarBackground: "tansparent",
  cellBackground: "tansparent",
  cellActiveColor: "rgba(181, 221, 230,.7)",
  cellBorderColor: "#97B7D1",
  cellRightIconColor: "#5B7489",
  cellGroupBackground:
    "linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.2) 100%)",
  searchBackground: "rgba(255, 255, 255, 0.3)",
  searchContentBackground: "rgba(255, 255, 255, 0.3)",
  fieldPlaceholderTextColor: "#5B7489",
  buttonDefaultColor: "#224059",
  buttonDefaultBackground:
    "linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0) 100%)",
  buttonDefaultBorderColor: "#fff",
  buttonPrimaryBorderColor: "#0066ec",
  buttonPlainBackground:
    "linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0) 100%)",
  listTextColor: "#224059",
  uploaderIconColor: "#fff",
  uploaderUploadBackground: "transparent",
  radioBorderColor: "#fff",
  checkboxBorderColor: "#fff",
  dialogBackground: "linear-gradient(180deg, #97a6b2 0%, #6a8091 100%)",
  dialogHasTitleMessageTextColor: "#fff",
  popupBackground: "linear-gradient(180deg, #97a6b2 0%, #6a8091 100%)",
  popupCloseIconColor: "#fff",
  pickerBackground: "transparent",
  pickerMaskColor: "#fff",
  pickerConfirmActionColor: "#fff",
  pickerCancelActionColor: "#fff",
  pickerOptionTextColor: "#fff",
  pickerGroupBackground: "transparent",
  pullRefreshHeadTextColor: "#5B7489",
  tabsNavBackground: "transparent",
  tabTextColor: "#fff",
  tabActiveTextColor: "#fff",
  overlayBackground: "rgba(34, 64, 89, 0.9)",
  calendarBackground: "transparent",
  treeSelectContentBackground: "transparent",
  treeSelectNavBackground: "transparent",
  stepsBackground: "transparent"
}

const router = useRouter()

const { initAuthConfig } = functionRoom2Store()

const { checkAuthLoginOut } = userStore()

const isOverflowVisible = computed(() => {
  return router.currentRoute.value.path === "/functionRoom2/deviceDetail"
})

const whiteList = ["/functionRoom2"]
console.log(router.currentRoute.value.path)

const showSampleSend = ref(false)
provide("showSampleSend", showSampleSend)
async function getIsShowSampleSend() {
  const res = await getBusinessParam("ENABLE_INTELLIGENT_SAMPLING")
  showSampleSend.value = res as boolean
}
getIsShowSampleSend()
onMounted(async () => {
  initfontSize()
})
window.onresize = () => {
  initfontSize()
}
const initfontSize = () => {
  const winW = document.body.clientWidth || window.innerWidth
  let size = (winW / 1080) * 100
  document.documentElement.style.fontSize = size + "px"
}

initAuthConfig().then(() => {
  checkAuthLoginOut()
})
</script>

<style lang="less" scoped>
:deep(*) {
  box-sizing: border-box;
}

.layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #e4e8f7;
  color: #224059;
  font-size: 0.24rem;
  font-family: Source Han Sans;
  padding: 110px 24px 24px;
  .body {
    flex: 1;
    height: 0;
    overflow: auto;
    padding: 0 0.24rem;
  }
  .body-visible {
    overflow: visible;
  }
}
</style>
<style lang="less" scoped>
@import "./index.less";
.layout {
  width: 100%;
  background-image: radial-gradient(closest-side, rgba(168, 217, 217, 1), rgba(168, 217, 217, 0)),
    radial-gradient(closest-side, rgba(169, 211, 230, 1), rgba(243, 11, 164, 0)),
    radial-gradient(closest-side, rgba(169, 211, 230, 1), rgba(169, 211, 230, 0)),
    radial-gradient(closest-side, rgba(151, 210, 219, 1), rgba(151, 210, 219, 0)),
    radial-gradient(closest-side, rgba(169, 211, 230, 1), rgba(169, 211, 230, 0));
  background-size: 130vmax 130vmax, 80vmax 80vmax, 90vmax 90vmax, 110vmax 110vmax, 90vmax 90vmax;
  background-position: -80vmax -80vmax, 60vmax -30vmax, 10vmax 10vmax, -30vmax -10vmax,
    50vmax 50vmax;
  background-repeat: no-repeat;
  animation: 10s movement linear infinite;

  &::after {
    display: block;
    width: 100%;
    height: 100%;

    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
}

@keyframes movement {
  0%,
  100% {
    background-size: 130vmax 130vmax, 80vmax 80vmax, 90vmax 90vmax, 110vmax 110vmax, 90vmax 90vmax;
    background-position: -80vmax -80vmax, 60vmax -30vmax, 10vmax 10vmax, -30vmax -10vmax,
      50vmax 50vmax;
  }

  25% {
    background-size: 100vmax 100vmax, 90vmax 90vmax, 100vmax 100vmax, 90vmax 90vmax, 60vmax 60vmax;
    background-position: -60vmax -90vmax, 50vmax -40vmax, 0vmax -20vmax, -40vmax -20vmax,
      40vmax 60vmax;
  }

  50% {
    background-size: 80vmax 80vmax, 110vmax 110vmax, 80vmax 80vmax, 60vmax 60vmax, 80vmax 80vmax;
    background-position: -50vmax -70vmax, 40vmax -30vmax, 10vmax 0vmax, 20vmax 10vmax, 30vmax 70vmax;
  }

  75% {
    background-size: 90vmax 90vmax, 90vmax 90vmax, 100vmax 100vmax, 90vmax 90vmax, 70vmax 70vmax;
    background-position: -50vmax -40vmax, 50vmax -30vmax, 20vmax 0vmax, -10vmax 10vmax,
      40vmax 60vmax;
  }
}
</style>
