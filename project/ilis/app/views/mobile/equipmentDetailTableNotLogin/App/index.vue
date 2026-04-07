<template>
  <a-config-provider :locale="locale">
    <div style="font-size: 12px;">
      <router-view />
    </div>
  </a-config-provider>
</template>

<script>
import zhCN from 'ant-design-vue/es/locale/zh_CN'

export default {
  name: 'App',
  data() {
    return {
      locale: zhCN,
    }
  },
  created() {
    document.title = localStorage.getItem('title') || '设备详情'
  },
  methods: {},
}
</script>
