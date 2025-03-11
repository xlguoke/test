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
        :cols="1"
        :entity="EquipmentUpkeepDeviceEntity"
        :field-list="fieldList"
        :label-col="{
          style: { width: '120px' },
        }"
      ></IlisForm>
    </div>
  </HtModal>
</template>

<script setup lang='ts'>
import { EquipmentUpkeepDeviceEntity } from '../EquipmentUpkeepDeviceEntity'
import { EquipmentUpkeepPlanType } from '../EquipmentUpkeepPlanEntity'
import type { IlisFormExpose } from '~/components/ilisComponent'
import { IlisForm } from '~/components/ilisComponent'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'

interface Iprops {
  data: EquipmentUpkeepDeviceEntity[]
  type: EquipmentUpkeepPlanType
}

const props = defineProps<IDialogPropsParam<null, Iprops>>()

const formRef = ref<IlisFormExpose<EquipmentUpkeepDeviceEntity>>()

const showDialog = ref(true)

const fieldList = ref<string[]>([])

if (props.param.type === EquipmentUpkeepPlanType.MONTH) {
  fieldList.value = ['upkeepDepart', 'upkeepPerson', 'upkeepProjectName', 'remark']
}
else {
  fieldList.value = ['upkeepDepart', 'upkeepPerson', 'upkeepProjectName', 'planPeriod', 'remark']
}

async function handleConfirm() {
  const formData = await formRef.value!.getFormData()
  props.onConfirm(null)
  props.param?.data?.forEach((item) => {
    item.upkeepDepartId = formData.upkeepDepartId
    item.upkeepDepart = formData.upkeepDepart
    item.upkeepPersonId = formData.upkeepPersonId
    item.upkeepPerson = formData.upkeepPerson
    item.upkeepProject = formData.upkeepProject
    item.upkeepProjectName = formData.upkeepProjectName
    item.planPeriod = formData.planPeriod
    item.remark = formData.remark
  })
  showDialog.value = false
}
</script>

<style>

</style>
