<template>
  <div class="container">
    <div class="count">{{ start }}</div>
    <div class="main">
      <div
        v-for="(item, index) in 32"
        :key="item"
        class="step"
        :style="{ '--un-rotate': `${(180 / 31) * index}deg` }"
      >
        <i
          class="step_item"
          :style="{
            backgroundColor: cubicBezierNumber * 180 > (180 / 32) * index ? color : '#D8D8D8'
          }"
        ></i>
      </div>
      <div class="poiner_box" :style="{ '--un-rotate': `${cubicBezierNumber * 180 - 90}deg` }">
        <img v-if="type === 'hot'" src="@/assets/poiner.svg " class="poiner" />
        <img v-else src="@/assets/poinerCold.svg " class="poiner" />
        <div class="bg_circle"></div>
      </div>
      <div class="current" :style="{ color }">
        {{ current }}
      </div>
    </div>
    <div class="count">
      {{ end }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from "vue"
import { useTransition } from "@vueuse/core"
const props = withDefaults(
  defineProps<{
    start?: number
    end?: number
    data?: number
    type?: "cold" | "hot"
  }>(),
  {
    start: 0,
    end: 100,
    data: 0,
    type: "cold"
  }
)

const color = computed(() => {
  return props.type === "cold" ? "#0066EC" : "#F68844"
})

const current = ref(0)

const percent = computed(() => {
  const range = props.end - props.start
  const percent = (current.value - props.start) / range
  return percent
})

const cubicBezierNumber = useTransition(percent, {
  duration: 1500,
  transition: [0.75, 0, 0.25, 1]
})

onMounted(() => {
  current.value = props.data
  watch(
    () => props.data,
    (val) => {
      current.value = val
    }
  )
})
</script>
<style lang="less" scoped>
.container {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  .count {
    width: 0.4rem;
  }
  .main {
    position: relative;
    height: 2.72rem;
    width: 2.72rem;
    .step {
      --un-rotate: 100deg;
      position: absolute;
      top: 50%;
      height: 0.05rem;
      width: 100%;
      display: flex;
      align-items: center;
      transform-origin: center;
      transform: translateY(-50%) rotate(var(--un-rotate));
      .step_item {
        display: inline-block;
        height: 0.042rem;
        width: 0.084rem;
        transform: translateX(-300%);
        border-radius: 0.04rem;
        box-shadow: 0px 0px 0.2rem 0px rgba(0, 102, 236, 0.1);
      }
    }
    .poiner_box {
      --un-rotate: -90deg;
      position: relative;
      height: 2.72rem;
      width: 2.72rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transform-origin: center;
      transform: rotate(var(--un-rotate));
      border-radius: 9999px;
      background: rgba(255, 255, 255, 0.6);
      box-shadow: 0px 0px 20px 0px rgba(0, 102, 236, 0.08);
      .poiner {
        position: absolute;
        top: -0.1rem;
        z-index: 0;
        height: 0.22rem;
        width: 0.32rem;
      }
      .bg_circle {
        height: 2.19rem;
        width: 2.19rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 9999px;
        background-color: #fff;
        transition-property: color, background-color, border-color, text-decoration-color, fill,
          stroke;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        transition-duration: 150ms;
        box-shadow: 0px 0px 20px 0px rgba(0, 102, 236, 0.1);
      }
    }
    .current {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      top: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.54rem;
      line-height: 0.6rem;
      font-weight: 500;
    }
  }
}
</style>
