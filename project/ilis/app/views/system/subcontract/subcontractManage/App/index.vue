<template>
  <IlisContainer app-id="subcontractManage" wrap-class-name="testTaskStatistic">
    <router-view />
  </IlisContainer>
</template>

<script>
import { getQueryVariable } from '~/providers/common/utils'

export default {
  name: 'App',
  data() {
    return {

      pageType: getQueryVariable('taskassigned'),
    }
  },
  created() {
    if (this.pageType && this.pageType === 'taskassigned') {
      this.$router.push({ name: 'AddRecord' })
    }
  },
  methods: {},
}
</script>
