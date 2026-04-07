<template>
  <div class="page-wrap">
    <img src="@/assets/images/error.png" alt="auth" />
    <p class="error-page-hint">系统访问异常，请稍后重试或联系系统管理员</p>
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
    margin-bottom: 50px;
    width: 300px;
  }

  .error-page-hint {
    font-size: 16px;
    color: #999;
  }
}
</style>
