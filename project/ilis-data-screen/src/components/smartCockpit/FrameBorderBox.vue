<template>
  <div class="frame-border-box">
    <slot></slot>
    <div class="frame-box-border-tl"></div>
    <div class="frame-box-border-tr"></div>
    <div class="frame-box-border-bl"></div>
    <div class="frame-box-border-br"></div>
  </div>
</template>

<style lang="less" scoped>
.frame-border-box {
  display: flex;
  position: relative;
  height: 100%;
  width: 100%;
  padding: 0.16rem;
  border: 2px solid rgba(64, 231, 213, 0.4);
}

.frame-box-border-o {
  content: "";
  background: #40e7d5;
  display: block;
  position: absolute;
}

.frame-box-border-tl {
  position: absolute;
  left: -2px;
  top: -2px;

  &::before {
    .frame-box-border-o;
    width: 0.3rem;
    height: 2px;
  }

  &::after {
    .frame-box-border-o;
    height: 0.3rem;
    width: 2px;
  }
}

.frame-box-border-tr {
  position: absolute;
  right: -2px;
  top: -2px;

  &::before {
    .frame-box-border-o;
    width: 0.3rem;
    height: 2px;
    right: 0;
    top: 0;
  }

  &::after {
    .frame-box-border-o;
    height: 0.3rem;
    width: 2px;
    right: 0;
    top: 0;
  }
}

.frame-box-border-bl {
  position: absolute;
  left: -2px;
  bottom: -2px;

  &::before {
    .frame-box-border-o;
    width: 0.3rem;
    height: 2px;
    left: 0;
    bottom: 0;
  }

  &::after {
    .frame-box-border-o;
    height: 0.3rem;
    width: 2px;
    left: 0;
    bottom: 0;
  }
}

.frame-box-border-br {
  position: absolute;
  right: -2px;
  bottom: -2px;

  &::before {
    .frame-box-border-o;
    width: 0.3rem;
    height: 2px;
    right: 0;
    bottom: 0;
  }

  &::after {
    .frame-box-border-o;
    height: 0.3rem;
    width: 2px;
    right: 0;
    bottom: 0;
  }
}
</style>
