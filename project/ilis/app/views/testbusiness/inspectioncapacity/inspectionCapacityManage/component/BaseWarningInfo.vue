<template>
  <a-descriptions
    bordered size="small" :column="2"
    :label-style="{ textAlign: 'center' }"
    :content-style="{ width: '215px' }"
  >
    <a-descriptions-item label="报告编号">
      {{ initData?.reportSn || '' }}
    </a-descriptions-item>
    <a-descriptions-item label="预警类型">
      {{ initData?.warningType ? WARNING_TYPE_MAP[initData.warningType] : '' }}
    </a-descriptions-item>
    <a-descriptions-item label="预警对象">
      <span v-if="initData.objectName && initData.objectRemark">{{ `${initData.objectName}（${initData.objectRemark}）` }}</span>
      <span v-else>{{ initData.objectName || initData.objectRemark || '' }}</span>
    </a-descriptions-item>
    <a-descriptions-item label="量能阈值">
      {{ initData?.capacityLimit ? `${initData?.capacityLimit}份/天` : '' }}
    </a-descriptions-item>
    <a-descriptions-item label="预警日期">
      {{ initData?.warningDate || '' }}
    </a-descriptions-item>
    <a-descriptions-item label="创建日期">
      {{ dayjs(initData?.createDate).format('YYYY-MM-DD') || '' }}
    </a-descriptions-item>
  </a-descriptions>
</template>

<script lang="ts" setup>
import type { IBaseWarningInfo } from '../CapacityEntity.ts'
import dayjs from 'dayjs'
import { WARNING_TYPE_MAP } from '../CapacityEntity.ts'

defineProps({
  initData: {
    type: Object as PropType<IBaseWarningInfo>,
    default: () => ({}),
  },
})
</script>
