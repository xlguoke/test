<template>
  <a-tooltip color="#fff" placement="right">
    <template #title>
      <div class="text-[#aaaaaa] text-3">
        <slot v-if="!viewTitle"></slot>
        {{ viewTitle }}
      </div>
    </template>
    <a-tag :color="color" @mouseenter="handleMouseEnter">
      <slot></slot>
    </a-tag>
  </a-tooltip>
</template>

<script lang="ts" setup>
const props = defineProps<{
  /**
   * # tag颜色
   */
  color?: string
  /**
   * # tooltip文本
   */
  title?: string | (() => Promise<string>)
}>()

const viewTitle = ref('')

let titleFn: () => Promise<string>

if (typeof props.title === 'function') {
  titleFn = props.title
}
else {
  viewTitle.value = props.title || ''
}

async function handleMouseEnter() {
  if (titleFn) {
    viewTitle.value = await titleFn().catch((_err) => {
      return ''
    })
  }
}
</script>
