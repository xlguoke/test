<template>
  <a-table
    :data-source="datas"
    :columns="inviteFilecolumns"
    row-key="id"
    :pagination="false"
    :scroll="{ x: 800 }"
  >
    <template #bodyCell="{ column, text, record }">
      <template v-if="column.dataIndex === 'attachmentCount'">
        <a-button type="link" size="small" @click="clickAttachmentCount(record as InviteFileData)">
          {{ text }}
        </a-button>
      </template>
      <template v-if="column.dataIndex === 'action'">
        <a-button v-if="record.valid" type="link" size="small" @click="openInviteModal(record as InviteFileData)">
          编辑
        </a-button>
        <a-button type="link" size="small" @click="previewInviteQr(record as InviteFileData)">
          预览
        </a-button>
        <a-button v-if="record.valid" type="link" size="small" style="color: red" @click="disableInviteQr(record as InviteFileData)">
          禁用
        </a-button>
        <a-button v-else type="link" size="small" @click="recoverInviteQr(record as InviteFileData)">
          恢复
        </a-button>
      </template>
    </template>
  </a-table>
</template>

<script setup lang='ts'>
import type { InviteFileData } from '..'
import { Modal } from 'ant-design-vue'
import dayjs from 'dayjs'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { inviteFilecolumns } from '..'
import { disableInviteQrCode, recoverInviteQrCode } from './fileOperations'
import InvitePreview from './InvitePreview.vue'
import InviteSetting from './InviteSetting.vue'

const props = defineProps({
  datas: {
    type: Array<InviteFileData>,
    default: () => [] as any[],
  },
  // 主码
  qrCodeKey: {
    type: String,
    default: '',
  },
  // h5上传页面地址
  qrCodeLink: {
    type: String,
    default: '',
  },
})

const emits = defineEmits(['load', 'queryFile'])

/**
 * 编辑
 */
async function openInviteModal(row: InviteFileData, unload?: boolean) {
  await AnyDialogHelper.showModel(InviteSetting, {
    coreKey: props.qrCodeKey,
    data: row,
    isEdit: true,
  })
  if (unload)
    return
  emits('load')
}

/**
 * 预览二维码
 */
async function previewInviteQr(row: InviteFileData) {
  await AnyDialogHelper.showModel(InvitePreview, {
    data: row,
    qrCodeLink: props.qrCodeLink,
  })
}

/**
 * 禁用
 */
async function disableInviteQr(row: InviteFileData) {
  Modal.confirm({
    title: '确定要禁用此二维码吗？',
    content: '禁用后，无法继续通过该二维码上传附件。',
    centered: true,
    onOk: async () => {
      await disableInviteQrCode(row.qrKey)
      emits('load')
    },
  })
}

/**
 * 恢复
 */
async function recoverInviteQr(row: InviteFileData) {
  Modal.confirm({
    title: '确定要恢复此二维码吗？',
    content: '恢复后，可继续通过该二维码上传附件。',
    centered: true,
    onOk: async () => {
      if (row.invalidTime < dayjs().format('YYYY-MM-DD')) {
        openInviteModal(row, true).then(async () => {
          await recoverInviteQrCode(row.qrKey)
          emits('load')
        })
      }
      else {
        await recoverInviteQrCode(row.qrKey)
        emits('load')
      }
    },
  })
}

/**
 * 点击已上传文件数量，筛选当前上传人员上传附件
 */
function clickAttachmentCount(row: InviteFileData) {
  emits('queryFile', row)
}
</script>

<style>

</style>
