<template>
  <Container>
    <div class="body">
      <div class="name">风险告知卡</div>
      <div class="link">
        <van-icon name="arrow" color="#224059" />
      </div>
    </div>
  </Container>
</template>
<script lang="ts" setup>
import Container from "../../../components/Container.vue"
</script>
<style lang="less" scoped>
.body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  .name {
    color: #224059;
    font-size: 0.32rem;
    font-weight: 700;
  }
  .link {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 0.44rem;
    height: 0.44rem;
    border-radius: 0.04rem;
    border: 1px solid #ffffff;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0) 100%);
  }
}
</style>
