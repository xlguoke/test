<template>
  <div class="footer-main">
    <div class="keep"></div>
    <div class="powerdBy">技术支持：重庆海特科技发展有限公司</div>
    <div class="version">
      <span>版本：V2.210</span>
      <span>DFGDD12345</span>
    </div>
  </div>
</template>

<script lang="ts" setup></script>

<style lang="less" scoped>
.footer-main {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  align-items: center;
  font-size: 14px;
  letter-spacing: 3px;
  padding: 0 20px 20px;
  .powerdBy {
    font-weight: bold;
    color: #003684;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .version {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    color: #49557c;
    gap: 40px;
  }
}
</style>
