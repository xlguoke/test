<template>
  <AppProvider>
    <WriteExample :sample-ids="sampleIds" />
  </AppProvider>
</template>

<script setup lang='ts'>
import WriteExample from './components/WriteExample.vue'

interface Sample {
  id: string
  name: string
  displayName: string
}

const sampleIds = ref<string[]>([])

if (!window.vm) {
  window.vm = {}
}
window.vm.initWriteExample = function (rows: Sample[]) {
  sampleIds.value = rows.map(d => d.id)
}
</script>

<style>

</style>
