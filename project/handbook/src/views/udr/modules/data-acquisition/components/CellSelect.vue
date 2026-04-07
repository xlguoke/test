<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { PickerColumn } from '../data-acquisition'

const props = defineProps({
  value: {
    type: String,
    default: '',
  },
  columns: {
    type: Array<PickerColumn>,
    default: () => [],
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(['update:value'])

const localValue = ref(props.value)
const showPicker = ref(false)

const valueText = computed(() => {
  if (!localValue.value)
    return ''
  return props.columns.find(item => item.value === localValue.value)?.text
})

watch(
  () => props.value,
  (val) => {
    if (!val && props.isDefault)
      localValue.value = props.columns[0]?.value || ''
    else
      localValue.value = val
  },
  {
    immediate: true,
  },
)

watch(localValue, (val) => {
  emit('update:value', val)
})

function onConfirm(data: any) {
  showPicker.value = false
  localValue.value = data.selectedValues[0]
}
</script>

<template>
  <div>
    <van-field
      v-model="valueText"
      clearable
      readonly
      placeholder="请选择"
      @click="showPicker = true"
    >
      <template #right-icon>
        <van-icon
          v-if="!!localValue"
          name="clear"
          color="#ccc"
          @click.stop="localValue = ''"
        />
      </template>
    </van-field>

    <van-popup
      v-model:show="showPicker"
      destroy-on-close
      round
      position="bottom"
    >
      <van-picker
        :model-value="[localValue]"
        :columns="columns"
        @cancel="showPicker = false"
        @confirm="onConfirm"
      />
    </van-popup>
  </div>
</template>

<style scoped>
.van-cell {
  padding: 0;
}
.van-field__control {
  height: 2.8rem;
}
</style>
