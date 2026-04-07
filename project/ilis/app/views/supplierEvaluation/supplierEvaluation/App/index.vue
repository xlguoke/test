<template>
  <IlisContainer app-id="supplierEvaluation" wrap-class-name="equipmentOutgo">
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
    if (this.pageType && this.pageType === 'detailPage') {
      this.$router.push({ name: 'AddEdit' })
    }

    const routerPage = getQueryVariable('routerPage')
    if (routerPage) {
      this.$router.push({ name: routerPage })
    }
  },
  methods: {},
}
</script>

<style lang="less">
.ant-modal .ant-modal-footer {
  &::after {
    content: '';
    display: block;
    clear: both;
    height: 0;
  }
}
</style>
