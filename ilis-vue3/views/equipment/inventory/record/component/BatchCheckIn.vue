<template>
  <HtModal
    v-model:open="internalOpen"
    title="批量登记"
    width="400px"
    :confirm-loading="loading"
    :after-close="onClosed"
    @ok="handleConfirm"
  >
    <div class="pr-3">
      <IlisForm
        ref="formRef"
        :init-data="initData"
        :cols="1"
        :field-list="['status', 'inventoryUserName', 'inventoryTime', 'remark']"
        :entity="EquipmentInventoryCheckInEntity"
      >
        <template #status="{ data }">
          <IlisInput
            v-model="data.status"
            :entity="EquipmentInventoryCheckInEntity"
            field="status"
            :options="EquipmentInventoryCheckInEntity.getOptions('status')?.filter(i => i.value !== EquipmentInventoryCheckInStatus.WAIT)"
          ></IlisInput>
        </template>
        <template #inventoryUserName="{ data }">
          <div class="flex gap-3">
            <IlisInput
              v-model="data.inventoryUserName"
              class="flex-1"
              :entity="EquipmentInventoryCheckInEntity"
              disabled
              field="inventoryUserName"
            ></IlisInput>
            <a-button @click="showPersonSelector = true">
              选择
            </a-button>
          </div>
        </template>
        <template #inventoryTime="{ data }">
          <IlisInput
            v-model="data.inventoryTime"
            :entity="EquipmentInventoryCheckInEntity"
            show-time
            class="w-full"
            field="inventoryTime"
          ></IlisInput>
        </template>
      </IlisForm>
    </div>
    <!-- 人员选择器 -->
    <PersonSelector
      v-model:show="showPersonSelector"
      @confirm="handleSelectPerson($event)"
    />
  </HtModal>
</template>

<script lang="ts" setup>
import { EquipmentInventoryCheckInEntity, EquipmentInventoryCheckInStatus } from '../EquipmentInventoryCheckInEntity'
import { equipmentInventoryCheckInBatch } from '../api'
import type { EquipmentInventoryRecordEntity } from '../EquipmentInventoryRecordEntity'
import { type IlisFormExpose, IlisInput } from '~/components/ilisComponent'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import type { IUserSelectVoEntity } from '~/interface/IUserSelectVoEntity'

interface IProps {
  /** 要操作的设备 */
  data: EquipmentInventoryCheckInEntity[]
  /** 盘点记录 */
  record: EquipmentInventoryRecordEntity
}

const props = defineProps<IDialogPropsParam<null, IProps>>()

const internalOpen = ref(true)

const loading = ref(false)

const formRef = ref<IlisFormExpose<EquipmentInventoryCheckInEntity>>()

const showPersonSelector = ref(false)

const initData = ref(new EquipmentInventoryCheckInEntity())

function handleSelectPerson(data: IUserSelectVoEntity[]) {
  initData.value.inventoryUserName = data[0].name
  initData.value.inventoryUserId = data[0].id
  showPersonSelector.value = false
}

/**
 * # 确认
 */
async function handleConfirm() {
  const formData = await formRef.value?.getFormData()
  loading.value = true
  await equipmentInventoryCheckInBatch({
    inventorId: props.param.record?.id,
    inventoryAssetIds: props.param.data.map(item => item.id),
    status: formData!.status!,
    inventoryTime: new Date(formData!.inventoryTime!).getTime().toString(),
    inventoryUserId: formData!.inventoryUserId!,
    inventoryUserName: formData!.inventoryUserName!,
    remark: formData!.remark!,
  }).finally(() => loading.value = false)

  internalOpen.value = false
  props.onConfirm(null)
}
</script>
