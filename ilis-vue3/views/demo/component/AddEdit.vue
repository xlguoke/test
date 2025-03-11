<template>
  <HtModal
    v-model:open="visible"
    :title="param.id ? '编辑' : '新增'"
    width="500px"
    :confirm-loading="loading"
    :after-close="onClosed"
    @ok="handleOk"
  >
    <IlisForm
      :key="initData.rentType"
      ref="ilisFormRef"
      :cols="1"
      :entity="EquipmentInventoryPlanEntity"
      :init-data="initData"
    >
    </IlisForm>
  </HtModal>
</template>

<script lang="ts" setup>
import { message } from 'ant-design-vue'
import { EquipmentInventoryPlanEntity } from '../EquipmentInventoryPlanEntity'
import { saveEquipmentInventoryPlan } from '../api.ts'
import type { IlisFormExpose } from '~/components/ilisComponent'
import { IlisForm } from '~/components/ilisComponent'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'

const props = defineProps<IDialogPropsParam<null, EquipmentInventoryPlanEntity>>()

const loading = ref(false)

const visible = ref(true)

const initData = ref<EquipmentInventoryPlanEntity>(props.param)

const ilisFormRef = ref<IlisFormExpose<EquipmentInventoryPlanEntity>>()

async function init() {
  if (props.param.id) {
  // keep
  }
}
init()

async function handleOk() {
  const formData = await ilisFormRef.value?.getFormData()
  loading.value = true
  await saveEquipmentInventoryPlan(formData!).finally(() => {
    loading.value = false
  })
  message.success('操作成功！')
  props.onConfirm(null)
  visible.value = false
}
</script>
