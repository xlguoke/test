<template>
  <AppProvider>
    <a-card
      class="h-full flex flex-col"
      :body-style="{ flex: 1, height: 0, padding: '16px' }"
    >
      <a-row :gutter="16" class="h-full">
        <a-col span="4" class="h-full">
          <BigCategoryTree @change="onChange" />
        </a-col>
        <a-col span="20">
          <List :big-category-id="selectedBigCategory" :param-version-id="selectedParamVersionId" />
        </a-col>
      </a-row>
    </a-card>
  </AppProvider>
</template>

<script setup lang='ts'>
import List from './components/List.vue'
import BigCategoryTree from '~/components/bigCategoryTree/Index.vue'

const selectedBigCategory = ref('')

const selectedParamVersionId = ref('')

function onChange(data: { bigCategoryId: string, paramVersionId: string }) {
  selectedBigCategory.value = data.bigCategoryId
  selectedParamVersionId.value = data.paramVersionId
}
</script>
