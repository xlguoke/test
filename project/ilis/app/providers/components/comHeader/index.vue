<template>
  <div class="comtitle">
    <span style="margin-left: 8px">
      <slot></slot>
    </span>
  </div>
</template>

<style lang="less" scoped>
.comtitle {
  font-size: 14px;
  position: relative;
  margin-bottom: 8px;
  font-weight: bold;
}
.comtitle::before {
  content: '';
  position: absolute;
  display: inline-block;
  width: 3px;
  height: 12px;
  background: var(--colorPrimary);
  top: 5px;
}
</style>
