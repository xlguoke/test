<template>
  <van-field
    label-align="left"
    input-align="right"
    v-bind="$attrs"
  >
    <template #input>
      <van-radio-group
        v-model="value"
        direction="horizontal"
        :disabled="disabled"
        class="gap-2"
      >
        <van-radio v-for="item in options" :key="item.value" :name="item.value">
          {{ item.label }}
        </van-radio>
      </van-radio-group>
    </template>
  </van-field>
</template>

<script setup lang='ts'>
const props = defineProps({
  value: [String, Boolean],
  options: Object as PropType<Array<string | {
    label: string
    value: string
  }>>,
})

const emits = defineEmits(['update:value'])

const attrs = useAttrs()

const options = computed(() => {
  return (props.options || []).map(item => typeof (item) === 'string'
    ? {
        label: item,
        value: item,
      }
    : item)
})

const value = computed({
  get() {
    return props.value
  },
  set(val) {
    emits('update:value', val)
  },
})

const disabled = computed(() => !!(attrs.readonly || attrs.disabled))
</script>
