<template>
  <ht-modal
    title="调试"
    :open="visible"
    :mask-closable="false"
    :footer="false"
    wrap-class-name="consignList-detail-modal"
    :centered="true"
    width="500px"
    @cancel="handleCancel"
  >
    <video
      v-if="src"
      id="myplayer"
      :src="src"
      width="100%"
      height="300"
      style="object-fit: fill"
      :autoplay="true"
      controls
      playsInline
      webkit-playsinline
      muted
    />
  </ht-modal>
</template>

<script>
import dayjs from 'dayjs'

let player

export default {
  props: ['data'],
  data() {
    return {
      visible: false,
      dayjs,
      src: '',
    }
  },
  created() {
    AnyDriverHelper.createScript('ezuikit.js')
  },
  methods: {
    beginPlay() {
      player = new EZUIKit.EZUIPlayer('myplayer')
      setTimeout(() => {
        player.play()
      }, 500)
    },
    showModal(src) {
      this.src
        = src
          || 'https://hls01open.ys7.com/openlive/6e0b2be040a943489ef0b9bb344b96b8.hd.m3u8'
      this.visible = true
      window.$oNextTick(() => {
        this.beginPlay()
      })
    },
    handleCancel() {
      this.visible = false
      window.$oNextTick(() => {
        player.stop()
        this.src = ''
        player = null
      })
    },
  },
}
</script>

<style lang="less" scoped>
:deep(.ant-modal-body) {
  padding: 0;
  margin-top: -1px;
  height: 300px;
}
</style>
