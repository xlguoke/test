<template>
  <div :id="mapId" style="height: 100%;"></div>
</template>

<script setup lang='ts'>
/**
 * 百度api文档：https://lbsyun.baidu.com/index.php?title=jspopular3.0
 */
import { message } from 'ant-design-vue'

const emits = defineEmits<{
  /** 地图加载完成只是 */
  (e: 'ready', data: any): void
}>()

const mapId = `map-${Date.now()}`
const zoom = ref(20)
const center = ref([106.510683, 29.615676])

let baiduMap: any = null

onMounted(() => {
  mapLoader()
})

async function mapLoader() {
  baiduMap = new window.BMap.Map(mapId)

  window.aa = baiduMap

  const point = new window.BMap.Point(center.value[0], center.value[1])
  // 设置地图中心并设置缩放
  baiduMap.centerAndZoom(point, zoom.value)
  // 开启鼠标滚轮缩放
  baiduMap.enableScrollWheelZoom(true)

  // 添加比例尺插件
  baiduMap.addControl(new window.BMap.ScaleControl())

  // 初始化地图事件
  baiduMap.addEventListener('click', (ev: any) => {
    emits('click', ev)
  })

  emits('ready', baiduMap)
}

// 更新地图中心
function updateMapCenter(center: [number, number]) {
  if (!center || center.length !== 2) {
    message.error('坐标错误')
    return
  }
  baiduMap.panTo(new window.BMap.Point(center[0], center[1]))
}

onUnmounted(() => {
  baiduMap = null
})

defineExpose({
  updateMapCenter,
})
</script>

<style lang="less">
.BMap_vectex.BMap_vectex_node {
  background: #fff;
  border: 1px solid #03A9F4;
  border-radius: 50%;
}

.BMap_shadow img {
  max-width: initial;
}
</style>
