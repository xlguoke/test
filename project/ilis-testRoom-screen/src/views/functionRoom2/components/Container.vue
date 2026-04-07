<template>
  <div class="container-custom">
    <div v-if="title" class="title_box">
      <span :class="`${subTitle ? 'sub-title' : 'title'}`">
        <slot name="title">{{ title }}</slot>
      </span>
      <router-link v-if="link" :to="{ path: link, query: query }">
        {{ linkText || "查看详情" }}>
      </router-link>
    </div>
    <slot></slot>
  </div>
</template>
<script lang="ts" setup>
defineProps<{
  /** 标题 */
  title?: string
  /** 跳转路由地址 */
  link?: string
  /** 跳转文字 */
  linkText?: string
  /** 跳转携带参数 */
  query?: Record<string, any>
  /** 显示小号标题 */
  subTitle?: boolean
}>()
</script>
<style lang="less" scoped>
.container-custom {
  border-radius: 0.16rem;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.2) 100%);
  border: 0.02rem solid #ffffff;
  padding: 0.32rem;
  margin-bottom: 0.32rem;
  .title_box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.3rem;
    .sub-title {
      font-size: 0.28rem;
      font-weight: bold;
    }
    .title {
      font-size: 0.32rem;
      font-weight: bold;
    }
  }
}
</style>
