<template>
  <div>
  </div>
</template>

<script setup lang='ts'>
import { useArchiveDeposit } from './composables/useArchiveDeposit'

const { handleSubmitAudit } = useArchiveDeposit()

window.handleSubmitAudit = handleSubmitAudit
</script>
