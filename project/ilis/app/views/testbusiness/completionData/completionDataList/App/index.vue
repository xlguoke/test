<template>
  <IlisContainer app-id="completionDataList" wrap-class-name="testItem">
    <router-view />
  </IlisContainer>
</template>

<script>
import { getQueryVariable } from '~/providers/common/utils'

export default {
  name: 'App',
  data() {
    return {

      pageType: getQueryVariable('page'),
    }
  },
  created() {
    if (this.pageType && this.pageType == 'unitProject') {
      this.$router.push({ name: 'SelTreeUnit' })
    }
  },
  methods: {},
}
</script>

<style lang="less">
@import './index.less';
</style>
