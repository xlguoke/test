<template>
  <div class=" h-full flex-y">
    <van-space class=" w-full pt-12 px16">
      <van-button
        type="primary"
        :plain="query.businessType === AuditTypeEnum.温湿度巡查台账审批 ? false : true"
        size="small"
        @click="handleClick(AuditTypeEnum.温湿度巡查台账审批)"
      >
        巡查台账审核
      </van-button>
      <van-button
        type="primary"
        :plain="query.businessType === AuditTypeEnum.温湿度巡查异常处理 ? false : true"
        size="small"
        @click="handleClick(AuditTypeEnum.温湿度巡查异常处理)"
      >
        异常处理审核
      </van-button>
    </van-space>
    <div class=" w-full py-12 px16">
      <van-search
        v-model="query.quickQry"
        placeholder="请输入搜索关键词"
        @search="listRef.onRefresh()"
      >
        <template #left-icon>
          <div flex-x items-center>
            <img src="@/assets/searchIcon.svg" w16 h16 alt="">
          </div>
        </template>
      </van-search>
    </div>
    <div class=" w-full flex-1 overflow-y-auto">
      <CustomList
        ref="listRef"
        px-16
        :api="getAuditList"
        :query="query"
      >
        <template #default="{ data }">
          <div v-for="(item, index) in data" :key="index" mb-12 card>
            <div class="mb-12 flex-x justify-between break-all font-700">
              <div>
                流程标题：{{ item.processName }}
              </div>
            </div>
            <div mb-12>
              <template v-if="item.processSummary">
                <div
                  v-for="(pVal, pKey) in JSON.parse(item.processSummary)"
                  :key="pKey"
                  :span="24"
                  class="mb-12 flex justify-between"
                >
                  <div label>
                    {{ pKey }}：
                  </div>
                  <div class="flex-1 break-all pl-4 text-right">
                    {{ pVal }}
                  </div>
                </div>
              </template>
              <div :span="24" mb-12 flex-x justify-between>
                <span label>发起人：</span>
                <span>{{ item.processStartUserName }}</span>
              </div>
              <div :span="24" mb-12 flex-x justify-between>
                <span label>流程发起时间：</span>
                <span>{{ dayjs(item.processStartTime).format("YYYY-MM-DD HH:mm:ss") }}</span>
              </div>
            </div>
            <div class="flex-x justify-end">
              <van-button
                size="small"
                w-60
                type="primary"
                plain
                @click="router.push({ path: '/audit/handle', query: { id: item.id } })"
              >
                处理
              </van-button>
            </div>
          </div>
        </template>
      </CustomList>
    </div>
  </div>
</template>

<script lang="ts" setup>
import dayjs from 'dayjs'
import { getAuditList } from '.'
import { AuditTypeEnum } from '@/api/common'

const router = useRouter()

const listRef = ref()

const query = ref({
  page: 1,
  size: 10,
  queryType: 10,
  businessType: AuditTypeEnum.温湿度巡查台账审批,
  quickQry: '',
})

function handleClick(businessType: AuditTypeEnum) {
  query.value.businessType = businessType
  listRef.value.onRefresh()
}
</script>

<route lang="json">
  {
    "name": "audit",
    "meta": {
      "title": "审核列表"
    }
  }
</route>
