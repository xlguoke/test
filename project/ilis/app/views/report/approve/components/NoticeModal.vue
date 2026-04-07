<template>
  <HtModal
    v-model:open="showDialog"
    :after-close="onClosed"
    :confirm-loading="confirmLoading"
    title="通知修改委托"
    @ok="handleOk"
  >
    <a-textarea v-model:value.trim="noticeContent" :rows="4" />
  </HtModal>
</template>

<script setup lang='ts'>
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { message } from 'ant-design-vue'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

interface IProps {
  type: string
  objectId: string
}

const props = defineProps<IDialogPropsParam<null, IProps>>()

const showDialog = ref(true)

const noticeContent = ref('')

const confirmLoading = ref(false)

async function handleOk() {
  if (!noticeContent.value) {
    message.error('请输入通知内容')
    return
  }
  confirmLoading.value = true
  await IlisApiHelper.postForm('noticeController.do?doConsignModifyNotice', {
    type: props.param.type,
    objectId: props.param.objectId,
    noticeContent: noticeContent.value,
  }).finally(() => {
    confirmLoading.value = false
  })
  message.success('通知修改成功！')
  showDialog.value = false
  props.onConfirm(null)
  window.opener?.InitObj?.reloadDataGrid(false)
  setTimeout(() => {
    window.close()
  }, 1000)
}
</script>
