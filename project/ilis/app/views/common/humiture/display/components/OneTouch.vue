<template>
  <ht-modal
    v-model:open="open"
    title="一键开启"
    width="320px"
    :mask-closable="false"
    destroy-on-close
    :confirm-loading="submitLoading"
    centered
    @cancel="cancel"
  >
    <a-form
      ref="formRef"
      :model="formState"
      class="pt-4 max-h-[70vh] overflow-auto"
      :label-col="{ span: 8 }"
      :wrapper-col="{ span: 16 }"
    >
      <a-form-item label="最低温度（℃）" name="minTem">
        <a-input-number v-model:value="formState.minTem" placeholder="请输入" class="w-full" />
      </a-form-item>
      <a-form-item label="最高温度（℃）" name="maxTem">
        <a-input-number v-model:value="formState.maxTem" placeholder="请输入" class="w-full" />
      </a-form-item>
      <a-form-item label="最低湿度（℃）" name="minHum">
        <a-input-number v-model:value="formState.minHum" placeholder="请输入" class="w-full" />
      </a-form-item>
      <a-form-item label="最高湿度（℃）" name="maxHum">
        <a-input-number v-model:value="formState.maxHum" placeholder="请输入" class="w-full" />
      </a-form-item>
      <!--      <a-form-item label="湿度（%RH）" name="hum"> -->
      <!--        <a-input-number v-model:value="formState.hum" placeholder="请输入" class="w-full" /> -->
      <!--      </a-form-item> -->
    </a-form>

    <template #footer>
      <a-button @click="cancel">
        取消
      </a-button>
      <a-button type="primary" :loading="submitLoading" @click="onSubmit">
        确定
      </a-button>
    </template>
  </ht-modal>
</template>

<script setup lang='ts'>
import type { PropType } from 'vue'
import type { ViewLaboratoryDataEntity } from '~/views/common/humiture/display'
import type { IotDeviceThreshold } from '~/views/common/humiture/display/api.ts'
import { message } from 'ant-design-vue'
import { humitureTemSet } from '~/views/common/humiture/display/api.ts'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  dataSource: {
    type: Object as PropType<ViewLaboratoryDataEntity>,
    default: () => ({}),
  },
})
const emits = defineEmits(['update:open', 'onSave', 'changeStatus'])
const open = computed(() => props.open)

const formRef = ref()

const submitLoading = ref(false)

const formState = ref<IotDeviceThreshold>({
  minTem: 0,
  maxTem: 0,
  minHum: 0,
  maxHum: 0,
})
watch(open, (val) => {
  if (!val) {
    cancel()
  }
  else {
    const record = props.dataSource
    // 默认为标准温湿度范围
    formState.value.minTem = record.minTemperature
    formState.value.maxTem = record.maxTemperature
    formState.value.minHum = record.minHumidity
    formState.value.maxHum = record.maxHumidity
  }
})
function onSubmit() {
  formRef.value.validateFields().then(async () => {
    const record = props.dataSource
    const iotEqIds = record.iotEqId || record.labIotEq.iotEqId
    const data: IotDeviceThreshold = {
      ...formState.value,
      iotEqId: iotEqIds,
      laboratoryId: record.id,
      type: 'all',
    }
    if (data) {
      submitLoading.value = true
      const res = await humitureTemSet(data)
        .then(() => {
          message.success(`操作成功`)
        })
        .finally(() => {
          submitLoading.value = false
        })
      emits('onSave', res)
      cancel()
    }
  })
}

// 关闭弹窗
function cancel() {
  emits('update:open', false)
  formRef.value.resetFields()
}
</script>
