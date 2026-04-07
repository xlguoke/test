<template>
  <div card>
    <div class="mb12 pb12 split-boder">
      <div ellipsis>
        <span font-700 text-16>{{ data.name }}</span> （{{ data.ledgerSn }}）
      </div>
    </div>
    <div mb12 flex-x justify-between>
      <span label>创建人员：</span>
      <span>{{ data.createName }}</span>
    </div>
    <div mb12 flex-x justify-between>
      <span label>创建时间：</span>
      <span>{{ dayjs(data.createDate).format('YYYY-MM-DD HH:mm:ss') }}</span>
    </div>
    <div mb12 flex-x justify-between>
      <span label>开始日期：</span>
      <span>{{ dayjs(data.ledgerStartDate).format('YYYY-MM-DD') }}</span>
    </div>
    <div mb12 flex-x justify-between>
      <span label>结束日期：</span>
      <span>{{ dayjs(data.ledgerEndDate).format('YYYY-MM-DD') }}</span>
    </div>
    <div mb12 flex-x justify-between>
      <span label>试验室：</span>
      <span flex-1 text-right ellipsis>{{ data.laboratoryName }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { IHumitureLedger } from '@/pages/account-book'
import dayjs from 'dayjs'

defineProps<{
  data: IHumitureLedger
}>()
</script>
