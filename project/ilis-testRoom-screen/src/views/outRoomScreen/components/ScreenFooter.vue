<template>
  <div class="main">
    <div class="keep"></div>
    <div class="powerdBy">技术支持：重庆海特科技发展有限公司</div>
    <div class="version">
      <span>屏幕编码：DFGDD1234564DGASDG</span>
      <span>版本号：V1.0.86</span>
    </div>
  </div>
</template>

<script lang="ts" setup></script>

<style lang="less" scoped>
.main {
  height: 0.35rem;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  align-items: center;
  font-size: 0.14rem;
  line-height: 100%;
  letter-spacing: 0.03rem;
  padding: 0 0.2rem;
  .powerdBy {
    font-weight: bold;
    color: #224059;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .version {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    color: #224059;
    span:first-child {
      margin-right: 0.4rem;
      white-space: nowrap;
    }
  }
}
</style>
