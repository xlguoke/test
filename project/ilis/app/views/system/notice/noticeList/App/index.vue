<template>
  <IlisContainer app-id="noticeList" wrap-class-name="testItem">
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
    const routeName = getQueryVariable('routeName')
    if (routeName) {
      this.$router.push({
        name: routeName,
      })
    }
  },
  methods: {},
}
</script>
