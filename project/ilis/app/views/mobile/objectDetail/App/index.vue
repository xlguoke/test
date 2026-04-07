<template>
  <a-config-provider :locale="locale">
    <div class="sampleManageApp">
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
    document.title = localStorage.getItem('title')
  },
  methods: {},
}
</script>

<style lang="less">
@import './index.less';
</style>
