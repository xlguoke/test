<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'

const props = defineProps<{
  text: string
}>()

onMounted(() => {
  nextTick(() => {
    initTextWrap()
  })
})

const textEllipsis = ref<HTMLElement>()
const isClick = ref(false)
function initTextWrap() {
  if (!props.text)
    return
  const el = textEllipsis.value
  if (!el)
    return
  const w = el.offsetWidth
  isClick.value = w > 220
}

function showDetail() {
  if (!isClick.value)
    return
  showDialog({ message: props.text })
}
</script>

<template>
  <div class="text-ellipsis" @click="showDetail">
    <span ref="textEllipsis">{{ text }}</span>
  </div>
</template>

<style scoped>
.text-ellipsis {
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
