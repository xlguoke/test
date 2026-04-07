<template>
  <Container>
    <div class="title">传感器1</div>
    <div class="t line">
      <img src="src\assets\images\functionRoom2\tColorIcon.png" alt="" />
      <span>温度：</span>
      <span>20℃</span>
    </div>
    <div class="rh line">
      <img src="src\assets\images\functionRoom2\rhColorIcon.png" alt="" />
      <span>湿度：</span>
      <span>95%RH</span>
    </div>
  </Container>
</template>
<script lang="ts" setup>
import Container from "@/views/functionRoom2/components/Container.vue"
</script>
<style lang="less" scoped>
.title,
.t {
  margin-bottom: 0.24rem;
}
.line {
  display: flex;
  align-items: center;
  img {
    width: 0.32rem;
    height: 0.32rem;
    margin-right: 0.08rem;
  }
}
</style>
