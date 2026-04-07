<template>
  <VanNavBar
    v-if="show"
    :title="title"
    :fixed="true"
    clickable
    placeholder
    :left-arrow="showLeftArrow"
    z-index="99"
    @click-left="onBack"
    @click-right="onClickRight"
  >
    <!-- <template v-if="InAndroid && route.name === 'home'" #right>
      <van-icon name="scan" />
    </template> -->
  </VanNavBar>
</template>

<script setup lang="ts">
import { insetAppRootPage, routeWhiteList } from '@/config/routes'
import { InEmbed } from '@/utils/referrer'

const route = useRoute()
const router = useRouter()

function onBack() {
  if (!InEmbed) {
    history.back()
    return
  }

  if (route.name && insetAppRootPage.includes(route.name)) {
    (parent as any).back()
    return
  }
  if (window.history.state.back)
    history.back()
  else
    router.replace('/')
}

function onClickRight() {
  if (route.name === 'home') {
    onQRScan()
  }
}

function onQRScan() {
  window.cordova.plugins.barcodeScanner.scan(
    (result: { text: string, format: string, cancelled: boolean }) => {
      if (!result.cancelled) {
        const text = result.text

        // eslint-disable-next-line no-alert
        alert(text)
      }
    },
    (error: any) => {
      // eslint-disable-next-line no-alert
      alert(`扫描二维码失败: ${error}`)
    },
    {
      preferFrontCamera: true, // iOS and Android
      showFlipCameraButton: false, // iOS and Android
      showTorchButton: false, // iOS and Android
      torchOn: false, // Android, launch with the torch switched on (if available)
      saveHistory: false, // Android, save scan history
      prompt: '', // Android
      resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
      formats: 'QR_CODE', // default: all but PDF_417 and RSS_EXPANDED
      orientation: 'portrait', // Android only (portrait|landscape), default unset so it rotates with the device
      disableAnimations: true, // iOS
      disableSuccessBeep: false, // iOS and Android
    },
  )
}

const { t } = useI18n()

const title = computed(() => {
  if (!route.meta)
    return ''

  return route.meta.i18n ? t(route.meta.i18n) : (route.meta.title || '')
})

const show = computed(() => {
  return !route.meta?.hiddenNavBar
})

const showLeftArrow = computed(() =>
  !route.name
  || !routeWhiteList.includes(route.name)
  || (InEmbed && insetAppRootPage.includes(route.name)))
</script>
