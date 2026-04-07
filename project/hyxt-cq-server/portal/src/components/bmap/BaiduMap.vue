<template>
  <div id="baiduMap" style="width: 100%; height: 100%"></div>
</template>
<script setup lang="ts">
import { onMounted } from "vue";

onMounted(() => {
  const BMap = (window as any).BMap;
  const map = new BMap.Map("baiduMap");
  const point = new BMap.Point(106.581494, 29.525004);
  map.centerAndZoom(point, 15);
  map.enableScrollWheelZoom(true);
  map.addEventListener("click", function (e) {
    console.log(e);
  });
  const marker = new BMap.Marker(point); // 创建标注
  const opts = {
    width: 200,
    height: 80,
    title: '重庆市交通规划和技术发展中心'
  };
  map.addOverlay(marker); // 将标注添加到地图中
  const infoWindow = new BMap.InfoWindow("重庆市南岸区南兴路58号", opts); // 创建信息窗口对象
  map.openInfoWindow(infoWindow, map.getCenter());
});
</script>
<style scoped lang="less">
</style>
