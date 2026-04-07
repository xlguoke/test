<template>
  <a-form :model="formState">
    <a-form-item label="配置1">
      <a-input></a-input>
    </a-form-item>
    <a-form-item label="配置2">
      <a-input></a-input>
    </a-form-item>
  </a-form>
</template>

<script lang="ts" setup>
const formState = ref()
</script>
