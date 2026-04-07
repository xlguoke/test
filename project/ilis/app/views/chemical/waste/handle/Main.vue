<template>
  <AppProvider>
    <a-card
      class="h-full flex flex-col"
      :body-style="{ flex: 1, height: 0, padding: '16px' }"
    >
      <div class="h-full">
        <List />
      </div>
    </a-card>
  </AppProvider>
</template>

<script setup lang='ts'>
import List from './components/List.vue'
</script>
