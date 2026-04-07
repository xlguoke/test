<template>
  <div class="base-config">
    <a-form :model="baseConfigFormState">
      <a-form-item label="功能室名称" :label-col="{ span: 24 }">
        <a-input v-model:value="baseConfigFormState.name" :maxlength="50"></a-input>
      </a-form-item>
    </a-form>
  </div>
</template>

<script lang="ts" setup>
import { useScreenEditorStore } from '~/store/screenEditorStore'

const { baseConfigFormState } = toRefs(useScreenEditorStore())
</script>
