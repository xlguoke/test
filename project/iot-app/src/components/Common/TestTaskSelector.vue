<template>
  <van-popup
    position="right"
    round
    :style="{ height: '100vh' }"
  >
    <div class="px12 bg-wrapper h-full w-[320px]">
      <div class=" py12 font-bold text-18 flex-x items-center">
        <span stripe></span>
        选择任务
      </div>
      <div class="py12 bg-wrapper">
        <van-search
          v-model="searchValue"
          placeholder="请输入任务编号/检测人员/委托单位/工程项目"
          @search="listRef.onRefresh()"
        >
          <template #left-icon>
            <div flex-x items-center>
              <img src="@/assets/searchIcon.svg" w16 h16 alt="">
            </div>
          </template>
        </van-search>
      </div>
      <div style="height: calc(100% - 145px) ; overflow-y: auto;">
        <CustomList
          ref="listRef"
          size-key="rows"
          :api="getTestTaskList"
          :query="{ quickQryParam: searchValue, labId }"
        >
          <template #default="{ data }">
            <van-radio-group v-model="selData" shape="dot">
              <van-radio
                v-for="item in data"
                :key="(item.id as string)"
                class="mb12 card"
                :name="item"
              >
                <div flex-x mb8>
                  <span label>任务编号：</span>
                  <span text-text>{{ item.testTaskCode }}</span>
                </div>
                <div flex-x mb8>
                  <span label>样品编号：</span>
                  <span text-text>{{ item.testObjectCode }}</span>
                </div>
                <div flex-x mb8>
                  <span label>样品名称：</span>
                  <span text-text>{{ item.testSampleDisplayName }}</span>
                </div>
              </van-radio>
            </van-radio-group>
          </template>
        </CustomList>
      </div>
      <div class="fixed-box">
        <van-button
          type="primary"
          size="small"
          w-full
          @click="onOk"
        >
          确定
        </van-button>
      </div>
    </div>
  </van-popup>
</template>

<script lang="ts" setup>
import { getTestTaskList } from '@/api/common'

defineProps<{
  /** # 功能室id,传入后查询功能室下的任务 */
  labId?: string
}>()

const emit = defineEmits(['confirm'])

const searchValue = ref('')

const listRef = ref()

const selData = ref()

function onOk() {
  emit('confirm', selData.value)
}
</script>
