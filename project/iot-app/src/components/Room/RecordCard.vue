<template>
  <div card line-height-22>
    <div class="mb12 flex-x justify-between pb12 split-boder">
      <span font-700>{{ data.laboratoryName }}</span>
      <span>{{ CommandWayTypeDict.getLabelByKey(data.commandWay) }}</span>
    </div>
    <div mb12 flex-x justify-between>
      <span label>控制时间：</span>
      <span>{{ dayjs(data.createDate).format('YYYY-MM-DD HH:mm:ss') }}</span>
    </div>
    <div mb12 flex-x justify-between>
      <span label>控制人：</span>
      <span>{{ data.operator }}</span>
    </div>
    <div mb12 flex-x justify-between>
      <span label>控制结果：</span>
      <span>{{ ReqStatusDict.getLabelByKey(data.reqStatus) }}</span>
    </div>
    <div mb12 flex-x justify-between>
      <span label>控制内容：</span>
      <span>{{ data.content }}</span>
    </div>
    <div mb12 flex-x justify-between>
      <span label>备注：</span>
      <span>{{ data.remark }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { CommandWayTypeDict, type IHumitureLog, ReqStatusDict } from '@/pages/room'
import dayjs from 'dayjs'

defineProps<{
  data: IHumitureLog
}>()
</script>
