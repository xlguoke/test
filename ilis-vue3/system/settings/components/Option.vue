<template>
  <div>
    <p class="font-semibold" data-test="option-name">
      {{ name }}
    </p>
    <div :class="flexed ? 'flex gap-1' : ''">
      <slot />
      <p class="text-gray-500" data-test="option-desc" v-html="desc" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  name: string
  desc?: string
  flexed?: boolean
}

const props = defineProps<Props>()

const desc = computed(() => {
  if (props.desc) {
    return props.desc.replace(/(&emsp;|&nbsp;)/g, '')
  }
  return props.desc
})
</script>
