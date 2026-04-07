<template>
  <div card>
    <div class="mb12 pb12 split-boder">
      <div mb6 ellipsis>
        {{ data.testSampleDisplayName }}
        {{ data.testSampleDisplayCode && `(${data.testSampleDisplayCode})` }}
      </div>
      <div>
        <span label>任务编号：</span>
        <span>{{ data.testTaskCode }}</span>
      </div>
    </div>
    <div mb12 flex-x justify-between>
      <span label>试验室</span>
      <span>
        {{ data.laboratoryName }}
        <template v-if="data.laboratoryIotEqType === LaboratoryIotEqType.调养箱 && data.boxName">
          ({{ data.boxName }})
        </template>
      </span>
    </div>
    <div mb12 flex-x justify-between>
      <span label>预约人员</span>
      <span>{{ data.resUserName }}</span>
    </div>
    <div mb12 flex-x justify-between>
      <span label>开始时间</span>
      <span>{{ dayjs(Number(data.startDate)).format('YYYY-MM-DD HH:mm:ss') }}</span>
    </div>
    <div mb12 flex-x justify-between>
      <span label>结束时间</span>
      <span>{{ dayjs(Number(data.endDate)).format('YYYY-MM-DD HH:mm:ss') }}</span>
    </div>
    <div mb12 flex-x justify-between>
      <span label>目标温度</span>
      <span v-if="data.laboratoryIotEqType === LaboratoryIotEqType.调养箱">-</span>
      <span v-else>{{ data.tem || '-' }}℃~{{ data.maxTem || '-' }}℃</span>
    </div>
    <div mb12 flex-x justify-between>
      <span label>目标湿度</span>
      <span v-if="data.laboratoryIotEqType === LaboratoryIotEqType.调养箱">-</span>
      <span v-else>{{ data.hum || '-' }}%rh~{{ data.maxHum || '-' }}%rh</span>
    </div>
    <div v-if="CanOperate" flex-x justify-end gap12>
      <van-button size="small" btn @click="onDel">
        删除
      </van-button>
      <van-button
        size="small"
        class="btn"
        type="primary"
        plain
        @click="router.push({ path: '/appointment-management/add', query: formatQueryData(data) as any })"
      >
        修改
      </van-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { LaboratoryIotEqType } from '@/pages/appointment-management'
import type { IPreTask } from '@/pages/preTask'
import { delHumitureRes } from '@/pages/room'
import { CanOperate } from '@/utils/referrer'
import dayjs from 'dayjs'
import { closeToast, showConfirmDialog, showLoadingToast, showSuccessToast } from 'vant'

const props = defineProps<{
  data: IPreTask
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

const router = useRouter()

function formatQueryData(data: IPreTask) {
  return {
    ...data,
    testParams: data.paramList ? data.paramList.map(item => item.id).join(',') : '',
    paramList: undefined,
  }
}

function onDel() {
  showConfirmDialog({
    title: '提示',
    message: '确定删除吗？',
  })
    .then(async () => {
      showLoadingToast({
        forbidClick: true,
        duration: 0,
      })
      // on confirm
      await delHumitureRes(props.data.id).finally(() => {
        closeToast()
      })
      showSuccessToast('删除成功')
      emit('refresh')
    })
    .catch(() => {
    // on cancel
    })
}
</script>
