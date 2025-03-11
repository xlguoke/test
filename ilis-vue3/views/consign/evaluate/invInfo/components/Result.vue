<template>
  <div v-if="isSuccess" class="result">
    <van-image
      width="100"
      height="100"
      :src="successImg"
      style="margin: 30px 0;"
    />
    <span>您已提交评价！</span>
    <span>感谢您的关注与支持！</span>
  </div>
  <div v-else class="result">
    <van-image
      width="100"
      height="100"
      :src="failedImg"
      style="margin: 30px 0;"
    />
    <span>评价已结束！</span>
    <span>感谢您的关注与支持！</span>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  isSuccess: boolean
}>()
const successImg = new URL('~/assets/img/success.png', import.meta.url).href
const failedImg = new URL('~/assets/img/failed.png', import.meta.url).href
</script>

<style lang="less" scoped>
.result{
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
