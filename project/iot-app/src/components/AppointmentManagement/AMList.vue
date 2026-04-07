<template>
  <div>
    <CustomList
      ref="listRef"
      p16
      :api="getHumitureResList"
      :query="query"
      total-key="total"
    >
      <template #default="{ data }">
        <PreTaskCard
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
import { CreateType, getHumitureResList } from '@/pages/room'

const queryStr = ref('')

const listRef = ref()

const query = ref({
  type: CreateType.预约,
  testTaskCode: queryStr.value,
})
</script>
