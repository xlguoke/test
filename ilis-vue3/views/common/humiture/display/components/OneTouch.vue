<template>
  <a-modal
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
      <a-form-item label="温度（℃）" name="tem">
        <a-input-number v-model:value="formState.tem" placeholder="请输入" class="w-full" />
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
  </a-modal>
</template>

<script setup lang='ts'>
import type { PropType } from 'vue'
import { message } from 'ant-design-vue'
import type { ViewLaboratoryDataEntity } from '~/views/common/humiture/display'
import { IotControllType, IotStatusType } from '~/views/common/humiture/display'
import type { HumitureParams } from '~/views/common/humiture/display/api.ts'
import { humitureControll } from '~/views/common/humiture/display/api.ts'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  dataSource: {
    type: Object as PropType<ViewLaboratoryDataEntity>,
    default: () => {},
  },
})

const emits = defineEmits(['update:open', 'onSave'])

const open = computed(() => props.open)

const formRef = ref()

const submitLoading = ref(false)

const formState = ref<HumitureParams>({
  tem: undefined,
  hum: undefined,
})

watch(open, (val) => {
  if (!val) {
    cancel()
  }
  else {
    formState.value.tem = props.dataSource.currentHum
    formState.value.hum = props.dataSource.currentTemp
  }
})
function onSubmit() {
  formRef.value.validateFields().then(async () => {
    const data = props.dataSource

    if (data) {
      submitLoading.value = true
      const res = await humitureControll(data.id, IotControllType.所有, IotStatusType.开, formState.value).finally(() => {
        submitLoading.value = false
      })
      message.success('保存成功')
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
