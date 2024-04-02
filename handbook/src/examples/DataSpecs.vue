<script setup lang="ts">
import { List } from 'ant-design-vue'
import DataSpec from './DataSpec.vue'

const basicData = [
  { name: '检测样品', type: 'testSample' },
  { name: '检测参数', type: 'testParam' },
  { name: '样品与参数', type: 'testSampleParam' },
  { name: '工程项目', type: 'project' },
  { name: '试验模板', type: 'template' },
] as const
</script>

<template>
  <List>
    <!-- using scoped slot will lose the type assertion -->
    <!-- <template #renderItem="{ item }"> -->
    <!--  <DataSpec :name="item.name" :type="item.type" /> -->
    <!-- </template> -->
    <template v-for="basic in basicData" :key="basic.name">
      <DataSpec :name="basic.name" :type="basic.type" />
    </template>
  </List>
</template>

<style scoped>

</style>
