<template>
  <IlisContainer app-id="industry-container-sampletree">
    <!-- 全局遮罩层，用于在iframe弹窗时覆盖整个页面 -->
    <!-- <GlobalOverlay></GlobalOverlay> -->
    <IlisIndustryContainer>
      <iframe
        v-if="iframeSrc"
        ref="iframeRef"
        :src="iframeSrc"
        class="w-full h-full z-[11] relative"
      ></iframe>
      <a-empty v-else class="w-full h-full"></a-empty>
    </IlisIndustryContainer>
  </IlisContainer>
</template>

<script lang="ts" setup>
import { useIndustryStore } from '~/store/industryStore'
import { buildIframeSrc } from './composables'

const props = defineProps<{
  redirect: string
}>()

const { industry, sample } = toRefs(useIndustryStore())

const iframeSrc = ref('')

const iframeRef = ref()

const params = new URLSearchParams(window.location.search)

// 监听industry变化，动态更新iframe地址
watch([industry, sample], () => {
  // 从地址中参数获取iframeSrc
  const src = decodeURIComponent(params.get('iframeSrc') || '')
  iframeSrc.value = buildIframeSrc(src || props.redirect)

  nextTick(() => {
    iframeRef.value.onload = () => {
      window.getIndustryIframeSelectedRows = iframeRef.value?.contentWindow.getIndustryIframeSelectedRows
    }
  })
}, {
  immediate: true,
})
</script>
