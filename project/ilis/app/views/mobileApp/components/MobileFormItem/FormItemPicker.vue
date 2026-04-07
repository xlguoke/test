<template>
  <div>
    <van-field
      v-model="value"
      readonly
      is-link
      label-align="left"
      input-align="right"
      v-bind="$attrs"
      @click-input="open = true"
    />

    <van-popup
      v-model:show="open"
      destroy-on-close
      position="bottom"
      close-on-popstate
    >
      <van-picker
        :columns="columns"
        @cancel="open = false"
        @confirm="onSelect"
      />
    </van-popup>
  </div>
</template>

<script setup lang='ts'>
const props = defineProps({
  value: String,
  options: Object as PropType<Array<{
    text: string
    value: string
  }>>,
})

const emits = defineEmits(['update:value', 'select'])

const columns = computed(() => {
  return props.options || []
})

const value = computed(() => props.value)

const open = ref(false)

function onSelect({ selectedOptions }: { selectedOptions: any[] }) {
  open.value = false
  const selectedValue = selectedOptions[0]?.value || ''
  emits('update:value', selectedValue)
  emits('select', selectedOptions)
}
</script>
