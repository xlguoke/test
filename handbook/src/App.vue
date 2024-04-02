<script setup lang="ts">
import { h, ref, watch } from 'vue'
import { ConfigProvider, message, notification } from 'ant-design-vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import 'dayjs/locale/zh-cn'
import { RouterView, useRoute, useRouter } from 'vue-router'
import baseData from './stores/baseData'

const route = useRoute()
const router = useRouter()
const size: any = ref('large')
message.config({
  top: '20%',
})

// 数据更新结果提示
watch(
  () => baseData().updateProcess,
  (n: number) => {
    const process = n / baseData().updateTotal
    if (process < 1 || route.name === 'UpdateManage')
      return

    notification.success({
      message: '数据更新完成',
      description: h('div', {}, [
        h('span', '数据已更新，可在“我的->离线数据更新”中查看更新情况！'),
        h(
          'span',
          {
            style: {
              color: '#0066ec',
            },
            onClick: () => {
              notification.destroy()
              router.push('/my/updateManage')
            },
          },
          '立即前往查看',
        ),
      ]),
    })
  },
)
</script>

<template>
  <ConfigProvider
    :component-size="size"
    :locale="zhCN"
    :auto-insert-space-in-button="false"
    :theme="{
      token: {
        colorPrimary: '#0066ec',
        colorSuccess: '#00c477',
        colorWarning: '#ffa900',
        colorError: '#FF4141',
        borderRadius: 2,
      },
    }"
  >
    <RouterView v-if="$device.ready.value" />
  </ConfigProvider>
</template>

<style lang="less">
#app {
  height: 100%;
  width: 100%;
}
</style>
