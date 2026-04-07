<template>
  <AppProvider>
    <a-card
      class="h-full flex flex-col"
      :body-style="{ flex: 1, height: 0, padding: '16px' }"
    >
      <HtDrag :max-width="maxPanelWidth" :min-width="260">
        <HtDragItem :width="collapsed ? '0px' : 300" class="relative">
          <div class=" h-full flex flex-col overflow-hidden ">
            <BigCategoryTree @change="onChange" />
          </div>
          <template #after>
            <BaseToggleBar
              v-model="collapsed"
              class="absolute top-1/2 right-1 translate-x-[6px] -translate-y-1/2 z-10"
            ></BaseToggleBar>
          </template>
        </HtDragItem>
        <HtDragItem :key="industryId">
          <List :big-category-id="selectedBigCategory" :param-version-id="selectedParamVersionId" />
        </HtDragItem>
      </htdrag>
    </a-card>
  </AppProvider>
</template>

<script setup lang='ts'>
import BigCategoryTree from '~/components/bigCategoryTree/Index.vue'
import List from './components/List.vue'

const selectedBigCategory = ref('')

const selectedParamVersionId = ref('')

const collapsed = ref(true)

function onChange(data: { bigCategoryId: string, paramVersionId: string }) {
  selectedBigCategory.value = data.bigCategoryId
  selectedParamVersionId.value = data.paramVersionId
}
</script>
