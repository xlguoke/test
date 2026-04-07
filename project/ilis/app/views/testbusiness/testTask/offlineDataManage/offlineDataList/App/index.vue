<template>
  <IlisContainer app-id="offlineDataList" wrap-class-name="contractTestReport">
    <router-view />
  </IlisContainer>
</template>

<script>
import { getQueryVariable } from '~/providers/common/utils'

export default {
  name: 'App',
  data() {
    return {

    }
  },
  created() {
    const pageName = getQueryVariable('pageName')
    if (pageName === 'importSetting') {
      this.$router.push({
        path: '/importSetting',
      })
    }
  },
  methods: {},
}
</script>
