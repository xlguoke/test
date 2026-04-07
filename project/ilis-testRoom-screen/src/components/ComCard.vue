<template>
  <div :class="`s-card ${isLong ? 's-card-long' : ''} ${hideBorder ? 'hide-border' : ''} `">
    <div v-if="hideTitle" class="top-border"></div>
    <div v-if="!hideTitle" ref="cardHead" class="s-card-head">
      <img class="card-head-icon" src="@/assets/images/title-icon.png" />
      <span class="font-ys">{{ title }}</span>
    </div>
    <div
      :class="{
        's-card-body': true,
        'full-height': hideTitle
      }"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"

const props = defineProps({
  title: {
    type: String,
    default: ""
  },
  /** 加长卡片 */
  isLong: {
    type: Boolean,
    default: false
  },
  hideBorder: Boolean,
  hideTitle: Boolean
})

onMounted(() => {
  setBgPosition()
})

const cardHead = ref()
const setBgPosition = () => {
  const winW = window.innerWidth || document.body.clientWidth
  const winH = window.innerHeight || document.body.clientHeight
  const wh = winW / winH
  if (!cardHead.value) {
    return
  }
  if (wh > 2.7) {
    cardHead.value.style.backgroundPosition = "left center"
  } else {
    cardHead.value.style.backgroundPosition = "right center"
  }
}
</script>

<style scoped lang="less">
.top-border {
  position: relative;
  &::before {
    content: "";
    position: absolute;
    left: -1px;
    top: -1px;
    width: 0.12rem;
    height: 0.12rem;
    border-top: 2px solid #128cff;
    border-left: 2px solid #128cff;
  }
  &::after {
    content: "";
    position: absolute;
    right: -1px;
    top: -1px;
    width: 0.12rem;
    height: 0.12rem;
    border-top: 2px solid #128cff;
    border-right: 2px solid #128cff;
  }
}
.bottom-border(@color) {
  position: relative;
  &::before {
    content: "";
    position: absolute;
    left: -1px;
    bottom: -1px;
    width: 0.12rem;
    height: 0.12rem;
    border-bottom: 2px solid @color;
    border-left: 2px solid @color;
  }
  &::after {
    content: "";
    position: absolute;
    right: -1px;
    bottom: -1px;
    width: 0.12rem;
    height: 0.12rem;
    border-bottom: 2px solid @color;
    border-right: 2px solid @color;
  }
}
.s-card {
  width: 100%;
  height: 100%;
  &:not(.no-border):not(.hide-border) {
    border: 1px solid #05234a;
    .bottom-border(#128cff);
  }
  .s-card-head {
    position: relative;
    display: flex;
    align-items: center;
    padding-left: 0.06rem;
    line-height: 0.56rem;
    font-size: 0.22rem;
    border-image-source: url("@/assets/images/border-bg.png");
    border-image-slice: 3 64 3 50 fill;
    border-image-width: 0.03rem 0.5rem;
    background: url("@/assets/images/juxing-bg.png") no-repeat right center/auto 60%,
      linear-gradient(to right, #021f3a, #030a20);
    text-shadow: 0.02rem 0 0.08rem #128cff;
    .card-head-icon {
      margin: 0 0.08rem;
      width: 0.24rem;
      height: 0.28rem;
    }
  }
  .s-card-body {
    height: calc(100% - 0.56rem);
    padding: 0.1rem;
    box-sizing: border-box;
    &.full-height {
      height: 100%;
    }
  }
}

.s-card.hide-border {
  border: none;
  .s-card-body {
    padding: 0;
  }
}
</style>
