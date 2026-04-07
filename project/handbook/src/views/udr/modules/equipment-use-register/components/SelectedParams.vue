<script lang="ts" setup>
import { z } from 'zod'
import useSelData from '../../../composables/useSelData'
import { request } from '@/axios'
import SelDataList from '@/components/selDataList/index.vue'
import { useUdrStore } from '@/views/udr/provider/useUdrStore'
import type { SelDataItemDTO } from '@/type/common'
import { taskParam } from '@/type/equipment-use-register'

const emits = defineEmits(['select'])
const testTaskId = useUdrStore().getTestTaskId()

const {
  visible,
  selType,
  dataList,
  selectedRows,
  showModal,
  onCancel,
  onSearch,
} = useSelData({
  api: paramListApi,
})

async function paramListApi() {
  try {
    return await request({
      url: `/ilis2/testTask/testParam/${testTaskId}`,
      method: 'get',
      schema: z.array(taskParam),
    })
  }
  catch (err) {
    return []
  }
}

function confirmSelected(rows: SelDataItemDTO[]) {
  emits('select', rows)
  onCancel()
}

defineExpose({
  showModal,
})
</script>

<template>
  <van-popup v-model:show="visible" position="right" class="right-popup-wrap">
    <div class="popup-title">
      请选择参数
    </div>
    <SelDataList
      placeholder="请输入参数名称查询"
      :type="selType"
      :selected-rows="selectedRows"
      :data-list="dataList"
      style="flex: 1;height: 0;"
      :cancel="onCancel"
      @search="onSearch"
      @confirm="confirmSelected"
    />
  </van-popup>
</template>

<style lang="less" scoped>
.right-popup-wrap{
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 70%;
  background-color: #f9f8f8;

  .popup-title{
    height: 45px;
    line-height: 45px;
    font-size: 18px;
    text-align: center;
    color:#fff;
    background: var(--van-primary-color);
  }
}
</style>
