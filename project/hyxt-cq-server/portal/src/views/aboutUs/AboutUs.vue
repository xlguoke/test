<template>
  <div class="page-content card">
    <p class="title">重庆市交通规划和技术发展中心联系方式</p>
    <ul class="content">
      <li><span>办公地址：</span>重庆市南岸区南区路58号</li>
      <li><span>联系电话：</span>023 - 62806051</li>
      <li><span>邮编：</span>400060</li>
    </ul>
    <p class="title">
      技术支持、系统功能性问题等联系方式
    </p>
    <ul class="content">
      <li><span>联系电话：</span>023 - 67037628</li>
      <li><span>QQ：</span><a style="color: #4a8de5;" href="tencent://message/?uin=2850989611&amp;Site=有事Q我&amp;Menu=yes" target="_blank">2850989611</a> </li>
      <li><span>邮箱：</span>2850989611@qq.com</li>
      
    </ul>
    <div class="map-box">
      <img src="@/assets/images/address.png" style="width: 100%;height: 100%;"/>
      <!-- <BaiduMap/> -->
    </div>
  </div>
</template>
<script setup lang="ts">
// import BaiduMap from '@/components/bmap/BaiduMap.vue'

</script>
<style scoped lang="less">
.page-content {
  margin-top: 12px;
  padding: 20px;
  box-sizing: border-box;
  .title {
    margin-bottom: 10px;
    padding-left: 12px;
    position: relative;
    font-weight: 700;
    &::before {
      position: absolute;
      left: 0;
      top: 3px;
      width: 4px;
      height: 14px;
      border-top-right-radius: 2px;
      border-bottom-right-radius: 2px;
      content: "";
      background: @theme_color;
    }
  }
  .content {
    margin-bottom: 16px;
    li {
      display: inline-block;
      width: 30%;
    }
    span {
      color: #999;
    }
  }
  .map-box {
    height: 400px;
    background-color: #f5f5f5;
  }
}
</style>