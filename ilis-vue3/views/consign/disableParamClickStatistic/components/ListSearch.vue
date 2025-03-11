<template>
  <a-form
    ref="formRef"
    :model="form"
    layout="inline"
    @submit="handleSearch"
  >
    <a-form-item>
      <a-range-picker v-model:value="clickDate" />
    </a-form-item>
    <a-form-item name="quickQryParam">
      <a-space>
        <a-input
          v-model:value="form.q"
          style="width: 280px"
          allow-clear
          placeholder="请输入样品/参数名称查询"
        />
        <a-button type="primary" html-type="submit">
          查询
        </a-button>
        <a-button @click="resetSearch">
          重置
        </a-button>
      </a-space>
    </a-form-item>
  </a-form>
</template>

<script setup lang='ts'>
import { reactive } from 'vue'
import type { Query } from '../api'
import { useDateRangePickerHooks } from '~/hooks/useDatePickerHooks.ts'

const emits = defineEmits<{
  (e: 'search', data: Query): void
  (e: 'reset', data: Query): void
}>()

const formRef = ref()
const form: Query = reactive({
  q: '',
  clickTimeStart: undefined,
  clickTimeEnd: undefined,
})

const [clickDate] = useDateRangePickerHooks((val) => {
  form.clickTimeStart = val[0] || ''
  form.clickTimeEnd = val[1] || ''
})

function handleSearch() {
  emits('search', form)
}

async function resetSearch() {
  await formRef.value.resetFields()
  clickDate.value = [null, null]
  form.clickTimeStart = undefined
  form.clickTimeEnd = undefined
  form.q = ''

  emits('reset', form)
}
</script>
