<template>
  <HtModal
    v-model:open="visible"
    :title="param.id ? '编辑设备调拨' : '新增设备调拨'"
    width="500px"
    :confirm-loading="loading"
    :after-close="onClosed"
    @ok="handleOk"
  >
    <IlisForm
      :key="initData.rentType"
      ref="ilisFormRef"
      :cols="1"
      :entity="EquipmentAssetAllotEntity"
      :init-data="initData"
      :label-col="{
        style: { width: '120px' },
      }"
      :field-list="fieldList"
    >
      <template #equipmentName="{ data }">
        <div class="flex gap-3">
          <IlisInput
            v-model="data.equipmentName"
            class="flex-1 max-w-[260px]"
            :entity="EquipmentAssetAllotEntity"
            disabled
            field="equipmentName"
          ></IlisInput>
          <a-button @click="handleSelectDevice">
            选择
          </a-button>
        </div>
      </template>
      <template #outOrg="{ data }">
        <div class="flex gap-3">
          <IlisInput
            v-model="data.outOrg"
            class="flex-1 max-w-[260px]"
            :entity="EquipmentAssetAllotEntity"
            disabled
            field="outOrg"
          ></IlisInput>
          <a-button @click="handleSelectProjectOrgOut">
            选择
          </a-button>
        </div>
      </template>
      <template #inOrg="{ data }">
        <div class="flex gap-3">
          <IlisInput
            v-model="data.inOrg"
            class="flex-1"
            :entity="EquipmentAssetAllotEntity"
            disabled
            field="inOrg"
          ></IlisInput>
          <a-button @click="handleSelectProjectOrgIn">
            选择
          </a-button>
        </div>
      </template>
      <template #laboratoryId="{ data }">
        <IlisInput
          v-model="data.laboratoryId"
          class="flex-1"
          :entity="EquipmentAssetAllotEntity"
          :options="laboratoryOptions"
          field="laboratoryId"
        ></IlisInput>
      </template>
      <template #form-after>
        <a-form-item
          label="附件材料"
        >
          <a-button :icon="h(UploadOutlined)" @click="showUplaod = true">
            上传文件
          </a-button>
          <div v-for="(item, index) in fileList" :key="index">
            <a :href="`${rootUrl}/uploadController.do?download&accessoryId=${item.uid}`">{{ item.name }}</a>
          </div>
        </a-form-item>
      </template>
    </IlisForm>

    <!-- 附件上传 -->
    <IlisUpload
      v-model:show="showUplaod"
      :file-list="fileList"
      :max="1"
      @success="handleUploadSuccess"
    ></IlisUpload>
  </HtModal>
</template>

<script lang="ts" setup>
import { UploadOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { EquipmentAssetAllotEntity } from '../EquipmentAssetAllotEntity'
import { getEquipmentAllotDetail, saveEquipmentAllot } from '../api'
import type { EquipmentAssetEntity } from '../../asset/EquipmentAssetEntity'
import type { IlisFormExpose } from '~/components/ilisComponent'
import { IlisForm, IlisInput, IlisUpload } from '~/components/ilisComponent'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import type { IDepartmentEntity } from '~/interface/IDepartmentEntity'
import type { IOption } from '~/interface/IOption'
import { getListLaboratory } from '~/api/common'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import AssetSelector from '~/components/selectorViaMethodCall/AssetSelector.vue'
import OrgSelector from '~/components/selectorViaMethodCall/OrgSelector.vue'

const props = defineProps<IDialogPropsParam<null, EquipmentAssetAllotEntity>>()

const loading = ref(false)

const visible = ref(true)

const initData = ref<EquipmentAssetAllotEntity>(props.param)

const ilisFormRef = ref<IlisFormExpose<EquipmentAssetAllotEntity>>()

const showUplaod = ref(false)

const fileList = ref([] as any[])

const rootUrl = import.meta.env.VITE_ILIS_BASE

const showMoreFields = ref(false)

const laboratoryOptions = ref<IOption[]>([])

if (props.param.inOrgId) {
  showMoreFields.value = true
}

const fieldList = computed(() => {
  if (showMoreFields.value) {
    return EquipmentAssetAllotEntity.getFormFieldList()
  }
  else {
    return EquipmentAssetAllotEntity.getFormFieldList().filter(item => !['laboratoryId', 'storageSite'].includes(item))
  }
})

async function init() {
  if (props.param.id) {
    const { data } = await getEquipmentAllotDetail(props.param)
    initData.value = EquipmentAssetAllotEntity.fromJSON(data)
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

  if (!laboratoryOptions.value?.some((item) => {
    return item.value === initData.value?.laboratoryId
  })) {
    initData.value.laboratoryId = undefined
  }
}
async function handleSelectDevice() {
  const data = await AnyDialogHelper.showSelector<EquipmentAssetEntity>(AssetSelector, {
    multiple: true,
  })
  initData.value.equipmentId = data?.map(item => item.id)?.join(',')
  initData.value.equipmentName = data?.map(item => item.name)?.join(',')
  initData.value.outOrg = data[0].departName
  initData.value.outOrgId = data[0].departId
}

async function handleSelectProjectOrgIn() {
  const data = await AnyDialogHelper.showSelector<IDepartmentEntity>(OrgSelector)
  initData.value.inOrgId = data[0].id
  initData.value.inOrg = data[0].text
  showMoreFields.value = true
  getListLaboratoryOptiopn({ departId: data[0].id })
}

async function handleSelectProjectOrgOut() {
  const data = await AnyDialogHelper.showSelector<IDepartmentEntity>(OrgSelector)
  initData.value.outOrgId = data[0].id
  initData.value.outOrg = data[0].text
}

async function handleUploadSuccess(files: any[]) {
  if (files.length === 0) {
    fileList.value = []
    initData.value.attachmentIds = ''
    return
  }
  fileList.value = files.map(item => ({
    uid: item.id || item.uid,
    name: item.attachmenttitle || item.name,
    status: 'done',
    url: item.realpath || item.url,
  }))
  initData.value.attachmentIds = files.map(item => item.id).join(',')
}

async function handleOk() {
  const formData = await ilisFormRef.value?.getFormData()
  loading.value = true
  await saveEquipmentAllot(formData!).finally(() => {
    loading.value = false
  })
  message.success('操作成功！')
  props.onConfirm(null)
  visible.value = false
}
</script>
