<template>
  <div class="settingBaseInfo">
    <van-sticky>
      <MobileTitleBar left-arrow @click-left="$router.go(-1)" />
    </van-sticky>
    <iframe
      id="show-iframe"
      style=""
      frameborder="0"
      name="showHere"
      scrolling="auto"
      :src="url"
    ></iframe>
  </div>
</template>

<script>
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'

export default {
  components: {
    MobileTitleBar,
  },
  data() {
    return {
      url: '',
    }
  },
  created() {
    this.url = this.$route.params.url
  },
  methods: {},
}
</script>

<style>
#show-iframe {
  height: 100vh;
  width: 100vw;
}
</style>

<style lang="less" scoped>
@import url('./index');
</style>
