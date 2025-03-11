<template>
  <HtModal
    v-model:open="visible"
    title="批量编辑"
    width="500px"
    :confirm-loading="loading"
    :after-close="onClosed"
    @ok="handleOk"
  >
    <IlisForm
      ref="ilisFormRef"
      is-optional
      show-checkbox
      :cols="1"
      :entity="EquipmentAssetEntity"
      :field-list="['type', 'factory', 'departName', 'serveLocation', 'userName', 'status']"
    >
    </IlisForm>
  </HtModal>
</template>

<script lang="ts" setup>
import { message } from 'ant-design-vue'
import { EquipmentAssetEntity } from '../EquipmentAssetEntity'
import { batchEditEquipmentAsset } from '../api.ts'
import type { IlisFormExpose } from '~/components/ilisComponent'
import { IlisForm } from '~/components/ilisComponent'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'

const props = defineProps<IDialogPropsParam<null, EquipmentAssetEntity[]>>()

const loading = ref(false)

const visible = ref(true)

const ilisFormRef = ref<IlisFormExpose<EquipmentAssetEntity>>()

async function handleOk() {
  const formData = await ilisFormRef.value?.getFormData()
  const keys = ilisFormRef.value?.checkedFormKeys
  if (keys?.includes('userName')) {
    keys.push('userId')
  }
  if (keys?.includes('departName')) {
    keys.push('departId')
  }
  const modified = {
    type: keys?.includes('type'),
    factory: keys?.includes('factory'),
    departId: keys?.includes('departId'),
    serveLocation: keys?.includes('serveLocation'), // 使用地点是否修改
    userId: keys?.includes('userId'), // 使用人是否修改
    status: keys?.includes('status'),
  }
  loading.value = true
  await batchEditEquipmentAsset({
    idList: props.param?.map(i => i.id),
    ...formData!,
    modified,
  }).finally(() => {
    loading.value = false
  })
  message.success('操作成功！')
  props.onConfirm(null)
  visible.value = false
}
</script>
