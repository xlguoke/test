<template>
  <ht-modal
    v-model:open="open"
    title="操作屏鉴权配置"
    :loading="loading"
    width="640px"
    @ok="handleConfirm"
    @cancel="handleCancel"
  >
    <div class="mb-2">
      受控范围选择
    </div>
    <a-checkbox v-model:checked="dataSource.optEquipment">
      操作功能室温湿度设备（打开、关闭、调节、设置）
    </a-checkbox>
    <br />
    <a-checkbox v-model:checked="dataSource.optScheduleTask">
      操作定时任务（添加、修改、删除、开启、关闭）
    </a-checkbox>
    <br />
    <a-checkbox v-model:checked="dataSource.optAppointmentTask">
      操作预约任务（修改、删除）
    </a-checkbox>
    <br />
    <a-checkbox v-model:checked="dataSource.optTestTask">
      操作试验检测任务（针对任务、子任务、设备使用的开始、结束、撤销、删除）
    </a-checkbox>
    <br />
    <a-checkbox v-model:checked="dataSource.optIntelligentSampleTask">
      操作智能送样任务（新增任务、送达确认、取消送样）
    </a-checkbox>
    <br />
    <div class="flex items-center mt-2 gap-1">
      <span>功能室操作屏上登录后无操作</span>
      <a-input-number v-model:value="dataSource.staticExitTime" :step="1" :min="1" :max="99999" />
      <span>分钟后自动退出登录</span>
    </div>
  </ht-modal>
</template>

<script setup lang='ts'>
import { message } from 'ant-design-vue'
import { getScreenAuthConfig, setScreenAuthConfig } from '~/views/admin/screen/configuration/api.ts'

const dataSource = ref<{
  optEquipment?: boolean
  optScheduleTask?: boolean
  optAppointmentTask?: boolean
  optTestTask?: boolean
  optIntelligentSampleTask?: boolean
  staticExitTime?: number
}>({})

const loading = ref(false)

const open = ref(true)

getScreenAuthConfig().then((res) => {
  const data = res.data
  dataSource.value.optEquipment = data.optEquipment
  dataSource.value.optScheduleTask = data.optScheduleTask
  dataSource.value.optAppointmentTask = data.optAppointmentTask
  dataSource.value.optTestTask = data.optTestTask
  dataSource.value.optIntelligentSampleTask = data.optIntelligentSampleTask
  dataSource.value.staticExitTime = data.staticExitTime
})

async function handleConfirm() {
  loading.value = true
  await setScreenAuthConfig(dataSource.value).finally(() => {
    loading.value = false
  })

  message.success('保存成功！')
  handleCancel()
}

function handleCancel() {
  open.value = false
}
</script>

<style>

</style>
