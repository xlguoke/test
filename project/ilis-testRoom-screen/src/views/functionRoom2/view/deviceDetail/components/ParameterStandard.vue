<template>
  <div class="list">
    <Container v-for="i in 12" :key="i" class="item">
      <CommonLine class="line" align="left" label="检测参数：" value="粒径分布"></CommonLine>
      <CommonLine
        class="line"
        align="left"
        label="试验依据："
        value="《公路桥梁钢结构防腐涂装技术条件》(JT/T 722-2023)"
      ></CommonLine>
      <CommonLine
        class="line"
        align="left"
        label="评定标准："
        value="《公路桥梁钢结构防腐涂装技术条件》(JT/T 722-2023)"
      ></CommonLine>
    </Container>
  </div>
</template>
<script lang="ts" setup>
import CommonLine from "@/views/functionRoom2/components/CommonLine.vue"
import Container from "@/views/functionRoom2/components/Container.vue"
</script>
<style lang="less" scoped>
.list {
  .item {
    margin-bottom: 0.32rem;
    .line {
      & + .line {
        margin-top: 0.24rem;
      }
    }
  }
}
</style>
