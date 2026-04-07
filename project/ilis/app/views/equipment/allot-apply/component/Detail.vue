<!-- 该文件同时作为资产调拨申请详情和设备调拨申请详情使用 -->
<template>
  <div>
    <BaseTitle>调拨信息</BaseTitle>
    <IlisForm
      disabled
      :cols="2"
      :entity="EquipmentAllotApplyEntity"
      :init-data="initData"
      :label-col="{
        style: { width: '100px' },
      }"
    >
      <template #uploadQR="{ data }">
        <HtUploadFile
          v-if="initData?.id"
          :business-type="allotConfig[typeComputed].attachmentKey"
          force-init
          :business-id="initData?.id"
          @get-qr-code-key="data.uploadQR = $event"
        />
      </template>
    </IlisForm>
    <IlisCustomPropertiesForm
      v-if="initData?.customizeValues"
      :customize-type="allotConfig[typeComputed].customPropertiesKey"
      disabled
      :cols="2"
      :default-value="initData.customizeValues"
      :label-col="{
        style: { width: '120px' },
      }"
    />
    <BaseTitle>设备信息</BaseTitle>
    <IlisTable
      show-index
      :data-source="initData?.eqList"
      :entity="DeviceEntity"
      :field-list="['name', 'equipmentSn', 'assetSn', 'standard', 'status']"
    >
    </IlisTable>
  </div>
</template>

<script lang="ts" setup>
import { HtUploadFile } from '~/components/htUploadFile'
import { AllotType } from '~/enum/AllotType'
import { DeviceEntity } from '../../DeviceEntity'
import { getEquipmentAllotDetail } from '../api'
import { allotConfig, EquipmentAllotApplyEntity } from '../EquipmentAllotApplyEntity'

const props = withDefaults(defineProps<{
  id?: string
  type?: AllotType
}>(), {
  type: AllotType.EQUIPMENT,
})

const initData = ref()

const urlParams = new URLSearchParams(location.search)

const idByAuthPage = urlParams.get('id')

const typeByAuthPage = urlParams.get('type')

const id = computed(() => props.id || idByAuthPage)

const typeComputed = computed(() => props.type || typeByAuthPage)

async function init() {
  if (id.value) {
    const { data } = await getEquipmentAllotDetail(EquipmentAllotApplyEntity.fromJSON({ id: id.value }))
    initData.value = EquipmentAllotApplyEntity.fromJSON(data)
  }
}
init()
</script>
