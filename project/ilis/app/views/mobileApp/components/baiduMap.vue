<template>
  <div class="baidu-map-wrap">
    <div :id="domId" class="baidu-map-main"></div>

    <van-loading v-if="loading" color="#0094ff" class="baidu-map-loading">
      地图加载中...
    </van-loading>
  </div>
</template>

<script>
import { v4 } from 'uuid'
import { BaiduMapTool } from '~/views/mobileApp/provides/modules/baidu-map-tool'

export default {
  name: 'BaiduMap',
  emits: ['getLocation'],
  data() {
    return {
      baiduMap: null,
      domId: v4(),
      loading: false,
    }
  },
  mounted() {
    this.baiduMap = new BaiduMapTool(this.domId)
    this.initMap()
  },
  methods: {
    async initMap() {
      this.loading = true
      await this.baiduMap.createMap().finally(() => {
        this.loading = false
      })

      this.getLocation()
    },
    async getLocation() {
      const positionData = await this.baiduMap.getLocation()
      this.$emit('getLocation', positionData, this.baiduMap)
    },
    getMapInstance() {
      return this.baiduMap.mapInstance
    },
  },
}
</script>

<style lang="less" scoped>
.baidu-map-wrap {
  position: relative;

  .baidu-map-main {
    width: 100%;
    height: 100%;
  }

  .baidu-map-loading {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>
