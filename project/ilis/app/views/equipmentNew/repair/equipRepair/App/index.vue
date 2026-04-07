<template>
  <IlisContainer app-id="equipRepair">
    <router-view />
  </IlisContainer>
</template>

<script>
import { getQueryVariable } from '~/providers/common/utils'

export default {
  name: 'App',
  data() {
    return {

      pageType: getQueryVariable('detail'),
    }
  },
  created() {
    if (this.pageType && this.pageType == 'detailPage') {
      this.$router.push({ name: 'AddEdit' })
    }
  },
  methods: {},
}
</script>

<style lang="less">
@import './index.less';
</style>
