<template>
  <AppProvider>
    <a-card
      style="width: 100%"
      :tab-list="tabList"
      :active-tab-key="key"
      @tab-change="key => onTabChange(key)"
    >
      <ListTodo v-if="key === 'tab1'" />
      <ListReady v-if="key === 'tab2'" />
    </a-card>
  </AppProvider>
</template>

<script setup lang='ts'>
import ListTodo from './component/ListTodo.vue'
import ListReady from './component/ListReady.vue'

const key = ref('tab1')

const tabList = [
  {
    key: 'tab1',
    tab: '待确认文件',
  },
  {
    key: 'tab2',
    tab: '已确认文件',
  },
]

function onTabChange(value: string) {
  key.value = value
};
</script>

<style>

</style>
