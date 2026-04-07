<template>
  <div />
</template>

<script lang="ts" setup>
import type { SignPostionConfigEntity } from './SignPostionConfigEntity'
import type { SignStaffEntity } from './SignStaffEntity'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import PdfSignModal from './component/PdfSignModal.vue'

interface IParam {
  files: any[]
  isReadOnly?: boolean
  signItem: SignStaffEntity[] // 勾选中的签名项
  signData: SignPostionConfigEntity[] // 签名数据集合
  staffData: SignStaffEntity[] // 签名项集合
}

async function handleSigin(params: IParam) {
  const data = await AnyDialogHelper.showModel(PdfSignModal, {
    files: params.files?.filter(i => (i.extend as string).toLowerCase() === 'pdf'),
    signData: [...params.signData],
    isReadOnly: params.isReadOnly,
    signItem: [...params.signItem],
    staffData: [...params.staffData],
  })
  return data
}

window.handleSigin = handleSigin
</script>
