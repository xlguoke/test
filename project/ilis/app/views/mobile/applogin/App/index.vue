<template>
  <a-config-provider :locale="locale">
    <div class="applogin">
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
  methods: {},
}
</script>

<style lang="less" scoped>
@import './index.less';
</style>
