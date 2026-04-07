<template>
  <div class="common-navbar">
    <div class="l">
      <slot name="left">
        <div class="back_btn" @click="onBack">
          <van-icon name="arrow-left" />
        </div>
      </slot>
    </div>
    <div class="c">
      <slot name="title">{{ title }}</slot>
    </div>
    <div class="r">
      <slot name="right"></slot>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed } from "vue"
import { useRouter } from "vue-router"

const props = defineProps<{
  title?: string
}>()

const router = useRouter()

const title = computed(() => {
  return props.title || router.currentRoute.value.meta.title
})

function onBack() {
  if (window.history.state.back) {
    history.back()
  } else {
    router.replace("/")
  }
}
</script>
<style lang="less" scoped>
.common-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  margin-bottom: 40px;
  .l,
  .r {
    width: 80px;
  }
  .c {
    white-space: nowrap;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0 24px;
    text-align: center;
    font-size: 48px;
    font-weight: bold;
    line-height: 66px;
    color: #224059;
  }
  .back_btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    border-radius: 16px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0) 100%);
    border: 1px solid #ffffff;
  }
}
</style>
