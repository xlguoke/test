<template>
  <div>
    <van-sticky>
      <MobileTitleBar
        class="left-title"
        title="新增盘点单"
        left-arrow
        @click-left="$router.go(-1)"
      >
      </MobileTitleBar>
    </van-sticky>
  </div>
</template>

<script>
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'

export default {
  components: {
    MobileTitleBar,
  },
  data() {
    return {}
  },

  methods: {},
}
</script>

<style lang="less" scoped></style>
