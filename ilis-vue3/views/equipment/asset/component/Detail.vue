<template>
  <HtModal
    v-model:open="visible"
    title="详情"
    width="80vw"
    :after-close="onClosed"
  >
    <template #footer>
      <a-button @click="visible = false">
        关闭
      </a-button>
    </template>
    <a-space class=" w-full mb-40">
      <div>
        <div class=" font-bold text-[18px] mb-[20px]">
          {{ detail.name }}
        </div>
        <BaseTitle>基础信息</BaseTitle>
        <a-descriptions title="">
          <a-descriptions-item label="资产类别">
            {{ EquipmentAssetEntity.getFieldDictionaryArray('type')?.getLabelByKey(detail.type as string) }}
          </a-descriptions-item>
          <a-descriptions-item label="资产编号">
            {{ detail.assetSn }}
          </a-descriptions-item>
          <a-descriptions-item label="设备编号">
            {{ detail.equipmentSn }}
          </a-descriptions-item>
          <a-descriptions-item label="资产品牌">
            {{ detail.factory }}
          </a-descriptions-item>
          <a-descriptions-item label="规格型号">
            {{ detail.standard }}
          </a-descriptions-item>
          <a-descriptions-item label="购置日期">
            {{ AnyDateTimeHelper.format(detail.buyDate || '', EDateFormatType.YYYY_MM_DD) }}
          </a-descriptions-item>
          <a-descriptions-item label="所属单位">
            {{ detail.standard }}
          </a-descriptions-item>
          <a-descriptions-item label="所属部门">
            {{ detail.departName }}
          </a-descriptions-item>
          <a-descriptions-item label="使用地点">
            {{ detail.serveLocation }}
          </a-descriptions-item>
          <a-descriptions-item label="使用人">
            {{ detail.userName }}
          </a-descriptions-item>
          <a-descriptions-item label="使用状态" :span="2">
            {{ EquipmentAssetEntity.getFieldDictionaryArray('status')?.getLabelByKey(detail.status as string) }}
          </a-descriptions-item>
          <a-descriptions-item label="附件信息" :span="3">
            <HtUploadFile
              business-type="ASSET"
              force-init
              is-reandonly
              :business-id="param.id"
              :accept="['png', 'jpg', 'jpeg']"
            >
              <template #preview-list="{ data }">
                <a-image
                  v-for="item in data"
                  :key="item.id"
                  :width="100"
                  :height="100"
                  :src="item.url"
                />
              </template>
            </HtUploadFile>
          </a-descriptions-item>
        </a-descriptions>
        <BaseTitle>自定义属性</BaseTitle>
        <a-descriptions>
          <a-descriptions-item v-for="item in detail.customizeValues" :key="item.id" :label="item.columnName">
            {{ item.columnValue }}
          </a-descriptions-item>
        </a-descriptions>
      </div>
      <div class=" flex flex-col gap-3 items-center">
        <a-qrcode ref="qrCodeRef" :value="detail.eqQrKey || `/asset/detail?id=${detail.id}`" />
        <a-button @click="handlePrintQrCode">
          打印二维码
        </a-button>
      </div>
    </a-space>
  </HtModal>
</template>

<script lang="ts" setup>
import { getEquipmentAssetDetail } from '../api'
import { EquipmentAssetEntity } from '../EquipmentAssetEntity'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import HtUploadFile from '~/components/htUploadFile/Index.vue'

const props = defineProps<IDialogPropsParam<null, EquipmentAssetEntity>>()

const visible = ref(true)

const qrCodeRef = ref()

const detail = ref(new EquipmentAssetEntity())

async function init() {
  if (props.param.id) {
    getData(props.param)
  }
}
init()

async function getData(row: EquipmentAssetEntity) {
  const { data } = await getEquipmentAssetDetail(row)
  detail.value = data
}

async function handlePrintQrCode() {
  const url = await qrCodeRef.value.toDataURL()
  // 创建iframe打印
  const iframe = document.createElement('iframe')
  iframe.style.display = 'none'
  document.body.appendChild(iframe)

  const iframeContent = iframe.contentWindow
  const img = document.createElement('img')

  img.src = url
  iframeContent?.document.body.appendChild(img)
  nextTick(() => {
    iframeContent?.print()
    iframeContent!.onafterprint = () => {
      document.body.removeChild(iframe)
    }
  })
}
</script>
