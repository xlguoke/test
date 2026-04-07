<template>
  <IlisContainer app-id="qr_upload">
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </IlisContainer>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {

    }
  },
  mounted() {
    this.initFontSize()

    window.onresize = () => {
      this.initFontSize()
    }
  },
  methods: {
    initFontSize() {
      const winW
        = document.documentElement.clientWidth || document.body.clientWidth
      const scale = Math.min(winW / 750, 1)
      document.documentElement.style.fontSize = `${scale * 100}px`
    },
  },
}
</script>

<style lang="less">
html,
body,
#qr_upload {
  height: 100%;
  overflow-x: hidden;
}
.ant-message {
  top: 10%;
}
.ant-modal {
  top: 30%;
}
.ant-btn.ant-btn-loading:not(.ant-btn-circle):not(.ant-btn-circle-outline):not(
    .ant-btn-icon-only
  )
  .anticon:not(:last-child) {
  margin-left: 0;
  font-size: 0.24rem;
}
</style>
