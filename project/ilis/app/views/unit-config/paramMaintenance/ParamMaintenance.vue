<template>
  <AppProvider>
    <a-card
      class="h-full flex flex-col"
      :body-style="{ flex: 1, height: 0, padding: '16px' }"
    >
      <a-row :gutter="16" class="h-full">
        <a-col span="4" class="h-full">
          <BigCategoryTree v-model:value="selectedBigCategory" />
        </a-col>
        <a-col span="20">
          <List :big-category-id="selectedBigCategory" />
        </a-col>
      </a-row>
    </a-card>
  </AppProvider>
</template>

<script setup lang='ts'>
import BigCategoryTree from './components/BigCategoryTree.vue'
import List from './components/List.vue'

const selectedBigCategory = ref<string>('')
</script>
