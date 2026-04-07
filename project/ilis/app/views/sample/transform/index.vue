<template>
  <div>
  </div>
</template>

<script setup lang='ts'>
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import SampleRetentionModal from './components/SampleRetentionModal.vue'
import TransportationProcessModal from './components/TransportationProcessModal.vue'

async function handleSampleRetention() {
  await AnyDialogHelper.showModel(SampleRetentionModal)
}
async function handleTransportationProcess() {
  await AnyDialogHelper.showModel(TransportationProcessModal)
}

window.handleSampleRetention = handleSampleRetention
window.handleTransportationProcess = handleTransportationProcess
</script>
