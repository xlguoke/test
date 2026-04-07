<template>
  <a-form :label-col="{ style: { width: '84px' } }" :disabled="isReadonly">
    <div class=" grid grid-cols-2 gap-x-3">
      <a-form-item v-if="EQUIPMENT_10" label="检校计划">
        <div>{{ props.checkPlanName }}</div>
      </a-form-item>
      <a-form-item label="设备编号" required>
        <a-input-group compact>
          <a-input v-model:value="deviceInfo.equipmentSn" disabled :style="{ width: id ? '' : 'calc(100% - 60px)' }" />
          <a-button v-if="!id" type="primary" @click="handleSelectDevice">
            选择
          </a-button>
        </a-input-group>
      </a-form-item>
      <a-form-item label="设备名称">
        <a-input v-model:value="deviceInfo.name" disabled></a-input>
      </a-form-item>
      <a-form-item label="规格型号">
        <a-input v-model:value="deviceInfo.standard" disabled></a-input>
      </a-form-item>
      <a-form-item label="出厂编号">
        <a-input v-model:value="deviceInfo.factorySn" disabled></a-input>
      </a-form-item>
      <a-form-item label="所属部门">
        <a-input v-model:value="deviceInfo.departName" disabled></a-input>
      </a-form-item>
      <a-form-item label="检校确认人">
        <a-input v-model:value="deviceInfo.checkPersonName" disabled></a-input>
      </a-form-item>
      <a-form-item label="存放位置">
        <a-input v-model:value="deviceInfo.storageSite" disabled></a-input>
      </a-form-item>
      <a-form-item label="下次检校日期">
        <a-input :value="(deviceInfo.nextCheckDate ? dayjs(deviceInfo.nextCheckDate).format('YYYY-MM-DD') : '')" disabled></a-input>
      </a-form-item>
    </div>
  </a-form>
</template>

<script lang="ts" setup>
import type { DeviceEntity } from '~/views/equipment/DeviceEntity'
import { cloneDeep } from '@unovis/ts'
import dayjs from 'dayjs'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import VMCallDeviceSelector from '~/components/selectorViaMethodCall/VMCallDeviceSelector.vue'
import { EDateFormatType } from '~/utils/EDateFormatType'

const props = defineProps<{
  modelValue: string
  deviceInfo: DeviceEntity
  checkPlanName?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void
  (e: 'update:deviceInfo', val: DeviceEntity): void
}>()

const id = inject('id')

const isReadonly = inject('isReadonly')

const EQUIPMENT_10 = inject('EQUIPMENT_10')

const value = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit('update:modelValue', val)
  },
})

const deviceInfo = computed({
  get: () => props.deviceInfo,
  set: (val) => {
    emit('update:deviceInfo', val)
  },
})

async function handleSelectDevice() {
  const res = await AnyDialogHelper.showSelector<DeviceEntity>(VMCallDeviceSelector)
  value.value = res?.[0]?.id
  const transFormData = cloneDeep(res[0])
  transFormData.nextCheckDate = AnyDateTimeHelper.format(transFormData.nextCheckDate || '', EDateFormatType.YYYY_MM_DD) as any
  deviceInfo.value = transFormData
}
</script>
