<template>
  <span :style="{ transitionDelay: `${delay}ms` }">{{ formattedNumber }}</span>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue"

const props = defineProps({
  value: {
    type: Number,
    required: true
  },
  duration: {
    type: Number,
    default: 1500
  },
  delay: {
    type: Number,
    default: 0
  }
})

const currentValue = ref(props.value)

const startValue = ref(0)

const formattedNumber = computed(() => {
  return currentValue.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
})

const animateNumber = (newValue) => {
  const startTime = performance.now()

  const animate = (currentTime) => {
    const progress = Math.min((currentTime - startTime) / props.duration, 1)
    currentValue.value = Math.floor(startValue.value + (newValue - startValue.value) * progress)

    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      currentValue.value = newValue
    }
  }

  requestAnimationFrame(animate)
}

watch(
  () => props.value,
  (newValue) => {
    startValue.value = currentValue.value
    animateNumber(newValue)
  },
  { immediate: true }
)
</script>
