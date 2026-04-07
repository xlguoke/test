<template>
  <ul class="flex text-center">
    <li v-if="datas.length === 1" class="flex-1 flex justify-between items-center">
      <p>{{ datas[0].title }}</p>
      <p class="text-[46px] font-bold">{{ datas[0].count }}</p>
    </li>
    <template v-else>
      <li v-for="(d, i) in datas" :key="i" class="flex-1 w-0">
        <p class="text-[46px] font-bold">{{ d.count }}</p>
        <p>{{ d.title }}</p>
      </li>
    </template>
  </ul>
</template>

<script setup lang="ts">
defineProps<{
  datas: Array<{ title: string; count: number }>
}>()
</script>

<style></style>
