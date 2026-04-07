<template>
  <span></span>
</template>

<script lang="ts" setup>
import type { IReportSignature } from '.'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import SealPosition from './components/SealPosition.vue'

async function setSealPosition(reportList: IReportSignature[]) {
  await AnyDialogHelper.showModel(SealPosition, {
    reportList,
  })
}

// 提供给jsp调用
window!.setSealPosition = setSealPosition
</script>
