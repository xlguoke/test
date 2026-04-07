<!-- 行业容器 -->
<template>
  <HtDrag :max-width="maxPanelWidth" :min-width="260">
    <HtDragItem :width="collapsed ? '0px' : 300" class="relative">
      <div class=" h-full flex flex-col overflow-hidden ">
        <!-- 行业切换 -->
        <a-select
          v-if="industryOptions.length > 1"
          v-model:value="industryId"
          class="w-full !mb-3"
          show-search
          placeholder="请选择领域"
          :options="industryOptions"
          :filter-option="filterOption"
          @change="(v: any) => {
            setIndustryId(v)
            sample = undefined
          }"
        ></a-select>
        <!-- 样品树 -->
        <div class="flex-1 h-0">
          <IlisSampleTree
            ref="ilisSampleTreeRef"
            :key="industryId"
            @select="sample = $event.sample"
          ></IlisSampleTree>
        </div>
      </div>
      <template #after>
        <BaseToggleBar
          v-model="collapsed"
          class="absolute top-1/2 right-1 translate-x-[6px] -translate-y-1/2 z-10"
        ></BaseToggleBar>
      </template>
    </HtDragItem>
    <HtDragItem :key="industryId">
      <slot>
        <!-- 内容区 -->
      </slot>
    </HtDragItem>
  </HtDrag>
</template>

<script lang="ts" setup>
import { useIndustryStore } from '~/store/industryStore'

const { industryId, setIndustryId, industryList, sample } = toRefs(useIndustryStore())

const industryOptions = computed(() => industryList.value.map(item => ({ label: item.name || '', value: item.id })))

const collapsed = ref(true)

const maxPanelWidth = document.body.clientWidth * 0.65

const ilisSampleTreeRef = ref()

watch(sample, (val) => {
  if (!val) {
    ilisSampleTreeRef.value.clearCheckedKeys()
  }
})

function filterOption(input: string, option: any) {
  return option.value.toLowerCase().includes(input.toLowerCase())
}
</script>
