<template>
  <IlisContainer app-id="objedctSmartTagSel" wrap-class-name="taskAddPeriod">
    <router-view />
  </IlisContainer>
</template>

<script>
import { getQueryVariable } from '~/providers/common/utils'

export default {
  name: 'App',
  data() {
    return {

      modalPage: getQueryVariable('modalPage'),
    }
  },
  created() {
    if (this.modalPage && this.modalPage === 'objectmanageReceive') {
      this.$router.push({ name: 'SmartTag' })
    }
  },
  methods: {},
}
</script>
