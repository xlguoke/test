<template>
  <a-style-provider hash-priority="high" :transformers="[legacyLogicalPropertiesTransformer]">
    <a-config-provider
      :locale="zhCN"
      :component-size="themeStore?.componentSize"
      :theme="themeStore.antdThemeConfig"
    >
      <slot />
      <MessageHolder />
      <NotificationHolder />
      <ModalHolder />
    </a-config-provider>
  </a-style-provider>
</template>

<script setup lang='ts'>
import { legacyLogicalPropertiesTransformer, message, Modal, notification } from 'ant-design-vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import dayjs from 'dayjs'
import { useThemeSync } from '~/composables/useThemeSync'
import { useThemeStore } from '~/store/themeStore'
import { AnyDriverHelper } from '~/utils/AnyDriverHelper'
import 'dayjs/locale/zh-cn'

const themeStore = useThemeStore()

// 启用主题同步，监听主题变化并更新CSS变量（配合tailwindcss）
useThemeSync()

const [, MessageHolder] = message.useMessage()
const [ModalApi, ModalHolder] = Modal.useModal()
const [, NotificationHolder] = notification.useNotification()

onMounted(async () => {
  /**
   * 说明：
   * antd样式降级后，message、notification、modal的样式会丢失
   * 通过hook的方式设置message和notification挂载节点后，样式就正常
   * 但上面的方法对modal没用，modal有class但没有样式值，通过用hook提供的api调用modal后样式文件才能被加载出来
   * 故在页面启动时，立马调用一次modal并销毁以实现加载出modal组件样式
   * 目前没看到更优雅的解决方案，如果有其他方案，在谷歌低版本（如：62）测试没问题后，替换这个逻辑
   */
  const modal = ModalApi.info({
    title: '',
    content: '',
  })
  modal.destroy()
  await AnyDriverHelper.createLinkByUrl(`${import.meta.env.VITE_ILIS_BASE}/plug-in/iconfont/iconfont.css?version=${Date.now()}`)
})

dayjs.locale('zh-cn')
</script>

<style>
.ant-btn .anticon{
  vertical-align: middle;
}
</style>
