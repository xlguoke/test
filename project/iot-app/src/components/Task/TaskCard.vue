<template>
  <div card>
    <div mb12 flex-x justify-between>
      <span label>定时类型</span>
      <span>
        {{ RestTypeDict.getLabelByKey(data.restType) }}
      </span>
    </div>
    <div mb12 flex-x justify-between>
      <span label>控制类型</span>
      <span>
        {{ CustomTypeDict.getLabelByKey(data.customType) }}
      </span>
    </div>
    <div mb12 flex-x justify-between>
      <span label>开始时间</span>
      <span>
        {{ data.startDate ? dayjs(data.startDate).format("YYYY-MM-DD HH:mm:ss") : "" }}
      </span>
    </div>
    <div v-if="data.customType === CustomType.设置温湿度">
      <div mb12 flex-x justify-between>
        <span label>目标温度</span>
        <span>{{ data.tem || '-' }}℃~{{ data.maxTem || '-' }}℃</span>
      </div>
      <div mb12 flex-x justify-between>
        <span label>目标湿度</span>
        <span>{{ data.hum || '-' }}%rh~{{ data.maxHum || '-' }}%rh</span>
      </div>
    </div>
    <div v-if="data.customType === CustomType.开启">
      <div mb12 flex-x justify-between>
        <span label>目标温度</span>
        <span>{{ data.tem || '-' }}℃</span>
      </div>
    </div>

    <div mb12 flex-x justify-between>
      <span label>启用状态</span>
      <span flex-x>
        {{ checked ? "开启" : "关闭" }}
        <van-switch
          v-if="CanOperate"
          v-model="checked"
          size="20"
          ml9
          @click="onChange"
        ></van-switch>
      </span>
    </div>
    <div v-if="CanOperate" flex-x justify-end gap12>
      <van-button
        size="small"
        h32
        w64
        @click="onDel()"
      >
        删除
      </van-button>
      <van-button
        size="small"
        type="primary"
        plain
        h32
        w64
        @click="router.push({ path: '/timedTask/add', query: (data as any) })"
      >
        修改
      </van-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { StatusType } from '@/pages/room'
import {
  CustomType,
  CustomTypeDict,
  delHumitureTimer,
  type ITimedTask,
  RestTypeDict,
  switchHumiture,
} from '@/pages/timedTask'
import { CanOperate } from '@/utils/referrer'
import dayjs from 'dayjs'
import { closeToast, showConfirmDialog, showLoadingToast, showSuccessToast } from 'vant'

const props = defineProps<{
  data: ITimedTask
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

const router = useRouter()

const checked = ref(props.data.status === StatusType.开启)

watch(() => props.data.status, (val) => {
  checked.value = val === StatusType.开启
})

async function onChange() {
  const status = checked.value ? StatusType.开启 : StatusType.关闭
  showLoadingToast({
    forbidClick: true,
    duration: 0,
  })
  await switchHumiture(props.data.id, status).finally(() => {
    closeToast()
  })
  showSuccessToast('操作成功')
  emit('refresh')
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
      await delHumitureTimer(props.data.id).finally(() => {
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
