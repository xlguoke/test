<template>
  <a-row :gutter="16">
    <a-col span="12">
      <a-space class="mt-1">
        <div>功能室：</div>
        <div>{{ dataSource.laboratoryName }}</div>
      </a-space>
    </a-col>
    <a-col span="12">
      <a-space>
        <div>巡查时间：</div>
        <span>{{ dataSource.recordDate }}</span>
      </a-space>
    </a-col>
  </a-row>
  <a-row :gutter="16" class="mt-4">
    <a-col span="12">
      <a-card>
        <p class="mb-2">
          温度
        </p>
        <a-form-item label="标准温度（℃）" class="mb-2">
          <span>{{ dataSource.minTem }} ~ {{ dataSource.maxTem }}</span>
        </a-form-item>
        <a-form-item label="巡查温度（℃）" class="mb-2">
          <span>{{ dataSource.tem }}</span>
        </a-form-item>
        <a-form-item label="温度状态" class="mb-0">
          <span
            :class="{
              'text-red-500': dataSource.temStatus !== MStatus.正常,
            }"
          >{{ MStatusDict.getLabelByKey(dataSource.temStatus) }}</span>
        </a-form-item>
      </a-card>
    </a-col>
    <a-col span="12">
      <a-card>
        <p class="mb-2">
          湿度
        </p>
        <a-form-item label="标准湿度（%RH）" class="mb-2">
          <span>{{ dataSource.minHum }} ~ {{ dataSource.maxHum }}</span>
        </a-form-item>
        <a-form-item label="巡查湿度（%RH）" class="mb-2">
          <span>{{ dataSource.hum }}</span>
        </a-form-item>
        <a-form-item label="湿度状态" class="mb-0">
          <span
            :class="{
              'text-red-500': dataSource.humStatus !== MStatus.正常,
            }"
          ><span>{{ MStatusDict.getLabelByKey(dataSource.humStatus) }}</span></span>
        </a-form-item>
      </a-card>
    </a-col>
  </a-row>
</template>

<script setup lang='ts'>
import type { PropType } from 'vue'
import dayjs from 'dayjs'
import { MStatus, MStatusDict } from '~/views/common/humiture/record'
import type { HumitureRecordDataItem } from '~/views/common/humiture/record/api/getHumitureRecordList.ts'

const props = defineProps({
  dataSource: {
    type: Object as PropType<HumitureRecordDataItem>,
    default: () => {},
  },
})

const dataSource = computed(() => {
  const data = { ...props.dataSource } as HumitureRecordDataItem
  data.recordDate = data.recordDate ? dayjs(data.recordDate).format('YYYY-MM-DD HH:mm:ss') : undefined
  return data
})
</script>
