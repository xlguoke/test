<template>
  <HtModal
    v-model:open="showDialog"
    :after-close="onClosed"
    title="批量编辑"
    @ok="handleConfirm"
  >
    <div class="pr-3">
      <IlisForm
        ref="formRef"
        is-optional
        show-checkbox
        :cols="1"
        :entity="EquipmentInspectDeviceEntity"
        :field-list="EquipmentInspectDeviceEntity.getFormFieldList()?.filter((i) => !['inspectItems'].includes(i))"
        :label-col="{
          style: { width: '100px' },
        }"
      ></IlisForm>
    </div>
  </HtModal>
</template>

<script setup lang='ts'>
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import type { IlisFormExpose } from '~/components/ilisComponent'
import { message } from 'ant-design-vue'
import { EquipmentInspectDeviceEntity } from '../EquipmentInspectDeviceEntity'

const props = defineProps<IDialogPropsParam<null, EquipmentInspectDeviceEntity[]>>()

const formRef = ref<IlisFormExpose<EquipmentInspectDeviceEntity>>()

const showDialog = ref(true)

const loading = ref(false)

async function handleConfirm() {
  const formData = await formRef.value?.getFormData()
  const keys = formRef.value?.checkedFormKeys
  loading.value = true
  props.param?.forEach((i) => {
    keys?.forEach((key) => {
      i[key] = formData?.[key]
    })
  })
  message.success('操作成功！')
  props.onConfirm(null)
  showDialog.value = false
}
</script>

<style>

</style>
