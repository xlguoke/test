<template>
  <div class="nice-frame">
    <div
      v-if="title"
      class="nice-frame-title"
      :class="{
        long: longTitle
      }"
    >
      {{ title }}
    </div>
    <span v-if="topLine" class="nice-frame-line-t"></span>
    <span class="nice-frame-line-b"></span>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"

const props = defineProps({
  /** 展示顶部线条装饰 */
  topLine: {
    type: Boolean,
    default: false
  },
  /** 标题 */
  title: {
    type: String,
    defalut: ""
  },
  /** 是否为长标题 */
  longTitle: {
    type: Boolean,
    default: false
  }
})

const topLine = ref(props.topLine)

const longTitle = ref(props.longTitle)
</script>

<style lang="less" scoped>
.nice-frame-line {
  content: "";
  display: block;
  width: 0.13rem;
  height: 0.13rem;
  position: absolute;
}

.nice-frame {
  position: relative;
  border: 1px solid rgba(18, 140, 255, 0.19);
  display: flex;
  flex-direction: column;
}

.nice-frame-title {
  height: 0.58rem;
  background: url("@/assets/images/commandCenterScreen/title-bg.png") no-repeat;
  padding-left: 0.48rem;
  line-height: 0.58rem;
  font-size: 0.2rem;
  background-position: left;
  background-size: cover;
  color: #fff;
  text-shadow: 0px 0px 0.09rem #158eff;
  letter-spacing: 1px;
  font-family: "YSFont";

  &.long {
    background: url("@/assets/images/commandCenterScreen/title-bg-long.png") no-repeat;
    background-position: left;
    background-size: cover;
  }
}

.nice-frame-line-t {
  &::before {
    .nice-frame-line;
    background: url("@/assets/images/commandCenterScreen/iframe-t-l.png") no-repeat;
    background-size: 100%;
    left: 0;
    top: 0;
  }

  &::after {
    .nice-frame-line;
    background: url("@/assets/images/commandCenterScreen/iframe-t-r.png") no-repeat;
    background-size: 100%;
    right: 0;
    top: 0;
  }
}

.nice-frame-line-b {
  &::before {
    .nice-frame-line;
    background: url("@/assets/images/commandCenterScreen/iframe-b-l.png") no-repeat;
    background-size: 100%;
    left: 0;
    bottom: 0;
  }

  &::after {
    .nice-frame-line;
    background: url("@/assets/images/commandCenterScreen/iframe-b-r.png") no-repeat;
    background-size: 100%;
    right: 0;
    bottom: 0;
  }
}
</style>
