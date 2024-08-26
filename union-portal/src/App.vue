<script setup lang="ts">
import { useRoute } from 'vue-router'
import zhCN from 'ant-design-vue/es/locale/zh_CN'

const route = useRoute()
const docTitle = ref('')
watchEffect(() => {
  docTitle.value = route.meta.title as string
})

useHead({
  title: docTitle,
  meta: [
    {
      name: 'description',
      content: 'ILis Union Project',
    },
  ],
})
</script>

<template>
  <a-config-provider
    :locale="zhCN"
    :theme="{
      token: {
        borderRadius: 4,
        colorPrimary: '#0066ec',
      },
    }"
  >
    <RouterView />
  </a-config-provider>
</template>

<style>

</style>
