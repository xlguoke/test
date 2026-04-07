<template>
  <IlisContainer app-id="stuffProduction">
    <a-tabs default-active-key="1" @change="callback">
      <a-tab-pane key="1" tab="待分配权重任务">
      </a-tab-pane>
      <a-tab-pane key="2" tab="已分配权重任务" force-render>
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
          this.$router.push({ name: 'waitAllocated' })
          break
        case '2':
          this.$router.push({ name: 'Allocated' })
          break
      }
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
