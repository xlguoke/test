<template>
  <div>
    <component
      :is="register?.find(i => i.name === currentWidget?.name)?.configComponent || ScreenBaseConfig"
    ></component>
  </div>
</template>

<script lang="ts" setup>
import { useScreenEditorStore } from '~/store/screenEditorStore'
import { register } from '../widgets/register'
import ScreenBaseConfig from './ScreenBaseConfig.vue'

const { currentWidget } = toRefs(useScreenEditorStore())
</script>
