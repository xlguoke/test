<script setup lang="ts">
import { ref } from 'vue'
import { readLogEntries } from 'custodian'
import { List, ListItem } from 'ant-design-vue'

const entries = ref<FileEntry[]>()
const err = ref(null)
readLogEntries()
  .then(logEntries => entries.value = logEntries)
  .catch(e => err.value = e)
</script>

<template>
  <List :data-source="entries">
    <template #renderItem="{ item }">
      <ListItem>
        <RouterLink :to="`/my/logs/${item.name}`">
          {{ item.name }}
        </RouterLink>
      </ListItem>
    </template>
  </List>
</template>

<style scoped lang="less">

</style>
