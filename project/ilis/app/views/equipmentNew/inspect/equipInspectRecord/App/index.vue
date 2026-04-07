<template>
  <IlisContainer app-id="equipInspectRecord" wrap-class-name="equipmentOutgo">
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
  },
  methods: {},
}
</script>
