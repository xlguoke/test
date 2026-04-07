<template>
  <IlisContainer app-id="parameterScript" wrap-class-name="equipmentOutgo">
    <router-view />
  </IlisContainer>
</template>

<script>
import { getQueryVariable } from '~/providers/common/utils'

export default {
  name: 'App',
  data() {
    return {

      pageType: getQueryVariable('detailId'),
    }
  },
  created() {
    if (this.pageType) {
      this.$router.push({ name: 'AddEdit' })
    }
  },
  methods: {},
}
</script>
