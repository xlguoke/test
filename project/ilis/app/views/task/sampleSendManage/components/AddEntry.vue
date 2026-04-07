<template>
  <div></div>
</template>

<script lang="ts" setup>
import type { TaskEntity } from '../../TaskEntity'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
// import { SampleSendEntity } from '../SampleSendEntity'
import Add from './Add.vue'

async function handleAddSampleSend(params: TaskEntity[]) {
  // const initData = new SampleSendEntity()
  // initData.taskCode = params[0].testTaskCode
  // initData.taskId = params[0].id
  // initData.objectName = params[0].testSampleDisplayName
  // initData.objectCode = params[0].testObjectCode
  await AnyDialogHelper.showModel(Add, {
    taskList: params,
  })
}

if (!window.vm) {
  window.vm = {}
}

window.vm.handleAddSampleSend = handleAddSampleSend
</script>
