<template>
  <div>
    <p v-html="data.content"></p>
    <template v-for="(item, i) in data.hyperlinks" :key="item.id + i">
      <p class="mt-1 leading-4">
        {{ item.describe }}：<a class="text" @click="showSource(item.id)">{{ item.text }}</a>
      </p>
    </template>

    <Source ref="sourceRef" />
  </div>
</template>

<script setup lang='ts'>
import type { PropType } from 'vue'
import type { StandardTrace } from '../api'
import Source from './Source.vue'

defineProps({
  data: {
    type: Object as PropType<StandardTrace>,
    default: () => ({}),
  },
})

const sourceRef = ref()
function showSource(id: string) {
  sourceRef.value.initModalZindex()
  sourceRef.value.showModal(id)
}
</script>

<style scoped>
a{
  color: #1677ff
}
a:hover{
  opacity: .8;
}
</style>
