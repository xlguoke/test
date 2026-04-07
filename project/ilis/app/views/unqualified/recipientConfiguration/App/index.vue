<template>
  <IlisContainer app-id="recipientConfiguration">
    <a-tabs default-active-key="1" @change="callback">
      <a-tab-pane key="1" tab="外部人员">
      </a-tab-pane>
      <a-tab-pane key="2" tab="内部人员" force-render>
      </a-tab-pane>
    </a-tabs>

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
  methods: {
    callback(key) {
      switch (key) {
        case '1':
          this.$router.push({ name: 'ExternalStaff' })
          break
        case '2':
          this.$router.push({ name: 'Insider' })
          break
      }
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
