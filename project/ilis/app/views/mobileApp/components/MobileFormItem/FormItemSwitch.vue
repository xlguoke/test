<template>
  <van-field
    label-align="left"
    input-align="right"
    v-bind="$attrs"
  >
    <template #input>
      <van-switch
        v-model="value"
        :disabled="disabled"
        size="24px"
      ></van-switch>
    </template>
  </van-field>
</template>

<script setup lang='ts'>
const props = defineProps({
  value: Boolean,
})

const emits = defineEmits(['update:value'])

const attrs = useAttrs()

const value = computed({
  get() {
    return props.value
  },
  set(val) {
    emits('update:value', val)
  },
})

const disabled = computed(() => attrs.readonly || attrs.disabled)
</script>
