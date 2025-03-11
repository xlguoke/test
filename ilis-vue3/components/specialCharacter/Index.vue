<template>
  <span>
    <a class="specialCharacter" @click="visible = true">
      <slot>特殊字符</slot>
    </a>
    <ht-modal
      v-model:open="visible"
      title="特殊字符"
      width="700px"
      :mask="false"
      :footer="false"
      tiled-level
      @cancel="emits('cancel')"
    >
      <SpecialCharacter @select="selectCharacter" />
    </ht-modal>
  </span>
</template>

<script setup lang='ts'>
import SpecialCharacter from './components/SpecialCharacter.vue'

const emits = defineEmits<{
  (e: 'select', data: string): void
  (e: 'cancel'): void
}>()

const visible = ref(false)

function selectCharacter(c: string) {
  emits('select', c)
}
</script>

<style scoped>
.specialCharacter{
  position: relative;
  color: #0066ec;
  z-index: 99;
}
.specialCharacter:hover{
  opacity: .8;
}
</style>
