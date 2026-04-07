<template>
  <IlisContainer app-id="chemicalApplianceManage" wrap-class-name="equipmentOutgo">
    <router-view />
  </IlisContainer>
</template>

<script>
import { getQueryVariable } from '~/providers/common/utils'

export default {
  name: 'App',
  data() {
    return {}
  },
  created() {
    const routerPage = getQueryVariable('routerPage')
    this.$router.push({ name: routerPage })
  },
  methods: {},
}
</script>

<style lang="less">
@import './index.less';
</style>
