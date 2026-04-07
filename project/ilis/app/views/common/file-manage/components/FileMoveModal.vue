<template>
  <HtModal
    v-model:open="showDialog"
    title="移动文件"
    :after-close="onClosed"
    :confirm-loading="confirmLoading"
    @ok="onOk"
  >
    <a-space direction="vertical" style="width: 100%; padding: 12px;">
      <a-select
        v-model:value="selectedFolderId"
        :options="foderList.map(item => ({
          label: item.name,
          value: item.id,
        }))"
        class="w-full"
        placeholder="请选择目标文件夹"
      />
    </a-space>
  </HtModal>
</template>

<script setup lang='ts'>
import type { FolderTree, IFileEntity } from '../api'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { message } from 'ant-design-vue'
import { getFolderListApi, moveFile } from '../api'

const props = defineProps<IDialogPropsParam<any, IFileEntity>>()

const showDialog = ref(true)

const foderList = ref<FolderTree[]>([])

const selectedFolderId = ref()

const confirmLoading = ref(false)

async function getFolderList() {
  const { data } = await getFolderListApi()
  foderList.value = data || []
}

async function onOk() {
  if (!selectedFolderId.value) {
    message.warning('请选择目标文件夹')
    return
  }
  confirmLoading.value = true
  await moveFile({
    docId: props.param.attachmentId,
    folderId: selectedFolderId.value,
  }).finally(() => {
    confirmLoading.value = false
  })
  message.success('移动成功')
  showDialog.value = false
  props.onConfirm(props.param)
}

getFolderList()
</script>
