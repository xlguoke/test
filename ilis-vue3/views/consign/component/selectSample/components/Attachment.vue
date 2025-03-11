<template>
  <HtUploadFile
    :business-type="BUSINES_TYPE.SAMPLE"
    :business-id="useBasicInfo.data.mark"
    :qr-code-url="dataSource.attachmentQrUrl"
    :parent-key="parentKey"
    :is-reandonly="readonly"
    @init-complete="initComplete"
  />
</template>

<script setup lang='ts'>
import { MainController } from '../modules/MainController'
import HtUploadFile, { BUSINES_TYPE, type UploadFileData } from '~/components/htUploadFile'
import type { UseBasicInfo } from '~/views/consign/component/selectSample/modules/UseBasicInfo.ts'
import type { UseAttachment } from '~/views/consign/component/selectSample/modules/UseAttachment.ts'
import { usePageState } from '~/views/consign/component/selectSample/hooks/usePageState.ts'

const useBasicInfo = inject('useBasicInfo') as UseBasicInfo
const useAttachment = inject('useAttachment') as UseAttachment

const { readonly } = usePageState()

const dataSource = computed(() => useAttachment.data)

const consignWindow = MainController.consignWindow
const parentEle = consignWindow.document.getElementById('attachmentQrKey-CONSIGN') as HTMLInputElement
const parentKey = parentEle.value

function initComplete(data: UploadFileData) {
  useAttachment.setDataField('attachmentQrKey', data.qrCodeKey)
  useAttachment.setDataField('attachmentQrUrl', data.qrCodeUrl)
}
</script>
