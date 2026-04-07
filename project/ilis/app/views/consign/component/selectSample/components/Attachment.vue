<template>
  <HtUploadFile
    :business-type="BUSINES_TYPE.SAMPLE"
    :business-id="useBasicInfo.data.mark"
    :qr-code-url="dataSource.attachmentQrUrl"
    :parent-key="parentKey"
    :is-reandonly="isDetailPage"
    @init-complete="initComplete"
  />
</template>

<script setup lang='ts'>
import type { UploadFileData } from '~/components/htUploadFile'
import type { UseAttachment } from '~/views/consign/component/selectSample/modules/UseAttachment.ts'
import type { UseBasicInfo } from '~/views/consign/component/selectSample/modules/UseBasicInfo.ts'
import HtUploadFile, { BUSINES_TYPE } from '~/components/htUploadFile'

const useBasicInfo = inject('useBasicInfo') as UseBasicInfo
const useAttachment = inject('useAttachment') as UseAttachment

const { isDetailPage } = useAttachment.consignPageState

const dataSource = computed(() => useAttachment.data)

const parentKey = useAttachment.consignDetail.attachmentQrKey

function initComplete(data: UploadFileData) {
  useAttachment.setDataField('attachmentQrKey', data.qrCodeKey)
  useAttachment.setDataField('attachmentQrUrl', data.qrCodeUrl)
}
</script>
