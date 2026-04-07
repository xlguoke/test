<template>
  <AllotApply :type="AllotType.ASSETS"></AllotApply>
</template>

<script lang="ts" setup>
import { AllotType } from '~/enum/AllotType'
import AllotApply from '~/views/equipment/allot-apply/index.vue'
</script>
