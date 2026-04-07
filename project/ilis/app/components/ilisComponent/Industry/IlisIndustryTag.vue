<template>
  <span>
    <!-- <a-tag :bordered="false" class="!bg-white !px-3 !py-1">{{ industry?.name }}</a-tag> -->
    <a-tag
      v-if="sample"
      class="!px-[12px] !py-[4px]"
      closable
      @close="onCloseSample"
    >{{ sample?.title }}</a-tag>
  </span>
</template>

<script lang="ts" setup>
import { useIndustryStore } from '~/store/industryStore'

const { sample } = toRefs(useIndustryStore())

function onCloseSample() {
  sample.value = undefined
}
</script>
