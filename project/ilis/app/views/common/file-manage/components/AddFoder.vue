<template>
  <HtModal
    v-model:open="showDialog"
    title="添加文件夹"
    :after-close="onClosed"
    :confirm-loading="confirmLoading"
    @ok="onOk"
  >
    <a-space direction="vertical" style="width: 100%;">
      <div style="padding: 8px 0; color: #999; font-size: 12px;">
        上级目录：{{ param?.name || '根目录' }}
      </div>
      <a-input
        v-model:value.trim="folderName"
        :maxlength="AppConfig.MAX_LENGTH_INPUT"
        placeholder="请输入文件夹名称"
      ></a-input>
    </a-space>
  </HtModal>
</template>

<script setup lang='ts'>
import type { FolderTree } from '../api'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { message } from 'ant-design-vue'
import { AppConfig } from '~/anyThing/AppConfig'
import { BUSINES_TYPE } from '~/components/htUploadFile'
import { addFolder, getQrKey } from '../api'

const props = defineProps<IDialogPropsParam<any, FolderTree>>()

const showDialog = ref(true)

const folderName = ref('')

const confirmLoading = ref(false)

async function onOk() {
  try {
    if (!folderName.value) {
      message.error('请输入文件夹名称')
      return
    }
    confirmLoading.value = true
    const { data } = await addFolder({
      folderName: folderName.value,
      parentFolderId: props.param?.id,
    })
    let parentQrKey = ''
    // 获取父级的二维码key
    if (props.param?.id) {
      parentQrKey = await getQrKey({
        businessId: props.param.id,
        businessType: BUSINES_TYPE.DOCUMENT_MANAGEMENT,
      })
    }
    await getQrKey({
      businessId: data,
      businessType: BUSINES_TYPE.DOCUMENT_MANAGEMENT,
      parentKey: parentQrKey,
    })
    props.onConfirm(null)
    showDialog.value = false
  }
  catch (error) {
    confirmLoading.value = false
    throw error
  }
}
</script>
