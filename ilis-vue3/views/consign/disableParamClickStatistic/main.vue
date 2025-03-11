<template>
  <AppProvider>
    <a-card
      class="h-full flex flex-col"
      :body-style="{ flex: 1, padding: '16px' }"
    >
      <List class="flex-1" />
    </a-card>
  </AppProvider>
</template>

<script setup lang='ts'>
import List from './components/List.vue'
</script>
