<script setup lang="ts">
defineProps({
  describe: { type: String, default: '暂无数据' },
})
</script>

<template>
  <div class="no-data">
    <img src="@/assets/images/no-data.png">
    <p>{{ describe }}</p>
  </div>
</template>

<style lang="less" scoped>
.no-data {
  margin: 10% auto 0;
  text-align: center;
  color: #aaa;
  line-height: 50px;
  font-size: 16px;
  img {
    margin-bottom: 1.2rem;
    height: 55vw;
    max-height: 260px;
  }
}

@media screen and (max-width: 576px) {
  .no-data {
    font-size: 14px;
  }
}
</style>
