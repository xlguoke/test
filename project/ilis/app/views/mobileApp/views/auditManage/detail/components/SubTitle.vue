<template>
  <div class="audit-detail-title">
    <slot></slot>
  </div>
</template>

<script>
export default {
  data() {
    return {}
  },
}
</script>

<style lang="less" scoped>
.audit-detail-title {
  font-size: 14px;
  color: #151515;
  padding-left: 28px;
  position: relative;
  line-height: 50px;
  background: #fff;
  &::before {
    content: '';
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    height: 12px;
    width: 3px;
    background: #0066ec;
    border-top-right-radius: 2px;
    border-bottom-right-radius: 2px;
  }
}
</style>
