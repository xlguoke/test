<template>
  <div>
    <p class="font-bold text-[14px] mb-1" data-test="option-name">
      <slot name="beforeName">
        {{ term(name) }}
      </slot>
    </p>
    <div :class="flexed ? 'flex gap-1 items-start' : ''">
      <slot name="beforeOption"></slot>
      <div class="flex items-center">
        <slot />
      </div>
      <p data-test="option-desc" v-html="term(desc || '')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useIndustryStore } from '~/store/industryStore'

interface Props {
  name: string
  desc?: string
  flexed?: boolean
}

const props = defineProps<Props>()

const { term } = useIndustryStore()

const desc = computed(() => {
  if (props.desc) {
    return props.desc.replace(/(&emsp;|&nbsp;)/g, '')
  }
  return props.desc
})
</script>
