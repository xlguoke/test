<template>
  <IlisContainer app-id="taskStatusMarker" wrap-class-name="testTaskStatistic">
    <router-view />
  </IlisContainer>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {

    }
  },
  methods: {},
}
</script>

<style lang="less">
@import './index.less';
</style>
