<template>
  <Container title="巡查信息" link="/functionRoom2/checkDetail">
    <div v-for="item in 4" :key="item" class="line">
      <div class="time">巡查时间：2024-10-28 12:00:00</div>
      <div class="block">
        <img src="@/assets/images/functionRoom2/tIcon.png" alt="" />
        <span>25℃</span>
      </div>
      <div class="block">
        <img src="@/assets/images/functionRoom2/rhIcon.png" alt="" />
        <span>90%rh</span>
      </div>
    </div>
  </Container>
</template>
<script lang="ts" setup>
import Container from "../../../components/Container.vue"
</script>
<style lang="less" scoped>
.line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.24rem;
  &:nth-last-child(1) {
    margin-bottom: 0;
  }
  .time {
    flex: 1;
  }
  .block {
    // display: flex;
    // align-items: center;
    & + .block {
      margin-left: 0.35rem;
    }
    span {
      vertical-align: middle;
    }
    img {
      width: 0.24rem;
      height: 0.24rem;
      margin-right: 0.12rem;
    }
  }
}
</style>
