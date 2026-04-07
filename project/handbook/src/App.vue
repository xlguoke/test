<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import type { ConfigProviderThemeVars } from 'vant'
import { ConfigProvider as VantConfigProvider } from 'vant'
import baseData from './stores/baseData'
import CustomNotify from './components/CustomNotify.vue'
import AppUpdate from './components/AppUpdate.vue'

const themeVars: ConfigProviderThemeVars = reactive({
  primaryColor: '#0066ec',
  successColor: '#00c477',
  warningColor: '#ffa900',
  errorColor: '#FF4141',
  dangerColor: '#FF4141',
  radiusSm: '2px',
  checkboxSize: '16px',
  radioSize: '16px',
  dialogRadius: '2px',
})
const route = useRoute()
const router = useRouter()
const showNotify = ref(false)

// 数据更新结果提示
watch(
  () => baseData().updateProcess,
  (n: number) => {
    const process = n / baseData().updateTotal
    if (process < 1 || route.name === 'UpdateManage')
      return
    showNotify.value = true
  },
)
</script>

<template>
  <VantConfigProvider :theme-vars="themeVars">
    <RouterView v-if="$device.ready.value" />
    <CustomNotify v-model="showNotify">
      <template #icon>
        <van-icon name="passed" color="#00c477" />
      </template>
      <span>数据已更新，可在“我的->离线数据更新”中查看更新情况！</span>
      <span style="color: var(--primary-color);" @click="showNotify = false;router.push('/my/updateManage')">
        立即前往查看
      </span>
    </CustomNotify>
    <ReportedError />
    <AppUpdate v-if="$device.ready.value && route.name && route.name !== 'Login'" />
  </VantConfigProvider>
</template>

<style lang="less">
body.main-horizontal {
  overflow-y: auto;
}
#app {
  height: 100%;
  width: 100%;
}
</style>
