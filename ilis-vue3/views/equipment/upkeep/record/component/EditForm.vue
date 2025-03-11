<template>
  <IlisForm
    ref="formRef"
    :cols="1"
    :init-data="props.initData"
    :entity="EquipmentUpkeepRecordEntity"
  >
    <template v-if="showFile" #form-after>
      <a-form-item label="附件">
        <HtUploadFile
          business-type="EQ_UPKEEP_RECORD"
          force-init
          :business-id="initData.id"
        />
      </a-form-item>
    </template>
  </IlisForm>
</template>

<script lang="ts" setup>
import { EquipmentUpkeepRecordEntity } from '../EquipmentUpkeepRecordEntity'
import { IlisForm, type IlisFormExpose } from '~/components/ilisComponent'
import HtUploadFile from '~/components/htUploadFile/Index.vue'

const props = withDefaults(defineProps<{
  initData: EquipmentUpkeepRecordEntity
  showFile?: boolean
}>(), {
  initData: () => new EquipmentUpkeepRecordEntity(),
})

const formRef = ref<IlisFormExpose<EquipmentUpkeepRecordEntity>>()

async function getData() {
  const res = await formRef.value?.getFormData()
  return res
}

defineExpose({
  getData,
})
</script>
