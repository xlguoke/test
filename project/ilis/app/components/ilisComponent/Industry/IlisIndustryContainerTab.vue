<!-- 行业容器 -->
<template>
  <div class="w-full h-full flex flex-col overflow-hidden">
    <a-tabs v-if="industryList.length > 1" v-model:active-key="industryId" @change="(v: any) => setIndustryId(v)">
      <a-tab-pane v-for="item in industryList" :key="item.id" :tab="item.name || ''" />
    </a-tabs>
    <div :key="industryId" class="flex-1 h-0">
      <slot>
        <!-- 内容区 -->
      </slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useIndustryStore } from '~/store/industryStore'

const { industryId, setIndustryId, industryList } = toRefs(useIndustryStore())
</script>
