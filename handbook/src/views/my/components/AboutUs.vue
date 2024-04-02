<script setup lang="ts">
const version = __VERSION__
</script>

<template>
  <div class="show-title-bar about-us-warp">
    <TitleBar />
    <div class="content">
      <img class="app-icon" src="@/assets/images/app-icon.png" alt="">
      <p class="app-describe">
        采用物联网技术、语音识别、图像识别技术帮助试验工程师和测量工程师，提供了快速记录试验或检测数据的工具。
      </p>
    </div>
    <div class="footer">
      <p>版权所有 重庆海特科技发展有限公司</p>
      <p>渝ICP备10201065号-18A</p>
      <p>{{ version }}</p>
    </div>
  </div>
</template>

<style lang="less" scoped>
.about-us-warp{
  display: flex;
  flex-direction: column;
  .content{
    padding: 0 5rem;
    flex: 1;
    .app-icon{
      display: block;
      margin: 10rem auto 0;
      width: 8.8rem;
      height: 8.8rem;
      min-width: 70px;
      min-height: 70px;
      margin-bottom: 30px;
    }
    .app-describe{
      line-height: 24px;
    }
  }
  .footer{
    margin-bottom: 5rem;
    text-align: center;
    line-height: 24px;
    color: #666;
  }
}
</style>
