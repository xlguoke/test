<template>
  <div>
    <CustomList
      p16
      pt0
      :api="getHumitureTimerList"
      :query="query"
      total-key="total"
    >
      <template #default="{ data }">
        <TaskCard
          v-for="(item) in data"
          :key="item"
          mb12
          :data="item"
        />
      </template>
    </CustomList>
  </div>
</template>

<script lang="ts" setup>
import { CreateType, getHumitureTimerList } from '../room'

const route = useRoute()

const roomData = route.query

const query = ref({
  'laboratory.id': roomData.id,
  'type': CreateType.定时任务,
})
</script>

<route lang="json">
  {
    "name": "timedTask",
    "meta": {
      "title": "定时设置"
    }
  }
</route>
