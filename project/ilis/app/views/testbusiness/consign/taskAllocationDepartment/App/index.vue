<template>
  <IlisContainer app-id="taskAllocationDepartment" wrap-class-name="equipmentOutgo">
    <router-view />
  </IlisContainer>
</template>

<script>
import { getQueryVariable } from '~/providers/common/utils'

export default {
  name: 'App',
  data() {
    return {

      pageType: getQueryVariable('moduleName'),
    }
  },
  created() {
    if (this.pageType && this.pageType == 'taskAssigned') {
      this.$router.push({ name: 'AddEdit' })
    }
  },
  methods: {},
}
</script>
