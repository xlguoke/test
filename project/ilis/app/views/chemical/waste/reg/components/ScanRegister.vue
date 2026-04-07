<template>
  <ht-modal
    v-model:open="open"
    title="扫码登记"
    width="640px"
    :mask-closable="false"
    @cancel="cancel"
  >
    <a-flex>
      <div class="flex-1">
        <a-alert message="提示：您可以根据实际需要和使用场景，设置二维码登记时的默认值。" type="info" />
        <a-form ref="formRef" :model="formState" class="pt-4" :label-col="{ style: 'width: 75px' }" :wrapper-col="{ style: 'flex: 1' }">
          <a-form-item label="功能室" name="laboratoryId">
            <a-select v-model:value="formState.laboratoryId" :options="laboratoryOptions" placeholder="请选择" @change="(v, d) => onChange('laboratoryName', d)"></a-select>
          </a-form-item>
          <a-form-item label="废物类型" name="type">
            <a-select v-model:value="formState.type" :options="wasteTypeList" placeholder="请选择" @change="(v, d) => onChange('typeName', d)"></a-select>
          </a-form-item>
          <a-form-item label="有害成分" name="hazardousIngredients">
            <a-select v-model:value="formState.hazardousIngredients" :options="chemicalHazardousIngredientsOptions" placeholder="请选择" @change="(v, d) => onChange('hazardousIngredientsName', d)"></a-select>
          </a-form-item>
        </a-form>
      </div>
      <div class="w-[150px] ml-4 text-center">
        <a-spin :spinning="saveLoading">
          <img v-if="qrCodeUrl" ref="qrCodeRef" :src="qrCodeUrl" />
        </a-spin>
        <div class="mt-2">
          请使用ILIS-APP首页<br />右上角扫一扫
        </div>
      </div>
    </a-flex>

    <template #footer>
      <a-button @click="cancel">
        关闭
      </a-button>
      <a-button type="primary" @click="downCode">
        下载二维码
      </a-button>
    </template>
  </ht-modal>
</template>

<script setup lang='ts'>
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps.ts'
import type { IOption } from '~/interface/IOption.ts'
import QRCode from 'qrcode'
import { getDictByCode } from '~/api/common.ts'
import { useLaboratoryOptionsHook } from '~/hooks/options/useLaboratoryOptionsHook.ts'
import { SaveChemicalWasteBarcode, saveChemicalWasteBarcode } from '~/views/chemical/waste/reg/api.ts'
import { useWasteRegHooks } from '~/views/chemical/waste/reg/useWasteRegHooks.ts'

const props = defineProps<IDialogPropsParam<null>>()

const chemicalHazardousIngredientsOptions = ref<IOption[]>([])

const formRef = ref()

const qrCodeRef = ref()

const open = ref(true)

const saveLoading = ref(false)

const qrCodeUrl = ref('')

const formState = ref(new SaveChemicalWasteBarcode())

const { wasteTypeList } = useWasteRegHooks()

const { laboratoryOptions } = useLaboratoryOptionsHook()

createQrCode()

getDictByCode('chemicalHazardousIngredients').then((res) => {
  chemicalHazardousIngredientsOptions.value = res.data.map(item => ({
    label: item.typeName,
    value: item.typeCode,
  }))
})

async function onChange(key: string, item: IOption) {
  formState.value[key] = item.label
  createQrCode()
}

async function createQrCode() {
  const saveKey = new Date().getTime()
  saveLoading.value = true
  await saveChemicalWasteBarcode(saveKey, formState.value).finally(() => {
    saveLoading.value = false
  })

  const qrContent = `chemicalWasteReg:${saveKey}`
  QRCode.toDataURL(qrContent, {
    text: qrContent,
    width: 300,
    height: 300,
    colorDark: '#000000',
    colorLight: '#ffffff',
    errorCorrectionLevel: 'H',
    margin: 1,
  }).then((url: string) => {
    qrCodeUrl.value = url
  })
}

// 下载二维码
function downCode() {
  const url = qrCodeRef.value.src
  downloader.excute(url, '扫码登记.png')
}

// 关闭弹窗
function cancel() {
  open.value = false
  props.onConfirm(null)
}
</script>
