<template>
  <div>
    <div class="w-full flex-x gap16 px16 pt12 mb12">
      <van-search
        v-model="query.quickQry"
        class="flex-1 p-0"
        placeholder="请输入调养箱名称"
        @search="handleSearch"
      >
        <template #left-icon>
          <div flex-x items-center>
            <img src="@/assets/searchIcon.svg" w16 h16 alt="">
          </div>
        </template>
      </van-search>
      <van-button btn size="small" type="primary" plain @click="handleSearch">
        查询
      </van-button>
    </div>
    <CustomList
      ref="listRef"
      p16
      pt0
      :api="humitureBookPage"
      :query="query"
      :listen-data-update="listenCollectDataUpdate"
      total-key="total"
    >
      <template #default="{ data }">
        <div class="grid grid-cols-2 mb16 gap-9">
          <IncubatorCard
            v-for="item in data"
            :key="item.id"
            :data="item"
            :base-config="baseConfig"
            mb16
          />
        </div>
      </template>
    </CustomList>
  </div>
</template>

<script lang="ts" setup>
import { humitureBookPage } from '.'
import { useIncubatorConfig } from './modules/useIncubatorConfig'

const route = useRoute()

const roomData = route.query

const listRef = ref()

const query = ref({
  labId: roomData.labId,
  quickQry: '',
})

const { baseConfig, listenCollectDataUpdate } = useIncubatorConfig()

function handleSearch() {
  listRef.value?.onRefresh()
}
</script>

<route lang="json">
  {
    "name": "Incubator",
    "meta": {
      "title": "调养箱"
    }
  }
</route>
