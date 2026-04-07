<template>
  <van-popup
    v-model:show="show"
    position="bottom"
    close-on-popstate
    :style="{ height: '100%', width: '100%' }"
    @closed="onClosed"
  >
    <div class="flex w-full h-full flex-col">
      <MobileTitleBar title="查看PDF" left-arrow @click-left="show = false" />
      <div v-if="pdfUrl" class="flex-1 min-h-0">
        <iframe
          class="w-full h-full"
          :src="pdfUrl"
          frameborder="0"
        ></iframe>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang='ts'>
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'

const show = ref(false)

const pdfUrl = ref('')

function open(fileUrl: string, filename: string) {
  const url = new URL('/ilis2/pdfjs-app/web/viewer.html', location.origin)
  url.searchParams.append('file', fileUrl)
  url.searchParams.append('filename', filename)

  pdfUrl.value = url.href
  show.value = true
}

function onClosed() {
  pdfUrl.value = ''
}

top.pdfviewback = function () {
  show.value = false
}

defineExpose({
  open,
})
</script>
