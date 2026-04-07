<template>
  <a-config-provider
    :theme="{
      token: {
        wireframe: false,
        colorText: '#244F9B',
        colorBorderSecondary: '#00186C',
        colorFillSecondary: 'rgba(0, 0, 0, 0)',
        colorFillQuaternary: 'rgba(0, 0, 0, 0)',
        colorFillTertiary: 'rgba(0, 0, 0, 0)',
        colorBgContainer: '#000b32',
        colorBgLayout: 'rgba(0, 0, 0, 0)',
        colorBgSpotlight: 'rgba(0, 0, 0, 0)',
        colorBgElevated: '#000b32',
        colorBorder: '#00186C',
        colorTextBase: '#244f9b',
        colorBgBase: '#030a20',
        fontSize: 24,
        colorTextQuaternary: '#244F9B'
      }
    }"
  >
    <van-config-provider :theme-vars="themeVars">
      <div class="deviceSmallScreen">
        <ScreenHeader />
        <div class="body">
          <RouterView />
        </div>
        <ScreenFooter />
      </div>
    </van-config-provider>
  </a-config-provider>
</template>

<script lang="ts" setup>
import { ConfigProviderThemeVars } from "vant/es"
import ScreenFooter from "./component/ScreenFooter.vue"
import ScreenHeader from "./component/ScreenHeader.vue"
import { onMounted } from "vue"

const themeVars: ConfigProviderThemeVars = {
  primaryColor: "#244F9B",
  tabFontSize: "0.24rem",
  tabsLineHeight: "0.4rem",
  tabTextColor: "#244F9B",
  tabActiveTextColor: "#1677ff",
  tabsNavBackground: "transparent",
  // calendarConfirmButtonHeight: "3.125vw",
  buttonRadius: "0.20833vw",
  cellLineHeight: "0.28rem",
  cellVerticalPadding: "0.22rem",
  cellHorizontalPadding: "0.22rem"
}

onMounted(async () => {
  initfontSize()
})
window.onresize = () => {
  initfontSize()
}
const initfontSize = () => {
  const winW = document.body.clientWidth || window.innerWidth
  let size = (winW / 1920) * 100
  document.documentElement.style.fontSize = size + "px"
}
</script>

<style lang="less" scoped>
:deep(*) {
  box-sizing: border-box;
}
.deviceSmallScreen {
  display: flex;
  flex-direction: column;
  height: 100vh;
  .body {
    flex: 1;
    height: 0;
  }
}
</style>
