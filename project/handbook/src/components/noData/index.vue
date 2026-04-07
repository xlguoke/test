<script setup lang="ts">
defineProps({
  describe: { type: String, default: '暂无数据' },
  mini: Boolean,
})
</script>

<template>
  <div :class="`no-data ${mini ? 'mini' : ''}`">
    <slot name="img">
      <img src="@/assets/images/udr/no-data.png">
    </slot>
    <p class="describe">
      {{ describe }}
    </p>
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
  .describe {
    margin: 0;
  }

  &.mini {
    margin: 1.6rem auto 0;
    font-size: 14px;
    img {
      margin-bottom: 0;
      height: 10rem;
    }
    .describe {
      line-height: 1rem;
    }
  }
}

@media screen and (max-width: 576px) {
  .no-data {
    font-size: 14px;
  }
}
</style>
