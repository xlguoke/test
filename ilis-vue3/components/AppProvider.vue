<template>
  <a-config-provider
    :locale="zhCN"
    component-size="middle"
    :theme="{
      token: {
        colorPrimary: '#0066ec',
        borderRadius: 4,
        size: 12,
        fontSize: 12,
      },
    }"
  >
    <slot />
  </a-config-provider>
</template>

<script setup lang='ts'>
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

dayjs.locale('zh-cn')
</script>

<style>

</style>
