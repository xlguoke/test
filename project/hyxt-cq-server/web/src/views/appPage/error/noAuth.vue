<template>
  <div class="page-wrap">
    <img src="@/assets/images/auth.png" alt="auth" />
    <p class="error-page-hint">您无访问权限</p>
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
    font-size: 16px;
    color: #999;
  }
}
</style>
