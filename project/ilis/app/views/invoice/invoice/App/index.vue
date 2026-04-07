<template>
  <IlisContainer app-id="invoice">
    <router-view />
  </IlisContainer>
</template>

<script>
import { getQueryVariable } from '~/providers/common/utils'

export default {
  name: 'App',
  data() {
    return {

      isAddInvoice: getQueryVariable('isAddInvoice'),
    }
  },
  created() {
    if (this.isAddInvoice && this.isAddInvoice == '1') {
      this.$router.push({
        name: 'addInvoice',
      })
    }
  },
  methods: {},
}
</script>

<style lang="less">
@import './index.less';
</style>
