<template>
  <HtModal
    v-model:open="visible"
    :title="param.data?.id ? '编辑' : '新增'"
    width="460px"
    :confirm-loading="loading"
    :after-close="onClosed"
    @cancel="visible = false"
    @ok="handleOk"
  >
    <div class="pr-3">
      <IlisForm
        ref="formRef"
        :init-data="initData"
        :cols="1"
        :entity="EquipmentCheckParamEntity"
        :field-list="EquipmentCheckParamEntity.getFormFieldList()?.filter((i) => !['checkPeriodUnit'].includes(i))"
        :label-col="{
          style: { width: '120px' },
        }"
      >
        <template #checkPeriod="{ data }">
          <div class="flex items-center">
            <IlisInput
              v-model="data.checkPeriod"
              field="checkPeriod"
              :entity="EquipmentCheckParamEntity"
            ></IlisInput>
            <IlisInput
              v-model="data.checkPeriodUnit"
              field="checkPeriodUnit"
              :entity="EquipmentCheckParamEntity"
              :allow-clear="false"
            ></IlisInput>
          </div>
        </template>
      </IlisForm>
    </div>
  </HtModal>
</template>

<script lang="ts" setup>
import { message } from 'ant-design-vue'
import { EquipmentCheckParamEntity } from '../EquipmentCheckParamEntity'
import { addParam } from '../api'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { type IlisFormExpose, IlisInput } from '~/components/ilisComponent'

interface IDialogProps {
  data: EquipmentCheckParamEntity
  equipmentId: string
  isDetail?: boolean
}

const props = defineProps<IDialogPropsParam<null, IDialogProps>>()

const visible = ref(true)

const loading = ref(false)

const formRef = ref<IlisFormExpose<EquipmentCheckParamEntity>>()

const initData = ref(props.param.data)

async function handleOk() {
  const formData = await formRef.value!.getFormData()
  const params = {
    ...formData,
    'TSEquipment.id': props.param.equipmentId,
  }
  loading.value = true
  await addParam(params).finally(() => {
    loading.value = false
  })
  message.success('操作成功')
  props.onConfirm(null)
  visible.value = false
}
</script>
