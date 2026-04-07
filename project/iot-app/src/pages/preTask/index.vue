<template>
  <div class=" h-full flex-y">
    <div class=" w-full flex-x gap16 px16 pt12">
      <van-search
        v-model="queryStr"
        class="flex-1 p-0"
        placeholder="请输入预约人员/样品名称/任务编号"
        @search="handleSearch"
      >
        <template #left-icon>
          <div flex-x items-center>
            <img src="@/assets/searchIcon.svg" w16 h16 alt="">
          </div>
        </template>
      </van-search>
      <van-button btn size="small" type="primary" plain @click="filterRef.showFilter = true">
        筛选
      </van-button>
    </div>
    <div class=" w-full flex-1 overflow-y-auto">
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
            @refresh="listRef.onRefresh"
          />
        </template>
      </CustomList>
      <PreTaskFilter
        ref="filterRef"
        :query="query"
        @confirm="handleSearch"
      ></PreTaskFilter>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { CreateType, getHumitureResList } from '../room'

const route = useRoute()

const roomData = route.query

const queryStr = ref('')

const listRef = ref()

const filterRef = ref()

const query = ref({
  'laboratory.id': roomData.id,
  'type': CreateType.预约,
  'quickQry': queryStr.value,
})

function handleSearch(obj?: Record<string, any>) {
  query.value.quickQry = queryStr.value
  if (obj) {
    query.value = { ...query.value, ...obj }
  }
  nextTick(() => {
    listRef.value.onRefresh()
  })
}
</script>

<route lang="json">
  {
    "name": "preTask",
    "meta": {
      "title": "预约任务"
    }
  }
</route>
