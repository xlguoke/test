<template>
  <a-config-provider :locale="locale">
    <div class="equipmentOutgo">
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
    document.title = localStorage.getItem('title') || '试验检测管理信息系统'
  },
  methods: {},
}
</script>
