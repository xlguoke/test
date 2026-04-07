<template>
  <!-- <van-stepper :min="0" class="w-full flex-x justify-between border rounded-14 px-6 shadow" @click.stop /> -->
  <div>
    <div class="flex justify-around mb-14 h20 items-center gap-x-4 text-center line-height-20">
      <input
        v-model="inputMin"
        class="sliderInput"
        type="number"
        @change="onInput('min')"
      />
      <input
        v-model="inputMax"
        class="sliderInput"
        type="number"
        @change="onInput('max')"
      />
    </div>
    <div class="h16 flex-x">
      <van-slider
        v-model="val"
        range
        bar-height="6px"
        :min="min"
        :max="max"
        :active-color="activeColor"
        @change="emit('change')"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = withDefaults(defineProps<{
  min: number
  max: number
  value: [number, number]
  activeColor?: string
}>(), {
  min: 0,
  max: 100,
  value: () => [0, 0] as [number, number],
})

const emit = defineEmits<{
  (e: 'update:value', value: [number, number]): void
  (e: 'change'): void
}>()

const inputMin = ref<number>()

const inputMax = ref<number>()

const val = computed({
  get() {
    return props.value
  },
  set(val) {
    emit('update:value', val)
  },
})

function onInput(type: 'max' | 'min') {
  if (type === 'max') {
    if (inputMax.value > props.max) {
      inputMax.value = props.max
    }
    if (inputMax.value < val.value[0]) {
      inputMax.value = val.value[0]
    }
    val.value[1] = inputMax.value
    emit('change')
  }

  if (type === 'min') {
    if (inputMin.value < props.min) {
      inputMin.value = props.min
    }
    if (inputMin.value > val.value[1]) {
      inputMin.value = val.value[1]
    }
    val.value[0] = inputMin.value
    emit('change')
  }
}

watch(val, (v) => {
  if (v) {
    inputMin.value = v[0]
    inputMax.value = v[1]
  }
  else {
    inputMin.value = undefined
    inputMax.value = undefined
  }
}, { deep: true, immediate: true })
</script>

<style scoped>
:deep(.van-stepper) {
  display: flex;
  align-items: center;
}
:deep(.van-slider) {
  background: rgba(255, 255, 255, 0.8);
}
:deep(.van-slider__button) {
  width: 16px !important;
  height: 16px !important;
  box-shadow: 0px 0px 4px 0px rgba(0, 102, 236, 0.2);
}

.sliderInput {
  width: 40px;
  height: 24px;
  background: rgba(255, 255, 255, 0.6);
  border: 0;
  border-radius: 4px;
  text-align: center;
  font-size: 16px;
}
</style>
