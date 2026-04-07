<template>
  <HtModal
    v-model:open="visible"
    :title="param.data?.id ? '编辑' : '新增'"
    width="600px"
    :confirm-loading="loading"
    :after-close="onClosed"
    @cancel="visible = false"
    @ok="handleOk"
  >
    <div class="pr-6">
      <IlisForm
        ref="formRef"
        :init-data="initData"
        :cols="1"
        :entity="EquipmentCheckParamEntity"
        :field-list="EquipmentCheckParamEntity.getFormFieldList()?.filter((i) => !['checkPeriodUnit'].includes(i))"
        :label-col="{
          style: { width: '150px' },
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
        <template #attachmentIds="{ data }">
          <HtUploadFile
            force-init
            :business-id="data.id"
            :business-type="BUSINES_TYPE.EQ"
            @get-qr-code-key="data.attachmentIds = $event"
          ></HtUploadFile>
        </template>
      </IlisForm>
    </div>
  </HtModal>
</template>

<script lang="ts" setup>
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import type { IlisFormExpose } from '~/components/ilisComponent'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import IlisInput from '~/anyThing/components/input/Index.vue'
import { BUSINES_TYPE, HtUploadFile } from '~/components/htUploadFile'
import { addParam } from '../api'
import { EquipmentCheckParamEntity } from '../EquipmentCheckParamEntity'

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
    'equipment.id': props.param.equipmentId,
  }

  if (params.nextCheckDate) {
    params.nextCheckDate = dayjs(params.nextCheckDate).format('YYYY-MM-DD')
  }

  if (params.preCheckDate) {
    params.preCheckDate = dayjs(params.preCheckDate).format('YYYY-MM-DD')
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
