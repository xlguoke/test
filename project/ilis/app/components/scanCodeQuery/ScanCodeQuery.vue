<template>
  <div class="scan-code-query">
    <a-input
      v-model:value="searchString"
      :placeholder="placeholder"
      autofocus
      @change="changeValue"
      @keypress.enter="enterSearch"
    />
    <slot name="scan-btn" :on-scan="enterSearch">
      <a-button style="margin-left: 10px" type="primary" @click="enterSearch">
        添加
      </a-button>
    </slot>
  </div>
</template>

<script lang="ts" setup>
import type { SCAN_TYPE } from '.'
import { message } from 'ant-design-vue'
import { apis } from '.'

interface Props {
  value: string
  scanType: SCAN_TYPE
  placeholder?: string
  enter?: (res: any) => void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '输入标签编码回车或扫描标签码即可添加',
})
const emits = defineEmits(['enter', 'error', 'update:value'])
const searchString = ref(props.value)

watch(() => props.value, (val) => {
  searchString.value = val
})

function changeValue() {
  emits('update:value', searchString.value)
}

async function enterSearch() {
  const api = apis[props.scanType]

  if (!api) {
    message.error('请传入正确的scanType')
    console.error('请传入正确的scanType')
    return
  }

  if (!searchString.value)
    return

  try {
    const { data } = await ilisAxios.get<any>(`${api}${searchString.value}`)

    if (!data)
      return

    emits('enter', data)
  }
  catch (err) {
    message.error((err as Error).message || '查询失败')
    emits('error', err)
  }
  searchString.value = ''
}
</script>

<style lang="less" scoped>
.scan-code-query {
  display: inline-flex;
  min-width: 400px;
}
</style>
