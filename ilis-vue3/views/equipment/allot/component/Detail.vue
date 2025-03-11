<template>
  <HtModal
    v-model:open="visible"
    title="设备调拨详情"
    width="500px"
    :confirm-loading="loading"
    :after-close="onClosed"
  >
    <template #footer>
      <a-button @click="visible = false">
        关闭
      </a-button>
    </template>
    <IlisForm
      :key="initData.rentType"
      ref="ilisFormRef"
      :cols="1"
      :entity="EquipmentAllotEntity"
      :init-data="initData"
      :label-col="{
        style: { width: '120px' },
      }"
      :field-list="fieldList"
      disabled
    >
      <template #equipmentName="{ data }">
        <IlisInput
          v-model="data.equipmentName"
          class="flex-1"
          :entity="EquipmentAllotEntity"
          disabled
          field="equipmentName"
        ></IlisInput>
        <div v-if="initData.equipmentId" class="flex items-center pt-2">
          <BaseText class="flex-1">
            设备编号：{{ initData.equipmentVo?.equipmentSn }}
          </BaseText>
          <BaseText class="flex-1">
            规格型号：{{ initData.equipmentVo?.standard }}
          </BaseText>
        </div>
      </template>
      <template #outOrg="{ data }">
        <IlisInput
          v-model="data.outOrg"
          class="flex-1"
          :entity="EquipmentAllotEntity"
          disabled
          field="outOrg"
        ></IlisInput>
      </template>
      <template #inOrg="{ data }">
        <IlisInput
          v-model="data.inOrg"
          class="flex-1"
          :entity="EquipmentAllotEntity"
          disabled
          field="inOrg"
        ></IlisInput>
      </template>
      <template #laboratoryId="{ data }">
        <IlisInput
          v-model="data.laboratoryId"
          class="flex-1"
          :entity="EquipmentAllotEntity"
          :options="laboratoryOptions"
          field="laboratoryId"
          disabled
        ></IlisInput>
      </template>
      <template #form-after>
        <a-form-item
          label="附件材料"
        >
          <div v-for="(item, index) in fileList" :key="index">
            <a :href="`${rootUrl}/uploadController.do?download&accessoryId=${item.uid}`">{{ item.name }}</a>
          </div>
        </a-form-item>
      </template>
    </IlisForm>
  </HtModal>
</template>

<script lang="ts" setup>
import { EquipmentAllotEntity } from '../EquipmentAllotEntity'
import { getEquipmentAllotDetail } from '../api'
import type { IlisFormExpose } from '~/components/ilisComponent'
import { IlisForm, IlisInput } from '~/components/ilisComponent'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import type { IOption } from '~/interface/IOption'
import { getListLaboratory } from '~/api/common'

const props = defineProps<IDialogPropsParam<null, EquipmentAllotEntity>>()

const loading = ref(false)

const visible = ref(true)

const initData = ref<EquipmentAllotEntity>(props.param)

const ilisFormRef = ref<IlisFormExpose<EquipmentAllotEntity>>()

const fileList = ref([] as any[])

const rootUrl = import.meta.env.VITE_ILIS_BASE

const showMoreFields = ref(false)

const laboratoryOptions = ref<IOption[]>([])

if (props.param.inOrgId) {
  showMoreFields.value = true
}

const fieldList = computed(() => {
  if (showMoreFields.value) {
    return EquipmentAllotEntity.getFormFieldList()
  }
  else {
    return EquipmentAllotEntity.getFormFieldList().filter(item => !['laboratoryId', 'storageSite'].includes(item))
  }
})

async function init() {
  if (props.param.id) {
    const { data } = await getEquipmentAllotDetail(props.param)
    initData.value = EquipmentAllotEntity.fromJSON(data)
    initData.value.attachmentIds = data.files.map((item: any) => item.attachmentId)?.join(',')
    fileList.value = data.files.map((item: any) => ({
      uid: item.attachmentId,
      name: item.name,
      url: item.url,
    }))
  }
  if (props.param.inOrgId) {
    getListLaboratoryOptiopn({ departId: props.param.inOrgId })
  }
}
init()

async function getListLaboratoryOptiopn(query?: Record<string, any>) {
  const { data } = await getListLaboratory(query)
  laboratoryOptions.value = data.obj?.map((item: any) => {
    return {
      label: item.name,
      value: item.id,
    }
  })
}
</script>
