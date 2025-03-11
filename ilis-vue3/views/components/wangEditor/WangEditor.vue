<template>
  <div class="p-2">
    <WEditor v-model:value="content" :height="height" :placeholder="placeholder" />
  </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import WEditor from '~/components/wangEditor'

const content = ref('')
const height = ref(300)
const placeholder = ref('')

const urlParam = new URLSearchParams(location.search)
const h = urlParam.get('height')
height.value = h ? Number(h) : 300
placeholder.value = urlParam.get('placeholder') || '请输入内容...'

window.getEditorValue = () => content.value
window.setEditorValue = (v: string) => (content.value = v)
</script>

<style>

</style>
