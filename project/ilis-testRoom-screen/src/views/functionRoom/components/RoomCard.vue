<template>
  <div class="gradient-border">
    <p class="tl-border"></p>
    <p class="br-border"></p>
    <p v-if="title" class="sub-title font-ys">{{ title }}</p>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { toRefs } from "vue"
interface Props {
  title?: string
}
const props = defineProps<Props>()
const { title } = toRefs(props)
</script>

<style scoped lang="less">
.gradient-border {
  position: relative;
  margin-top: 0.2rem;
  background: linear-gradient(138deg, rgba(18, 140, 255, 0.26) 0%, rgba(18, 140, 255, 0) 100%);

  .tl-border,
  .br-border {
    position: absolute;
    width: 0;
    height: 0;
  }

  .tl-border {
    left: 0;
    top: 0;
  }

  .br-border {
    right: 0;
    bottom: 0;
  }

  .tl-border::before,
  .tl-border:after {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
  }

  .tl-border::before {
    width: 2.4rem;
    height: 2px;
    background: linear-gradient(to right, #158eff, transparent);
  }

  .tl-border:after {
    width: 2px;
    height: 2.4rem;
    background: linear-gradient(#158eff, transparent);
  }

  .br-border::before,
  .br-border:after {
    content: "";
    position: absolute;
    right: 0;
    bottom: 0;
  }

  .br-border::before {
    width: 2.4rem;
    height: 2px;
    background-image: linear-gradient(to right, transparent, #158eff);
  }

  .br-border:after {
    width: 2px;
    height: 2.4rem;
    background-image: linear-gradient(transparent, #158eff);
  }

  .sub-title {
    margin: 0 auto;
    width: 3.45rem;
    height: 0.51rem;
    line-height: 0.51rem;
    background: url(@/assets/images/sub-title-bg.png) no-repeat;
    background-size: 100% 100%;
    color: #bceaff;
    text-align: center;
    font-size: 0.36rem;
  }
}
</style>
