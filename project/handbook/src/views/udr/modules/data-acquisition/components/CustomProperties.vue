<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import SelectedDatePicker from '@/components/SelectedDatePicker.vue'

const props = defineProps({
  value: {
    type: String,
    default: '',
  },
  columns: {
    type: Object,
    default: () => {},
  },
})
const emit = defineEmits(['update:value'])

const localValue = ref(props.value)
const showPicker = ref(false)
const showDatePicker = ref(false)
const picerOpts = computed(() => {
  if (!props.columns.columnValue) {
    return [{
      text: '请选择',
      value: '',
    }]
  }
  const opts: string[] = props.columns.columnValue.split(';')
  return opts.map(d => ({ text: d, value: d }))
})

watch(
  () => props.value,
  (val) => {
    localValue.value = val
  },
)

watch(localValue, (val) => {
  emit('update:value', val)
})

function openPicker() {
  if (props.columns.columnType === 'date')
    showDatePicker.value = true
  else
    showPicker.value = true
}

function onConfirm(obj: any) {
  showPicker.value = false
  localValue.value = obj.selectedValues[0]
}

function changeDatePicker(val: string) {
  localValue.value = val
}
</script>

<template>
  <div style="min-width: 11rem">
    <van-field
      v-if="['select', 'date', 'radio'].includes(columns.columnType)"
      v-model="localValue"
      clearable
      readonly
      :placeholder="`请选择${columns.displayName}`"
      @click="openPicker"
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
    <van-field
      v-else-if="columns.columnType === 'inputNumber'"
      v-model="localValue"
      type="number"
      clearable
      :placeholder="`请输入${columns.displayName}`"
    />
    <van-field
      v-else
      v-model="localValue"
      clearable
      :placeholder="`请输入${columns.displayName}`"
    />

    <van-popup
      v-model:show="showPicker"
      destroy-on-close
      round
      position="bottom"
    >
      <van-picker
        :model-value="[localValue]"
        :columns="picerOpts"
        @cancel="showPicker = false"
        @confirm="onConfirm"
      />
    </van-popup>

    <SelectedDatePicker
      v-if="columns.columnType === 'date'"
      v-model:show="showDatePicker"
      :default-value="localValue"
      @change="changeDatePicker"
    />
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
