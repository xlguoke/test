<template>
  <div class="page-wrap">
    <img src="@/assets/images/404.png" alt="404" />
    <p class="error-page-hint">抱歉，您访问的页面不存在</p>
    <router-link to="/"><a-button type="primary">返回首页</a-button></router-link>
  </div>
</template>

<script lang="ts" setup></script>
<style scoped lang="less">
.page-wrap {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  img {
    width: 500px;
  }
  .error-page-hint {
    margin-bottom: 30px;
    font-size: 16px;
    color: #999;
  }
}
</style>
