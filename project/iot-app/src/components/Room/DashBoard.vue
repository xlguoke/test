<!-- eslint-disable vue/max-len -->
<template>
  <div class="flex-x gap-10">
    <div w40 text-12>
      {{ start }}
    </div>
    <div class="pos-relative h88 w88">
      <div
        v-for="(item, index) in 32"
        :key="item"
        class="pos-absolute top-50% h1.35 w-full flex-x transform-origin-center translate-y-[-50%] rotate-100"
        :style="{
          '--un-rotate': `${180 / 31 * (index)}deg`,
        }"
      >
        <i
          class="inline-block h1.5 w3 translate-x-[-200%] scale-100 rounded-4 shadow"
          :style="{
            backgroundColor: cubicBezierNumber * 180 > (180 / 32 * (index)) ? color : '#D8D8D8',
          }"
        ></i>
      </div>
      <div
        class="pos-relative h88 w88 flex-x transform-origin-center rotate-[-90deg] justify-center rounded-full bg-white shadow"
        :style="{
          '--un-rotate': `${cubicBezierNumber * 180 - 90}deg`,
        }"
      >
        <img
          v-if="type === 'hot'"
          src="@/assets/poiner.svg "
          class="pos-absolute top-[-2px] z-0 h7 w10"
        >
        <img
          v-else
          src="@/assets/poinerCold.svg "
          class="pos-absolute top-[-2px] z-0 h7 w10"
        >
        <div class="h70 w70 flex-x justify-center rounded-full bg-white transition-colors shadow">
        </div>
      </div>
      <div
        class="pos-absolute bottom-0 left-0 right-0 top-0 flex-x justify-center text-18 font-500"
        :style="{
          color,
        }"
      >
        {{ current?.toFixed(precision) }}
      </div>
    </div>
    <div w40 text-12>
      {{ end }}
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = withDefaults(defineProps<{
  start?: number
  end?: number
  data?: number
  type?: 'cold' | 'hot'
  precision?: number
}>(), {
  start: 0,
  end: 100,
  data: 0,
  type: 'cold',
  precision: 0,
})

const color = computed(() => {
  return props.type === 'cold' ? '#0066EC' : '#F68844'
})

const current = ref(0)

const percent = computed(() => {
  const range = props.end - props.start
  const percent = (current.value - props.start) / range
  return percent
})

const cubicBezierNumber = useTransition(percent, {
  duration: 1500,
  transition: [0.75, 0, 0.25, 1],
})

onMounted(() => {
  current.value = props.data
  watch(() => props.data, (val) => {
    current.value = val
  })
})
</script>
