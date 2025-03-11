<template>
  <AppProvider>
    <a-card
      class="h-full flex flex-col"
      :body-style="{ flex: 1, height: 0, padding: '16px' }"
    >
      <a-flex class="h-full">
        <List class="w-0 flex-1" />
      </a-flex>
    </a-card>
  </AppProvider>
</template>

<script setup lang='ts'>
import List from './components/List.vue'
</script>
