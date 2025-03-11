<template>
  <HtModal
    v-model:open="visible"
    :title="param.id ? '编辑固定资产' : '新增固定资产'"
    width="80vw"
    :confirm-loading="loading"
    :after-close="onClosed"
    @ok="handleOk"
  >
    <BaseTitle>基础信息</BaseTitle>
    <IlisForm
      :key="initData.rentType"
      ref="ilisFormRef"
      :cols="3"
      :entity="EquipmentAssetEntity"
      :init-data="initData"
    >
      <template #assetSn="{ data }">
        <IlisInput
          v-model="data.assetSn"
          field="assetSn"
          :entity="EquipmentAssetEntity"
          @blur="handleBlur"
        ></IlisInput>
      </template>
      <template #form-after>
        <a-form-item label="上传图片">
          <HtUploadFile
            business-type="ASSET"
            force-init
            :business-id="initData.id"
            :accept="['png', 'jpg', 'jpeg']"
            @get-qr-code-key="initData.uploadQR = $event"
          />
        </a-form-item>
      </template>
    </IlisForm>
    <BaseTitle>自定义属性</BaseTitle>
    <!-- 自定义属性部分 -->
    <IlisCustomPropertiesForm
      ref="customizeFormRef"
      customize-type="fixedAssets"
      :cols="3"
      :default-value="initData.customizeValues"
    >
    </IlisCustomPropertiesForm>
  </HtModal>
</template>

<script lang="ts" setup>
import { Modal, message } from 'ant-design-vue'
import { EquipmentAssetEntity } from '../EquipmentAssetEntity'
import { addEquipmentAsset, checkEquipmentAsset, editEquipmentAsset } from '../api.ts'
import type { IlisFormExpose } from '~/components/ilisComponent'
import { IlisCustomPropertiesForm, IlisForm, IlisInput } from '~/components/ilisComponent'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { BaseTitle } from '~/components/UI/index.ts'
import HtUploadFile from '~/components/htUploadFile/Index.vue'

const props = defineProps<IDialogPropsParam<null, EquipmentAssetEntity>>()

const loading = ref(false)

const visible = ref(true)

const initData = ref<EquipmentAssetEntity>(props.param)

initData.value.quantity = 1

const ilisFormRef = ref<IlisFormExpose<EquipmentAssetEntity>>()

const customizeFormRef = ref()

function handleBlur(e: FocusEvent) {
  const value = (e.target as HTMLInputElement)?.value
  checkAssetSn(value)
}

async function checkAssetSn(assetSn: string) {
  if (!assetSn) {
    return
  }

  const { data } = await checkEquipmentAsset({
    id: initData.value.id,
    assetSn,
  })

  if (data.assets) {
    Modal.warning({
      title: '提示',
      content: '该资产编号已存在！',
    })
    return
  }
  if (!data.assets && data.equipmentList?.length && !initData.value.id) {
    Modal.confirm({
      title: '提示',
      content: '存在相同资产编号检测设备，是否引用数据？',
      onOk: () => {
        delete data.equipmentList?.[0]?.type
        delete data.equipmentList?.[0]?.status
        initData.value = EquipmentAssetEntity.fromJSON(data.equipmentList?.[0] || {})
        initData.value.quantity = 1
        initData.value.eqId = data.equipmentList?.[0]?.id
        delete (initData.value as any).id
      },
    })
  }
}

async function handleOk() {
  const formData = await ilisFormRef.value?.getFormData()
  const customizeValue = await customizeFormRef.value?.getFormData()
  formData!.customizeValueList = customizeValue
  loading.value = true
  const api = props.param.id ? editEquipmentAsset : addEquipmentAsset
  await api(formData!).finally(() => {
    loading.value = false
  })
  message.success('操作成功！')
  props.onConfirm(null)
  visible.value = false
}
</script>
