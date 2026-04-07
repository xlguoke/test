<template>
  <div class=" h-full flex-y">
    <VanNavBar
      v-if="InEmbed"
      title="巡查台账"
      :fixed="true"
      clickable
      placeholder
      :left-arrow="true"
      @click-left="onBack"
    />
    <div v-else class="w-full px16 pt16">
      <div class="mt-16 text-18 font-bold ">
        海特智慧试验室温湿度控制系统
      </div>
      <p>
        今天又是美好的一天！
      </p>
    </div>

    <div class="w-full flex-x gap16 px16">
      <van-search v-model="queryStr" class="flex-1 p-0" placeholder="请输入台账名称、台账编号、创建人查询" @search="listRef.onRefresh()">
        <template #left-icon>
          <div flex-x items-center>
            <img src="@/assets/searchIcon.svg" w16 h16 alt="">
          </div>
        </template>
      </van-search>
    </div>
    <div class=" w-full flex-1 overflow-y-auto">
      <CustomList ref="listRef" p16 :api="getHumitureLedgerList" :query="{ quickQry: queryStr }" total-key="total">
        <template #default="{ data }">
          <AccountBookCard
            v-for="(item) in data"
            :key="item"
            mb12
            :data="(item as IHumitureLedger)"
            @click="router.push({
              path: '/account-book/detail',
              query: { id: item.id },
            })"
          />
        </template>
      </CustomList>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { InEmbed } from '@/utils/referrer'
import { getHumitureLedgerList, type IHumitureLedger } from '.'

const router = useRouter()

const queryStr = ref('')

const listRef = ref()

function onBack() {
  if ((parent as any).back) {
    (parent as any).back()
    return
  }
  if (window.history.state.back)
    history.back()
  else
    router.replace('/')
}
</script>

<route lang="json">
{
  "name": "account-book",
  "meta": {
    "title": "巡查台账",
    "hiddenNavBar": true
  }
}
</route>
